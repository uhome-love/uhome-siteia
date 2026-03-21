import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Building2, Layers, MapPin, BedDouble,
  DollarSign, Sparkles, ChevronRight, ChevronLeft,
  Dog, Dumbbell, Waves, Eye, Car, Trees, KeyRound, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ease = [0.16, 1, 0.3, 1] as const;

/* ─── Types ─── */
interface OnboardingFilters {
  tipos: string[];
  bairros: string[];
  quartos: number | null;
  preco_max: number | null;
  diferenciais: string[];
}

/* ─── Data ─── */
const TIPOS = [
  { value: "apartamento", label: "Apartamento", icon: Building2 },
  { value: "casa", label: "Casa", icon: Home },
  { value: "cobertura", label: "Cobertura", icon: Layers },
  { value: "studio", label: "Studio", icon: Building2 },
];

const BAIRROS = [
  "Moinhos de Vento", "Petrópolis", "Bela Vista", "Auxiliadora",
  "Três Figueiras", "Higienópolis", "Cidade Baixa", "Bom Fim",
  "Menino Deus", "Tristeza", "Ipanema", "Cristal",
  "Jardim Botânico", "Boa Vista", "Passo d'Areia", "Centro Histórico",
];

const QUARTOS_OPTIONS = [
  { value: 1, label: "1 quarto" },
  { value: 2, label: "2 quartos" },
  { value: 3, label: "3 quartos" },
  { value: 4, label: "4+" },
];

const PRECOS = [
  { value: 300000, label: "Até R$300k" },
  { value: 500000, label: "Até R$500k" },
  { value: 800000, label: "Até R$800k" },
  { value: 1200000, label: "Até R$1.2M" },
  { value: 2000000, label: "Até R$2M" },
  { value: null as number | null, label: "Sem limite" },
];

const DIFERENCIAIS = [
  { value: "pet_friendly", label: "Pet friendly", icon: Dog },
  { value: "piscina", label: "Piscina", icon: Waves },
  { value: "academia", label: "Academia", icon: Dumbbell },
  { value: "vista", label: "Vista", icon: Eye },
  { value: "vaga", label: "Vaga coberta", icon: Car },
  { value: "area_verde", label: "Área verde", icon: Trees },
];

/* ─── Step Illustration ─── */
function StepIcon({ step }: { step: number }) {
  const icons = [Building2, MapPin, BedDouble, DollarSign, Sparkles, KeyRound];
  const Icon = icons[step] ?? KeyRound;
  return (
    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
      <Icon className="h-8 w-8 text-white" strokeWidth={1.5} />
    </div>
  );
}

/* ─── Main Component ─── */
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [totalEncontrados, setTotalEncontrados] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<OnboardingFilters>({
    tipos: [],
    bairros: [],
    quartos: null,
    preco_max: null,
    diferenciais: [],
  });

  // Contact form (final step)
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  /* ─── Real-time counter ─── */
  const atualizarContador = useCallback(async (f: OnboardingFilters) => {
    let query = supabase
      .from("imoveis")
      .select("*", { count: "exact", head: true })
      .eq("status", "disponivel");

    if (f.tipos.length) query = query.in("tipo", f.tipos);
    if (f.bairros.length) query = query.in("bairro", f.bairros);
    if (f.quartos) query = query.gte("quartos", f.quartos);
    if (f.preco_max) query = query.lte("preco", f.preco_max);

    const { count } = await query;
    setTotalEncontrados(count ?? 0);
  }, []);

  useEffect(() => {
    atualizarContador(filters);
  }, [filters, atualizarContador]);

  /* ─── Navigation ─── */
  const totalSteps = 6; // 0-4 filter steps + 5 contact

  const goNext = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const pular = () => {
    localStorage.setItem("uhome_onboarding_done", "1");
    navigate("/");
  };

  /* ─── Toggle helpers ─── */
  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  /* ─── Finalize ─── */
  const finalizar = async () => {
    if (!nome.trim() || !whatsapp.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }

    setLoading(true);
    try {
      await supabase.from("public_leads").insert({
        nome: nome.trim(),
        telefone: whatsapp.trim(),
        email: email.trim() || null,
        origem_pagina: "/onboarding",
        origem_componente: "wizard_onboarding",
        tipo_interesse: "comprar",
      });

      if (email.trim()) {
        const descParts: string[] = [];
        if (filters.tipos.length) descParts.push(filters.tipos.join(", "));
        if (filters.bairros.length) descParts.push(`em ${filters.bairros.join(", ")}`);
        if (filters.quartos) descParts.push(`${filters.quartos}+ quartos`);
        if (filters.preco_max) descParts.push(`até R$${(filters.preco_max / 1000).toFixed(0)}k`);

        await supabase.from("buscas_salvas").insert({
          email: email.trim(),
          filters: filters as any,
          descricao_humana: descParts.join(" · ") || "Sem filtros específicos",
          ativa: true,
        });
      }

      localStorage.setItem("uhome_onboarding_done", "1");

      const params = new URLSearchParams();
      params.set("finalidade", "venda");
      if (filters.tipos[0]) params.set("tipo", filters.tipos[0]);
      if (filters.bairros[0]) params.set("q", filters.bairros[0]);
      if (filters.quartos) params.set("quartos", String(filters.quartos));
      if (filters.preco_max) params.set("preco_max", String(filters.preco_max));

      navigate(`/busca?${params.toString()}`);
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Step content ─── */
  const steps = [
    // 0 — Tipo
    {
      title: "Que tipo de imóvel você procura?",
      subtitle: "Selecione um ou mais",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {TIPOS.map(({ value, label, icon: Icon }) => {
            const active = filters.tipos.includes(value);
            return (
              <button
                key={value}
                onClick={() => setFilters((f) => ({ ...f, tipos: toggleArray(f.tipos, value) }))}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.97] ${
                  active
                    ? "border-white bg-white/20 text-white"
                    : "border-white/20 text-white/80 hover:border-white/40"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[14px] font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    // 1 — Bairro
    {
      title: "Quais bairros te interessam?",
      subtitle: "Selecione quantos quiser",
      content: (
        <div className="flex flex-wrap gap-2">
          {BAIRROS.map((b) => {
            const active = filters.bairros.includes(b);
            return (
              <button
                key={b}
                onClick={() => setFilters((f) => ({ ...f, bairros: toggleArray(f.bairros, b) }))}
                className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all active:scale-[0.97] ${
                  active
                    ? "border-white bg-white/20 text-white"
                    : "border-white/25 text-white/75 hover:border-white/50"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      ),
    },
    // 2 — Quartos
    {
      title: "Quantos quartos?",
      subtitle: "Mínimo de quartos desejado",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {QUARTOS_OPTIONS.map(({ value, label }) => {
            const active = filters.quartos === value;
            return (
              <button
                key={value}
                onClick={() => setFilters((f) => ({ ...f, quartos: active ? null : value }))}
                className={`rounded-xl border-2 px-4 py-3.5 text-[14px] font-semibold transition-all active:scale-[0.97] ${
                  active
                    ? "border-white bg-white/20 text-white"
                    : "border-white/20 text-white/80 hover:border-white/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      ),
    },
    // 3 — Preço
    {
      title: "Qual seu orçamento?",
      subtitle: "Valor máximo de compra",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {PRECOS.map(({ value, label }) => {
            const active = filters.preco_max === value;
            return (
              <button
                key={label}
                onClick={() => setFilters((f) => ({ ...f, preco_max: active ? null : value }))}
                className={`rounded-xl border-2 px-4 py-3.5 text-[14px] font-semibold transition-all active:scale-[0.97] ${
                  active
                    ? "border-white bg-white/20 text-white"
                    : "border-white/20 text-white/80 hover:border-white/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      ),
    },
    // 4 — Diferenciais
    {
      title: "O que não pode faltar?",
      subtitle: "Diferenciais do imóvel",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {DIFERENCIAIS.map(({ value, label, icon: Icon }) => {
            const active = filters.diferenciais.includes(value);
            return (
              <button
                key={value}
                onClick={() => setFilters((f) => ({ ...f, diferenciais: toggleArray(f.diferenciais, value) }))}
                className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-left transition-all active:scale-[0.97] ${
                  active
                    ? "border-white bg-white/20 text-white"
                    : "border-white/20 text-white/80 hover:border-white/40"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-[13px] font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    // 5 — Contact
    {
      title: "Quase lá! Como podemos te contatar?",
      subtitle: "Para enviar os imóveis que combinam com você",
      content: (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-[14px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-white/50"
          />
          <input
            type="tel"
            placeholder="WhatsApp (com DDD)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-[14px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-white/50"
          />
          <input
            type="email"
            placeholder="E-mail (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-[14px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-white/50"
          />
        </div>
      ),
    },
  ];

  const isLastStep = step === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary">
      {/* Skip button */}
      <button
        onClick={pular}
        className="absolute right-5 top-5 flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium text-white/60 transition-colors hover:text-white/90"
      >
        Pular
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Logo */}
      <div className="absolute left-6 top-5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420" className="h-9 w-9" aria-label="Uhome">
          <path d="M 213.0 399.5 L 181.0 397.5 L 152.0 390.5 L 136.0 384.5 L 104.0 367.5 L 74.0 342.5 L 53.5 318.0 L 36.5 288.0 L 24.5 253.0 L 19.5 218.0 L 21.5 181.0 L 25.5 161.0 L 31.5 142.0 L 46.5 111.0 L 64.5 86.0 L 92.0 59.5 L 121.0 40.5 L 155.0 26.5 L 191.0 19.5 L 229.0 19.5 L 264.0 26.5 L 284.0 33.5 L 304.0 43.5 L 330.0 61.5 L 353.5 84.0 L 364.5 98.0 L 376.5 117.0 L 391.5 152.0 L 399.5 192.0 L 399.5 226.0 L 396.5 247.0 L 391.5 266.0 L 384.5 285.0 L 376.5 301.0 L 367.5 316.0 L 353.5 334.0 L 324.0 361.5 L 295.0 379.5 L 274.0 388.5 L 253.0 394.5 L 213.0 399.5 Z" fill="white" />
          <path d="M 214.0 363.5 L 190.0 362.5 L 168.0 357.5 L 158.0 353.5 L 143.0 344.5 L 127.5 330.0 L 114.5 309.0 L 106.5 281.0 L 105.5 205.0 L 104.0 203.5 L 66.5 203.0 L 210.0 54.5 L 246.0 91.5 L 247.0 75.5 L 311.5 76.0 L 311.5 160.0 L 353.5 203.0 L 314.5 204.0 L 314.5 260.0 L 312.5 282.0 L 303.5 311.0 L 291.5 330.0 L 277.0 343.5 L 260.0 353.5 L 238.0 360.5 L 214.0 363.5 Z M 222.5 344.0 L 242.0 340.5 L 260.0 332.5 L 272.0 323.5 L 283.5 309.0 L 292.5 287.0 L 295.5 268.0 L 295.5 186.0 L 309.5 185.0 L 292.5 167.0 L 292.5 95.0 L 265.5 95.0 L 265.0 138.5 L 210.0 81.5 L 109.5 185.0 L 123.5 186.0 L 124.5 276.0 L 130.5 299.0 L 139.5 315.0 L 154.0 329.5 L 173.0 339.5 L 194.0 344.5 L 222.5 344.0 Z M 219.0 318.5 L 201.0 318.5 L 181.0 312.5 L 164.5 298.0 L 157.5 285.0 L 153.5 267.0 L 154.0 185.5 L 171.5 186.0 L 171.5 262.0 L 175.5 280.0 L 179.5 287.0 L 187.0 294.5 L 195.0 298.5 L 204.0 300.5 L 225.0 298.5 L 234.0 293.5 L 240.5 287.0 L 244.5 279.0 L 247.5 267.0 L 247.5 186.0 L 266.5 186.0 L 266.5 259.0 L 265.5 271.0 L 260.5 289.0 L 254.5 299.0 L 244.0 309.5 L 232.0 315.5 L 219.0 318.5 Z" fill="hsl(var(--primary))" />
        </svg>
      </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col px-6">
        {/* Progress bar */}
        <div className="mb-8 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <StepIcon step={step} />

            <h1 className="mb-1 text-[22px] font-extrabold leading-tight text-white">
              {steps[step].title}
            </h1>
            <p className="mb-6 text-[14px] text-white/60">{steps[step].subtitle}</p>

            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        {/* Counter */}
        {totalEncontrados !== null && step < 5 && (
          <motion.div
            key={totalEncontrados}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-center text-[13px] font-medium text-white/60"
          >
            <span className="font-bold text-white">{totalEncontrados.toLocaleString("pt-BR")}</span>{" "}
            imóveis encontrados
          </motion.div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1 rounded-full px-4 py-2.5 text-[13px] font-medium text-white/70 transition-colors hover:text-white active:scale-[0.97]"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
          ) : (
            <div />
          )}

          {isLastStep ? (
            <button
              onClick={finalizar}
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-primary shadow-lg transition-all hover:shadow-xl active:scale-[0.97] disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Ver meus imóveis"}
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-primary shadow-lg transition-all hover:shadow-xl active:scale-[0.97]"
            >
              Continuar
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
