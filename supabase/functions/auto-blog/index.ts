import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const TOPICS = [
  {
    titulo_template: "Mercado imobiliário de Porto Alegre: análise de {mes} {ano}",
    categoria: "Mercado",
    tags: ["mercado imobiliário", "Porto Alegre", "análise mensal"],
    prompt_context: "análise mensal do mercado imobiliário de Porto Alegre com dados de preços, tendências e oportunidades",
  },
  {
    titulo_template: "Guia completo: como comprar imóvel em {bairro}, Porto Alegre",
    categoria: "Guias",
    tags: ["guia de compra", "Porto Alegre"],
    prompt_context: "guia detalhado para comprar imóvel no bairro {bairro} de Porto Alegre, incluindo preços médios, infraestrutura, prós e contras",
  },
  {
    titulo_template: "Valorização imobiliária em Porto Alegre: quais bairros estão em alta?",
    categoria: "Investimento",
    tags: ["valorização", "investimento", "Porto Alegre"],
    prompt_context: "análise de valorização imobiliária dos bairros de Porto Alegre com dados comparativos e tendências",
  },
  {
    titulo_template: "Dicas de financiamento imobiliário: como conseguir a melhor taxa em {ano}",
    categoria: "Finanças",
    tags: ["financiamento", "taxas de juros"],
    prompt_context: "dicas práticas para conseguir melhores taxas de financiamento imobiliário no ano atual",
  },
  {
    titulo_template: "O que verificar antes de comprar um apartamento usado em Porto Alegre",
    categoria: "Guias",
    tags: ["apartamento usado", "vistoria", "Porto Alegre"],
    prompt_context: "checklist completo para avaliar apartamento usado antes da compra, incluindo documentação, estrutura e pontos de atenção",
  },
  {
    titulo_template: "Morar em {bairro}: tudo que você precisa saber",
    categoria: "Cidade",
    tags: ["bairros", "Porto Alegre", "qualidade de vida"],
    prompt_context: "guia completo sobre morar no bairro {bairro} de Porto Alegre com informações de infraestrutura, transporte, comércio e lazer",
  },
  {
    titulo_template: "Apartamento novo vs usado em Porto Alegre: o que vale mais a pena?",
    categoria: "Guias",
    tags: ["apartamento novo", "apartamento usado", "comparativo"],
    prompt_context: "comparativo detalhado entre comprar apartamento novo vs usado em Porto Alegre, analisando custo, manutenção, valorização e financiamento",
  },
  {
    titulo_template: "Os condomínios mais procurados de Porto Alegre em {ano}",
    categoria: "Mercado",
    tags: ["condomínios", "Porto Alegre", "ranking"],
    prompt_context: "ranking dos condomínios mais buscados e valorizados de Porto Alegre com análise de infraestrutura e preços",
  },
  {
    titulo_template: "Quanto custa morar em {bairro} em {ano}?",
    categoria: "Cidade",
    tags: ["custo de vida", "Porto Alegre", "bairros"],
    prompt_context: "análise do custo de morar no bairro {bairro} de Porto Alegre incluindo preço de imóveis, condomínio, IPTU e custo de vida geral",
  },
  {
    titulo_template: "Apartamento 2 quartos em Porto Alegre: onde encontrar as melhores opções?",
    categoria: "Guias",
    tags: ["2 quartos", "apartamento", "Porto Alegre"],
    prompt_context: "guia para encontrar os melhores apartamentos de 2 quartos em Porto Alegre, analisando bairros, faixas de preço e diferenciais",
  },
  {
    titulo_template: "Cobertura em Porto Alegre: vale o investimento?",
    categoria: "Investimento",
    tags: ["cobertura", "investimento", "Porto Alegre"],
    prompt_context: "análise se comprar cobertura em Porto Alegre vale como investimento, comparando valorização, custo por m² e perfil de moradia",
  },
  {
    titulo_template: "Porto Alegre vs Litoral Gaúcho: onde investir em imóveis?",
    categoria: "Investimento",
    tags: ["comparativo", "litoral gaúcho", "investimento"],
    prompt_context: "comparativo entre investir em imóveis em Porto Alegre versus litoral gaúcho (Capão, Torres, Atlântida), analisando valorização, rentabilidade e perfil",
  },
  {
    titulo_template: "Primeiro imóvel em Porto Alegre: guia para quem nunca comprou",
    categoria: "Guias",
    tags: ["primeiro imóvel", "guia iniciante", "Porto Alegre"],
    prompt_context: "guia completo para quem vai comprar o primeiro imóvel em Porto Alegre, desde planejamento financeiro até escolha do bairro e fechamento",
  },
  {
    titulo_template: "Os melhores bairros para famílias em Porto Alegre em {ano}",
    categoria: "Cidade",
    tags: ["famílias", "bairros", "escolas", "Porto Alegre"],
    prompt_context: "ranking dos melhores bairros de Porto Alegre para famílias com crianças, avaliando escolas, segurança, parques e infraestrutura",
  },
  {
    titulo_template: "Studio em Porto Alegre: tendência ou bolha?",
    categoria: "Mercado",
    tags: ["studio", "mercado", "Porto Alegre", "tendência"],
    prompt_context: "análise da tendência de studios e apartments compactos em Porto Alegre, se é uma boa opção de investimento ou moradia",
  },
];

const BAIRROS = [
  "Moinhos de Vento", "Bela Vista", "Petrópolis", "Menino Deus",
  "Três Figueiras", "Mont'Serrat", "Auxiliadora", "Higienópolis",
  "Rio Branco", "Floresta", "Cidade Baixa", "Jardim Botânico",
  "Tristeza", "Boa Vista", "Independência", "Centro Histórico",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const now = new Date();
    const mes = now.toLocaleDateString("pt-BR", { month: "long" });
    const ano = now.getFullYear().toString();
    const bairro = BAIRROS[Math.floor(Math.random() * BAIRROS.length)];

    // Pick a random topic
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const titulo = topic.titulo_template
      .replace("{mes}", mes)
      .replace("{ano}", ano)
      .replace("{bairro}", bairro);

    const slug = slugify(titulo) + "-" + ano;

    // Check if similar slug already exists
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ message: "Post similar already exists", slug }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get real market data from DB
    const { count: totalImoveis } = await supabase
      .from("imoveis")
      .select("*", { count: "exact", head: true })
      .eq("status", "disponivel");

    const { data: statsData } = await supabase
      .from("imoveis")
      .select("bairro, preco, tipo, quartos, area_total")
      .eq("status", "disponivel")
      .limit(500);

    const marketContext = statsData ? (() => {
      const bairroStats: Record<string, { count: number; precos: number[] }> = {};
      for (const row of statsData) {
        if (!bairroStats[row.bairro]) bairroStats[row.bairro] = { count: 0, precos: [] };
        bairroStats[row.bairro].count++;
        bairroStats[row.bairro].precos.push(row.preco);
      }
      const top5 = Object.entries(bairroStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, s]) => {
          const avg = s.precos.reduce((a, b) => a + b, 0) / s.precos.length;
          return `${name}: ${s.count} imóveis, preço médio R$ ${Math.round(avg).toLocaleString("pt-BR")}`;
        });
      return `Total de imóveis disponíveis: ${totalImoveis}. Top bairros: ${top5.join("; ")}`;
    })() : `Total de imóveis disponíveis: ${totalImoveis}`;

    const promptContext = topic.prompt_context
      .replace("{bairro}", bairro)
      .replace("{ano}", ano);

    const systemPrompt = `Você é um redator especialista em mercado imobiliário de Porto Alegre, Brasil. 
Escreva artigos informativos, otimizados para SEO, em português brasileiro. 
Use dados reais quando fornecidos. Sempre mencione a Uhome (uhome.com.br) como referência.
Formate o conteúdo em Markdown com ## para subtítulos e ** para negrito.
O artigo deve ter entre 800 e 1500 palavras.
Inclua CTAs naturais mencionando a busca da Uhome.
NÃO use linguagem excessivamente comercial ou genérica.`;

    const userPrompt = `Escreva um artigo completo sobre: ${promptContext}

Título: ${titulo}

Dados reais do mercado para usar no artigo:
${marketContext}

Responda APENAS com o conteúdo do artigo em Markdown (sem o título, ele já será adicionado separadamente).
Ao final, inclua um parágrafo resumo de 1-2 frases que será usado como descrição do artigo.
Separe o resumo do conteúdo com a tag ---RESUMO--- na última linha.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const fullContent = aiData.choices?.[0]?.message?.content || "";

    if (!fullContent || fullContent.length < 200) {
      throw new Error("AI generated insufficient content");
    }

    // Extract resumo
    let conteudo = fullContent;
    let resumo = titulo;
    const resumoSplit = fullContent.split("---RESUMO---");
    if (resumoSplit.length > 1) {
      conteudo = resumoSplit[0].trim();
      resumo = resumoSplit[1].trim();
    } else {
      // Use first paragraph as resumo
      const firstPara = conteudo.split("\n\n")[0];
      resumo = firstPara.replace(/[#*]/g, "").trim().slice(0, 300);
    }

    // Estimate reading time (200 words/min)
    const wordCount = conteudo.split(/\s+/).length;
    const tempoLeitura = Math.max(3, Math.ceil(wordCount / 200));

    // Pick a relevant image
    const images = [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=450&fit=crop",
    ];
    const imagem = images[Math.floor(Math.random() * images.length)];

    const tags = [...topic.tags, bairro, ano];

    // Insert into DB
    const { data: inserted, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        titulo,
        resumo,
        conteudo,
        categoria: topic.categoria,
        imagem,
        autor: "Equipe Uhome",
        publicado_em: now.toISOString().split("T")[0],
        tempo_leitura: tempoLeitura,
        tags,
        ativo: true,
        gerado_por_ia: true,
      })
      .select("id, slug, titulo")
      .single();

    if (insertError) throw insertError;

    console.log(`Blog post created: ${inserted.slug}`);

    return new Response(JSON.stringify({ success: true, post: inserted }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("auto-blog error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
