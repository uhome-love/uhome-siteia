# Urgente: busca dando "Não foi possível carregar os imóveis"

## O que encontrei
- O clique no ícone 3D funciona e abre a busca certa (ex.: Garden, Novidades). O que falha é a lista de imóveis: o banco está estourando o tempo limite e devolve erro, inclusive na busca sem filtro.
- A causa é a contagem de imóveis e os pinos do mapa: essas duas consultas abrem o pacote inteiro de fotos de cada imóvel (~20 mil) só para conferir se ele tem foto. Cada uma leva ~7,5 s, e com várias rodando ao mesmo tempo o banco fica ocupado e a busca principal também cai.
- Testei a mesma contagem conferindo só a foto principal: 0,14 s (50 vezes mais rápido) e o mesmo resultado (imóveis sem foto continuam escondidos).

## O que vou fazer
1. Trocar a verificação de foto nessas duas consultas (contagem e pinos do mapa) para usar a foto principal, como a busca principal já faz. Nenhuma mudança visual.
2. Conferir na hora: consultas voltam abaixo de 1 s e a busca para de dar erro.
3. Testar no site oficial: clicar em Garden, Novidades e mais 2 ícones no celular e no computador, todos mostrando imóveis.
4. Depois retomo o plano da primeira tela pronta da Home.

## Detalhes técnicos
- Migration: `count_imoveis` e `get_map_pins` com `coalesce(i.foto_principal,'') <> ''` no lugar de `i.fotos IS NOT NULL AND i.fotos::text != '[]'`; assinaturas, grants e o resto iguais.
