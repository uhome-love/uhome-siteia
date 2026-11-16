# Continuação: funil, rajadas e nova página de produto do Natal

## Etapa 1 – Fechar Partes 1 e 2 (já prontas no código)
- Publicar o site com os novos eventos do funil e o limite de 1 clique de WhatsApp a cada 5 segundos por sessão.
- Abrir uma visita de teste no celular (390px) em /em-foco/orygem e conferir os 4 eventos gravados: página vista, rolagem até a metade, galeria aberta e primeiro toque no formulário.
- Apagar os registros de teste. Os cerca de 1.900 registros das rajadas continuam guardados até você confirmar.

## Etapa 2 – Nova página de produto do Natal (/em-foco/:slug)
Objetivo: menos banner e menos texto solto, mais informação útil e um caminho claro até o contato.

Ordem da página:
1. **Topo com foto grande** (foto oficial da incorporadora, fachada ou área de lazer), nome, bairro e cidade, "a partir de R$ X", entrega e um único botão "Quero as condições de Natal".
2. **Faixa de 3 a 4 números-chave**: dormitórios, área privativa, vagas, entrega.
3. **Condição de Natal**: um cartão limpo com a oferta da campanha (entrada a partir de 10% até 18/12) e o selo oficial, sem repetir banners.
4. **Galeria curada**: 6 a 8 melhores fotos em mosaico, com "ver todas" abrindo a galeria completa (fotos, plantas, mapa).
5. **Por que este produto**: 3 diferenciais curtos com ícone, tirados da ficha.
6. **Plantas e tipologias**: cartões por tipologia com metragem e preço quando houver.
7. **Localização**: mapa e 3 a 4 pontos próximos.
8. **Formulário**: título "Receba a condição de Natal do [produto]", com os textos já aprovados.
9. **Outros produtos do Natal**: carrossel compacto no final.
- Celular: barra fixa "Quero as condições" e WhatsApp; o cartão que aparece ao rolar é removido para não poluir.
- Fora do Natal, a mesma página aparece sem selo e sem faixa de campanha, com os textos sem Natal.

Materiais:
- Usar só fotos oficiais já cadastradas (7 a 14 por produto), escolhendo as melhores para o topo e o mosaico. Não usar fotos de banco de imagens, para não mostrar algo que não é o produto.
- Ao final, mostrar prints no celular de 2 ou 3 produtos.

## Detalhes técnicos
- Reestruturar `ProdutoFocoPage.tsx` em seções; reaproveitar `MaterialGallery`, `NatalArt`, `FocoShared` e o formulário de lead (com o rastreio do funil intacto).
- Dados continuam vindo de `produtos_foco.ficha`; nada muda no banco.
- Manter o prefixo do corretor (/c/:slug) com cartão do corretor no lugar do formulário.
