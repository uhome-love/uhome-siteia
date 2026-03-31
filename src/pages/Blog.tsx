import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCanonical } from "@/hooks/useCanonical";
import { setJsonLd, removeJsonLd, buildOrganizationJsonLd } from "@/lib/jsonld";
import { blogCategorias, type BlogPost } from "@/data/blog";
import { useBlogPosts } from "@/hooks/useBlogPosts";

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      >
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.imagem}
            alt={post.titulo}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <span className="mb-2 inline-block self-start rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {post.categoria}
          </span>
          <h2 className="font-heading text-lg font-semibold leading-snug text-foreground line-clamp-2 text-balance">
            {post.titulo}
          </h2>
          <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {post.resumo}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.tempoLeitura} min de leitura
            </span>
            <span className="flex items-center gap-1 font-semibold text-primary transition-transform group-hover:translate-x-1">
              Ler artigo <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function Blog() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const { data: blogPosts = [] } = useBlogPosts();
  useCanonical("/blog");

  useEffect(() => {
    document.title = "Blog | Mercado Imobiliário em Porto Alegre — Uhome";
    const meta = document.querySelector('meta[name="description"]');
    const desc = "Artigos, guias e análises sobre o mercado imobiliário de Porto Alegre. Dicas para comprar, investir e financiar seu imóvel.";
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }

    setJsonLd("jsonld-org", buildOrganizationJsonLd());
    setJsonLd("jsonld-blog", {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Uhome Blog",
      description: desc,
      url: "https://uhome.com.br/blog",
      publisher: {
        "@type": "Organization",
        name: "Uhome",
        url: "https://uhome.com.br",
      },
      blogPost: blogPosts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.titulo,
        description: p.resumo,
        url: `https://uhome.com.br/blog/${p.slug}`,
        datePublished: p.publicadoEm,
        author: { "@type": "Organization", name: p.autor },
        image: p.imagem,
      })),
    });
    return () => {
      removeJsonLd("jsonld-org");
      removeJsonLd("jsonld-blog");
    };
  }, []);

  const postsFiltrados = categoriaAtiva
    ? blogPosts.filter((p) => p.categoria === categoriaAtiva)
    : blogPosts;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <Breadcrumbs items={[{ label: "Blog" }]} className="justify-center mb-6" />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance"
          >
            Blog Uhome
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 font-body text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto text-pretty"
          >
            Guias, análises e dicas sobre o mercado imobiliário de Porto Alegre para você tomar decisões com confiança.
          </motion.p>
        </div>
      </section>

      {/* Category filter */}
      <section className="mx-auto max-w-5xl px-5 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoriaAtiva(null)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] ${
              !categoriaAtiva
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Todos
          </button>
          {blogCategorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] ${
                categoriaAtiva === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Posts grid */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {postsFiltrados.map((post, i) => (
            <BlogCard key={post.slug} post={post} index={i} />
          ))}
        </div>

        {postsFiltrados.length === 0 && (
          <p className="mt-12 text-center font-body text-muted-foreground">
            Nenhum artigo nesta categoria ainda.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
}
