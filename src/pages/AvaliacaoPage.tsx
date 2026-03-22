import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, BarChart3, MapPin, Settings2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone, rawPhone } from "@/lib/phoneMask";
import { whatsappLink } from "@/lib/whatsapp";
import { avaliarImovel, precoM2Fallback, formatPreco } from "@/services/avaliacao";
import type { DadosImovel, ResultadoAvaliacao } from "@/services/avaliacao";

const TIPOS = [
  { label: "Apartamento", icon: "🏢" },
  { label: "Casa", icon: "🏠" },
  { label: "Cobertura", icon: "🌆" },
  { label: "Studio / Kitnet", icon: "🏨" },
];

const ESTADOS: { val: DadosImovel["estado"]; label: string; sub: string }[] = [
  { val: "novo", label: "Novo / Alto padrão", sub: "Acabamento premium, reformado recentemente" },
  { val: "bom", label: "Bom estado", sub: "Bem conservado, sem necessidade de obras" },
  { val: "medio", label: "Padrão médio", sub: "Algumas atualizações necessárias" },
  { val: "reforma", label: "Precisa de reforma", sub: "Requer obra significativa" },
];

const DIFERENCIAIS = [
  "Churrasqueira", "Piscina", "Sacada", "Suíte", "Vista panorâmica",
  "Portaria 24h", "Elevador", "Salão de festas", "Playground", "Academia",
];

const ease = [0.16, 1, 0.3, 1];

export default function AvaliacaoPage() {
  const [passo, setPasso] = useState(1);
  const [dados, setDados] = useState<DadosImovel>({
    tipo: "", bairro: "", area: 0,
    quartos: 2, banheiros: 2, vagas: 1,
    estado: "bom", diferenciais: [],
  });
  const [resultado, setResultado] = useState<ResultadoAvaliacao | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [totalImoveis, setTotalImoveis] = useState(12000);
  const [dbBairros, setDbBairros] = useState<string[]>([]);
  const totalPassos = 5;

  useEffect(() => {
    supabase.rpc("get_bairros_disponiveis").then(({ data }) => {
      if (data) {
        setDbBairros(data.map((d: { bairro: string; count: number }) => d.bairro));
        setTotalImoveis(data.reduce((sum: number, d: { count: number }) => sum + d.count, 0));
      }
    });
  }, []);

  const bairrosFiltrados = dbBairros.filter(b =>
    !dados.bairro || b.toLowerCase().includes(dados.bairro.toLowerCase())
  ).slice(0, 12);

  async function finalizar() {
    setCalculando(true);
    try {
      await supabase.from("captacao_imoveis").insert({
        nome,
        telefone: rawPhone(telefone),
        bairro: dados.bairro,
        tipo_imovel: dados.tipo,
        utm_source: "calculadora_avaliacao",
      } as any);

      const res = await avaliarImovel(dados);
      setResultado(res);
      setPasso(6);
    } catch {
      // still show result even if lead save fails
      const res = await avaliarImovel(dados);
      setResultado(res);
      setPasso(6);
    } finally {
      setCalculando(false);
    }
  }

  function toggleDiferencial(d: string) {
    setDados(prev => ({
      ...prev,
      diferenciais: prev.diferenciais.includes(d)
        ? prev.diferenciais.filter(x => x !== d)
        : [...prev.diferenciais, d],
    }));
  }

  const canContinue: Record<number, boolean> = {
    1: !!dados.tipo,
    2: !!dados.bairro,
    3: dados.area > 0,
    4: true,
    5: !!nome && rawPhone(telefone).length >= 10,
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero header */}
        <div className="bg-primary px-6 pb-8 pt-12 text-center sm:px-10 sm:pt-16">
          <p className="mb-3 font-body text-[11px] font-bold uppercase tracking-widest text-primary-foreground/60">
            UhomePreço — Avaliação gratuita
          </p>
          <h1 className="mx-auto max-w-lg font-body text-3xl font-extrabold leading-tight text-primary-foreground sm:text-4xl">
            Quanto vale seu imóvel em Porto Alegre?
          </h1>
          <p className="mx-auto mt-3 max-w-md font-body text-sm text-primary-foreground/75">
            Baseado em dados reais de {totalImoveis.toLocaleString("pt-BR")} imóveis em POA.
            Resultado em segundos, 100% gratuito.
          </p>
        </div>

        {/* Main card */}
        <div className="bg-secondary/40 px-4 pb-16 sm:px-6">
          <div className="mx-auto -mt-1 max-w-[560px] rounded-2xl bg-background p-6 shadow-xl sm:p-9">

            {/* Progress */}
            {passo <= totalPassos && (
              <div className="mb-7">
                <div className="mb-2 flex items-center justify-between font-body text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">Passo {passo} de {totalPassos}</span>
                  <span>{Math.round((passo / totalPassos) * 100)}% concluído</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={false}
                    animate={{ width: `${(passo / totalPassos) * 100}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as any }}
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={passo}
                initial={{ opacity: 0, x: 24, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -24, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as any }}
              >
                {/* STEP 1 — Tipo */}
                {passo === 1 && (
                  <div>
                    <h2 className="mb-5 font-body text-xl font-extrabold text-foreground sm:text-2xl">
                      Qual o tipo do seu imóvel?
                    </h2>
                    <div className="mb-6 grid grid-cols-2 gap-3">
                      {TIPOS.map(op => (
                        <button
                          key={op.label}
                          onClick={() => { setDados(d => ({ ...d, tipo: op.label })); setPasso(2); }}
                          className={`flex flex-col items-center gap-2 rounded-xl border-[1.5px] p-5 font-body text-sm font-semibold transition-all active:scale-[0.97] ${
                            dados.tipo === op.label
                              ? "border-primary bg-primary/8 text-primary"
                              : "border-border text-foreground hover:border-foreground/30"
                          }`}
                        >
                          <span className="text-3xl">{op.icon}</span>
                          {op.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2 — Bairro */}
                {passo === 2 && (
                  <div>
                    <h2 className="mb-5 font-body text-xl font-extrabold text-foreground sm:text-2xl">
                      Em qual bairro fica?
                    </h2>
                    <input
                      placeholder="Digite o bairro..."
                      value={dados.bairro}
                      onChange={e => setDados(d => ({ ...d, bairro: e.target.value }))}
                      list="avaliacao-bairros"
                      className="mb-3 w-full rounded-xl border-[1.5px] border-border bg-transparent px-4 py-3.5 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                    />
                    <datalist id="avaliacao-bairros">
                      {bairrosFiltrados.map(b => <option key={b} value={b} />)}
                    </datalist>

                    {dados.bairro && precoM2Fallback[dados.bairro] && (
                      <div className="mb-4 rounded-xl bg-primary/8 px-4 py-3 font-body text-sm text-primary">
                        Preço médio em {dados.bairro}:{" "}
                        <strong>R$ {precoM2Fallback[dados.bairro].toLocaleString("pt-BR")}/m²</strong>
                      </div>
                    )}

                    <StepNav back={() => setPasso(1)} next={() => setPasso(3)} disabled={!canContinue[2]} />
                  </div>
                )}

                {/* STEP 3 — Características */}
                {passo === 3 && (
                  <div>
                    <h2 className="mb-5 font-body text-xl font-extrabold text-foreground sm:text-2xl">
                      Características do imóvel
                    </h2>
                    <div className="mb-5 grid grid-cols-2 gap-3">
                      <Field label="Área total (m²)">
                        <input
                          type="number"
                          placeholder="Ex: 85"
                          value={dados.area || ""}
                          onChange={e => setDados(d => ({ ...d, area: +e.target.value }))}
                          className="w-full bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                        />
                      </Field>
                      <Field label="Quartos">
                        <select
                          value={dados.quartos}
                          onChange={e => setDados(d => ({ ...d, quartos: +e.target.value }))}
                          className="w-full appearance-none bg-transparent font-body text-sm text-foreground outline-none"
                        >
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? "quarto" : "quartos"}</option>)}
                        </select>
                      </Field>
                      <Field label="Banheiros">
                        <select
                          value={dados.banheiros}
                          onChange={e => setDados(d => ({ ...d, banheiros: +e.target.value }))}
                          className="w-full appearance-none bg-transparent font-body text-sm text-foreground outline-none"
                        >
                          {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n === 1 ? "banheiro" : "banheiros"}</option>)}
                        </select>
                      </Field>
                      <Field label="Vagas de garagem">
                        <select
                          value={dados.vagas}
                          onChange={e => setDados(d => ({ ...d, vagas: +e.target.value }))}
                          className="w-full appearance-none bg-transparent font-body text-sm text-foreground outline-none"
                        >
                          <option value={0}>Sem vaga</option>
                          {[1, 2, 3].map(n => <option key={n} value={n}>{n} {n === 1 ? "vaga" : "vagas"}</option>)}
                        </select>
                      </Field>
                    </div>

                    <p className="mb-2 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Diferenciais (opcional)
                    </p>
                    <div className="mb-6 flex flex-wrap gap-2">
                      {DIFERENCIAIS.map(d => (
                        <button
                          key={d}
                          onClick={() => toggleDiferencial(d)}
                          className={`rounded-full border-[1.5px] px-3 py-1.5 font-body text-xs transition-all active:scale-[0.96] ${
                            dados.diferenciais.includes(d)
                              ? "border-primary bg-primary/10 font-semibold text-primary"
                              : "border-border text-muted-foreground hover:border-foreground/30"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    <StepNav back={() => setPasso(2)} next={() => setPasso(4)} disabled={!canContinue[3]} />
                  </div>
                )}

                {/* STEP 4 — Estado */}
                {passo === 4 && (
                  <div>
                    <h2 className="mb-5 font-body text-xl font-extrabold text-foreground sm:text-2xl">
                      Estado de conservação
                    </h2>
                    <div className="mb-6 flex flex-col gap-3">
                      {ESTADOS.map(op => (
                        <button
                          key={op.val}
                          onClick={() => setDados(d => ({ ...d, estado: op.val }))}
                          className={`rounded-xl border-[1.5px] p-4 text-left transition-all active:scale-[0.98] ${
                            dados.estado === op.val
                              ? "border-primary bg-primary/8"
                              : "border-border hover:border-foreground/30"
                          }`}
                        >
                          <div className={`font-body text-sm font-semibold ${dados.estado === op.val ? "text-primary" : "text-foreground"}`}>
                            {op.label}
                          </div>
                          <div className="mt-0.5 font-body text-xs text-muted-foreground">{op.sub}</div>
                        </button>
                      ))}
                    </div>
                    <StepNav back={() => setPasso(3)} next={() => setPasso(5)} />
                  </div>
                )}

                {/* STEP 5 — Contato */}
                {passo === 5 && (
                  <div>
                    <h2 className="mb-2 font-body text-xl font-extrabold text-foreground sm:text-2xl">
                      Para onde enviamos a avaliação?
                    </h2>
                    <p className="mb-5 font-body text-sm text-muted-foreground">
                      Gratuito e sem compromisso.
                    </p>

                    <Field label="Seu nome" className="mb-3">
                      <input
                        placeholder="João Silva"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        className="w-full bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                      />
                    </Field>
                    <Field label="WhatsApp" className="mb-5">
                      <input
                        type="tel"
                        placeholder="(51) 99999-9999"
                        value={telefone}
                        onChange={e => setTelefone(formatPhone(e.target.value))}
                        className="w-full bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                      />
                    </Field>

                    <div className="mb-6 space-y-2">
                      {[
                        "Avaliação baseada em dados reais de POA",
                        "Comparativo com imóveis similares no seu bairro",
                        "100% gratuito, sem compromisso",
                      ].map(item => (
                        <div key={item} className="flex items-start gap-2 font-body text-xs text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setPasso(4)}
                        className="flex items-center gap-1.5 rounded-xl px-4 py-3 font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-[0.97]"
                      >
                        <ArrowLeft className="h-4 w-4" /> Voltar
                      </button>
                      <button
                        onClick={finalizar}
                        disabled={calculando || !canContinue[5]}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-body text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
                      >
                        {calculando ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Calculando...</>
                        ) : (
                          <>Ver avaliação <ArrowRight className="h-4 w-4" /></>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* RESULT */}
                {passo === 6 && resultado && (
                  <div>
                    {/* Value card */}
                    <div className="mb-6 rounded-2xl bg-primary/8 p-6 text-center">
                      <p className="mb-1 font-body text-xs font-semibold uppercase tracking-wider text-primary">
                        Estimativa de valor de venda
                      </p>
                      <p className="mb-1 font-body text-sm text-muted-foreground">
                        {dados.tipo} em {dados.bairro}
                      </p>
                      <p className="my-2 font-body text-3xl font-extrabold text-primary sm:text-4xl">
                        {formatPreco(resultado.valorMin)} — {formatPreco(resultado.valorMax)}
                      </p>
                      <p className="font-body text-sm text-primary">
                        Valor central: <strong>{formatPreco(resultado.valorMedio)}</strong>
                      </p>
                      {resultado.confianca === "alta" && (
                        <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 font-body text-xs font-semibold text-green-800">
                          Alta confiança — {resultado.totalSimilares} imóveis similares
                        </span>
                      )}
                      {resultado.confianca === "media" && (
                        <span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 font-body text-xs font-semibold text-amber-800">
                          Confiança média — {resultado.totalSimilares} similares
                        </span>
                      )}
                      {resultado.confianca === "baixa" && (
                        <span className="mt-3 inline-block rounded-full bg-red-100 px-3 py-1 font-body text-xs font-semibold text-red-800">
                          Poucos dados — {resultado.totalSimilares} similares encontrados
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-3 gap-2">
                      {[
                        { val: `R$ ${resultado.precoM2Bairro.toLocaleString("pt-BR")}`, label: "Preço médio/m²" },
                        { val: String(resultado.totalSimilares), label: "Imóveis similares" },
                        { val: `${resultado.tempoMedioVenda} dias`, label: "Tempo médio venda" },
                      ].map(s => (
                        <div key={s.label} className="rounded-xl bg-secondary p-3 text-center">
                          <p className="font-body text-base font-bold text-foreground">{s.val}</p>
                          <p className="mt-0.5 font-body text-[11px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Similares */}
                    {resultado.imoveisSimilares.length > 0 && (
                      <div className="mb-6">
                        <p className="mb-3 font-body text-sm font-bold text-foreground">
                          Imóveis similares disponíveis
                        </p>
                        {resultado.imoveisSimilares.map((im: any) => (
                          <Link
                            key={im.id}
                            to={`/imovel/${im.slug}`}
                            target="_blank"
                            className="flex items-center justify-between border-b border-border py-3 font-body text-sm text-muted-foreground transition-colors last:border-0 hover:text-foreground"
                          >
                            <span>{im.titulo} · {im.area_total}m²</span>
                            <span className="font-semibold text-foreground">{formatPreco(im.preco)}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="rounded-2xl bg-primary p-6 text-center text-primary-foreground">
                      <p className="mb-2 font-body text-lg font-extrabold">Quer vender com a Uhome?</p>
                      <p className="mb-5 font-body text-sm opacity-80">
                        Fotos profissionais gratuitas + anúncio em destaque + corretor dedicado
                      </p>
                      <Link
                        to="/anunciar"
                        className="mb-3 block rounded-xl bg-background py-3.5 font-body text-sm font-bold text-primary transition-all hover:brightness-95 active:scale-[0.97]"
                      >
                        Anunciar meu imóvel gratuitamente
                      </Link>
                      <a
                        href={whatsappLink(`Olá! Fiz a avaliação do meu ${dados.tipo} em ${dados.bairro} e gostaria de mais informações.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl bg-primary-foreground/15 py-3 font-body text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/25 active:scale-[0.97]"
                      >
                        💬 Falar com corretor no WhatsApp
                      </a>
                    </div>

                    {/* Refazer */}
                    <button
                      onClick={() => { setPasso(1); setResultado(null); }}
                      className="mt-4 w-full text-center font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      ← Fazer nova avaliação
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Credibility section */}
        <section className="bg-background px-6 py-16 sm:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-2 font-body text-2xl font-extrabold text-foreground sm:text-3xl">
              Como o UhomePreço calcula o valor?
            </h2>
            <p className="mb-12 font-body text-sm text-muted-foreground">
              Nossa metodologia usa dados reais do mercado imobiliário de Porto Alegre.
            </p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { Icon: BarChart3, titulo: "Dados reais de POA", texto: `Analisamos ${totalImoveis.toLocaleString("pt-BR")}+ imóveis disponíveis no mercado imobiliário de Porto Alegre.` },
                { Icon: MapPin, titulo: "Preço por bairro", texto: "Calculamos o preço médio do m² em cada bairro e aplicamos multiplicadores baseados nas características." },
                { Icon: Settings2, titulo: "Ajuste por características", texto: "Tipo, área, quartos, vagas, estado de conservação e diferenciais são considerados na estimativa." },
              ].map(item => (
                <div key={item.titulo} className="px-2">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <item.Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-body text-base font-bold text-foreground">{item.titulo}</h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">{item.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

/* ── Reusable sub-components ── */

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block rounded-xl border-[1.5px] border-border p-3.5 transition-colors focus-within:border-primary ${className}`}>
      <span className="mb-0.5 block font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function StepNav({ back, next, disabled = false }: { back: () => void; next: () => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={back}
        className="flex items-center gap-1.5 rounded-xl px-4 py-3 font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-[0.97]"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <button
        onClick={next}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-3 font-body text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
      >
        Continuar <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
