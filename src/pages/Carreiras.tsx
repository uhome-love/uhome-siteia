import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCanonical } from "@/hooks/useCanonical";

const benefits = [
  {
    icon: "📈",
    title: "Crescimento real",
    text: "Comissões competitivas, carteira crescente de imóveis e suporte total para você fechar mais.",
  },
  {
    icon: "🤖",
    title: "Tecnologia a seu favor",
    text: "CRM próprio, busca por IA e portal moderno. Você foca nas pessoas, a tecnologia faz o resto.",
  },
  {
    icon: "🏙️",
    title: "Especialistas em POA",
    text: "Time local com profundo conhecimento dos bairros. Aqui você não é mais um número.",
  },
  {
    icon: "🤝",
    title: "Cultura colaborativa",
    text: "Ambiente de trabalho honesto, sem microgestão. Resultados reconhecidos e celebrados.",
  },
  {
    icon: "📱",
    title: "Trabalho flexível",
    text: "Modelo híbrido. Atenda seus clientes com liberdade e suporte quando precisar.",
  },
  {
    icon: "🎯",
    title: "Leads qualificados",
    text: "Receba leads direto do uhome.com.br. Menos prospecção fria, mais conversão.",
  },
];

const vagas = [
  {
    area: "Comercial",
    cargo: "Corretor de Imóveis",
    tipo: "PJ / Autônomo",
    modelo: "Híbrido",
    descricao:
      "Atendimento de leads qualificados, apresentação de imóveis e fechamento de negócios. CRECI ativo obrigatório.",
  },
  {
    area: "Comercial",
    cargo: "Corretor de Imóveis Sênior",
    tipo: "PJ / Autônomo",
    modelo: "Híbrido",
    descricao:
      "Perfil consultivo para imóveis de alto padrão. Experiência mínima de 3 anos no mercado de POA.",
  },
  {
    area: "Operações",
    cargo: "Assistente Administrativo",
    tipo: "CLT",
    modelo: "Presencial",
    descricao:
      "Suporte à equipe comercial, gestão de documentos e atendimento ao cliente.",
  },
  {
    area: "Marketing",
    cargo: "Analista de Marketing Digital",
    tipo: "CLT",
    modelo: "Híbrido",
    descricao:
      "Gestão de redes sociais, campanhas de performance e conteúdo para o portal uhome.com.br.",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const Carreiras = () => {
  const vagasRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = "Carreiras | Uhome Imóveis";
    return () => {
      document.title = "Uhome Imóveis | Apartamentos e Casas à Venda em Porto Alegre";
    };
  }, []);

  const scrollToVagas = () => {
    vagasRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="mt-16 flex min-h-[85vh] flex-col-reverse lg:flex-row">
        {/* Left — blue */}
        <div className="flex flex-1 flex-col justify-center bg-primary px-8 py-16 sm:px-16 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease }}
          >
            <p className="font-body text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
              Carreiras
            </p>
            <h1
              className="mt-4 font-body text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[1.1] text-white"
              style={{ textWrap: "balance" }}
            >
              Faça parte do time que está reinventando o mercado imobiliário de Porto Alegre.
            </h1>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-white/75">
              Na Uhome, corretores e profissionais de tecnologia trabalham juntos para transformar a
              experiência de comprar e vender imóveis.
            </p>
            <button
              onClick={scrollToVagas}
              className="mt-10 rounded-full border-2 border-white px-7 py-3 font-body text-sm font-bold text-white transition-all hover:bg-white hover:text-primary active:scale-[0.97]"
            >
              Ver vagas abertas
            </button>
          </motion.div>
        </div>

        {/* Right — photo */}
        <div className="relative flex-1 overflow-hidden">
          <motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease }}
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"
            alt="Equipe Uhome trabalhando"
            className="h-full min-h-[320px] w-full object-cover lg:min-h-0"
          />
        </div>
      </section>

      {/* ─── POR QUE A UHOME ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease }}
            className="text-center font-body text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold text-foreground"
            style={{ textWrap: "balance" }}
          >
            Por que trabalhar na Uhome?
          </motion.h2>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-4 font-body text-base font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VAGAS ABERTAS ─── */}
      <section ref={vagasRef} className="border-t border-border bg-secondary/30 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease }}
          >
            <h2 className="font-body text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold text-foreground">
              Vagas abertas
            </h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Porto Alegre, RS · Presencial e Híbrido
            </p>
          </motion.div>

          <div className="mt-10 space-y-4">
            {vagas.map((vaga, i) => (
              <motion.div
                key={vaga.cargo}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:gap-0"
              >
                <div className="flex-1">
                  <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-[11px] font-semibold text-primary">
                    {vaga.area}
                  </span>
                  <h3 className="mt-2 font-body text-base font-bold text-foreground">
                    {vaga.cargo}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <span className="font-body text-xs text-muted-foreground">{vaga.tipo}</span>
                    <span className="font-body text-xs text-muted-foreground">📍 {vaga.modelo}</span>
                  </div>
                  <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                    {vaga.descricao}
                  </p>
                </div>

                <a
                  href={`mailto:carreiras@uhome.com.br?subject=Candidatura: ${vaga.cargo}`}
                  className="shrink-0 self-start rounded-full bg-primary px-5 py-2.5 font-body text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97] sm:ml-6 sm:self-center"
                >
                  Candidatar →
                </a>
              </motion.div>
            ))}
          </div>

          {/* Candidatura espontânea */}
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3, ease }}
            className="mt-12 rounded-2xl border-2 border-dashed border-border p-8 text-center"
          >
            <p className="font-body text-base font-bold text-foreground">
              Não encontrou sua vaga?
            </p>
            <p className="mt-1.5 font-body text-sm text-muted-foreground">
              Mande seu currículo. Guardamos para oportunidades futuras.
            </p>
            <a
              href="mailto:carreiras@uhome.com.br?subject=Candidatura Espontânea"
              className="mt-5 inline-block rounded-full bg-primary px-7 py-3 font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97]"
            >
              Enviar currículo
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Carreiras;
