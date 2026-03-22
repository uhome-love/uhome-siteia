import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhone } from "@/lib/phoneMask";
import { bairrosData } from "@/data/bairros";
import { CIDADES_PERMITIDAS } from "@/services/imoveis";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function HeroSection() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"comprar" | "anunciar">("comprar");

  // Search state
  const [bairroInput, setBairroInput] = useState("");
  const [bairrosSelecionados, setBairrosSelecionados] = useState<string[]>([]);
  const [bairroOpen, setBairroOpen] = useState(false);
  const bairroRef = useRef<HTMLDivElement>(null);
  const [tipo, setTipo] = useState("");
  const [cidade, setCidade] = useState("Porto Alegre");
  const [preco, setPreco] = useState("");
  const [quartos, setQuartos] = useState("");

  // Anunciar state
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [bairroAnuncio, setBairroAnuncio] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic neighborhood suggestions from DB — single efficient query
  const [dbBairros, setDbBairros] = useState<string[]>([]);

  useEffect(() => {
    async function loadBairros() {
      const { data } = await supabase.rpc("get_bairros_disponiveis");
      if (data) {
        setDbBairros(data.map((d: { bairro: string }) => d.bairro));
      }
    }
    loadBairros();
  }, []);

  const bairroSuggestions = useMemo(() => {
    const allBairros = dbBairros.length > 0 ? dbBairros : bairrosData.map((b) => b.nome);
    const base = allBairros.filter((b) => !bairrosSelecionados.includes(b));
    if (!bairroInput.trim()) return base.slice(0, 8);
    const q = bairroInput.toLowerCase();
    return base.filter((b) => b.toLowerCase().includes(q)).slice(0, 10);
  }, [bairroInput, bairrosSelecionados, dbBairros]);


  const addBairro = (nome: string) => {
    if (!bairrosSelecionados.includes(nome)) {
      setBairrosSelecionados((prev) => [...prev, nome]);
    }
    setBairroInput("");
    setBairroOpen(false);
  };

  const removeBairro = (nome: string) => {
    setBairrosSelecionados((prev) => prev.filter((b) => b !== nome));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bairroRef.current && !bairroRef.current.contains(e.target as Node)) {
        setBairroOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBuscar = () => {
    const params = new URLSearchParams();
    params.set("finalidade", "venda");
    if (bairrosSelecionados.length) params.set("q", bairrosSelecionados.join(","));
    else if (bairroInput.trim()) params.set("q", bairroInput.trim());
    if (tipo) params.set("tipo", tipo);
    if (preco) params.set("preco_max", preco);
    if (quartos) params.set("quartos", quartos);
    if (cidade && cidade !== "Porto Alegre") params.set("cidade", cidade);
    navigate(`/busca?${params.toString()}`);
  };

  const handleAnunciar = async () => {
    if (!nome.trim() || !telefone.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("captacao_imoveis").insert({
        nome: nome.trim(),
        telefone: telefone.trim(),
        bairro: bairroAnuncio.trim() || null,
        utm_source: "hero_home",
      });
      if (error) throw error;
      setEnviado(true);
      toast.success("Cadastro recebido!");
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const quartosOptions = ["Qualquer", "1+", "2+", "3+", "4+"];

  return (
    <section className="relative flex min-h-[auto] items-center overflow-hidden pt-16 lg:min-h-[92vh]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.webp"
          alt=""
          fetchPriority="high"
          decoding="sync"
          className="h-full w-full object-cover"
          style={{ objectPosition: "center center" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.1) 100%), linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.0) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:gap-16">
          {/* Left — headline */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease }}
            className="max-w-lg"
          >
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Porto Alegre & Região
            </p>
            <h1
              className="font-body text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
              style={{ textWrap: "balance" }}
            >
              Encontre o imóvel{" "}
              <span className="text-primary">perfeito</span> para você
            </h1>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-white/70">
              Apartamentos, casas e coberturas com curadoria especializada e busca inteligente por IA.
            </p>
          </motion.div>

          {/* Right — card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl sm:p-7 lg:ml-auto"
          >
            {/* Toggle */}
            <div className="mb-4 flex gap-2 sm:mb-6">
              {(["comprar", "anunciar"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModo(m)}
                  className={`rounded-full border-[1.5px] px-5 py-2 font-body text-sm transition-all active:scale-[0.97] ${
                    modo === m
                      ? "border-primary bg-primary/5 font-bold text-primary"
                      : "border-border font-normal text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {m === "comprar" ? "Buscar imóveis" : "Anunciar imóvel"}
                </button>
              ))}
            </div>

            {modo === "comprar" ? (
              <>
                {/* Bairro with autocomplete */}
                <div ref={bairroRef} className="relative mb-2 sm:mb-2.5">
                  <div className="rounded-xl border-[1.5px] border-border p-3 transition-colors focus-within:border-primary sm:p-3.5">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="mb-1 block font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Bairros ou regiões
                        </span>
                        {bairrosSelecionados.length > 0 && (
                          <div className="mb-1.5 flex flex-wrap gap-1">
                            {bairrosSelecionados.map((nome) => (
                              <span
                                key={nome}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-xs font-semibold text-primary"
                              >
                                {nome}
                                <button
                                  type="button"
                                  onClick={() => removeBairro(nome)}
                                  className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <input
                          type="text"
                          value={bairroInput}
                          onChange={(e) => { setBairroInput(e.target.value); setBairroOpen(true); }}
                          onFocus={() => setBairroOpen(true)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { setBairroOpen(false); handleBuscar(); }
                            if (e.key === "Escape") setBairroOpen(false);
                            if (e.key === "Backspace" && !bairroInput && bairrosSelecionados.length) {
                              removeBairro(bairrosSelecionados[bairrosSelecionados.length - 1]);
                            }
                          }}
                          placeholder={bairrosSelecionados.length ? "Adicionar bairro..." : "Ex: Moinhos de Vento, Petrópolis..."}
                          className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {bairroOpen && bairroSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
                      >
                        {bairroSuggestions.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => addBairro(b)}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-body text-sm text-foreground transition-colors hover:bg-secondary"
                          >
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            {b}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tipo + Preço */}
                <div className="mb-2 grid grid-cols-3 gap-2 sm:mb-2.5 sm:gap-2.5">
                  {/* Cidade */}
                  <label className="block rounded-xl border-[1.5px] border-border p-3 transition-colors focus-within:border-primary sm:p-3.5">
                    <span className="mb-0.5 block font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Cidade
                    </span>
                    <select
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full appearance-none bg-transparent font-body text-sm text-foreground focus:outline-none"
                    >
                      {CIDADES_PERMITIDAS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block rounded-xl border-[1.5px] border-border p-3 transition-colors focus-within:border-primary sm:p-3.5">
                    <span className="mb-0.5 block font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Tipo de imóvel
                    </span>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      className={`w-full appearance-none bg-transparent font-body text-sm focus:outline-none ${
                        tipo ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      <option value="">Todos</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="casa">Casa</option>
                      <option value="cobertura">Cobertura</option>
                      <option value="studio">Studio / Kitnet</option>
                      <option value="comercial">Comercial</option>
                    </select>
                  </label>

                  <label className="block rounded-xl border-[1.5px] border-border p-3 transition-colors focus-within:border-primary sm:p-3.5">
                    <span className="mb-0.5 block font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Valor até
                    </span>
                    <select
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      className={`w-full appearance-none bg-transparent font-body text-sm focus:outline-none ${
                        preco ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      <option value="">Qualquer</option>
                      <option value="300000">R$ 300 mil</option>
                      <option value="500000">R$ 500 mil</option>
                      <option value="800000">R$ 800 mil</option>
                      <option value="1000000">R$ 1 milhão</option>
                      <option value="1500000">R$ 1,5 milhão</option>
                      <option value="2000000">R$ 2 milhões</option>
                      <option value="3000000">R$ 3 milhões+</option>
                    </select>
                  </label>
                </div>

                {/* Quartos */}
                <div className="mb-4 sm:mb-5">
                  <span className="mb-2 block font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Quartos
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {quartosOptions.map((q, i) => {
                      const val = i === 0 ? "" : String(i);
                      const active = quartos === val;
                      return (
                        <button
                          key={q}
                          onClick={() => setQuartos(val)}
                          className={`rounded-full border-[1.5px] px-3 py-1.5 font-body text-xs transition-all active:scale-[0.96] sm:px-4 ${
                            active
                              ? "border-primary bg-primary/10 font-semibold text-primary"
                              : "border-border text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleBuscar}
                  className="mb-3 w-full rounded-xl bg-primary py-3.5 font-body text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
                >
                  Buscar imóveis
                </button>

                <button
                  onClick={() => navigate("/ia-search")}
                  className="mx-auto flex items-center gap-1.5 font-body text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Busca inteligente por IA
                </button>
              </>
            ) : enviado ? (
              <div className="py-8 text-center">
                <p className="mb-2 text-3xl">✅</p>
                <p className="font-body text-base font-bold text-foreground">Recebemos seu cadastro!</p>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  Um corretor entrará em contato em até 1h.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-body text-lg font-extrabold text-foreground">Venda mais rápido</h3>
                <p className="mb-5 mt-1 font-body text-xs text-muted-foreground">
                  4.800+ compradores ativos em Porto Alegre
                </p>

                {[
                  { label: "Seu nome", value: nome, set: setNome, ph: "João Silva", type: "text" },
                  { label: "WhatsApp", value: telefone, set: setTelefone, ph: "(51) 99999-9999", type: "tel" },
                  { label: "Bairro do imóvel", value: bairroAnuncio, set: setBairroAnuncio, ph: "Ex: Moinhos de Vento", type: "text" },
                ].map((f) => (
                  <label
                    key={f.label}
                    className="mb-2.5 block rounded-xl border-[1.5px] border-border p-3.5 transition-colors focus-within:border-primary"
                  >
                    <span className="mb-0.5 block font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {f.label}
                    </span>
                    <input
                      type={f.type}
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder={f.ph}
                      className="w-full bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                  </label>
                ))}

                <button
                  onClick={handleAnunciar}
                  disabled={loading}
                  className="mt-1 w-full rounded-xl bg-primary py-3.5 font-body text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Quero anunciar →"}
                </button>
                <p className="mt-3 text-center font-body text-[11px] text-muted-foreground">
                  Gratuito · Resposta em até 1h
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
