import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://uhome.com.br";
const PARAMS_PERMITIDOS = ["tipo", "bairros", "quartos"];

/**
 * Injeta/atualiza a tag <link rel="canonical"> no <head>.
 * Aceita um pathname override (ex.: página de imóvel com slug dinâmico).
 * Para a página de busca, preserva apenas parâmetros indexáveis.
 */
export function useCanonical(overridePath?: string) {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const path = overridePath ?? pathname;

    // Filtrar apenas parâmetros que devem ser indexados
    const params = new URLSearchParams(search);
    const paramsLimpos = new URLSearchParams();
    PARAMS_PERMITIDOS.forEach((p) => {
      if (params.has(p)) paramsLimpos.set(p, params.get(p)!);
    });
    const qs = paramsLimpos.toString();

    const canonical = `${SITE}${path}${qs ? "?" + qs : ""}`;

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);

    return () => {
      link?.remove();
    };
  }, [pathname, search, overridePath]);
}
