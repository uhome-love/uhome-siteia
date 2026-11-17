# Rodada 4 — bloco A em validação, bloco B não iniciado

## Medição correta

- Lighthouse 13.0.1 instalado fora do projeto, mobile padrão, throttling simulado.
- Tentativa no domínio publicado em 17/11/2026 retornou HTTP 403 da Cloudflare (regra regional). O Lighthouse terminou com `ERRORED_DOCUMENT_REQUEST`, portanto não há nota ou mediana válida.
- Não usar a prévia de desenvolvimento, substituir arquivos do site publicado ou servir uma réplica como medição comparável à central.
- Para concluir, executar três cargas por página em ambiente permitido pela regra regional, com perfis limpos, exportando JSON, trace e devtools log.

## Preparado, sem ativação antecipada

- Capa Gasômetro WebP: 800 × 381, **44.858 bytes** (arquivo original 72.162 bytes). Mesmas dimensões e enquadramento. Novo asset preserva o original; ainda não aplicado à capa para não divergir da tela pronta publicada.
- Preconnect de wsrv.nl movido para o início do head, conforme alternativa autorizada. Geração recorrente das quatro fotos locais ainda pendente.
- Nenhuma alteração em `site-dobra` foi feita ou implantada. Worker e lista de robôs intactos.

## Diagnóstico local (não é Lighthouse nem mediana comparável)

- Teste com HTML real da função atual injetado na prévia local confirmou que a home registra uma nova entrada LCP após a troca, mesmo com URL idêntica e dimensões iguais da seção.
- A tentativa de mover a foto pintada para o app não eliminou a nova entrada da home e foi descartada. Não foi mantida uma intervenção manual no DOM React.
- O teste local da busca preservou a entrada da primeira foto anterior ao carregamento do módulo de entrada, mas isso não prova o comportamento do bundle publicado em Lighthouse simulado.
- Meta ≤2,5 s e comparação entre LCP e fim do JavaScript principal seguem **não verificadas**.

## Ordem de publicação

1. Concluir A e executar a medição real.
2. Só então iniciar B e gerar modelos com o novo visual.
3. Novos modelos da função devem ser compatíveis com o app publicado ou protegidos por chave desligada até publicação. Avisar explicitamente antes de mudar a função.

Os CSS anexos foram analisados como referência; não foram importados antecipadamente. A importação remota de fonte existente no CSS fornecido deve ser omitida, mantendo Montserrat self-hosted.