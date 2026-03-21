export interface BairroData {
  nome: string;
  slug: string;
  foto: string;
  descricao: string;
  /** Approximate center for map */
  lat: number;
  lng: number;
}

export const bairrosData: BairroData[] = [
  {
    nome: "Moinhos de Vento",
    slug: "moinhos-de-vento",
    foto: "/images/moinhos-de-vento.png",
    descricao:
      "Moinhos de Vento é o bairro mais nobre de Porto Alegre. Com ruas arborizadas, gastronomia sofisticada na Rua Padre Chagas e o icônico Parcão, reúne edifícios de alto padrão, boutiques e vida noturna refinada. Um endereço de prestígio para quem valoriza conveniência e qualidade de vida.",
    lat: -30.025,
    lng: -51.2,
  },
  {
    nome: "Petrópolis",
    slug: "petropolis",
    foto: "/images/petropolis.png",
    descricao:
      "Petrópolis é um bairro residencial de alto padrão, próximo ao Parque Germânia e ao Colégio Rosário. Combina tranquilidade com acesso fácil ao comércio da Avenida Protásio Alves e às principais vias da cidade. Ideal para famílias que buscam segurança e espaço.",
    lat: -30.04,
    lng: -51.175,
  },
  {
    nome: "Bela Vista",
    slug: "bela-vista",
    foto: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    descricao:
      "Bela Vista alia localização privilegiada a uma infraestrutura completa. Com o Colégio Farroupilha e a PUCRS nas proximidades, o bairro concentra condomínios modernos, parques e fácil acesso às principais avenidas de Porto Alegre.",
    lat: -30.045,
    lng: -51.18,
  },
  {
    nome: "Auxiliadora",
    slug: "auxiliadora",
    foto: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    descricao:
      "Auxiliadora é sinônimo de sofisticação e praticidade. A poucos minutos do Shopping Iguatemi, concentra edifícios de alto padrão, clínicas, escolas e o melhor do comércio da Zona Norte. Perfeito para quem busca viver bem sem abrir mão da centralidade.",
    lat: -30.02,
    lng: -51.19,
  },
  {
    nome: "Três Figueiras",
    slug: "tres-figueiras",
    foto: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
    descricao:
      "Três Figueiras é um dos bairros mais exclusivos de Porto Alegre. Ruas tranquilas, residências luxuosas e a proximidade com o Parque Germânia e o Shopping Iguatemi fazem deste endereço uma referência em qualidade de vida e valorização imobiliária.",
    lat: -30.035,
    lng: -51.17,
  },
  {
    nome: "Menino Deus",
    slug: "menino-deus",
    foto: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    descricao:
      "Menino Deus encanta pela vista para o Guaíba e pela proximidade com o Parque Marinha do Brasil. Com excelente infraestrutura, ciclovias e acesso à Orla, é ideal para quem curte vida ao ar livre sem abrir mão da conveniência urbana.",
    lat: -30.05,
    lng: -51.225,
  },
  {
    nome: "Tristeza",
    slug: "tristeza",
    foto: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
    descricao:
      "Tristeza é o coração da Zona Sul de Porto Alegre. Com clima de cidade do interior, ruas arborizadas e comércio local vibrante, oferece casas espaçosas e apartamentos com vista privilegiada. Próximo à orla do Guaíba e ao Parque Saint-Hilaire.",
    lat: -30.11,
    lng: -51.25,
  },
  {
    nome: "Ipanema",
    slug: "ipanema",
    foto: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
    descricao:
      "Ipanema fica às margens do Guaíba e é o destino preferido de quem busca qualidade de vida na Zona Sul. Com praias, pôr do sol inesquecível e casas com terrenos generosos, é o refúgio perfeito dentro da capital gaúcha.",
    lat: -30.13,
    lng: -51.23,
  },
  {
    nome: "Centro Histórico",
    slug: "centro-historico",
    foto: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80",
    descricao:
      "O Centro Histórico de Porto Alegre concentra a vida cultural e comercial da capital. Com o Mercado Público, o Cais do Porto revitalizado e acesso a transporte público, é a escolha de quem quer estar no coração da cidade com imóveis de excelente custo-benefício.",
    lat: -30.03,
    lng: -51.23,
  },
  {
    nome: "Cidade Baixa",
    slug: "cidade-baixa",
    foto: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    descricao:
      "Cidade Baixa é o bairro mais boêmio e cultural de Porto Alegre. Com bares, restaurantes, galerias e a energia jovem da Rua João Alfredo, atrai estudantes e profissionais que valorizam autenticidade e vida urbana vibrante.",
    lat: -30.04,
    lng: -51.22,
  },
  {
    nome: "Bom Fim",
    slug: "bom-fim",
    foto: "https://images.unsplash.com/photo-1600566753086-00f18f6b0a28?w=800&q=80",
    descricao:
      "Bom Fim é um bairro eclético e cultural, vizinho ao Parque da Redenção e à UFRGS. Com cafés, livrarias e uma atmosfera universitária, oferece imóveis variados e excelente localização central. Perfeito para quem busca vida urbana com personalidade.",
    lat: -30.035,
    lng: -51.215,
  },
  {
    nome: "Cristal",
    slug: "cristal",
    foto: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    descricao:
      "Cristal combina tranquilidade residencial com acesso à Orla do Guaíba. Próximo ao Parque Marinha e com fácil acesso ao centro, é um bairro em valorização que atrai famílias em busca de espaço e contato com a natureza.",
    lat: -30.065,
    lng: -51.235,
  },
  {
    nome: "Boa Vista",
    slug: "boa-vista",
    foto: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    descricao:
      "Boa Vista é um bairro residencial com excelente infraestrutura, próximo ao Shopping Iguatemi e ao Bourbon Wallig. Oferece condomínios modernos, escolas e fácil acesso às principais avenidas. Equilíbrio perfeito entre praticidade e qualidade de vida.",
    lat: -30.015,
    lng: -51.17,
  },
  {
    nome: "Sarandi",
    slug: "sarandi",
    foto: "https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=800&q=80",
    descricao:
      "Sarandi é um dos bairros mais populosos de Porto Alegre e oferece imóveis com excelente custo-benefício. Com comércio variado, transporte público e proximidade da Arena do Grêmio, é uma opção inteligente para quem busca acessibilidade.",
    lat: -29.98,
    lng: -51.13,
  },
  {
    nome: "Partenon",
    slug: "partenon",
    foto: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    descricao:
      "Partenon é um bairro consolidado próximo à PUCRS e ao Hospital São Lucas. Com boa oferta de transporte, comércio e serviços, oferece apartamentos acessíveis e casas em ruas tranquilas. Ideal para estudantes e famílias.",
    lat: -30.065,
    lng: -51.17,
  },
];

export function getBairroBySlug(slug: string): BairroData | undefined {
  return bairrosData.find((b) => b.slug === slug);
}
