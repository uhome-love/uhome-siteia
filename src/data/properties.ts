export interface MockProperty {
  id: string;
  slug: string;
  title: string;
  neighborhood: string;
  city: string;
  price: number;
  priceFormatted: string;
  finalidade: "venda";
  tipo: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  image: string;
  badge?: string;
  features: string[];
  lat: number;
  lng: number;
}

export const mockProperties: MockProperty[] = [
  {
    id: "1", slug: "apartamento-moinhos-de-vento", title: "Apartamento Alto Padrão Moinhos",
    neighborhood: "Moinhos de Vento", city: "Porto Alegre", price: 1850000,
    priceFormatted: "R$ 1.850.000", finalidade: "venda", tipo: "apartamento",
    area: 142, bedrooms: 3, bathrooms: 2, parking: 2,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
    badge: "Destaque", features: ["Piscina", "Academia", "Portaria 24h"],
    lat: -30.0277, lng: -51.1963,
  },
  {
    id: "2", slug: "cobertura-duplex-petropolis", title: "Cobertura Duplex com Terraço",
    neighborhood: "Petrópolis", city: "Porto Alegre", price: 2490000,
    priceFormatted: "R$ 2.490.000", finalidade: "venda", tipo: "cobertura",
    area: 228, bedrooms: 4, bathrooms: 3, parking: 3,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    features: ["Churrasqueira", "Terraço", "Vista panorâmica"],
    lat: -30.0350, lng: -51.1850,
  },
  {
    id: "3", slug: "studio-moderno-bela-vista", title: "Studio Moderno e Compacto",
    neighborhood: "Bela Vista", city: "Porto Alegre", price: 385000,
    priceFormatted: "R$ 385.000", finalidade: "venda", tipo: "studio",
    area: 38, bedrooms: 1, bathrooms: 1, parking: 1,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop",
    badge: "Novo", features: ["Mobiliado", "Pet friendly"],
    lat: -30.0410, lng: -51.1880,
  },
  {
    id: "4", slug: "casa-tres-figueiras", title: "Casa com Jardim e Piscina",
    neighborhood: "Três Figueiras", city: "Porto Alegre", price: 3200000,
    priceFormatted: "R$ 3.200.000", finalidade: "venda", tipo: "casa",
    area: 320, bedrooms: 5, bathrooms: 4, parking: 4,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    features: ["Piscina", "Jardim", "Churrasqueira", "Academia"],
    lat: -30.0200, lng: -51.1700,
  },
  {
    id: "5", slug: "apto-reformado-boa-vista", title: "Apartamento Reformado 2D",
    neighborhood: "Boa Vista", city: "Porto Alegre", price: 520000,
    priceFormatted: "R$ 520.000", finalidade: "venda", tipo: "apartamento",
    area: 95, bedrooms: 2, bathrooms: 1, parking: 1,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
    features: ["Portaria 24h", "Reformado"],
    lat: -30.0180, lng: -51.1920,
  },
  {
    id: "6", slug: "loft-montserrat", title: "Loft Industrial Mont'Serrat",
    neighborhood: "Mont'Serrat", city: "Porto Alegre", price: 890000,
    priceFormatted: "R$ 890.000", finalidade: "venda", tipo: "apartamento",
    area: 68, bedrooms: 1, bathrooms: 1, parking: 1,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    badge: "Exclusivo", features: ["Mobiliado", "Pet friendly"],
    lat: -30.0250, lng: -51.2000,
  },
  {
    id: "7", slug: "apto-rio-branco", title: "Apartamento Clássico Centro",
    neighborhood: "Centro Histórico", city: "Porto Alegre", price: 295000,
    priceFormatted: "R$ 295.000", finalidade: "venda", tipo: "apartamento",
    area: 55, bedrooms: 1, bathrooms: 1, parking: 0,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    features: ["Portaria 24h"],
    lat: -30.0330, lng: -51.2300,
  },
  {
    id: "8", slug: "cobertura-bela-vista", title: "Cobertura Linear com Piscina",
    neighborhood: "Bela Vista", city: "Porto Alegre", price: 1750000,
    priceFormatted: "R$ 1.750.000", finalidade: "venda", tipo: "cobertura",
    area: 195, bedrooms: 3, bathrooms: 3, parking: 2,
    image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&h=400&fit=crop",
    features: ["Piscina", "Churrasqueira", "Vista panorâmica"],
    lat: -30.0395, lng: -51.1870,
  },
  {
    id: "9", slug: "casa-ipanema", title: "Casa Moderna em Condomínio",
    neighborhood: "Ipanema", city: "Porto Alegre", price: 1450000,
    priceFormatted: "R$ 1.450.000", finalidade: "venda", tipo: "casa",
    area: 210, bedrooms: 3, bathrooms: 2, parking: 2,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop",
    features: ["Condomínio fechado", "Jardim", "Segurança 24h"],
    lat: -30.1200, lng: -51.2100,
  },
  {
    id: "10", slug: "studio-cidade-baixa", title: "Studio Descolado Cidade Baixa",
    neighborhood: "Cidade Baixa", city: "Porto Alegre", price: 320000,
    priceFormatted: "R$ 320.000", finalidade: "venda", tipo: "studio",
    area: 32, bedrooms: 1, bathrooms: 1, parking: 0,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
    features: ["Mobiliado", "Pet friendly"],
    lat: -30.0400, lng: -51.2200,
  },
  {
    id: "11", slug: "sala-comercial-moinhos", title: "Sala Comercial Premium",
    neighborhood: "Moinhos de Vento", city: "Porto Alegre", price: 4500,
    priceFormatted: "R$ 4.500/mês", finalidade: "locacao", tipo: "comercial",
    area: 60, bedrooms: 0, bathrooms: 1, parking: 1,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    features: ["Ar condicionado", "Portaria 24h"],
    lat: -30.0265, lng: -51.1975,
  },
  {
    id: "12", slug: "apto-higienopolis", title: "Apartamento Espaçoso 3D",
    neighborhood: "Higienópolis", city: "Porto Alegre", price: 650000,
    priceFormatted: "R$ 650.000", finalidade: "venda", tipo: "apartamento",
    area: 110, bedrooms: 3, bathrooms: 2, parking: 1,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop",
    features: ["Reformado", "Portaria 24h"],
    lat: -30.0380, lng: -51.1950,
  },
];

export const neighborhoods = [
  "Moinhos de Vento", "Petrópolis", "Bela Vista", "Três Figueiras",
  "Mont'Serrat", "Boa Vista", "Centro Histórico", "Ipanema",
  "Cidade Baixa", "Higienópolis", "Rio Branco", "Auxiliadora",
];

export const propertyTypes = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "cobertura", label: "Cobertura" },
  { value: "studio", label: "Studio" },
  { value: "comercial", label: "Comercial" },
];

export const featureOptions = [
  "Pet friendly", "Mobiliado", "Piscina", "Academia", "Churrasqueira",
  "Portaria 24h", "Vista panorâmica", "Jardim", "Terraço", "Reformado",
];
