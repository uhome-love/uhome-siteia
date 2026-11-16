# Funil das páginas de anúncio + rajadas de cliques no WhatsApp

## Parte 1 — Passos do funil (sem mudar nada visível)

Páginas: /em-foco/:slug, /campanha/natal-chave-de-ouro, /investir-studios, /busca (também com o prefixo de corretor /c/:corretor/...).

Eventos novos gravados no registro de passos do visitante:
- pagina_anuncio_vista — ao abrir a página.
- rolagem_50 — ao chegar à metade da página.
- galeria_aberta — ao abrir as fotos (galeria de material).
- formulario_iniciado — no primeiro toque em qualquer campo de formulário.

Regras:
- Cada evento no máximo 1 vez por sessão e por página (memória da sessão do navegador).
- Cada evento leva: fonte, utm_source, utm_campaign, se tem gclid (sim/não) e aparelho. Nunca nome, telefone ou e-mail.
- formulario_enviado e whatsapp_click passam a levar a mesma origem e aparelho.
- Sem peso no celular: gravação adiada para quando o navegador estiver ocioso, rolagem medida por um marcador invisível (sem escutar cada rolagem), envio sem esperar resposta.
- Nenhum texto, layout ou elemento visível muda.

## Parte 2 — Rajadas de cliques no WhatsApp (12 e 13/11)

O que já foi visto:
- 2 sessões concentram as rajadas: 1.460 registros (12/11) e 440 (13/11).
- Esses registros vieram da versão antiga do rastreio (sem os campos novos que começaram a ser gravados em 15/11), então foram gerados pela página publicada antes da troca.
- O código de produto tem um aviso de que o registro "deve ser chamado só no clique, nunca ao desenhar a tela" — indício de um defeito antigo de laço.

A fazer:
1. Confirmar a causa: comparar o ritmo dos registros (intervalos regulares de milissegundos = laço da página; irregular = robô) e revisar a página de campanha com prefixo de corretor por qualquer registro disparado fora do clique.
2. Se for defeito, corrigir na origem.
3. Em qualquer caso, limite no navegador: no máximo 1 clique de WhatsApp registrado por sessão a cada 5 segundos (o WhatsApp sempre abre normalmente).
4. Limite também no banco: uma regra que ignora um novo registro da mesma sessão em menos de 5 segundos (protege contra robôs que gravam direto).
5. Marcar ou apagar os ~1.900 registros das rajadas para não distorcer relatórios (vou perguntar antes de apagar).

## Verificação e entrega
- Testes automáticos: "1 vez por sessão/página", "sem dados pessoais", "limite de 5s no WhatsApp".
- Publicar, abrir no celular (390px) com gclid de teste, conferir os 4 eventos gravados e o limite do WhatsApp; apagar os registros de teste.
- Responder com a lista do que foi feito e a causa das rajadas.

## Detalhes técnicos
- trackEvent.ts: novos tipos; anexar origem resumida de getLeadTracking() (fonte, utm_source, utm_campaign, tem_gclid, device) num campo jsonb novo `origem` em lead_events (migração simples); identidade continua só para o CRM quando já existente, nunca nos eventos novos.
- Hook único useFunilAnuncio(paginaTipo) montado nas 4 páginas: pagina_anuncio_vista via requestIdleCallback; IntersectionObserver em sentinela absoluta a 50% da altura; focusin delegado no documento para formulario_iniciado; MaterialGallery chama o evento ao abrir.
- Dedup em sessionStorage com chave tipo+pathname.
- whatsappTracker.ts: throttle por session_id (5s) antes do envio; migração com gatilho BEFORE INSERT em whatsapp_clicks que descarta repetição da mesma session_id em <5s.
- Eventos novos não vão para o CRM (só o site), como hoje com visitantes anônimos.
