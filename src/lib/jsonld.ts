import type { Imovel } from "@/services/imoveis";
import { formatPreco, fotoPrincipal } from "@/services/imoveis";
import type { BairroData } from "@/data/bairros";

/** Inject or update a JSON-LD script tag in <head> */
export function setJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** Remove a JSON-LD script tag */
export function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

/** Schema.org RealEstateListing for a property page */
export function buildImovelJsonLd(imovel: Imovel) {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: imovel.titulo,
    description:
      imovel.descricao?.slice(0, 300) ??
      `${cap(imovel.tipo)} em ${imovel.bairro}, Porto Alegre`,
    url: `https://uhome.com.br/imovel/${imovel.slug}`,
    datePosted: imovel.publicado_em,
    image: imovel.fotos.length
      ? imovel.fotos.map((f) => f.url)
      : [fotoPrincipal(imovel)],
    offers: {
      "@type": "Offer",
      price: imovel.preco,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    about: {
      "@type": "Residence",
      ...(imovel.tipo === "apartamento" && { "@type": "Apartment" }),
      ...(imovel.tipo === "casa" && { "@type": "House" }),
      name: imovel.titulo,
      numberOfRooms: imovel.quartos ?? undefined,
      numberOfBathroomsTotal: imovel.banheiros ?? undefined,
      floorSize: imovel.area_total
        ? { "@type": "QuantitativeValue", value: imovel.area_total, unitCode: "MTK" }
        : undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Porto Alegre",
        addressRegion: "RS",
        addressCountry: "BR",
        ...(imovel.bairro && { streetAddress: imovel.bairro }),
      },
      ...(imovel.latitude &&
        imovel.longitude && {
          geo: {
            "@type": "GeoCoordinates",
            latitude: imovel.latitude,
            longitude: imovel.longitude,
          },
        }),
    },
  };
}

/** Schema.org ItemList for a neighborhood listing page */
export function buildBairroJsonLd(
  bairro: BairroData,
  total: number,
  avgPrice?: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Imóveis à Venda em ${bairro.nome}, Porto Alegre`,
    description: bairro.descricao.slice(0, 300),
    url: `https://uhome.com.br/bairros/${bairro.slug}`,
    numberOfItems: total,
    itemListElement: {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Place",
        name: bairro.nome,
        description: bairro.descricao,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Porto Alegre",
          addressRegion: "RS",
          addressCountry: "BR",
          streetAddress: bairro.nome,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: bairro.lat,
          longitude: bairro.lng,
        },
      },
    },
    ...(avgPrice && {
      mainEntity: {
        "@type": "Offer",
        name: `Preço médio em ${bairro.nome}`,
        price: Math.round(avgPrice),
        priceCurrency: "BRL",
      },
    }),
  };
}

/** BreadcrumbList for bairro pages */
export function buildBairroBreadcrumbJsonLd(bairroNome: string, bairroSlug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Uhome", item: "https://uhome.com.br/" },
      { "@type": "ListItem", position: 2, name: "Bairros", item: "https://uhome.com.br/bairros" },
      { "@type": "ListItem", position: 3, name: bairroNome, item: `https://uhome.com.br/bairros/${bairroSlug}` },
    ],
  };
}

/** BreadcrumbList for property pages */
export function buildImovelBreadcrumbJsonLd(imovel: Imovel) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Uhome", item: "https://uhome.com.br/" },
      { "@type": "ListItem", position: 2, name: "Buscar", item: "https://uhome.com.br/busca" },
      { "@type": "ListItem", position: 3, name: imovel.bairro, item: `https://uhome.com.br/busca?bairros=${encodeURIComponent(imovel.bairro)}` },
      { "@type": "ListItem", position: 4, name: imovel.titulo, item: `https://uhome.com.br/imovel/${imovel.slug}` },
    ],
  };
}

/** Organization schema for the site */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Uhome",
    url: "https://uhome.com.br",
    logo: "https://uhome.com.br/uhome-logo.svg",
    description:
      "Imobiliária digital em Porto Alegre. Apartamentos, casas e coberturas à venda com curadoria e tecnologia.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Porto Alegre",
      addressRegion: "RS",
      addressCountry: "BR",
    },
    areaServed: {
      "@type": "City",
      name: "Porto Alegre",
    },
  };
}
