import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UhomeLogo } from "@/components/UhomeLogo";
import { useCanonical } from "@/hooks/useCanonical";
import { whatsappLink } from "@/lib/whatsapp";

const steps = [
  {
    numero: "01",
    titulo: "Cadastre seu imóvel",
    descricao: "Preencha as informações básicas e envie as fotos. Leva menos de 5 minutos.",
    icone: "📋",
  },
  {
    numero: "02",
    titulo: "Nossa equipe entra em contato",
    descricao: "Um corretor especializado avalia seu imóvel e cria um anúncio profissional.",
    icone: "📞",
  },
  {
    numero: "03",
    titulo: "Conectamos com compradores",
    descricao: "Seu imóvel aparece para milhares de compradores qualificados imediatamente.",
    icone: "🤝",
  },
];

const benefits = [
  { titulo: "Maior vitrine de POA", descricao: "Mais de 4.800 imóveis e milhares de compradores ativos buscando todos os dias.", destaque: "4.800+ compradores" },
  { titulo: "Busca por IA", descricao: "Nosso motor de busca com IA conecta seu imóvel exatamente com quem procura ele.", destaque: "Matching inteligente" },
  { titulo: "Zero custo para anunciar", descricao: "Anunciar é gratuito. Nossa comissão só acontece quando você vende.", destaque: "R$ 0 para começar" },
  { titulo: "Equipe especializada em POA", descricao: "Corretores com profundo conhecimento dos bairros e preços de Porto Alegre.", destaque: "Time local" },
  { titulo: "Fotos profissionais", descricao: "Oferecemos sessão fotográfica profissional para destacar seu imóvel.", destaque: "Incluso no serviço" },
  { titulo: "Acompanhamento em tempo real", descricao: "Você vê quantas pessoas viram seu imóvel e quem tem interesse.", destaque: "Dashboard de performance" },
];

const stats = [
  { numero: "4.800+", label: "compradores ativos" },
  { numero: "15 dias", label: "tempo médio de venda" },
  { numero: "100%", label: "digital e sem burocracia" },
  { numero: "0%", label: "custo para anunciar" },
];

const tiposImovel = ["Apartamento", "Casa", "Cobertura", "Studio / Kitnet", "Terreno", "Comercial"];

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const Anunciar = () => {
  useCanonical();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoImovel, setTipoImovel] = useState("");
  const [bairro, setBairro] = useState("");
  const [valorPretendido, setValorPretendido] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!nome.trim() || nome.trim().length < 2) {
      toast.error("Informe seu nome");
      return;
    }
    const tel = telefone.replace(/\D/g, "");
    if (tel.length < 10) {
      toast.error("Informe um WhatsApp válido");
      return;
    }
    if (!tipoImovel) {
      toast.error("Selecione o tipo do imóvel");
      return;
    }
    if (!bairro.trim()) {
      toast.error("Informe o bairro");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("captacao_imoveis" as any).insert({
        nome: nome.trim().slice(0, 100),
        telefone: tel.slice(0, 20),
        tipo_imovel: tipoImovel,
        bairro: bairro.trim().slice(0, 100),
        valor_pretendido: valorPretendido.trim().slice(0, 50) || null,
        mensagem: mensagem.trim().slice(0, 1000) || null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("form-anunciar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/[0.06] to-background px-6 pb-20 pt-28 text-center md:pt-36">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <motion.div
            custom={0} variants={fadeUp}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-1.5 font-body text-[13px] font-semibold text-primary"
          >
            <UhomeLogo variant="icon" height={18} />
            Uhome Imóveis · Porto Alegre
          </motion.div>

          <motion.h1
            custom={1} variants={fadeUp}
            className="mx-auto max-w-2xl font-body text-[clamp(2.25rem,5vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight text-foreground"
          >
            Venda seu imóvel{" "}
            <span className="text-primary">mais rápido</span> com a Uhome
          </motion.h1>

          <motion.p
            custom={2} variants={fadeUp}
            className="mx-auto mt-5 max-w-lg font-body text-lg leading-relaxed text-muted-foreground"
          >
            Mais de 4.800 compradores ativos buscando imóveis em Porto Alegre agora mesmo. Seu imóvel na vitrine certa.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={scrollToForm}
              className="rounded-full bg-primary px-8 py-4 font-body text-base font-bold text-primary-foreground shadow-lg transition-transform hover:shadow-xl active:scale-[0.97]"
            >
              Quero anunciar meu imóvel →
            </button>
            <a
              href="https://wa.me/5551999999999?text=Olá! Quero anunciar meu imóvel na Uhome."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-[1.5px] border-primary px-6 py-4 font-body text-base font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.97]"
            >
              Falar com corretor
            </a>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} className="mt-14 flex flex-wrap justify-center gap-10 md:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-body text-[clamp(1.5rem,3vw,1.75rem)] font-extrabold text-primary">{s.numero}</div>
                <div className="mt-1 font-body text-[13px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mx-auto max-w-[900px]">
          <motion.h2 custom={0} variants={fadeUp} className="text-center font-body text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-foreground">
            Simples assim
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="mt-3 text-center font-body text-base text-muted-foreground">
            Do cadastro à venda em 3 passos
          </motion.p>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.numero}
                custom={i + 2} variants={fadeUp}
                className="rounded-2xl border border-border bg-card p-8 shadow-sm"
              >
                <div className="mb-4 font-body text-[13px] font-bold tracking-wider text-primary">
                  PASSO {step.numero}
                </div>
                <div className="mb-4 text-[2rem]">{step.icone}</div>
                <h3 className="mb-2.5 font-body text-lg font-bold text-foreground">{step.titulo}</h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">{step.descricao}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="bg-secondary/40 px-6 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mx-auto max-w-[900px]">
          <motion.h2 custom={0} variants={fadeUp} className="text-center font-body text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-foreground">
            Por que anunciar com a Uhome?
          </motion.h2>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {benefits.map((item, i) => (
              <motion.div
                key={item.titulo}
                custom={i + 1} variants={fadeUp}
                className="flex gap-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <div className="h-4 w-4 rounded-[3px] bg-primary" />
                </div>
                <div>
                  <div className="mb-1 font-body text-[11px] font-bold tracking-wider text-primary">
                    {item.destaque}
                  </div>
                  <h3 className="mb-1.5 font-body text-[15px] font-bold text-foreground">{item.titulo}</h3>
                  <p className="font-body text-[13px] leading-relaxed text-muted-foreground">{item.descricao}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Form */}
      <section id="form-anunciar" className="px-6 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mx-auto max-w-[560px]">
          <motion.h2 custom={0} variants={fadeUp} className="text-center font-body text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-foreground">
            Cadastre seu imóvel
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="mt-2 text-center font-body text-base text-muted-foreground">
            Preencha abaixo e um corretor entra em contato em até 1h.
          </motion.p>

          {submitted ? (
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mt-10 text-center">
              <div className="text-5xl">✅</div>
              <h3 className="mt-4 font-body text-2xl font-extrabold text-foreground">Recebemos seu cadastro!</h3>
              <p className="mt-2 font-body text-base text-muted-foreground">
                Um corretor da Uhome vai entrar em contato no seu WhatsApp em até 1 hora.
              </p>
              <Link
                to="/busca"
                className="mt-6 inline-block rounded-full bg-primary px-7 py-3 font-body text-sm font-semibold text-primary-foreground"
              >
                Ver imóveis disponíveis
              </Link>
            </motion.div>
          ) : (
            <motion.div custom={2} variants={fadeUp} className="mt-10 flex flex-col gap-4">
              <FormField label="Seu nome *">
                <input
                  value={nome} onChange={(e) => setNome(e.target.value)}
                  placeholder="João Silva" maxLength={100}
                  className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </FormField>

              <FormField label="WhatsApp *">
                <input
                  value={telefone} onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(51) 99999-9999" type="tel" maxLength={20}
                  className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </FormField>

              <FormField label="Tipo do imóvel *">
                <select
                  value={tipoImovel} onChange={(e) => setTipoImovel(e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                >
                  <option value="">Selecione...</option>
                  {tiposImovel.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>

              <FormField label="Bairro *">
                <input
                  value={bairro} onChange={(e) => setBairro(e.target.value)}
                  placeholder="Ex: Moinhos de Vento" maxLength={100}
                  className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </FormField>

              <FormField label="Valor pretendido">
                <input
                  value={valorPretendido} onChange={(e) => setValorPretendido(e.target.value)}
                  placeholder="Ex: R$ 450.000" maxLength={50}
                  className="w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </FormField>

              <FormField label="Informações adicionais">
                <textarea
                  value={mensagem} onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Conte mais sobre seu imóvel: quartos, área, diferenciais..."
                  rows={4} maxLength={1000}
                  className="w-full resize-y rounded-lg border-[1.5px] border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </FormField>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-2 w-full rounded-lg bg-primary px-4 py-4 font-body text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? "Enviando..." : "Quero anunciar meu imóvel →"}
              </button>

              <p className="text-center font-body text-xs text-muted-foreground">
                Gratuito · Sem compromisso · Respondemos em até 1h
              </p>
            </motion.div>
          )}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-[13px] font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export default Anunciar;
