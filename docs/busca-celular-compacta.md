# Busca celular — ajuste de 18/11/2026

## Resultado em 390 × 844
| Página | Topo da primeira foto antes | Depois / tela pronta |
|---|---:|---:|
| /busca | 354 px | 248 px |
| /lancamentos-porto-alegre | 494,25 px | 308 px |

- Uma busca no topo; pílula abre tela cheia com bairro, endereço ou código. Botão ao lado abre filtros também nas URLs prontas.
- Chips aplicados logo abaixo das abas; categorias laterais de 44 px, ícones distintos de 20 px em grafite e seleção cheia.
- Título de 20 px/700. Texto introdutório das URLs prontas mantido no computador, oculto apenas no celular para priorizar os imóveis.
- Após rolar: topo de 60 px, abas recolhidas, categorias saem da tela com a rolagem.
- Computador conserva categorias originais, segunda busca, filtros, título e divisão 60/40 com mapa.

## Tela pronta / publicação
- A simplificação anterior continua: somente site-v3 direto, sem document.write.
- site-dobra implantada e cache de busca/URLs renovado com quatro cards, chips e ícones alinhados ao app.
- Novo molde exige **uh-busca-layout=compacta-1** no HTML. Sem essa chave, o pre da busca é descartado antes da pintura e o app antigo abre normalmente: não há mistura de modelos incompatíveis.
- Publicar **o app desta versão** para ativar o novo visual e a tela pronta compacta. O período anterior à publicação usa abertura normal da busca, sem pre compacto.
- Regras de retenção continuam inline; Worker não alterado. Imagens e dimensões preservadas.

## Verificação
- Três cargas locais em contextos novos de navegador, simulando head/pre/script do Worker em localhost. Não são Lighthouse mobile simulado nem medição oficial no Brasil.
- Mediana de LCP: busca **0,228 s**; lançamentos **0,204 s**. Elemento LCP: primeira foto.
- CLS: busca **0,00050**; lançamentos **0,00079**.
- Foto retida: mesmos URL, tamanho e topo (248/308 px) antes/depois da montagem; um H1, sem overflow horizontal nem erros JavaScript.
- Busca real de Moinhos de Vento e abertura dos filtros verificadas nas duas páginas, sem envio de lead.
- Tela de computador conferida em 1440 px; cabeçalho compacto conferido após rolar 500 px no celular.
- Medição oficial LCP ≤2,5 s e CLS <0,1 continua com a central no Brasil após publicar.

## Prints
Quatro capturas 390 × 844 entregues: busca e lançamentos, antes e depois.