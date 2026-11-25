# Teste de velocidade ponta a ponta e melhorias

## Como está hoje (visitantes reais, últimos 7 dias, 75% das visitas)
| Página | Abertura da 1ª imagem (meta 2,5 s) | Resposta ao toque (meta 0,2 s) |
|---|---|---|
| Busca | **3,5 s** (só 46% bom) | **0,29 s** |
| Home | 2,8 s | 0,22 s |
| Em-foco | 2,8 s | 0,11 s |
| Imóvel | 2,2 s (bom) | 0,14 s (bom) |

Mudança de layout está boa em todas. O pior ponto é a **Busca**, seguida da Home.

## O que farei
1. **Teste ponta a ponta no celular** (375 px, rede e processador lentos), 5 rodadas por página: Home, Busca (com e sem anúncio), Imóvel, Em-foco, e o caminho Home → Busca → Imóvel → formulário (sem enviar lead real). Identificar em cada uma qual elemento atrasa e o que demora ao toque.
2. **Busca:** fazer a foto do 1º cartão aparecer mais cedo e reduzir o trabalho ao tocar em filtros, cartões e paginação (atualizações pesadas divididas ou adiadas).
3. **Home:** reduzir o atraso da foto do 1º cartão e o trabalho ao tocar na faixa de categorias e na busca.
4. Só aplicar o que não muda visual, textos, primeira tela pronta, formulários, CRM, rastreio e conversões; desfazer o que não melhorar.
5. Rodar todos os testes e repetir a medição para comparar antes → depois.

O site precisa ser publicado por você no fim; os números reais melhoram nos dias seguintes.

## Detalhes técnicos
- Playwright com CPU 4x e Fast 3G, PerformanceObserver (LCP + elemento, long tasks, event timing para INP).
- Busca: verificar handlers de filtro/URL-Zustand (startTransition, memo de cartões), preload da foto do 1º cartão com variante wsrv.
- Respeitar AGENTS.md (moldes site-dobra, sem manualChunks).
