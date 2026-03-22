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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { condominio_nome } = await req.json();
    if (!condominio_nome) {
      return new Response(JSON.stringify({ error: "condominio_nome required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache first
    const { data: cached } = await supabase
      .from("condominio_descricoes")
      .select("descricao")
      .eq("condominio_nome", condominio_nome)
      .maybeSingle();

    if (cached?.descricao) {
      return new Response(JSON.stringify({ descricao: cached.descricao }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch property data for this condominium
    const { data: imoveis } = await supabase
      .from("imoveis")
      .select("tipo, quartos, banheiros, vagas, area_total, area_util, preco, bairro, cidade, diferenciais, andar")
      .eq("status", "disponivel")
      .eq("condominio_nome", condominio_nome)
      .limit(50);

    if (!imoveis || imoveis.length === 0) {
      return new Response(JSON.stringify({ error: "No properties found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context for AI
    const bairro = imoveis[0].bairro;
    const cidade = imoveis[0].cidade || "Porto Alegre";
    const tipos = [...new Set(imoveis.map((i: any) => i.tipo))];
    const precos = imoveis.map((i: any) => i.preco).filter(Boolean);
    const precoMin = Math.min(...precos);
    const precoMax = Math.max(...precos);
    const areas = imoveis.map((i: any) => i.area_total || i.area_util || 0).filter((a: number) => a > 0);
    const areaMin = areas.length ? Math.min(...areas) : 0;
    const areaMax = areas.length ? Math.max(...areas) : 0;
    const quartos = [...new Set(imoveis.map((i: any) => i.quartos).filter(Boolean))].sort();
    const vagas = [...new Set(imoveis.map((i: any) => i.vagas).filter(Boolean))].sort();
    const diferenciais = [...new Set(imoveis.flatMap((i: any) => i.diferenciais || []))].slice(0, 15);
    const andares = [...new Set(imoveis.map((i: any) => i.andar).filter(Boolean))].sort((a: number, b: number) => a - b);

    const prompt = `Você é um redator imobiliário especializado em Porto Alegre. Escreva uma descrição atrativa e informativa para o empreendimento "${condominio_nome}", localizado no bairro ${bairro}, ${cidade}.

Dados do empreendimento:
- ${imoveis.length} unidades disponíveis
- Tipos: ${tipos.join(", ")}
- Faixa de preço: R$ ${precoMin.toLocaleString("pt-BR")} a R$ ${precoMax.toLocaleString("pt-BR")}
${areaMin > 0 ? `- Área: ${areaMin} a ${areaMax} m²` : ""}
${quartos.length > 0 ? `- Quartos: ${quartos.join(", ")}` : ""}
${vagas.length > 0 ? `- Vagas: ${vagas.join(", ")}` : ""}
${andares.length > 0 ? `- Andares: ${andares.join(", ")}` : ""}
${diferenciais.length > 0 ? `- Diferenciais: ${diferenciais.join(", ")}` : ""}

Regras:
- Escreva 2-3 parágrafos curtos (máximo 150 palavras total)
- Mencione o bairro e seus pontos fortes
- Destaque os diferenciais do empreendimento
- Use tom profissional mas acolhedor
- NÃO invente informações que não estão nos dados
- NÃO use clichês como "oportunidade única" ou "não perca"
- Foco em SEO: use palavras-chave naturais como "apartamento à venda em ${bairro}"`;

    // Call Lovable AI
    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um redator imobiliário brasileiro especializado em SEO." },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const descricao = aiData.choices?.[0]?.message?.content?.trim() || "";

    if (!descricao) {
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache the description
    await supabase.from("condominio_descricoes").upsert(
      { condominio_nome, descricao, updated_at: new Date().toISOString() },
      { onConflict: "condominio_nome" }
    );

    return new Response(JSON.stringify({ descricao }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
