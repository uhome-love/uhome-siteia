import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

async function checkAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role" as any, {
    _user_id: userId,
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["admin-role", user?.id],
    queryFn: () => checkAdmin(user!.id),
    enabled: !authLoading && !!user,
    staleTime: 5 * 60 * 1000, // cache 5 min — role rarely changes
    gcTime: 10 * 60 * 1000,
  });

  return {
    isAdmin,
    loading: authLoading || (!!user && isLoading),
    user,
  };
}
