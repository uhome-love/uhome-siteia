# LIA: aba no CRM e contato logo no início

## 1. LIA pede nome e WhatsApp no começo
- Na primeira ou segunda resposta, depois de responder rápido o que a pessoa perguntou, a LIA pede nome e WhatsApp com um motivo ("para o especialista te mandar as condições e as plantas").
- Se a pessoa não quiser passar, ela continua atendendo normalmente e pede de novo só quando houver motivo forte (visita, simulação, condição do Natal).
- Assim que a pessoa passa nome e telefone, o contato já entra no CRM (mesmo sem visita marcada), com o resumo da conversa até ali.
- Substitui a regra de hoje "não pedir contato na primeira resposta".

## 2. Aba "LIA" no CRM Uhome Sales
- Lista de todas as conversas da LIA no site, das mais recentes para as mais antigas.
- Em cada linha: nome e telefone (quando ela capturou), página ou imóvel de origem, campanha do Google, situação (conversando, contato capturado, visita marcada) e horário.
- Ao abrir: a conversa inteira em formato de chat, o contexto (imóveis vistos, busca, palavra do anúncio) e um botão para abrir o lead no CRM, quando existir.
- Filtros: período, situação e "só com telefone".
- Só administradores do CRM veem a aba.

## 3. Conferir
- Uma conversa de teste no site: a LIA pede o contato no início, o lead aparece no CRM e a conversa aparece na aba LIA. Depois apago o teste.

## Detalhes técnicos
- Site: ajustar `prompt.ts`; ao detectar nome+telefone válidos, chamar `registrar_interesse` (tipo compra, etapa "contato") e marcar `lia_conversas.etapa`. Lead segue para o CRM pelos gatilhos atuais.
- Site: nova função `lia-conversas` (somente leitura, protegida pelo mesmo segredo de integração usado entre site e CRM) que lista e detalha `lia_conversas`, sem expor a tabela publicamente.
- CRM (projeto UhomeSales): nova página/aba "LIA" consumindo essa função pelo backend do CRM, restrita a admin. Será feita no projeto do CRM; preciso confirmar lá qual segredo de integração já existe.
