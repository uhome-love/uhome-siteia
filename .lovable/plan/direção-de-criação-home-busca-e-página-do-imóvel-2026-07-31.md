# Direção de criação: Home, Busca e Página do Imóvel

Visão: hoje o site funciona bem, mas comunica "portal de listagem". O alvo é **corretora digital de alto padrão** — menos ruído, mais curadoria, mais confiança, e velocidade percebida quase instantânea. Abaixo, o que eu faria em cada superfície, em ordem de impacto.

---

## 1. Página do Imóvel — a mais estratégica (é onde a decisão acontece)

**Design / UX**
- Galeria como protagonista: hoje é um grid 4x2 fixo de 480px. Trocar por uma galeria cinematográfica full-bleed com foto principal grande, contador "1/32", e lightbox por categoria (Sala, Cozinha, Vista, Planta) em vez de rolagem cega.
- Painel de decisão fixo à direita (já é sticky) reorganizado por hierarquia real: preço → custo mensal total (condomínio + IPTU somados, o que ninguém faz bem) → CTA único de agendamento → WhatsApp secundário. Hoje há CTAs competindo.
- "Por que este imóvel": bloco curto e editorial acima da descrição — 3 pontos gerados a partir dos dados (posição solar, m² privativo vs média do bairro, andar, vagas). Substitui o texto cru importado do Jetimob.
- Contexto de bairro dentro da página: distância a pé de mercado, escola, parque, e um mini-comparativo de preço/m² do imóvel vs média do bairro. É o que gera confiança de alto padrão.
- Descrição tratada tipograficamente (medida de linha ~70 caracteres, "ler mais" suave) em vez de bloco denso.
- Mobile: barra inferior única e persistente com preço + Agendar; sem competir com o FAB do WhatsApp.

**Qualidade / velocidade**
- LCP: foto principal em AVIF/WebP responsivo com `fetchpriority=high` e preload; galeria restante lazy.
- Prefetch do detalhe no hover/touchstart do card da busca (já existe parcialmente) → abertura percebida como instantânea.
- Skeleton com a forma real da página (galeria + painel), não spinner.

## 2. Página de Busca — onde o site ganha ou perde a sessão

**Mapa (prioridade absoluta, detalhada no plano anterior)**
- Price pills estilo Airbnb, clusters limpos, hover-link lista↔mapa, debounce 350 ms, pins sem re-render.

**Qualificação da busca (o maior salto de qualidade)**
- Ordenação com inteligência real: além de "recentes/preço", oferecer **"Melhor custo-benefício"** (preço/m² vs média do bairro) e **"Recomendados para você"** (baseado nos favoritos e imóveis vistos).
- Filtros que respondem: contagem em tempo real em todos os filtros (hoje só nos tipos), e "0 resultados" nunca vazio — sempre com 3 sugestões de relaxamento ("sem a vaga extra: 42 imóveis").
- Salvar busca + alerta como parte natural do fluxo (o modal já existe) — oferecido após o 2º scroll, não como botão frio.
- Chips de contexto no topo mostrando a busca em linguagem natural ("Apartamentos de 3 quartos no Menino Deus até R$ 900 mil") — reforça a busca por IA que já existe.
- Comparador: selecionar até 3 imóveis e ver lado a lado (preço/m², condomínio, vagas, andar).

**Card do imóvel (SearchPropertyCard)**
- Menos badges, mais respiro. Hierarquia: foto → preço → endereço → 3 atributos → custo mensal. Hoje a densidade é de portal.
- Um sinal de escassez honesto e discreto ("visto 14 vezes esta semana") em vez de badges genéricos.
- Carrossel de fotos com pré-carregamento da próxima foto (mobile já tem IntersectionObserver; estender a lógica).

## 3. Home — hoje ela apresenta; deveria qualificar

- Hero: manter o card de busca sobre o skyline, mas reduzir a competição visual. Um H1 e um único caminho primário — busca. As 3 abas atuais dispersam.
- Prova social acima da dobra secundária: número real de imóveis, bairros cobertos, tempo médio de resposta. Dados que já existem no banco.
- Curadoria em vez de listagem: uma faixa "Selecionados da semana" com 6 imóveis escolhidos por critério (preço/m² abaixo da média, novos no site) — dá voz editorial de imobiliária de alto padrão.
- "Continue de onde parou": últimos imóveis vistos e buscas salvas. É a maior alavanca de retorno e não custa nada de infra.
- Bairros: manter, mas com foto tratada e dado de contexto (preço médio/m², nº de imóveis) em vez de só nome.
- Ferramentas de captação (avaliação de imóvel) com peso editorial próprio, não como banner.

## 4. Design system transversal

- Paleta rebaixada: base off-white/grafite, azul como acento pontual e não como cor de tudo. Hoje o azul saturado em botões, chips, bordas e sombras dá leitura "SaaS".
- Sombras neutras tokenizadas; hoje são rgba azuis hardcoded.
- Tipografia fluida com `clamp()`, tracking negativo em títulos, corpo mais respirado. Mantém Plus Jakarta Sans.
- Movimento com propósito: 150–250 ms padrão, elevação no hover, transições de página já existentes refinadas.

## 5. Velocidade percebida (transversal)

- Skeletons com a forma real de cada tela, nunca spinner.
- Prefetch em hover/touch nas rotas quentes (card → detalhe, nav → busca; parte já existe).
- Imagens: AVIF + tamanhos responsivos servidos pelo proxy que já usamos.
- Redução do JS inicial da busca fatiando `Search.tsx` (1137 linhas) e `SearchMap.tsx` (876 linhas).

---

## Detalhes técnicos
- Ordenações novas ("custo-benefício", "recomendados") usam dados já existentes (`preco`, `area_util`, stats de bairro) — no máximo uma RPC nova de média por bairro, sem alterar o schema.
- "Continue de onde parou" e comparador vivem em localStorage + Zustand; sem backend novo.
- Nada muda em Jetimob sync, CRM triggers, URL sync de filtros ou SEO/SSR.
- Cada item é entregável isolado; o site permanece no ar.

## Ordem que eu executaria
1. Mapa Airbnb-style (plano já aprovado em espírito) — maior impacto percebido.
2. Página do imóvel: galeria + painel de decisão + custo mensal total.
3. Busca: ordenações inteligentes, contagens em todos os filtros, zero-resultado com sugestões.
4. Design system rebaixado + card do imóvel.
5. Home: curadoria, prova social, "continue de onde parou".

Me diga por qual bloco começamos — ou aprove esta ordem e eu sigo do 1 ao 5.
