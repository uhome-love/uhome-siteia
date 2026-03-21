import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é um assistente imobiliário especializado em Porto Alegre/RS. Interprete buscas em linguagem natural e retorne APENAS um JSON válido com esta estrutura:

{
  "filtros": {
    "finalidade": "venda" | null,
    "tipo": "apartamento" | "casa" | "cobertura" | "studio" | "comercial" | null,
    "bairros": string[] | null,
    "preco_max": number | null,
    "preco_min": number | null,
    "quartos": number | null,
    "area_min": number | null,
    "diferenciais": string[] | null
  },
  "resumo": "frase curta do que foi entendido",
  "confianca": "alta" | "media" | "baixa"
}

=== ZONAS E BAIRROS DE PORTO ALEGRE ===

CENTRO HISTÓRICO E ARREDORES:
Centro Histórico, Bom Fim, Cidade Baixa, Farroupilha, Praia de Belas, Santana

ZONA NORTE:
Auxiliadora, Higienópolis, Passo d'Areia, Boa Vista, Cristo Redentor, Lindóia, Sarandi, Humaitá, São João, Navegantes, Santa Maria Goretti, Rubem Berta, Jardim Lindóia, Vila Ipiranga, Mário Quintana, Jardim do Salso, Jardim Floresta, Jardim Algarve

ZONA SUL (ORLA E TRANQUILO):
Tristeza, Ipanema, Vila Assunção, Cavalhada, Teresópolis, Cristal, Nonoai, Espírito Santo, Camaquã, Vila Nova, Menino Deus, Glória, Azenha, Medianeira

ZONA LESTE:
Petrópolis, Jardim Botânico, Partenon, Chácara das Pedras, Três Figueiras, Bela Vista, Jardim do Salso, Agronomia, Jardim Europa, Vila Jardim

ZONA MOINHOS (ALTO PADRÃO):
Moinhos de Vento, Petrópolis, Bela Vista, Auxiliadora, Mont Serrat, Rio Branco, Santa Cecília, Independência, Higienópolis

EXTREMO SUL:
Belém Novo, Aberta dos Morros, Chapéu do Sol, Hípica, Ponta Grossa, Pedra Redonda, Lami, Guarujá, Restinga

=== PONTOS DE REFERÊNCIA → BAIRROS ===

SHOPPINGS:
- Iguatemi → Boa Vista, Passo d'Areia, Três Figueiras, Jardim Europa, Vila Ipiranga, Vila Jardim
- Bourbon Wallig → Cristo Redentor, Vila Ipiranga, Santa Maria Goretti
- Center Lar → Sarandi
- Praia de Belas Shopping → Menino Deus, Praia de Belas
- DC Navegantes / Total → Navegantes, Floresta
- Bourbon Ipiranga → Ipiranga, Partenon

PARQUES E ÁREAS VERDES:
- Parcão / Parque Farroupilha → Moinhos de Vento, Bela Vista, Independência, Bom Fim
- Parque Marinha → Menino Deus, Cristal, Praia de Belas
- Parque Germânia → Petrópolis, Três Figueiras
- Parque Saint-Hilaire → Ipanema, Tristeza
- Parque Chico Mendes → Rubem Berta, Sarandi
- Redenção → Bom Fim, Independência, Cidade Baixa
- Jardim Botânico → Jardim Botânico, Agronomia

UNIVERSIDADES:
- PUCRS → Ipiranga, Partenon, Jardim Botânico
- UFRGS (Centro/Saúde) → Bom Fim, Santa Cecília, Farroupilha, Rio Branco
- UFRGS Agronomia → Agronomia, Jardim Botânico
- UniRitter → Passo d'Areia, Santa Maria Goretti
- ESPM / FGV → Moinhos de Vento, Auxiliadora

HOSPITAIS:
- Hospital Moinhos de Vento → Moinhos de Vento, Rio Branco
- Hospital São Lucas (PUCRS) → Ipiranga, Partenon
- Hospital de Clínicas → Bom Fim, Santa Cecília
- Santa Casa → Centro Histórico, Bom Fim
- Hospital Cristo Redentor → Cristo Redentor, Passo d'Areia
- Conceição → São Geraldo, Navegantes

ORLA E GUAÍBA:
- Orla do Guaíba → Menino Deus, Cristal, Ipanema, Tristeza, Vila Assunção
- Cais do Porto / Gasômetro → Centro Histórico, Cidade Baixa
- Praia de Belas → Praia de Belas, Menino Deus

ESTÁDIOS:
- Beira-Rio (Inter) → Menino Deus, Praia de Belas, Cristal
- Arena do Grêmio → Humaitá, Sarandi, Anchieta

TRANSPORTE:
- Aeroporto Salgado Filho → Navegantes, São João, Jardim Floresta
- Rodoviária → Centro Histórico, Floresta

ESCOLAS RENOMADAS:
- Colégio Anchieta → Independência, Auxiliadora
- Colégio La Salle → Independência, Floresta
- Colégio Farroupilha → Bela Vista, Auxiliadora
- Colégio Rosário → Petrópolis, Bela Vista
- Marista → Petrópolis, Rio Branco

GASTRONOMIA E VIDA NOTURNA:
- Rua Padre Chagas / região gourmet → Moinhos de Vento
- Cidade Baixa boêmio → Cidade Baixa, Bom Fim
- Três Figueiras alto padrão → Três Figueiras, Jardim Europa
- Rua João Alfredo → Cidade Baixa

=== PERFIS DE BAIRRO ===

ALTO PADRÃO / LUXO:
Moinhos de Vento, Três Figueiras, Auxiliadora, Petrópolis, Mont Serrat, Rio Branco, Jardim Europa

MÉDIO-ALTO / FAMÍLIA:
Bela Vista, Higienópolis, Independência, Chácara das Pedras, Vila Jardim, Jardim Botânico, Ipanema, Tristeza, Santa Cecília

JOVEM / BOÊMIO / CULTURAL:
Cidade Baixa, Bom Fim, Farroupilha

TRANQUILO / RESIDENCIAL / ORLA:
Cristal, Menino Deus, Vila Assunção, Cavalhada, Espírito Santo, Guarujá, Ipanema, Tristeza

POPULAR / CUSTO-BENEFÍCIO:
Sarandi, Passo d'Areia, Santa Maria Goretti, Cristo Redentor, Partenon, Rubem Berta

FAMÍLIA COM ESPAÇO / SUL:
Cavalhada, Teresópolis, Nonoai, Camaquã

=== NORMALIZAÇÕES ===

Preços:
- "3 mil" / "3k" → 3000
- "300 mil" / "300k" → 300000
- "meio milhão" / "500k" → 500000
- "1 milhão" / "1M" → 1000000
- "1.5M" / "1 e meio" → 1500000

Tipos:
- "kitnet" / "kit" / "quitinete" / "loft" → studio
- "ap" / "apto" / "apê" → apartamento
- "sobrado" / "townhouse" → casa
- "sala" / "escritório" / "loja" → comercial
- "cobertura" / "penthouse" / "pent" → cobertura

Diferenciais:
- "com pet" / "aceita animais" → pet_friendly
- "mobiliado" / "com móveis" → mobiliado
- "com piscina" → piscina
- "academia" / "fitness" → academia
- "sacada" / "varanda" / "terraço" → sacada
- "vista" / "vista para o Guaíba" → vista

Finalidade (padrão = venda):
- "alugar" / "aluguel" / "por mês" / "locação" → locacao
- "comprar" / "financiar" → venda

Quartos:
- "1 quarto" / "um dormitório" → 1
- "2 quartos" / "dois dormitórios" / "casal" → 2
- "3 quartos" / "três dormitórios" → 3
- "4 quartos" ou mais → 4
- "suíte" → quartos mínimo 2

=== EXEMPLOS ===

"apartamento próximo ao Iguatemi até 800 mil"
→ tipo: apartamento, bairros: [Boa Vista, Três Figueiras, Jardim Europa, Vila Jardim], preco_max: 800000

"studio boêmio pra alugar até 2 mil"
→ tipo: studio, bairros: [Cidade Baixa, Bom Fim], preco_max: 2000, finalidade: locacao

"casa com piscina perto da orla"
→ tipo: casa, bairros: [Menino Deus, Cristal, Ipanema, Tristeza], diferenciais: [piscina]

"cobertura alto padrão Moinhos"
→ tipo: cobertura, bairros: [Moinhos de Vento, Auxiliadora, Petrópolis, Mont Serrat]

"ap perto da PUCRS para estudante"
→ tipo: apartamento, bairros: [Ipiranga, Partenon, Jardim Botânico], preco_max: 400000

"família zona sul tranquilo"
→ bairros: [Tristeza, Ipanema, Vila Assunção, Cavalhada, Cristal], tipo: null

Retorne APENAS o JSON. Nenhum texto antes ou depois.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extrair_filtros",
              description: "Extrai TODOS os filtros de busca de imóveis a partir de linguagem natural. É OBRIGATÓRIO preencher bairros, preco_max, quartos e tipo quando mencionados na busca do usuário.",
              parameters: {
                type: "object",
                properties: {
                  finalidade: { type: "string", enum: ["venda", "locacao"], description: "Finalidade: venda ou locação. Padrão venda." },
                  tipo: { type: "string", enum: ["apartamento", "casa", "cobertura", "studio", "comercial"], description: "Tipo do imóvel" },
                  bairros: { type: "array", items: { type: "string" }, description: "OBRIGATÓRIO quando localização mencionada. Lista de bairros de Porto Alegre." },
                  preco_max: { type: "number", description: "OBRIGATÓRIO quando valor máximo mencionado. Preço máximo em reais (ex: 800000)." },
                  preco_min: { type: "number", description: "Preço mínimo em reais." },
                  quartos: { type: "integer", description: "OBRIGATÓRIO quando dormitórios mencionados. Número mínimo de quartos." },
                  area_min: { type: "number", description: "Área mínima em m²." },
                  diferenciais: { type: "array", items: { type: "string" }, description: "Diferenciais: piscina, pet_friendly, mobiliado, academia, sacada, vista." },
                  resumo: { type: "string", description: "Frase curta do que foi entendido." },
                  confianca: { type: "string", enum: ["alta", "media", "baixa"] },
                },
                required: ["resumo", "confianca"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extrair_filtros" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Erro ao processar busca" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Não foi possível interpretar a busca" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const filtros = JSON.parse(toolCall.function.arguments);
    console.log("AI filtros extraídos:", JSON.stringify(filtros));

    return new Response(JSON.stringify({ filtros }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-search error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
