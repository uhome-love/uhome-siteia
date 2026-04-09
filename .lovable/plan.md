

## Truncar descrição do imóvel com "Ver mais"

### O que será feito

Na página `/imovel/:slug`, a seção "Sobre o imóvel" (linhas 572-580 de `PropertyDetail.tsx`) passará a mostrar apenas o primeiro parágrafo por padrão, com um botão "Ver mais" que expande o texto completo.

### Implementação

**Arquivo: `src/pages/PropertyDetail.tsx`**

1. Adicionar um state `showFullDesc` (default `false`)
2. Extrair o primeiro parágrafo: split por `\n\n` ou `\n` e pegar o primeiro bloco não-vazio
3. Renderizar:
   - Se `showFullDesc` → texto completo
   - Senão → apenas primeiro parágrafo + botão "Ver mais"
4. Botão "Ver menos" quando expandido para colapsar de volta

O botão terá estilo inline (`text-primary font-semibold text-sm cursor-pointer`) sem borda, similar ao padrão de mercado (QuintoAndar, Zap).

