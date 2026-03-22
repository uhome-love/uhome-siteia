import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DOMAIN = "https://uhome.com.br";

const PAGES = [
  { label: "Home", path: "" },
  { label: "Busca", path: "/busca" },
  { label: "Busca IA", path: "/busca?modo=ia" },
  { label: "Anunciar", path: "/anunciar" },
  { label: "Avaliação", path: "/avaliar-imovel" },
  { label: "Blog", path: "/blog" },
  { label: "FAQ", path: "/faq" },
  { label: "Condomínios", path: "/condominios" },
  { label: "Bairro Moinhos de Vento", path: "/bairros/moinhos-de-vento" },
  { label: "Bairro Petrópolis", path: "/bairros/petropolis" },
  { label: "Bairro Bela Vista", path: "/bairros/bela-vista" },
  { label: "Bairro Três Figueiras", path: "/bairros/tres-figueiras" },
  { label: "Carreiras", path: "/carreiras" },
];

interface Corretor {
  id: string;
  nome: string;
  slug_ref: string;
}

export default function AdminLinks() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, nome, slug_ref")
      .eq("ativo", true)
      .not("slug_ref", "is", null)
      .order("nome")
      .then(({ data }) => {
        setCorretores((data as Corretor[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = corretores.filter((c) =>
    c.nome?.toLowerCase().includes(search.toLowerCase())
  );

  function copyLink(link: string, key: string) {
    navigator.clipboard.writeText(link);
    setCopiedKey(key);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedKey(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Links de Corretores
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gere e copie links personalizados para envio
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar corretor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((corretor) => (
          <div
            key={corretor.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {corretor.nome?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{corretor.nome}</p>
                <p className="text-xs text-muted-foreground">
                  /c/{corretor.slug_ref}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PAGES.map((page) => {
                const link = `${DOMAIN}/c/${corretor.slug_ref}${page.path}`;
                const key = `${corretor.id}-${page.path}`;
                const isCopied = copiedKey === key;

                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                      {page.label}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => copyLink(link, key)}
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum corretor encontrado
          </p>
        )}
      </div>
    </div>
  );
}
