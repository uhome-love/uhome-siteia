# Link "Ver no site" do Jetimob (/imovel/CODIGO)

## O que foi verificado
- O imóvel 16366-UH existe no site, com o endereço `apartamento-1-quarto-passo-da-areia-16366-UH`.
- O código **55880-UH não existe no banco do site**: nenhum imóvel com esse código foi encontrado, nem ativo nem inativo. Só existe um parecido, o 455880-LU (terreno na Tristeza).
- Por isso o link `/imovel/55880-UH` não tem para onde ir. A causa exata de ele cair em outro imóvel ainda não foi confirmada.

## O que vai ser feito
1. **Ver no Jetimob se o 55880-UH existe** e por que ainda não chegou ao site (cadastro recente, outra situação ou outra finalidade). Depois, puxar o imóvel com a atualização rápida.
2. **Link curto sempre certo**: quando alguém abrir `/imovel/CODIGO`, o site procura **exatamente** esse código (sem aceitar parecidos) e troca o endereço pelo link completo do imóvel, sem recarregar a página.
3. **Código ainda não sincronizado**: em vez de mostrar outro imóvel ou erro, aparece a mensagem "Este imóvel está sendo atualizado". O site puxa as novidades do Jetimob na hora e tenta de novo uma vez.
4. **Mesmo comportamento quando o link é compartilhado**: a prévia no WhatsApp e no Google também procura pelo código exato.
5. **Testes**: abrir `/imovel/16366-UH` deve levar ao link completo dele. Um código que não existe deve mostrar a mensagem e nunca outro imóvel.

## Detalhes técnicos
- `fetchImovelBySlugOnce`: quando o slug casa com `CODIGO_RE`, buscar por `jetimob_id=eq.CODIGO` (normalizado em maiúsculas). Os fallbacks com `ilike` ficam de fora para códigos.
- `PropertyDetail`: se o imóvel veio por código, usar `navigate(urlCanonica, { replace: true })`.
- `ssr-render`: mesma busca exata por `jetimob_id` para rotas só com o código.
- Fallback "não encontrado": chamar `sync-jetimob` com `mode: "incremental"` uma vez e tentar de novo.
- Adicionar um teste unitário para a busca por código exato.
