import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, BarChart3, MapPinned, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCorretor } from "@/contexts/CorretorContext";

const diferenciais = [
  {
    icon: Bot,
    titulo: "Busca Inteligente por IA",
    desc: "Descreva o imóvel em linguagem natural e a IA encontra as melhores opções para você.",
  },
  {
    icon: BarChart3,
    titulo: "UhomePreço",
    desc: "Análise de preço justo com dados reais do mercado de Porto Alegre em tempo real.",
  },
  {
    icon: MapPinned,
    titulo: "Mapa Interativo",
    desc: "Explore imóveis no mapa, desenhe sua área ideal e encontre o imóvel perfeito.",
  },
  {
    icon: UserCheck,
    titulo: "Corretor Dedicado",
    desc: "Cada cliente tem um corretor especializado no bairro de interesse. Sem enrolação.",
  },
];

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const duration = 1600;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [started, target]);

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true, amount: 0.5 }}
    >
      {value.toLocaleString("pt-BR")}{suffix}
    </motion.span>
  );
}

export function PorQueUhome() {
  const { prefixLink } = useCorretor();
  const [totalImoveis, setTotalImoveis] = useState(14600);

  useEffect(() => {
    supabase
      .from("imoveis")
      .select("*", { count: "exact", head: true })
      .eq("status", "disponivel")
      .then(({ count }) => {
        if (count && count > 0) setTotalImoveis(count);
      });
  }, []);

  const stats = [
    { numero: totalImoveis, suffix: "+", label: "Imóveis disponíveis" },
    { numero: 34, suffix: "", label: "Corretores especializados" },
    { numero: 100, suffix: "%", label: "Foco em Porto Alegre" },
  ];

  return (
    <section className="bg-secondary/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease }}
          className="text-center"
        >
          <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Por que escolher a Uhome
          </p>
          <h2
            className="mx-auto mt-3 max-w-xl font-body text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold leading-[1.15] tracking-tight text-foreground"
            style={{ textWrap: "balance" }}
          >
            A forma mais inteligente de comprar imóvel em Porto Alegre
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tecnologia de ponta, corretores especializados e dados reais do mercado para você tomar a melhor decisão.
          </p>
        </motion.div>

        {/* Diferenciais grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {diferenciais.map((item, i) => (
            <motion.div
              key={item.titulo}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-body text-sm font-bold text-foreground">
                {item.titulo}
              </h3>
              <p className="mt-2 font-body text-[13px] leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-body text-2xl font-extrabold text-primary sm:text-3xl">
                <AnimatedNumber target={stat.numero} suffix={stat.suffix} />
              </p>
              <p className="mt-1 font-body text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
          className="mt-12 text-center"
        >
          <Link
            to={prefixLink("/busca?finalidade=venda")}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-body text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-[0.97]"
          >
            Explorar imóveis →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
