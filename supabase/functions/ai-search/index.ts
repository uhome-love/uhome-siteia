import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é um assistente especializado em busca de imóveis em Porto Alegre e região.

O usuário vai descrever o que procura em linguagem natural. Você deve extrair filtros estruturados da busca.

Responda APENAS com o JSON usando a tool "extrair_filtros". Não adicione explicações.

Regras:
- finalidade: "venda" ou "locacao". Se mencionar aluguel/mês/mensal → "locacao". Se mencionar compra/investimento → "venda". Se ambíguo, omita.
- tipo: "apartamento", "casa", "cobertura", "studio", "comercial", "terreno". Normalize para minúsculas.
- bairros: lista de bairros mencionados. Normalize nomes (ex: "Moinhos" → "Moinhos de Vento").
- preco_max / preco_min: valores numéricos. "até 3 mil" → preco_max: 3000. "a partir de 500k" → preco_min: 500000. "R$1.5M" → 1500000.
- quartos: número inteiro.
- area_min: em m².
- diferenciais: lista de features mencionadas (piscina, academia, churrasqueira, portaria 24h, pet friendly, mobiliado, etc).
- resumo: frase curta descrevendo a busca interpretada.
- confianca: "alta" se a query é clara, "media" se ambígua, "baixa" se muito vaga.`;

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
              description: "Extrai filtros de busca de imóveis a partir de linguagem natural",
              parameters: {
                type: "object",
                properties: {
                  finalidade: { type: "string", enum: ["venda", "locacao"] },
                  tipo: { type: "string" },
                  bairros: { type: "array", items: { type: "string" } },
                  preco_max: { type: "number" },
                  preco_min: { type: "number" },
                  quartos: { type: "integer" },
                  area_min: { type: "number" },
                  diferenciais: { type: "array", items: { type: "string" } },
                  resumo: { type: "string" },
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
