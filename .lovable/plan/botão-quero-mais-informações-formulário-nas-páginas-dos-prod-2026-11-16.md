# Botão "Quero mais informações" + formulário nas páginas dos produtos de Natal

## O que muda para o visitante

1. **Novo botão "Quero mais informações"** ao lado de "Agendar visita":
   - no topo da página (abaixo do preço);
   - na barra fixa do celular, que passa a ter: "Agendar visita" | "Mais informações" | ícone do WhatsApp.
2. **Novo formulário "Quero mais informações"**, numa seção própria logo antes de "Agende sua visita" (e acessível pelo menu de seções como "Informações"):
   - Título: "Receba as condições de Natal do [produto]"
   - Campos: **Nome (obrigatório)**, **Telefone/WhatsApp com DDD (obrigatório)**, e-mail (opcional), mensagem (opcional).
   - Botão: "Quero mais informações".
   - Validação: nome com no mínimo 2 letras; telefone com 10 ou 11 números. Mensagens de erro claras em vermelho abaixo do campo.
   - Sucesso: "Em poucos minutos um consultor da Uhome chama você no WhatsApp com valores, plantas e unidades disponíveis do [produto]."
3. O botão "Quero esta planta" continua levando ao agendamento; o novo botão leva ao formulário de informações.
4. No formulário de agendamento, nome e telefone também passam a ser obrigatórios com a mesma validação.
5. Na versão do link do corretor, o formulário não aparece (continua o cartão do corretor com WhatsApp).

## Para onde vai o contato

Pelo mesmo caminho dos outros formulários do site: grava o lead com a origem do anúncio e o produto, e chega ao CRM pela regra atual (Fila do CEO só para quem não tem corretor). Nada de envio novo.

## Depois

Publicar, fazer um envio de teste, confirmar que chegou, apagar o teste e mandar print no celular.

## Detalhes técnicos
- Novo `src/components/foco/InfoLeadFoco.tsx` com zod (nome, telefone obrigatórios) usando `submitLead` + `getLeadTracking` + `setLeadIdentity`, formulario `"foco_mais_informacoes"`.
- `ProdutoFocoPage`: nova âncora `#informacoes`, função `pedirInfo()` que rola até a seção; botões no topo e barra fixa.
- `AgendaVisitaFoco`: mesma validação zod para nome/telefone.
- Funil `formulario_iniciado` já cobre o novo form automaticamente.
