import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCanonical } from "@/hooks/useCanonical";
import { setJsonLd, removeJsonLd, buildOrganizationJsonLd } from "@/lib/jsonld";
import { blogPosts } from "@/data/blog";
import { useBlogPosts } from "@/hooks/useBlogPosts";

function renderMarkdown(md: string) {
  // Simple markdown → HTML for headings, bold, lists, paragraphs
  const lines = md.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) { html.push("</ul>"); inList = false; }
      continue;
    }

    if (trimmed.startsWith("## ")) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h2>${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith("- ")) {
      if (!inList) { html.push("<ul>"); inList = true; }
      const content = trimmed.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html.push(`<li>${content}</li>`);
    } else {
      if (inList) { html.push("</ul>"); inList = false; }
      const content = trimmed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html.push(`<p>${content}</p>`);
    }
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  useCanonical(post ? `/blog/${post.slug}` : undefined);

  useEffect(() => {
    if (!post) return;

    document.title = `${post.titulo} | Blog Uhome`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", post.resumo);

    setJsonLd("jsonld-org", buildOrganizationJsonLd());
    setJsonLd("jsonld-blogpost", {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.titulo,
      description: post.resumo,
      image: post.imagem,
      url: `https://uhome.com.br/blog/${post.slug}`,
      datePublished: post.publicadoEm,
      author: { "@type": "Organization", name: post.autor },
      publisher: {
        "@type": "Organization",
        name: "Uhome",
        url: "https://uhome.com.br",
        logo: "https://uhome.com.br/uhome-logo.svg",
      },
      mainEntityOfPage: `https://uhome.com.br/blog/${post.slug}`,
    });
    setJsonLd("jsonld-breadcrumb-blog", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Uhome", item: "https://uhome.com.br/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://uhome.com.br/blog" },
        { "@type": "ListItem", position: 3, name: post.titulo, item: `https://uhome.com.br/blog/${post.slug}` },
      ],
    });

    return () => {
      removeJsonLd("jsonld-org");
      removeJsonLd("jsonld-blogpost");
      removeJsonLd("jsonld-breadcrumb-blog");
    };
  }, [post]);

  if (!post) return <Navigate to="/blog" replace />;

  const dataFormatada = new Date(post.publicadoEm).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const contentHtml = renderMarkdown(post.conteudo);

  // Related posts (same category, excluding current)
  const relacionados = blogPosts
    .filter((p) => p.categoria === post.categoria && p.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="pt-24 pb-16 sm:pt-28">
        <div className="mx-auto max-w-3xl px-5">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao blog
            </Link>
          </motion.nav>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {post.categoria}
            </span>
            <h1 className="mt-4 font-heading text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl text-balance">
              {post.titulo}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 font-body text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {dataFormatada}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.tempoLeitura} min de leitura
              </span>
              <span>{post.autor}</span>
            </div>
          </motion.header>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 overflow-hidden rounded-2xl"
          >
            <img
              src={post.imagem}
              alt={post.titulo}
              className="w-full aspect-[16/9] object-cover"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="prose prose-neutral mt-10 max-w-none font-body
              prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:leading-relaxed prose-p:text-muted-foreground
              prose-strong:text-foreground prose-strong:font-semibold
              prose-li:text-muted-foreground prose-li:leading-relaxed
              prose-ul:my-4 prose-ul:pl-5"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Tags */}
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl bg-secondary p-8 text-center"
          >
            <p className="font-heading text-lg font-semibold text-foreground">
              Procurando imóveis em Porto Alegre?
            </p>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Use a busca inteligente da Uhome e encontre o imóvel ideal para você.
            </p>
            <Link
              to="/busca"
              className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_4px_16px_rgba(91,108,249,0.35)] hover:-translate-y-px active:scale-[0.97]"
            >
              Explorar imóveis
            </Link>
          </motion.div>
        </div>

        {/* Related posts */}
        {relacionados.length > 0 && (
          <section className="mx-auto max-w-3xl px-5 mt-16">
            <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
              Artigos relacionados
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {relacionados.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/blog/${rel.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={rel.imagem}
                      alt={rel.titulo}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                      {rel.titulo}
                    </h3>
                    <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {rel.tempoLeitura} min
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
}
