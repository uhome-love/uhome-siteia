# Captação de imóvel: enviar dados completos ao CRM

## Situação atual
Hoje a captação chega ao CRM só com nome, telefone e uma linha de observação: tipo, bairro e valor. Os três formulários de captação não enviam o rastreamento:
- página Anunciar
- calculadora de avaliação
- cartão "Anunciar" da home

## O que muda
1. **Os três formulários passam a gravar:**
   - tipo do imóvel e finalidade (venda)
   - bairro, cidade, endereço, valor pretendido, quartos e área, quando informados
   - mensagem
   - página e botão de onde veio o contato
   - aparelho
   - todo o rastreamento: UTMs, gclid, gbraid, wbraid, fbclid, de onde a pessoa veio, primeira página e data da primeira visita
2. **No CRM, a captação vai pelo mesmo envio dos outros formulários.** Ela segue a mesma regra:
   - quem já tem corretor só recebe os dados acrescentados;
   - quem não tem vai para a Fila do CEO.
   - Os dados do imóvel ficam em `dados_site.captacao`, e as observações ficam legíveis para o corretor.
3. **Sem travar o formulário.** A pessoa vê a confirmação na hora. O envio ao CRM acontece depois, em segundo plano. Se o CRM falhar, a captação continua salva no site.

## Ponto para confirmar
O site é só de venda, então os formulários não perguntam venda ou locação. Vou enviar "venda" como padrão. Também não vou adicionar a opção "locação" na tela, a menos que você peça.

## Teste
Vou enviar uma captação de teste chamada "TESTE captação" e confirmar no CRM que chegou com `dados_site.captacao` e o rastreamento. Depois apago o teste do site.

## Detalhes técnicos
- **Banco:** a tabela `captacao_imoveis` ganha as colunas `finalidade`, `cidade`, `endereco`, `pagina_url`, `origem_componente`, `formulario`, `device`, `utm_medium/content/term`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `referrer`, `landing_url` e `contexto` (jsonb).
- **Formulários:** `Anunciar.tsx`, `AvaliacaoPage.tsx` e `HeroSection.tsx` usam `getLeadTracking()` e preenchem `dados_imovel`.
- **Envio ao CRM:** `handleCaptacao` em `sync-to-crm` passa a usar o mesmo caminho de `handleLead`: upsert em `leads` com `site_lead_id`, seguido de `moverParaFilaCEO`, que agora recebe `dados_site.captacao`. Publicação da função logo em seguida.
- O envio ao CRM já roda de forma assíncrona pela trigger, então o formulário não espera a resposta do CRM.
