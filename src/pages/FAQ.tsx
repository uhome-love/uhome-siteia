import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { whatsappLink } from "@/lib/whatsapp";
import { useCanonical } from "@/hooks/useCanonical";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  pergunta: string;
  resposta: string;
  categoria: string;
}

const faqs: FaqItem[] = [
  {
    categoria: "Compra de Imóveis",
    pergunta: "Quanto custa um apartamento em Porto Alegre?",
    resposta:
      "O preço varia conforme bairro, tamanho e padrão. Em bairros como Moinhos de Vento e Três Figueiras, apartamentos partem de R$ 800 mil e podem superar R$ 5 milhões. Em regiões como Cidade Baixa e Bom Fim, é possível encontrar opções a partir de R$ 350 mil. Na Uhome, você pode filtrar por faixa de preço na busca para encontrar o imóvel ideal.",
  },
  {
    categoria: "Compra de Imóveis",
    pergunta: "Quais são os melhores bairros para morar em Porto Alegre?",
    resposta:
      "Os bairros mais procurados para compra incluem Moinhos de Vento (alto padrão e vida noturna), Petrópolis (famílias e escolas), Bela Vista (condomínios modernos perto da PUCRS), Três Figueiras (exclusividade), Menino Deus (vista para o Guaíba) e Tristeza (qualidade de vida na Zona Sul). Cada bairro tem perfil diferente — explore nossas páginas de bairros para comparar.",
  },
  {
    categoria: "Compra de Imóveis",
    pergunta: "Qual a documentação necessária para comprar um imóvel em Porto Alegre?",
    resposta:
      "Para comprar um imóvel você precisa de: RG e CPF, comprovante de renda, comprovante de residência, certidão de estado civil e declaração do Imposto de Renda. Se financiar, o banco pedirá documentos adicionais. O vendedor deve apresentar a matrícula atualizada do imóvel, certidões negativas e IPTU em dia. A Uhome orienta você em cada etapa.",
  },
  {
    categoria: "Compra de Imóveis",
    pergunta: "É melhor comprar apartamento novo ou usado em Porto Alegre?",
    resposta:
      "Depende do seu perfil. Imóveis novos oferecem infraestrutura moderna, menor manutenção e áreas de lazer completas, mas costumam ter metragem menor. Usados geralmente são mais espaçosos, ficam em bairros consolidados e têm preço por m² mais acessível. Na Uhome, você encontra ambas as opções com filtros detalhados.",
  },
  {
    categoria: "Financiamento",
    pergunta: "Como funciona o financiamento imobiliário em Porto Alegre?",
    resposta:
      "O financiamento cobre até 80% do valor do imóvel, com prazos de até 35 anos. As taxas variam entre 8% e 12% ao ano, dependendo do banco e do perfil do comprador. Você precisa de entrada mínima de 20%, renda comprovada e aprovação de crédito. Use nosso simulador de financiamento para calcular as parcelas do imóvel desejado.",
  },
  {
    categoria: "Financiamento",
    pergunta: "Posso usar o FGTS para comprar imóvel em Porto Alegre?",
    resposta:
      "Sim. O FGTS pode ser usado como entrada ou para amortizar o saldo devedor, desde que: o imóvel seja residencial e urbano, esteja avaliado em até R$ 1,5 milhão (pelo SFH), você tenha pelo menos 3 anos de contribuição ao FGTS, e não possua outro financiamento ativo pelo SFH na mesma cidade.",
  },
  {
    categoria: "Financiamento",
    pergunta: "Qual a renda mínima para financiar um apartamento em Porto Alegre?",
    resposta:
      "A parcela do financiamento não pode ultrapassar 30% da sua renda bruta mensal. Para um apartamento de R$ 500 mil com 20% de entrada e prazo de 30 anos, a parcela fica em torno de R$ 4.500 — exigindo renda mínima de aproximadamente R$ 15 mil. Use nosso simulador para calcular com valores exatos.",
  },
  {
    categoria: "Bairros",
    pergunta: "Moinhos de Vento é um bom bairro para investir em Porto Alegre?",
    resposta:
      "Moinhos de Vento é o bairro com maior valorização e demanda de Porto Alegre. Com infraestrutura completa, gastronomia, Parcão e vida noturna, atrai tanto moradores quanto investidores. O metro quadrado é o mais alto da cidade, mas a liquidez e a valorização constante tornam o investimento sólido.",
  },
  {
    categoria: "Bairros",
    pergunta: "Como é morar na Zona Sul de Porto Alegre?",
    resposta:
      "A Zona Sul (Tristeza, Ipanema, Cristal) oferece ruas arborizadas, clima tranquilo, proximidade com a orla do Guaíba e terrenos mais generosos. É ideal para quem busca qualidade de vida e contato com a natureza, com comércio local e boas escolas. O deslocamento até o centro leva cerca de 20-30 minutos.",
  },
  {
    categoria: "Uhome",
    pergunta: "O que é a Uhome e como funciona?",
    resposta:
      "A Uhome é uma imobiliária digital especializada em Porto Alegre. Combinamos curadoria humana com tecnologia — incluindo busca por inteligência artificial — para ajudar você a encontrar o imóvel ideal. Nosso catálogo é atualizado diariamente e inclui apartamentos, casas e coberturas nos principais bairros da capital gaúcha.",
  },
  {
    categoria: "Uhome",
    pergunta: "Como funciona a busca por IA da Uhome?",
    resposta:
      "Nossa busca inteligente entende linguagem natural. Em vez de preencher filtros, você descreve o que procura — por exemplo, \"apartamento 3 quartos em Petrópolis até 900 mil com vaga\" — e a IA interpreta sua busca, aplica os filtros automaticamente e mostra os resultados mais relevantes.",
  },
  {
    categoria: "Uhome",
    pergunta: "Como anunciar meu imóvel na Uhome?",
    resposta:
      "Acesse a página Anunciar Imóvel e preencha o formulário com seus dados e informações do imóvel. Nossa equipe entrará em contato para avaliar o imóvel, realizar fotos profissionais e publicar o anúncio. A Uhome cuida de toda a divulgação e intermediação com compradores interessados.",
  },
];

const categorias = [...new Set(faqs.map((f) => f.categoria))];

function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.resposta,
      },
    })),
  };
}

const FAQ = () => {
  useCanonical();
  useEffect(() => {
    const title = "Perguntas Frequentes sobre Imóveis em Porto Alegre | Uhome";
    const desc =
      "Tire suas dúvidas sobre compra de imóveis, financiamento, bairros e mercado imobiliário em Porto Alegre. Respostas atualizadas pela equipe Uhome.";
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", "https://uhome.com.br/faq");

    setJsonLd("jsonld-faq", buildFaqJsonLd(faqs));

    return () => {
      document.title = "Uhome Imóveis | Porto Alegre";
      removeJsonLd("jsonld-faq");
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border bg-secondary/30 pb-12 pt-28 sm:pb-16 sm:pt-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <nav className="mb-6 flex items-center justify-center gap-1.5 font-body text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Uhome</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Perguntas Frequentes</span>
          </nav>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-h1 text-foreground text-balance"
          >
            Perguntas Frequentes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-4 max-w-lg font-body text-[15px] leading-relaxed text-muted-foreground text-pretty"
          >
            Tudo o que você precisa saber sobre comprar imóveis em Porto Alegre,
            financiamento e como a Uhome pode ajudar.
          </motion.p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-6">
          {categorias.map((cat, catIdx) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: catIdx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={catIdx > 0 ? "mt-10" : ""}
            >
              <h2 className="mb-4 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cat}
              </h2>
              <Accordion type="multiple" className="space-y-2">
                {faqs
                  .filter((f) => f.categoria === cat)
                  .map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`${cat}-${i}`}
                      className="rounded-xl border border-border bg-card px-5 data-[state=open]:shadow-sm"
                    >
                      <AccordionTrigger className="py-4 text-left font-body text-[15px] font-medium text-foreground hover:no-underline [&[data-state=open]]:text-primary">
                        {faq.pergunta}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 font-body text-sm leading-relaxed text-muted-foreground">
                        {faq.resposta}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-secondary/30 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-h3 text-foreground">Ainda tem dúvidas?</h2>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            Nossa equipe está pronta para ajudar você a encontrar o imóvel ideal.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/busca"
              className="rounded-full bg-primary px-6 py-2.5 font-body text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97]"
            >
              Buscar imóveis
            </Link>
            <a
              href={whatsappLink("Olá! Tenho uma dúvida sobre imóveis em Porto Alegre.")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-card px-6 py-2.5 font-body text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.97]"
            >
              Falar com a Uhome
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
