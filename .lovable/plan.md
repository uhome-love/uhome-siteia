# Materiais do Open Bosque nos dois sites indicados

## O que vou fazer

1. **Fotos:** baixar as imagens do projeto nos dois sites: fachada, voo do lazer, clube, horta e praça, piscina, áreas comuns e apartamento decorado. Ficam de fora logos, ícones e repetições. São cerca de 15 a 25 fotos boas.
2. **Plantas:** baixar as plantas de 1 dormitório (31 m²) e de 2 dormitórios (opções A e B, 41 a 45 m²), cada uma com e sem garden.
3. Guardar tudo no armazenamento de imagens do site e trocar a galeria e as plantas da página /em-foco/open-bosque. Cada foto ganha uma legenda e uma categoria (Fachada, Lazer, Apartamento, Vista), para as abas "Como é" funcionarem.
4. Atualizar a ficha com o que os sites confirmam:
   - endereço: Rua Pedro Waine, 75, no Passo d'Areia;
   - 3 torres de 16 andares, terreno de mais de 22 mil m² com parque linear;
   - itens de lazer: piscina, pet place, horta, bicicletário, playground, salões de festas e mini market;
   - tipologias de 1 e 2 dormitórios, com garden no térreo. O 3 dormitórios está esgotado e não entra.
5. Publicar e mandar prints no celular.

## O que NÃO vou mudar sem você confirmar

Os sites trazem números diferentes dos que estão hoje no nosso site:
- **Preço:** os sites dizem "a partir de R$ 247 mil"; o nosso diz R$ 240 mil.
- **Entrega:** os sites dizem "2029"; o nosso diz "Dezembro de 2028".
- **Renda mínima:** um dos sites mostra R$ 5.000 para o 1 dormitório.

Vou manter preço e entrega como estão, a menos que você (ou o Lucas) confirme os valores novos.

## Detalhes técnicos
- Download em /tmp; envio com `lovable-assets create`; atualização de `produtos_foco.galeria`, `plantas` e `ficha` (tipologias, lazer, endereço) via SQL, só no slug `open-bosque`.
- Serão usadas apenas as imagens publicadas nos sites, sem nenhuma alteração.
