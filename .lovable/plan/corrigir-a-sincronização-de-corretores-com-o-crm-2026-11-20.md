# Corrigir a sincronização de corretores com o CRM

## Causa
A sincronização tenta reconhecer cada corretor do CRM pelo código do CRM, mas no site esses códigos são diferentes. Por isso ela tenta criar um cadastro novo, com um endereço de página (ex.: /c/flavio-dias) que já existe, e falha. Resultado: nenhum dos 33 é atualizado há dias.

## O que muda
1. Reconhecer o corretor que já existe no site, nesta ordem: código do CRM, e-mail, endereço de página (gerado a partir do nome).
2. Quando encontrar, só atualizar o cadastro: nome, telefone, e-mail, CRECI, código do CRM, ativo e data da sincronização.
   - O endereço de página fica igual, para os links já enviados continuarem funcionando.
   - A foto oficial do site fica como está. A foto do CRM só entra quando o corretor ainda não tem foto oficial, para a vitrine não perder as fotos padronizadas.
3. Criar cadastro só para quem for realmente novo. Se o endereço já estiver em uso, acrescentar um número no final (ex.: -2).
4. A regra que desliga quem saiu do CRM continua igual. O Anderson não está mais no CRM, então segue desligado.

## Validação
- Rodar a sincronização: 33 atualizados, nenhum erro.
- Conferir que nenhuma foto oficial nem nenhum endereço de página mudou.
- Conferir que o Anderson continua desligado e fora da vitrine.
- Publicar só essa função. Não mexe no visual nem nos anúncios.

## Detalhe técnico
Arquivo: `supabase/functions/sync-corretores/index.ts`. Um único select dos perfis com `role = corretor` monta mapas por `uhomesales_id`, e-mail e `slug_ref`. Para cada corretor encontrado: `update` por id. Para os novos: `insert` com slug livre. O código de desligamento continua o mesmo.
