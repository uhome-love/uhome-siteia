import { useState, useCallback } from "react";
import { X, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "login" | "cadastro" | "forgot";

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const senhaSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);
const nomeSchema = z.string().trim().min(2, "Nome muito curto").max(100);

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 1 min

function getStrength(pw: string): { level: number; label: string; color: string } {
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
}

export function AuthModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const isLocked = Date.now() < lockedUntil;
  const strength = getStrength(senha);

  const checkRateLimit = useCallback(() => {
    if (isLocked) {
      const secsLeft = Math.ceil((lockedUntil - Date.now()) / 1000);
      toast.error(`Muitas tentativas. Tente novamente em ${secsLeft}s`);
      return false;
    }
    return true;
  }, [isLocked, lockedUntil]);

  const incrementAttempts = useCallback(() => {
    const next = attempts + 1;
    setAttempts(next);
    if (next >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCKOUT_MS);
      setAttempts(0);
    }
  }, [attempts]);

  const handleGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Erro ao conectar com Google");
  };

  const handleLogin = async () => {
    if (!checkRateLimit()) return;

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }
    const senhaResult = senhaSchema.safeParse(senha);
    if (!senhaResult.success) {
      toast.error(senhaResult.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailResult.data,
      password: senha,
    });
    setLoading(false);

    if (error) {
      incrementAttempts();
      toast.error(
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos"
          : error.message
      );
    } else {
      setAttempts(0);
      toast.success("Login realizado!");
      onClose();
    }
  };

  const handleCadastro = async () => {
    const nomeResult = nomeSchema.safeParse(nome);
    if (!nomeResult.success) {
      toast.error(nomeResult.error.errors[0].message);
      return;
    }
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }
    const senhaResult = senhaSchema.safeParse(senha);
    if (!senhaResult.success) {
      toast.error(senhaResult.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: emailResult.data,
      password: senha,
      options: {
        data: { nome: nomeResult.data },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      onClose();
    }
  };

  const handleForgotPassword = async () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(emailResult.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setTab("login");
    }
  };

  const inputClass =
    "w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/40 backdrop-blur-sm px-4 py-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px] my-auto rounded-2xl bg-card p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {tab === "forgot" && (
                  <button
                    onClick={() => setTab("login")}
                    className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <h2 className="font-body text-xl font-extrabold text-foreground">
                  {tab === "login" ? "Entrar" : tab === "cadastro" ? "Criar conta" : "Recuperar senha"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {tab === "forgot" ? (
              /* Forgot password form */
              <div className="mt-6 flex flex-col gap-3">
                <p className="font-body text-sm text-muted-foreground">
                  Digite seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  type="email"
                  maxLength={255}
                  className={inputClass}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleForgotPassword();
                  }}
                />
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enviar link de recuperação
                </button>
              </div>
            ) : (
              <>
                {/* Google */}
                <button
                  onClick={handleGoogle}
                  className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-border px-4 py-3 font-body text-sm font-semibold text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar com Google
                </button>

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="font-body text-xs text-muted-foreground">ou</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Form */}
                <div className="flex flex-col gap-3">
                  {tab === "cadastro" && (
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      maxLength={100}
                      className={inputClass}
                    />
                  )}
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    type="email"
                    maxLength={255}
                    className={inputClass}
                  />
                  <div>
                    <input
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Senha"
                      type="password"
                      maxLength={72}
                      className={inputClass}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          tab === "login" ? handleLogin() : handleCadastro();
                        }
                      }}
                    />
                    {/* Password strength indicator */}
                    {senha && (tab === "cadastro" || tab === "login") && (
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

                  {/* Forgot password link */}
                  {tab === "login" && (
                    <button
                      onClick={() => setTab("forgot")}
                      className="self-end font-body text-xs text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  )}

                  <button
                    onClick={tab === "login" ? handleLogin : handleCadastro}
                    disabled={loading || isLocked}
                    className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLocked
                      ? `Aguarde ${Math.ceil((lockedUntil - Date.now()) / 1000)}s`
                      : tab === "login"
                        ? "Entrar"
                        : "Criar conta"}
                  </button>
                </div>

                {/* Toggle */}
                <p className="mt-5 text-center font-body text-[13px] text-muted-foreground">
                  {tab === "login" ? (
                    <>
                      Não tem conta?{" "}
                      <button
                        onClick={() => setTab("cadastro")}
                        className="font-semibold text-primary hover:underline"
                      >
                        Criar conta
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem conta?{" "}
                      <button
                        onClick={() => setTab("login")}
                        className="font-semibold text-primary hover:underline"
                      >
                        Entrar
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
