# Urgente: busca dando "Não foi possível carregar os imóveis"

## O que encontrei
- O clique no ícone 3D funciona e abre a busca certa (ex.: Garden, Novidades). O que falha é a lista de imóveis: o banco está estourando o tempo limite e devolve erro, inclusive na busca sem filtro.
- A causa é a contagem de imóveis e os pinos do mapa: essas duas consultas abrem o pacote inteiro de fotos de cada imóvel (~20 mil) só para conferir se ele tem foto. Cada uma leva ~7,5 s, e com várias rodando ao mesmo tempo o banco fica ocupado e a busca principal também cai.
- Os ícones 3D da Home também somem por isso: eles só aparecem quando a consulta dos imóveis novos responde; com o banco travado ela falha e a fileira fica vazia.
- Testei a mesma contagem conferindo só a foto principal: 0,14 s (50 vezes mais rápido) e o mesmo resultado (imóveis sem foto continuam escondidos).

## O que vou fazer
1. Trocar a verificação de foto nessas duas consultas (contagem e pinos do mapa) para usar a foto principal, como a busca principal já faz. Nenhuma mudança visual.
2. Conferir na hora: consultas voltam abaixo de 1 s e a busca para de dar erro.
3. Validar todos os ícones 3D, um por um, no celular e no computador: aparecem na Home, e cada clique abre a busca certa com imóveis.
4. Se a consulta falhar mesmo assim, a Home tenta de novo sozinha em vez de esconder os ícones.
5. Depois retomo o plano da primeira tela pronta da Home.

## Detalhes técnicos
- Migration: `count_imoveis` e `get_map_pins` com `coalesce(i.foto_principal,'') <> ''` no lugar de `i.fotos IS NOT NULL AND i.fotos::text != '[]'`; assinaturas, grants e o resto iguais.
