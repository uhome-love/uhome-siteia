import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Home, Search } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Tenta redirecionar URLs comuns que geram 404.
 */
function tryRedirect(pathname: string): string | null {
  const p = pathname.toLowerCase().replace(/\/+$/, "");

  // /imoveis/slug → /imovel/slug
  if (p.startsWith("/imoveis/")) return p.replace("/imoveis/", "/imovel/");

  // /propriedade/slug ou /property/slug → /imovel/slug
  if (p.startsWith("/propriedade/") || p.startsWith("/property/")) {
    return `/imovel/${p.split("/").pop()}`;
  }

  // /bairro/slug → /bairros/slug
  if (p.startsWith("/bairro/") && !p.startsWith("/bairros/")) {
    return p.replace("/bairro/", "/bairros/");
  }

  // /empreendimento/slug → /empreendimentos/slug
  if (p.startsWith("/empreendimento/") && !p.startsWith("/empreendimentos/")) {
    return p.replace("/empreendimento/", "/empreendimentos/");
  }

  // /condominio/slug → /condominios/slug
  if (p.startsWith("/condominio/") && !p.startsWith("/condominios/")) {
    return p.replace("/condominio/", "/condominios/");
  }

  // /condominios/slug/id → /condominios/slug (old URL format with numeric ID)
  const condoMatch = p.match(/^\/condominios\/([^/]+)\/\d+$/);
  if (condoMatch) return `/condominios/${condoMatch[1]}`;

  // /lancamento/slug/id → /condominios/slug
  const lancMatch = p.match(/^\/lancamento\/([^/]+)(?:\/\d+)?$/);
  if (lancMatch) return `/condominios/${lancMatch[1]}`;

  // Common misspellings / old URLs
  if (p === "/pesquisa" || p === "/search") return "/busca";
  if (p === "/lancamentos") return "/condominios";
  if (p === "/empreendimentos") return "/condominios";
  if (p === "/contato" || p === "/contact") return "/";
  if (p === "/sobre" || p === "/about") return "/";
  if (p === "/home") return "/";
  if (p === "/privacidade") return "/politica-de-privacidade";
  if (p === "/avaliacao" || p === "/avaliar") return "/avaliar-imovel";
  if (p === "/imoveis") return "/busca";
  if (p === "/comprar") return "/busca";
  if (p === "/venda") return "/busca?finalidade=venda";

  return null;
}

/**
 * Extrai possível slug de imóvel de qualquer path.
 * Ex: /alguma-coisa/apartamento-2-quartos-moinhos → apartamento-2-quartos-moinhos
 */
function extractPossibleSlug(pathname: string): string | null {
  const p = pathname.replace(/\/+$/, "");
  const segments = p.split("/").filter(Boolean);
  // Se tem pelo menos um segmento que parece slug (tem letras e hifens)
  const last = segments[segments.length - 1];
  if (last && last.length > 5 && /^[a-z0-9-]+$/.test(last)) {
    return last;
  }
  return null;
}

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 1. Tenta redirect estático
    const redirect = tryRedirect(location.pathname);
    if (redirect) {
      navigate(redirect, { replace: true });
      return;
    }

    // 2. Tenta encontrar como slug de imóvel no banco
    const slug = extractPossibleSlug(location.pathname);
    if (slug) {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/imoveis?select=slug&slug=eq.${encodeURIComponent(slug)}&limit=1`;
      fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "accept-profile": "public",
        },
      })
        .then((r) => r.json())
        .then((rows: any[]) => {
          if (rows?.[0]?.slug) {
            navigate(`/imovel/${rows[0].slug}`, { replace: true });
            return;
          }
          setChecking(false);
          log404();
        });
    } else {
      setChecking(false);
      log404();
    }

    function log404() {
      document.title = "Página não encontrada | Uhome Imóveis";
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/page_404_log`, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "content-profile": "public",
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          path: location.pathname + location.search,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        }),
      }).catch(() => {});
    }

    return () => {
      document.title = "Uhome Imóveis | Apartamentos e Casas à Venda em Porto Alegre";
    };
  }, [location.pathname, location.search, navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease }}
          className="text-center"
        >
          <p className="font-mono text-[clamp(4rem,12vw,8rem)] font-bold leading-none text-primary/20">
            404
          </p>
          <h1 className="mt-4 font-body text-xl font-extrabold text-foreground sm:text-2xl">
            Página não encontrada
          </h1>
          <p className="mt-2 max-w-sm font-body text-sm text-muted-foreground">
            A página que você procura não existe ou foi removida.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-body text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
            >
              <Home className="h-4 w-4" />
              Voltar ao início
            </Link>
            <Link
              to="/busca"
              className="flex items-center gap-2 rounded-full border-[1.5px] border-primary px-6 py-3 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.97]"
            >
              <Search className="h-4 w-4" />
              Buscar imóveis
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
