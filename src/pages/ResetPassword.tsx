import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Check, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    // Also listen for auth state change with recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getStrength = (pw: string): { level: number; label: string; color: string } => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { level: 1, label: "Fraca", color: "bg-destructive" };
    if (score <= 3) return { level: 2, label: "Média", color: "bg-yellow-500" };
    return { level: 3, label: "Forte", color: "bg-green-500" };
  };

  const strength = getStrength(password);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Senha atualizada com sucesso!");
      setTimeout(() => navigate("/"), 2000);
    }
  };

  const inputClass =
    "w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary";

  if (!isRecovery) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-20">
          <div className="w-full max-w-md text-center">
            <h1 className="font-body text-2xl font-bold text-foreground">Link inválido</h1>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Este link de recuperação de senha é inválido ou expirou.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-20">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-7 w-7 text-green-500" />
              </div>
              <h2 className="font-body text-xl font-bold text-foreground">Senha atualizada!</h2>
              <p className="font-body text-sm text-muted-foreground">Redirecionando...</p>
            </div>
          ) : (
            <>
              <h1 className="font-body text-2xl font-bold text-foreground">Nova senha</h1>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Digite sua nova senha abaixo.
              </p>

              <form onSubmit={handleReset} className="mt-6 flex flex-col gap-4">
                <div>
                  <input
                    type="password"
                    placeholder="Nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={72}
                    className={inputClass}
                    autoFocus
                  />
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex flex-1 gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= strength.level ? strength.color : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-body text-xs text-muted-foreground">
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  maxLength={72}
                  className={inputClass}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Atualizar senha
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
