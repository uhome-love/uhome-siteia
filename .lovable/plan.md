# Usar as artes de Natal no site e nos anúncios

Chegaram 32 peças: geral, Black Natal e 6 imóveis (Open Bosque, Open Arvoredo, Orygem, Skyglass, Golden Lake, Casa Tua Canoas), cada uma em 4 tamanhos, com os textos aprovados.

## Ponto importante sobre o Google
As campanhas atuais são de **Pesquisa**. Nelas o Google só aceita imagem limpa: arte com texto por cima, botão "Receba a tabela" ou selo costuma ser reprovada. Por isso:
- **Nas campanhas de Pesquisa:** usar a foto do imóvel sem texto (recortada da própria arte, lado da foto) como imagem do anúncio de cada imóvel. Logo da Uhome entra separado.
- **As artes completas** ficam prontas na biblioteca do Google Ads para uma campanha de Display/Performance Max ou remarketing, quando decidirmos abrir (sem gasto novo agora, como combinado).
- **Meta Ads:** os tamanhos 1080x1350 e 1080x1920 são para lá, quando a conta for conectada.

## No site (onde as artes mais ajudam a converter)
1. **Página de cada imóvel da campanha:** banner da peça do imóvel no topo (1200x628 no computador, 1080x1350 no celular), sem cobrir a foto principal; o botão do banner leva ao formulário.
2. **Página da campanha / Em Foco:** peça geral no topo; de 23 a 29/11 troca sozinha para a peça Black Natal e volta depois do dia 29.
3. **Prévia de link no WhatsApp:** as páginas desses imóveis passam a mostrar a peça 1200x628 quando o link é compartilhado.
4. Depois de 18/12 os banners somem automaticamente.

## Google Ads
5. Enviar para a biblioteca: logo Uhome (quadrado), fotos limpas de cada imóvel (1,91:1 e 1:1) e as artes completas.
6. Ligar a foto de cada imóvel ao grupo de anúncios dele (Open Bosque, Skyglass, Orygem, Golden Lake, Casa Tua, Open Arvoredo) e a peça geral/logo nas 3 campanhas.
7. Conferir em 1-2 dias se o Google aprovou; o que for reprovado eu troco.

## Detalhes técnicos
- Artes guardadas como Lovable Assets, ligadas por slug do produto em `produtos_foco` (campo da ficha), com troca Black Natal pela data já usada em `src/lib/produtosFoco.ts`.
- Imagens otimizadas em WebP para carregar rápido no celular.
- Upload ao Google via `google_ads--upload_assets` (pede sua aprovação) e vínculo por grupo de anúncios com `mutate`.
