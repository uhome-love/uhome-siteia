import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const neighborhoods = [
  { name: "Moinhos de Vento", count: 127, image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop" },
  { name: "Bela Vista", count: 89, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop" },
  { name: "Petrópolis", count: 64, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop" },
  { name: "Mont'Serrat", count: 52, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop" },
  { name: "Três Figueiras", count: 41, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop" },
  { name: "Boa Vista", count: 73, image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop" },
];

export function FeaturedNeighborhoods() {
  return (
    <section className="py-24">
      <div className="container-uhome">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm font-medium uppercase tracking-[0.15em] text-primary">
            Explore
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Bairros em destaque
          </h2>
          <p className="mt-3 max-w-md font-body text-muted-foreground">
            Os melhores endereços de Porto Alegre, selecionados pela equipe Uhome.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {neighborhoods.map((n, i) => (
            <motion.button
              key={n.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl hover-lift"
            >
              <div className="aspect-[3/4] w-full">
                <img
                  src={n.image}
                  alt={n.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-body text-sm font-semibold text-white">{n.name}</p>
                <p className="mt-0.5 flex items-center gap-1 font-body text-xs text-white/70">
                  <MapPin className="h-3 w-3" />
                  {n.count} imóveis
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
