# Corretores ativos do CRM, fechar o plano do mapa e trazer os anúncios

## 1. Corretores (o Billy continua aparecendo)
**Causa encontrada:** a sincronização com o CRM só adiciona e atualiza os corretores ativos. Ela nunca desliga quem saiu, por isso todos os corretores do site estão marcados como ativos, inclusive o Billy John e testes como "hugo teste".

**O que vou fazer:**
- Na sincronização, desligar no site todo corretor que não estiver mais ativo no CRM. Ele some da Home, da vitrine de corretores e dos cartões de contato. Os leads e links antigos continuam salvos e não são apagados.
- Rodar a sincronização agora e mostrar a lista final: quem ficou ativo e quem foi desligado.
- A vitrine da Home passa a mostrar só corretores ativos, com foto e WhatsApp. Nomes de teste e perfis sem nome ficam de fora.
- Um link antigo de corretor desligado (`/c/billy-john`) continua abrindo o site, mas sem o cartão dele. O contato vai para a Uhome.

## 2. O que falta do mapa
1. Card do preço novo: fotos com setas, coração para salvar, X para fechar, cantos de 16 px e sombra suave. No celular, ele fica preso embaixo da tela.
2. Gaveta do celular com 3 posições: mapa inteiro, metade e lista.
3. Tela de carregamento da Home com o novo espaçamento da busca, para a página não pular.
4. Botões só com ícone (Home e Condomínios) passam a ter nome para leitores de tela.
5. Título da busca diz o tipo do imóvel, por exemplo "Apartamentos à venda em Porto Alegre", o que ajuda a nota de qualidade dos anúncios.
6. Testes em 360, 390, 430 e 1440 px, com fotos do resultado.

## 3. Anúncios do Google (proposta, sem alterar nada)
- Ler os textos atuais dos 18 anúncios, as palavras-chave e o desempenho dos últimos 30 dias.
- Trazer uma proposta por campanha (Natal Chave de Ouro, Studios e Imóveis do Site) com textos novos no tom do visual novo, página de destino certa para cada grupo e o que vale pausar. Sem MCMV, preço baixo ou FGTS, e só venda.
- Nada muda no Google Ads antes da sua aprovação.

## Detalhes técnicos
- `sync-corretores`: depois do upsert, `update profiles set ativo=false where role='corretor' and uhomesales_id not in (ids ativos do CRM)`, e o resultado é registrado no `sync_log`. Em seguida a função é publicada e chamada.
- `useCorretoresVitrine` e `CorretorContext`: filtro `ativo=true`, mais nome e telefone obrigatórios na vitrine.
- `SearchExperience`: o título usa `tipo` no plural quando há um único tipo filtrado.
- Google Ads: só consultas GAQL de leitura (`ad_group_ad` com headlines e descriptions, `keyword_view`, métricas de `LAST_30_DAYS`).
