# Home: foto principal no HTML (passo 2 da velocidade)

## Resultado do relatório novo (celular, comparado ao anterior)
- Pulo da página: 0,10 → 0,03 (resolvido).
- Imagens a economizar: 221 KB → 81 KB.
- Visual bloqueando: 660 ms → 370 ms.
- Nota de laboratório ainda baixa: a foto principal ainda espera 2,05 s para começar a baixar (antes 2,3 s). LCP de laboratório ~10 s no celular; no computador 2,8 s (FCP 0,3 s).
- Visitantes reais ainda mostram os números antigos (média de 28 dias): LCP 3,8 s, INP 178 ms, CLS 0,09.

Motivo que sobra: a foto só é conhecida depois que todo o código do site baixa e roda. A busca já resolve isso com a foto anunciada direto no HTML; a Home ainda não.

## O que vou fazer
1. O servidor que prepara a primeira tela da Home (já atualizado a cada 3 min) passa a buscar os 5 imóveis de "Novos no site" e colocar no HTML:
   - o aviso de pré-carregamento da 1ª foto, no mesmo tamanho que o card usa;
   - os dados desses 5 imóveis, para a Home desenhar os cards sem esperar nova consulta.
2. A Home usa esses dados prontos quando existirem; se não vierem (servidor fora, link de corretor), continua como hoje.
3. Sem mudar nada visual e sem mexer na primeira tela pronta da busca.
4. Conferir com Playwright em 390 px que a foto começa a baixar logo e que a Home não pisca; depois publicar e medir de novo.

## Detalhes técnicos
- `site-dobra/index.ts` `calcularHome`: chamar `busca_site` com o mesmo objeto de `HOME_NOVOS`, adicionar `<link rel="preload" as="image" fetchpriority="high" data-uh-v3 href=cardFotoUrl(rows[0].foto_principal)>` e `window.__UH_HOME_NOVOS__` no script; falhas não quebram o resto da Home.
- `buscaCedo.ts`: em `/`, se `__UH_HOME_NOVOS__` existir, registrar promise resolvida em `pedidosCedo` em vez de buscar.
- Deploy do `site-dobra`; teste unitário para o reaproveitamento da semente.
