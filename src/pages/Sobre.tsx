import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useCanonical } from "@/hooks/useCanonical";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { Building2, Users, ShieldCheck, Lightbulb, MapPin, Phone, Mail, Award } from "lucide-react";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, buildWhatsAppUrl } from "@/lib/whatsapp";
import { motion } from "framer-motion";
import { useWhatsAppLeadStore } from "@/stores/whatsappLeadStore";

const Sobre = () => {
  const openLeadModal = useWhatsAppLeadStore((s) => s.openModal);
  useCanonical("/sobre");

  useEffect(() => {
    document.title = "Sobre a Uhome | Imobiliária Digital em Porto Alegre";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Conheça a Uhome, imobiliária digital de Porto Alegre. Equipe especializada, CRECI-RS 25682J, tecnologia de busca com IA e curadoria de imóveis nos melhores bairros.");
    }

    setJsonLd("jsonld-about", {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "Sobre a Uhome Imóveis",
      description: "Imobiliária digital de Porto Alegre com busca por IA e curadoria especializada.",
      mainEntity: {
        "@type": "RealEstateAgent",
        name: "Uhome Imóveis",
        url: "https://uhome.com.br",
        logo: "https://uhome.com.br/uhome-logo.svg",
        foundingDate: "2024",
        description: "Imobiliária digital em Porto Alegre com mais de 14.600 imóveis, busca por IA e curadoria especializada.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Porto Alegre",
          addressLocality: "Porto Alegre",
          addressRegion: "RS",
          addressCountry: "BR",
        },
        telephone: `+55${WHATSAPP_NUMBER}`,
        areaServed: { "@type": "City", name: "Porto Alegre" },
        sameAs: ["https://www.instagram.com/uhome.imoveis"],
      },
    });

    return () => removeJsonLd("jsonld-about");
  }, []);

  const valores = [
    { icon: Lightbulb, title: "Inovação", desc: "Busca inteligente com IA que entende linguagem natural e encontra o imóvel perfeito para cada perfil." },
    { icon: ShieldCheck, title: "Transparência", desc: "Preços reais, fotos atualizadas e informações completas. Sem surpresas na hora da visita." },
    { icon: Users, title: "Curadoria", desc: "Cada imóvel é analisado pela equipe antes de entrar na plataforma. Qualidade acima de quantidade." },
    { icon: Award, title: "Excelência", desc: "CRECI-RS 25682J. Corretores certificados e comprometidos com o melhor atendimento." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 pt-28 pb-16">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumbs items={[{ label: "Sobre a Uhome" }]} className="mb-6" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight">
                A imobiliária digital de Porto Alegre
              </h1>
              <p className="mt-4 text-lg text-muted-foreground font-body leading-relaxed">
                A Uhome nasceu com a missão de transformar a experiência de comprar imóvel em Porto Alegre.
                Combinamos <strong>tecnologia de busca com inteligência artificial</strong>, curadoria especializada
                e atendimento humanizado para conectar você ao imóvel ideal.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Números */}
        <section className="py-12 border-b border-border">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { num: "14.600+", label: "Imóveis disponíveis" },
                { num: "80+", label: "Bairros cobertos" },
                { num: "CRECI-RS", label: "25682J" },
                { num: "100%", label: "Digital e transparente" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <p className="text-2xl md:text-3xl font-heading font-bold text-primary">{stat.num}</p>
                  <p className="text-sm text-muted-foreground font-body mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Nossa história */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  Nossa história
                </h2>
                <div className="mt-6 space-y-4 font-body text-muted-foreground leading-relaxed">
                  <p>
                    Fundada em Porto Alegre, a <strong>Uhome</strong> surgiu da percepção de que o mercado imobiliário
                    gaúcho precisava de uma abordagem moderna. Compradores passavam horas em portais genéricos, sem
                    filtros inteligentes e com informações desatualizadas.
                  </p>
                  <p>
                    Criamos uma plataforma que utiliza <strong>inteligência artificial</strong> para entender o que cada
                    pessoa realmente busca. Em vez de filtros engessados, basta descrever em linguagem natural:
                    "apartamento 3 quartos perto do Parcão até 900 mil" — e a IA encontra as melhores opções.
                  </p>
                  <p>
                    Nosso compromisso vai além da tecnologia. Cada imóvel da plataforma passa por curadoria,
                    com fotos verificadas e informações completas sobre bairro, condomínio e preço.
                    Trabalhamos com uma equipe de corretores certificados pelo <strong>CRECI-RS</strong>,
                    garantindo segurança jurídica em cada transação.
                  </p>
                  <p>
                    Atendemos toda a região metropolitana de Porto Alegre, com foco nos bairros mais
                    valorizados: Moinhos de Vento, Petrópolis, Bela Vista, Três Figueiras, Auxiliadora,
                    Menino Deus, Tristeza e muitos outros. Seja para morar, investir ou encontrar o
                    primeiro lar, a Uhome está aqui para facilitar essa jornada.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-2xl bg-secondary/30 p-8">
                  <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Dados da empresa
                  </h3>
                  <ul className="mt-4 space-y-3 font-body text-sm text-muted-foreground">
                    <li><strong>Razão social:</strong> Uhome Imóveis LTDA</li>
                    <li><strong>CRECI:</strong> RS 25682J</li>
                    <li className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      Porto Alegre, Rio Grande do Sul, Brasil
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <a href={`tel:+${WHATSAPP_NUMBER}`} className="hover:text-foreground transition-colors">
                        {WHATSAPP_DISPLAY}
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <a href="mailto:lucas@uhome.imb.br" className="hover:text-foreground transition-colors">
                        lucas@uhome.imb.br
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-8">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Áreas de atuação
                  </h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    Venda de apartamentos, casas, coberturas, studios, terrenos e imóveis comerciais
                    em Porto Alegre e região metropolitana (Canoas, Cachoeirinha, Gravataí, Guaíba).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-16 bg-secondary/10">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center">
              Nossos valores
            </h2>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {valores.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl bg-background border border-border p-6"
                >
                  <v.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-heading text-lg font-bold text-foreground">{v.title}</h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Pronto para encontrar seu imóvel?
            </h2>
            <p className="mt-4 font-body text-muted-foreground">
              Use nossa busca com inteligência artificial ou fale com um corretor especializado.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/busca"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 font-body text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Buscar imóveis
              </a>
              <button
                onClick={() => {
                  const url = buildWhatsAppUrl("Olá! Gostaria de falar com um corretor da Uhome.");
                  openLeadModal({ whatsappUrl: url, origem_componente: "sobre_cta" });
                }}
                className="inline-flex items-center justify-center rounded-full border border-border px-8 py-3 font-body text-sm font-semibold text-foreground hover:bg-secondary/50 transition-colors"
              >
                Falar com corretor
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sobre;
