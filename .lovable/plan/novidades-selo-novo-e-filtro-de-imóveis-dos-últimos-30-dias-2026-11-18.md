# Novidades: selo "Novo" e filtro de imóveis dos últimos 30 dias

Hoje há cerca de 1.266 imóveis disponíveis que entraram no site nos últimos 30 dias (pela data de publicação do anúncio).

## O que muda para o visitante
- **Selo "Novo"** no canto da foto, no mesmo estilo branco arredondado do Airbnb ("Preferido dos hóspedes"), em todo card de imóvel publicado há até 30 dias: busca, Home, mapa (mini card) e semelhantes. Quando o imóvel também é lançamento/em obras, o "Novo" tem prioridade e o outro selo vai para a linha de informações.
- **Categoria 3D "Novidades"** na faixa de categorias da Home e da busca, com ícone próprio (selo/estrela 3D no estilo dos atuais).
- **Filtro "Novidades"** no painel completo de Filtros: opção "Entraram nos últimos 30 dias", com contagem ao vivo, e chip "Novidades" removível nos resultados.
- Ordem "Mais recentes" continua igual; ao escolher Novidades os resultados já vêm dos mais novos primeiro.
- A Home "Novos no site" passa a usar a mesma regra de 30 dias.

## Regra
- Novo = data de publicação do anúncio dentro dos últimos 30 dias (horário de São Paulo); sem data de publicação, usa a data de entrada no site. Muda sozinho com o tempo, sem publicar de novo.

## Validação
- Teste automático da regra: 29 dias = novo, 31 dias = não novo, sem data de publicação usa data de entrada.
- Conferir no banco que a contagem do filtro bate com os imóveis listados (com e sem cidade, ex.: Porto Alegre, Capão da Canoa).
- Navegador, computador e celular: selo aparece só nos novos, categoria e filtro aplicam e removem certo.

## Detalhes técnicos
- `busca_site`: novo parâmetro `novidades` (dias, 30) filtrando `coalesce(publicado_em, created_at) >= now() - interval`, e devolvendo `publicado_em` nas linhas e a contagem de novidades para a categoria.
- Regra compartilhada `ehNovo()` em `src/lib` usada por `CatalogCard`, mapa e Home; teste ao lado dos existentes.
- Categoria em `buscaConfig.ts` (`filtros: { novidades: 30 }`), URL `?novidades=30`, `rotuloChip` "Novidades".
- Ícone gerado como WebP leve em `public/categorias/novidades.webp`.
- Sem mudanças no Worker nem no CRM.
