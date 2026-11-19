# Conta criada vira lead (só com WhatsApp)

## O que muda para o visitante
- Na tela "Criar conta" aparece o campo **WhatsApp (opcional)**, com a frase "Deixe seu WhatsApp para um corretor te ajudar".
- Quem entra com Google e ainda não deixou WhatsApp vê, uma única vez depois de entrar, um convite discreto para deixar o número (pode pular).
- Quem só entra de novo numa conta que já existe não vira lead novo.

## O que acontece por trás
- Conta nova **com WhatsApp**: vira lead pelo mesmo caminho dos outros formulários, então chega ao CRM na Fila do CEO (ou só adiciona histórico, se a pessoa já tem corretor ativo). Tipo de interesse: "conta_criada".
- Conta nova **sem WhatsApp**: não vira lead. Só fica registrada a ligação do e-mail com o histórico da pessoa no site.
- Google Ads: nova conversão secundária **"Conta criada"**, sem valor, que não muda os lances. Ela nunca conta como "Lead site".
- O lead de cadastro não soma R$ 50 no Google Ads (o valor só conta para formulários de contato de verdade).

## Detalhes técnicos
- `AuthModal.tsx`: campo de telefone validado (10–11 dígitos, opcional), salvo em `options.data.telefone`; quando preenchido, chama `submitLead` (import dinâmico) com `tipo_interesse: 'conta_criada'`, `origem_componente: 'cadastro'`, depois `setLeadIdentity`.
- Pedido do WhatsApp pós-Google: pequeno aviso lazy, mostrado uma vez quando `created_at` do usuário tem menos de 2 min e não existe telefone; marca em localStorage para não repetir.
- `gtag.ts`: `conversaoDoEvento` mapeia `conta_criada` para a nova ação secundária, nunca para "lead"; criar a ação "Conta criada" no Google Ads.
- Teste em `conversoesAds.test.ts`: conta_criada nunca vira lead e não tem valor.
- Sem teste de envio real de lead (regra do projeto: o agente não envia leads de teste).
