import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCorretor } from "@/contexts/CorretorContext";
import { Building2, Home, Crown, DollarSign, Bed, MapPin } from "lucide-react";

const seoLinks = {
  "Por faixa de preço": [
    { label: "Apartamentos até R$ 300 mil", href: "/apartamentos-ate-300-mil-porto-alegre", icon: DollarSign },
    { label: "Apartamentos até R$ 500 mil", href: "/apartamentos-ate-500-mil-porto-alegre", icon: DollarSign },
    { label: "Apartamentos até R$ 800 mil", href: "/apartamentos-ate-800-mil-porto-alegre", icon: DollarSign },
    { label: "Casas até R$ 500 mil", href: "/casas-ate-500-mil-porto-alegre", icon: Home },
    { label: "Casas até R$ 1 milhão", href: "/casas-ate-1-milhao-porto-alegre", icon: Home },
    { label: "Coberturas acima de R$ 1 milhão", href: "/coberturas-acima-1-milhao-porto-alegre", icon: Crown },
    { label: "Imóveis de luxo", href: "/imoveis-de-luxo-porto-alegre", icon: Crown },
  ],
  "Por tipo de imóvel": [
    { label: "Apartamentos em Porto Alegre", href: "/apartamentos-porto-alegre", icon: Building2 },
    { label: "Casas em Porto Alegre", href: "/casas-porto-alegre", icon: Home },
    { label: "Coberturas em Porto Alegre", href: "/coberturas-porto-alegre", icon: Crown },
    { label: "Studios em Porto Alegre", href: "/studios-porto-alegre", icon: Building2 },
    { label: "Apartamentos à venda", href: "/apartamentos-a-venda-porto-alegre", icon: Building2 },
    { label: "Casas à venda", href: "/casas-a-venda-porto-alegre", icon: Home },
  ],
  "Por dormitórios": [
    { label: "Apartamentos 1 quarto", href: "/apartamentos-1-quartos-porto-alegre", icon: Bed },
    { label: "Apartamentos 2 quartos", href: "/apartamentos-2-quartos-porto-alegre", icon: Bed },
    { label: "Apartamentos 3 quartos", href: "/apartamentos-3-quartos-porto-alegre", icon: Bed },
    { label: "Casas 3 quartos", href: "/casas-3-quartos-porto-alegre", icon: Bed },
    { label: "Casas 4 quartos", href: "/casas-4-quartos-porto-alegre", icon: Bed },
  ],
  "Por bairro": [
    { label: "Moinhos de Vento", href: "/apartamentos-moinhos-de-vento", icon: MapPin },
    { label: "Petrópolis", href: "/apartamentos-petropolis", icon: MapPin },
    { label: "Bela Vista", href: "/apartamentos-bela-vista", icon: MapPin },
    { label: "Mont'Serrat", href: "/apartamentos-montserrat", icon: MapPin },
    { label: "Auxiliadora", href: "/apartamentos-auxiliadora", icon: MapPin },
    { label: "Boa Vista", href: "/apartamentos-boa-vista", icon: MapPin },
    { label: "Três Figueiras", href: "/apartamentos-tres-figueiras", icon: MapPin },
    { label: "Todos os bairros →", href: "/bairros", icon: MapPin },
  ],
};

export function SeoLinksSection() {
  const { prefixLink } = useCorretor();

  return (
    <section className="border-t border-border bg-secondary/30 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm font-medium uppercase tracking-[0.15em] text-primary">
            Busque por categoria
          </p>
          <h2 className="mt-2 text-h2 text-foreground text-balance">
            Encontre imóveis em Porto Alegre
          </h2>
          <p className="mt-3 max-w-lg font-body text-muted-foreground">
            Navegue por bairro, tipo, faixa de preço ou dormitórios para encontrar o imóvel ideal.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(seoLinks).map(([category, links], catIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: catIdx * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="font-body text-sm font-bold text-foreground">{category}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={prefixLink(link.href)}
                      className="group flex items-center gap-2.5 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <link.icon className="h-3.5 w-3.5 shrink-0 text-primary/50 group-hover:text-primary transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
