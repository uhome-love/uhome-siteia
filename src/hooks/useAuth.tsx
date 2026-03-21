import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContext {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        setLoading(false);

        // Migrate anonymous favorites on sign in
        if (event === "SIGNED_IN" && sess?.user) {
          const raw = localStorage.getItem("favoritos_anonimos");
          if (raw) {
            try {
              const ids: string[] = JSON.parse(raw);
              if (ids.length > 0) {
                await supabase.from("favoritos").upsert(
                  ids.map((imovel_id) => ({
                    user_id: sess.user.id,
                    imovel_id,
                  })),
                  { onConflict: "user_id,imovel_id" }
                );
                localStorage.removeItem("favoritos_anonimos");
              }
            } catch { /* ignore */ }
          }
        }
      }
    );

    // Then get current session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
