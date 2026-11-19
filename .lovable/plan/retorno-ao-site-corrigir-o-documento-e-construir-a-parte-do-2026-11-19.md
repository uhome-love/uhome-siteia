# Retorno ao site: corrigir o documento e construir a parte do site

O documento novo (seções 10 a 12) foi escrito sem acesso ao código do site. Por isso, vários itens estão como "não existe" ou "confirmar". Conferi no site:

| Item do documento | O que o site tem de verdade |
|---|---|
| "Não há banner de consentimento" | **Existe.** Aviso com "Aceitar", "Recusar análise" e "Preferências", ligado ao modo de consentimento do Google |
| "visitor_id próprio" (R1) | **Existe.** Identificador do aparelho; o histórico anônimo entra na ficha quando a pessoa deixa o contato |
| Tag do Google | **Existe.** GA4 + Ads carregam depois da página pronta, nunca para robôs |
| Pixel da Meta no navegador | **Não carrega.** O site só manda evento se o pixel já estiver na página, e ele não está |
| Buscas recentes / vistos recentemente | **Não existem** no painel "Onde" nem na Home |
| Salvar busca com alerta | **Não existe** |
| Comparar favoritos | **Não existe** |
| Link do corretor com origem | Sem UTM |

## O que vou fazer (só a parte do site; envios, e-mail e regras do CRM ficam no CRM)

### 1. Documento corrigido
- Gerar a versão 2 do comparativo, com as seções 10 a 12 corrigidas conforme a tabela acima e as notas refeitas.

### 2. Memória no site, sem login
- **Buscas recentes** (últimas 5) no topo do painel "Onde", com um toque para repetir.
- **"Continue de onde parou"** na Home, com a última busca e os filtros dela.
- **"Vistos recentemente"** na Home e no fim da página do imóvel (até 10, os mais novos primeiro).
- Tudo guardado só no aparelho, com botão "Limpar".

### 3. Salvar busca e aviso de preço
- Botão **"Salvar esta busca"** nos resultados. Ele pede WhatsApp e a confirmação "quero receber avisos", e mostra os filtros escolhidos.
- No **2º favorito**: convite "Quer ser avisado se o preço baixar?".
- O pedido vira um lead normal, que chega à "Fila do CEO" pelo caminho atual, com o tipo "busca salva" e os filtros. **O envio dos avisos fica com o CRM.**

### 4. Comparar favoritos
- Escolher até 3 imóveis salvos e ver lado a lado: preço, área privativa, quartos, vagas, bairro, condomínio e fase.

### 5. Pixel da Meta com consentimento
- Carrega só depois de "Aceitar" e só depois da página pronta, nunca para robôs. É o mesmo cuidado da tag do Google.
- Eventos enviados:
  - ViewContent (imóvel aberto);
  - Search (busca);
  - AddToWishlist (favorito);
  - Schedule (visita pedida);
  - Lead (contato).
- **Preciso do número do pixel da Meta que a Uhome quer usar.** Sem ele, esta parte fica pronta mas desligada.

### 6. Origem nos links
- Links de corretor e de compartilhamento levam UTM.
- O site guarda `send_id` e `utm_*` na chegada e os inclui na jornada. Assim o CRM consegue mostrar "voltou pelo alerta".

## Teste
- Celular e computador:
  - buscar, sair e voltar: a última busca aparece;
  - abrir 3 imóveis: aparecem em "Vistos recentemente";
  - comparar 3 favoritos.
- Com "Recusar análise", nenhum pedido à Meta. Com "Aceitar", o pixel carrega depois da página.
- Salvar busca: **não envio lead de teste** (regra do projeto). Confiro o formulário até antes de enviar.
- Testes novos para as regras de "Buscas recentes" (máx. 5, sem repetir) e "Vistos" (máx. 10, mais recente primeiro).

## Detalhes técnicos
- `src/lib/memoriaLocal.ts`: buscas e vistos em localStorage, com limites e sem duplicatas. Os vistos são gravados ao abrir `/imovel/:slug`.
- `BuscaEtapas`/`PilulaBusca`: seção "Recentes" no passo Onde. `HomeVitrine`: faixas "Continue" e "Vistos", carregadas perto da tela (sem afetar a primeira tela).
- Salvar busca: `public_leads` com `origem='busca_salva'` e os filtros em `dados_site`, via `submitLead` existente. Os gatilhos levam ao CRM; nada no frontend fala com o CRM.
- Meta: `initMeta(pixelId)` em `src/lib/gtag.ts`, condicionado a `advertising=granted` e `isBotBrowser`. O pixel id fica como valor público de configuração.
- UTM: helper único na montagem dos links `/c/:corretorSlug` e no botão compartilhar.
