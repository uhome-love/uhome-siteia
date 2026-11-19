# Anúncios por produto e intenção + Salvar busca e Comparar como conversões secundárias

## O que existe hoje (conferido na conta)
- 3 campanhas de pesquisa ativas: Natal Chave de Ouro (R$ 30/dia), Imóveis do Site (R$ 30/dia), Investimento em Studios (R$ 18/dia).
- Natal já tem um grupo por produto apontando para a página `/em-foco/...` de cada um (11 produtos). O grupo genérico "Natal Chave de Ouro" está pausado.
- Imóveis do Site tem 3 grupos: genérico (`/busca` sem filtro), "Apartamento à venda POA" e "Imóveis à venda POA".
- Conversões: Visita agendada e Lead site (principais), Visita realizada CRM (principal), Clique no WhatsApp (secundária).
- Problema encontrado: "Salvar busca" envia o pedido como lead comum, então hoje contaria como **Lead site principal de R$ 50** — inflaria os resultados. Comparar não é medido no Google.

## 1. Imóveis do Site — grupos por intenção de busca
Trocar o grupo genérico (que cai na busca vazia) por grupos que abrem a busca já filtrada:
- Apartamento à venda Porto Alegre → `/busca?cidade=Porto Alegre&tipo=apartamento`
- Casa / casa em condomínio Porto Alegre → busca filtrada por casa
- Imóvel na planta / lançamento Porto Alegre → busca com fase "na planta"
- Imóveis em Canoas → busca de Canoas
- Imóveis no Litoral (Xangri-lá, Capão) → busca do Litoral
- Cobertura / alto padrão Porto Alegre → busca por cobertura
Cada grupo: palavras-chave em frase e exata da intenção, anúncio próprio (títulos com o tipo e a cidade), sem MCMV/FGTS/preço baixo. Grupo genérico pausado (não apagado). Grupos existentes de apartamento e imóveis POA são mantidos e revisados.

## 2. Natal — conferir alinhamento produto ↔ página
- Confirmar que cada grupo de produto tem palavras-chave do nome do empreendimento e anúncio citando a oferta da campanha (mesma frase das páginas).
- Completar produtos da campanha que ainda não têm grupo próprio, se houver.
- Lembrete: Natal termina em 18/12; registrar a data de fim na campanha.

## 3. Studios — alinhar à página
- Revisar palavras-chave de investimento (studio para investir, renda com aluguel de temporada não; apenas compra para investir) e o texto do anúncio com a página `/investir-studios`.

## 4. Conversões secundárias
- Criar no Google Ads: "Busca salva" (categoria lead/contato, secundária, sem valor) e "Comparar imóveis" (engajamento, secundária, sem valor). Secundárias não mudam os lances.
- No site: Salvar busca deixa de contar como "Lead site" e passa a disparar "Busca salva"; abrir a comparação nos Favoritos dispara "Comparar imóveis". Tudo respeitando o aceite de cookies.

## Ordem e aprovação
Cada mudança na conta passa por um cartão de aprovação seu. Nada aumenta orçamento. Grupos novos entram ativos dentro do orçamento atual.

## Detalhes técnicos
- `src/lib/gtag.ts`: adicionar `busca_salva` e `comparar` em `ADS` com os rótulos retornados na criação; `reportAdsConversion` mapeia `generate_lead` com `lead_tipo/tipo_interesse = busca_salva` para `busca_salva` (não `lead`); novo evento `comparar_imoveis` disparado em `Favoritos.tsx` ao abrir o diálogo.
- Teste em `gtag` test: busca_salva nunca vira "lead" nem tem valor; comparar sem valor.
- Google Ads: `conversionActionOperation` create (WEBPAGE, primaryForGoal=false); `adGroupOperation`/`adGroupCriterionOperation`/`adGroupAdOperation` creates na campanha 24462177253; pausa do grupo 204791834089; `campaign.endDate` de Natal = 2026-12-18.
- Ao final, salvar decisões nos arquivos da campanha e AGENTS.md (regra de conversões secundárias).
