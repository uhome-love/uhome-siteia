/**
 * SEO Page URL parser and configuration generator.
 * Handles patterns like:
 *   /apartamentos-moinhos-de-vento
 *   /apartamentos-2-quartos-petropolis
 *   /apartamentos-a-venda-porto-alegre
 *   /imoveis-de-luxo-porto-alegre
 */

export interface SeoPageConfig {
  /** Filter params for fetchImoveis */
  tipo?: string;
  bairro?: string;
  quartos?: number;
  /** SEO content */
  h1: string;
  metaTitle: string;
  metaDescription: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  /** For internal links */
  pageType: "tipo-bairro" | "tipo-quartos-bairro" | "intent" | "tipo-cidade";
  canonicalPath: string;
}

// ── Slug → display name maps ─────────────────────────────

const TIPO_MAP: Record<string, { singular: string; plural: string; tipoDb: string }> = {
  apartamentos: { singular: "Apartamento", plural: "Apartamentos", tipoDb: "apartamento" },
  apartamento: { singular: "Apartamento", plural: "Apartamentos", tipoDb: "apartamento" },
  casas: { singular: "Casa", plural: "Casas", tipoDb: "casa" },
  casa: { singular: "Casa", plural: "Casas", tipoDb: "casa" },
  coberturas: { singular: "Cobertura", plural: "Coberturas", tipoDb: "cobertura" },
  cobertura: { singular: "Cobertura", plural: "Coberturas", tipoDb: "cobertura" },
  studios: { singular: "Studio", plural: "Studios", tipoDb: "studio" },
  studio: { singular: "Studio", plural: "Studios", tipoDb: "studio" },
  terrenos: { singular: "Terreno", plural: "Terrenos", tipoDb: "terreno" },
  terreno: { singular: "Terreno", plural: "Terrenos", tipoDb: "terreno" },
  comerciais: { singular: "Imóvel Comercial", plural: "Imóveis Comerciais", tipoDb: "comercial" },
  comercial: { singular: "Imóvel Comercial", plural: "Imóveis Comerciais", tipoDb: "comercial" },
  imoveis: { singular: "Imóvel", plural: "Imóveis", tipoDb: "" }, // no filter, all types
};

// Intent pages config
const INTENT_PAGES: Record<string, { h1: string; metaTitle: string; metaDesc: string; tipo?: string; precoMin?: number }> = {
  "apartamentos-a-venda-porto-alegre": {
    h1: "Apartamentos à Venda em Porto Alegre",
    metaTitle: "Apartamentos à Venda em Porto Alegre | Uhome",
    metaDesc: "Encontre os melhores apartamentos à venda em Porto Alegre. Do studio ao 4 dormitórios, em todos os bairros. Busca inteligente com mapa interativo.",
    tipo: "apartamento",
  },
  "casas-a-venda-porto-alegre": {
    h1: "Casas à Venda em Porto Alegre",
    metaTitle: "Casas à Venda em Porto Alegre | Uhome",
    metaDesc: "Casas à venda em Porto Alegre e região. Térreas, sobrados e casas em condomínio nos melhores bairros.",
    tipo: "casa",
  },
  "imoveis-de-luxo-porto-alegre": {
    h1: "Imóveis de Luxo em Porto Alegre",
    metaTitle: "Imóveis de Luxo Porto Alegre | Alto Padrão | Uhome",
    metaDesc: "Seleção exclusiva de imóveis de luxo em Porto Alegre. Apartamentos, coberturas e casas de alto padrão nos bairros mais nobres.",
    precoMin: 1500000,
  },
  "investimento-imobiliario-porto-alegre": {
    h1: "Investimento Imobiliário em Porto Alegre",
    metaTitle: "Investimento Imobiliário Porto Alegre 2026 | Uhome",
    metaDesc: "Oportunidades de investimento imobiliário em Porto Alegre. Studios, apartamentos compactos e imóveis com alta rentabilidade.",
  },
  "lancamentos-porto-alegre": {
    h1: "Lançamentos Imobiliários em Porto Alegre",
    metaTitle: "Lançamentos Imobiliários Porto Alegre 2026 | Uhome",
    metaDesc: "Conheça os lançamentos imobiliários em Porto Alegre. Apartamentos novos, empreendimentos na planta e pré-lançamentos.",
  },
  "coberturas-a-venda-porto-alegre": {
    h1: "Coberturas à Venda em Porto Alegre",
    metaTitle: "Coberturas à Venda em Porto Alegre | Uhome",
    metaDesc: "Coberturas duplex e triplex à venda em Porto Alegre. Terraços, vista panorâmica e alto padrão nos melhores bairros.",
    tipo: "cobertura",
  },
  "terrenos-a-venda-porto-alegre": {
    h1: "Terrenos à Venda em Porto Alegre",
    metaTitle: "Terrenos à Venda em Porto Alegre | Uhome",
    metaDesc: "Terrenos à venda em Porto Alegre e região metropolitana. Lotes residenciais e comerciais para construção.",
    tipo: "terreno",
  },
};

// ── Slug normalizer ──────────────────────────────────────

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function deslugify(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Main parser ──────────────────────────────────────────

export function parseSeoSlug(slug: string): SeoPageConfig | null {
  // 1) Check intent pages first
  if (INTENT_PAGES[slug]) {
    const intent = INTENT_PAGES[slug];
    return {
      tipo: intent.tipo,
      h1: intent.h1,
      metaTitle: intent.metaTitle,
      metaDescription: intent.metaDesc,
      breadcrumbs: [
        { label: "Uhome", href: "/" },
        { label: "Imóveis", href: "/busca" },
        { label: intent.h1 },
      ],
      pageType: "intent",
      canonicalPath: `/${slug}`,
    };
  }

  // 2) Pattern: {tipo}-{N}-quartos-{bairro-slug}
  const quartosMatch = slug.match(/^(\w+)-(\d)-quartos-(.+)$/);
  if (quartosMatch) {
    const [, tipoSlug, quartosStr, bairroSlug] = quartosMatch;
    const tipoInfo = TIPO_MAP[tipoSlug];
    if (tipoInfo) {
      const quartos = parseInt(quartosStr, 10);
      const bairroNome = deslugify(bairroSlug);
      return {
        tipo: tipoInfo.tipoDb || undefined,
        bairro: bairroNome,
        quartos,
        h1: `${tipoInfo.plural} com ${quartos} Quartos em ${bairroNome}`,
        metaTitle: `${tipoInfo.plural} ${quartos} Quartos em ${bairroNome} — Porto Alegre | Uhome`,
        metaDescription: `Encontre ${tipoInfo.plural.toLowerCase()} com ${quartos} quartos à venda em ${bairroNome}, Porto Alegre. Preços, fotos e localização no mapa.`,
        breadcrumbs: [
          { label: "Uhome", href: "/" },
          { label: tipoInfo.plural, href: `/${tipoSlug}-porto-alegre` },
          { label: bairroNome, href: `/bairros/${bairroSlug}` },
          { label: `${quartos} quartos` },
        ],
        pageType: "tipo-quartos-bairro",
        canonicalPath: `/${slug}`,
      };
    }
  }

  // 3) Pattern: {tipo}-{bairro-slug}  (e.g. apartamentos-moinhos-de-vento)
  // Try matching longest tipo prefix
  for (const tipoSlug of Object.keys(TIPO_MAP).sort((a, b) => b.length - a.length)) {
    if (slug.startsWith(tipoSlug + "-")) {
      const bairroSlug = slug.slice(tipoSlug.length + 1);
      // Skip if it looks like an intent page suffix
      if (bairroSlug === "porto-alegre" || bairroSlug.startsWith("a-venda") || bairroSlug.startsWith("de-luxo")) continue;
      
      const tipoInfo = TIPO_MAP[tipoSlug];
      const bairroNome = deslugify(bairroSlug);
      return {
        tipo: tipoInfo.tipoDb || undefined,
        bairro: bairroNome,
        h1: `${tipoInfo.plural} à Venda em ${bairroNome}`,
        metaTitle: `${tipoInfo.plural} em ${bairroNome} — Porto Alegre | Uhome`,
        metaDescription: `${tipoInfo.plural} à venda em ${bairroNome}, Porto Alegre. Veja preços, fotos e localize no mapa. Encontre seu imóvel ideal com a Uhome.`,
        breadcrumbs: [
          { label: "Uhome", href: "/" },
          { label: tipoInfo.plural, href: `/${tipoSlug}-porto-alegre` },
          { label: bairroNome, href: `/bairros/${bairroSlug}` },
        ],
        pageType: "tipo-bairro",
        canonicalPath: `/${slug}`,
      };
    }
  }

  return null;
}

// ── Generate all valid SEO paths (for sitemap) ───────────

export const SEO_TIPOS = ["apartamentos", "casas", "coberturas", "studios", "terrenos", "comerciais"] as const;

export function getAllIntentPaths(): string[] {
  return Object.keys(INTENT_PAGES);
}

export function generateTipoBairroPaths(bairros: string[]): string[] {
  const paths: string[] = [];
  for (const tipo of SEO_TIPOS) {
    for (const bairro of bairros) {
      paths.push(`${tipo}-${slugify(bairro)}`);
    }
  }
  return paths;
}

export function generateQuartosBairroPaths(bairros: string[]): string[] {
  const paths: string[] = [];
  const quartosTipos = ["apartamentos", "casas", "coberturas"] as const;
  for (const tipo of quartosTipos) {
    for (const q of [1, 2, 3, 4]) {
      for (const bairro of bairros) {
        paths.push(`${tipo}-${q}-quartos-${slugify(bairro)}`);
      }
    }
  }
  return paths;
}

// ── Content generation helpers ───────────────────────────

export function generateBairroDescription(bairroNome: string, tipo?: string, quartos?: number): string {
  const tipoLabel = tipo ? TIPO_MAP[tipo]?.plural.toLowerCase() ?? "imóveis" : "imóveis";
  const quartosText = quartos ? ` com ${quartos} quartos` : "";
  
  return `Encontrar ${tipoLabel}${quartosText} em ${bairroNome}, Porto Alegre, ficou mais fácil com a Uhome. ` +
    `O bairro ${bairroNome} é um dos mais procurados da capital gaúcha, combinando qualidade de vida, infraestrutura completa e valorização imobiliária constante. ` +
    `\n\nA região conta com fácil acesso a transporte público, comércio variado, restaurantes, escolas e áreas de lazer. ` +
    `Para quem busca ${tipoLabel}${quartosText} em ${bairroNome}, a Uhome oferece uma curadoria completa com fotos profissionais, preços atualizados e localização interativa no mapa. ` +
    `\n\nPorque investir em ${bairroNome}? O bairro apresenta uma das maiores taxas de valorização imobiliária de Porto Alegre nos últimos anos. ` +
    `Com infraestrutura consolidada e novos empreendimentos em construção, é uma excelente opção tanto para moradia quanto para investimento. ` +
    `\n\nNa Uhome, você encontra ${tipoLabel} em ${bairroNome} com informações completas: metragem, número de quartos, vagas de garagem, valor do condomínio e muito mais. ` +
    `Use nosso mapa interativo para visualizar as opções disponíveis e comparar imóveis na região. ` +
    `Nossos corretores especializados no bairro ${bairroNome} estão prontos para te ajudar gratuitamente na busca pelo imóvel ideal.`;
}

export function generateIntentDescription(h1: string): string {
  return `A Uhome é referência em ${h1.toLowerCase()} e região metropolitana. ` +
    `Com tecnologia avançada de busca, mapa interativo e curadoria especializada, facilitamos a descoberta do imóvel perfeito. ` +
    `\n\nNossa plataforma reúne milhares de opções com fotos profissionais, preços atualizados diariamente e informações completas sobre cada imóvel. ` +
    `Filtre por bairro, tipo, número de quartos, faixa de preço e muito mais. ` +
    `\n\nPorto Alegre é uma das capitais com maior potencial de valorização imobiliária do Brasil. ` +
    `Com uma economia diversificada, universidades de referência e qualidade de vida reconhecida, a cidade atrai investidores e moradores de todo o país. ` +
    `\n\nNa Uhome, você conta com corretores especializados que conhecem cada bairro em detalhes. ` +
    `Receba atendimento personalizado e gratuito para encontrar exatamente o que você procura.`;
}
