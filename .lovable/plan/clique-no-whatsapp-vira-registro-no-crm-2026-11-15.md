# Clique no WhatsApp vira registro no CRM

## O que muda para você
- Todo clique num botão de WhatsApp do site (imóvel, empreendimento, Em Foco, campanha, Studios, botão flutuante, vitrine) chega no CRM antes do WhatsApp abrir, com página, empreendimento, texto da mensagem, origem (Google, campanha, palavra, gclid etc.), aparelho e um código anônimo do visitante.
- Se a pessoa já deixou nome ou telefone no site, isso vai junto, e o CRM liga o clique ao lead dela.
- O WhatsApp abre na hora, mesmo se o envio falhar.
- Número oficial: 51 99259-7097 em todos os botões da Uhome (é o número que o site já usa; vou garantir que nenhum botão use outro). Nas páginas de corretor (/c/nome) o botão continua indo para o corretor.

## Etapas
1. Mapear todos os botões de WhatsApp (17 arquivos) e passar todos por uma única função de clique.
2. Essa função grava o clique no banco do site de forma "dispara e esquece" (sem esperar resposta) e abre o WhatsApp imediatamente.
3. O gatilho que já leva os leads ao CRM passa a enviar também os cliques, com `tipo: "clique_whatsapp"`, pelo mesmo envio dos formulários.
4. Cliques sem nome/telefone não disparam o e-mail de alerta de novo lead (evita spam); cliques com telefone disparam.
5. Testar: clicar num botão, confirmar o registro no CRM sem erro, apagar o teste.

## Detalhes técnicos
- Envio do navegador: `navigator.sendBeacon`/`fetch keepalive` para não bloquear a navegação; tracking vem de `getLeadTracking("whatsapp_<local>")` em `leadTracking.ts` (fonte única).
- Identificador anônimo: `visitor_id` já existente em `session.ts` (ou criado lá se faltar).
- Envio ao CRM segue a regra do projeto: só via gatilho do banco → `sync-to-crm` (que hoje fala com o endpoint do CRM); o frontend nunca chama o CRM direto.
- Teste automatizado: o clique abre o WhatsApp mesmo quando o envio dá erro; número oficial correto.
