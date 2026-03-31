import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { blogPosts as staticPosts, type BlogPost } from "@/data/blog";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("slug, titulo, resumo, conteudo, categoria, imagem, autor, publicado_em, tempo_leitura, tags")
        .eq("ativo", true)
        .order("publicado_em", { ascending: false });

      if (error || !data || data.length === 0) {
        // Fallback to static posts
        return staticPosts;
      }

      // Merge: DB posts first, then static posts that don't exist in DB
      const dbSlugs = new Set((data as any[]).map((p: any) => p.slug));
      const dbPosts: BlogPost[] = (data as any[]).map((p: any) => ({
        slug: p.slug,
        titulo: p.titulo,
        resumo: p.resumo,
        conteudo: p.conteudo,
        categoria: p.categoria,
        imagem: p.imagem || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop",
        autor: p.autor,
        publicadoEm: p.publicado_em,
        tempoLeitura: p.tempo_leitura,
        tags: p.tags || [],
      }));

      const staticOnly = staticPosts.filter((p) => !dbSlugs.has(p.slug));
      return [...dbPosts, ...staticOnly];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBlogPost(slug?: string) {
  const { data: allPosts } = useBlogPosts();
  return allPosts?.find((p) => p.slug === slug) || null;
}
