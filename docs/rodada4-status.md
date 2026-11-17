# Rodada 4 — implementação A/B, publicação pendente

## Medição correta

- Lighthouse 13.0.1 instalado fora do projeto, mobile padrão, throttling simulado.
- Tentativa no domínio publicado em 17/11/2026 retornou HTTP 403 da Cloudflare (regra regional). O Lighthouse terminou com `ERRORED_DOCUMENT_REQUEST`, portanto não há nota ou mediana válida.
- Conforme autorização posterior do dono, validar pela prévia local com head/script/pre da função; não apresentar essa validação como medição oficial da central.
- Para concluir, executar três cargas por página em ambiente permitido pela regra regional, com perfis limpos, exportando JSON, trace e devtools log.

## Preparado, sem ativação antecipada

- Capa Gasômetro WebP: 800 × 381, **44.858 bytes** (arquivo original 72.162 bytes). Ativada no app novo; modelos antigos preservam a imagem antiga.
- Preconnect de wsrv.nl movido para o início do head, conforme alternativa autorizada. Geração recorrente das quatro fotos locais ainda pendente.
- `site-dobra` implantada: escolhe modelos novos apenas quando o HTML tem `uh-dobra-versao=site-v1`; sem essa chave usa modelos antigos. Worker e lista de robôs intactos. `ssr-render` atualizada para títulos solicitados.

## Diagnóstico local (não é Lighthouse nem mediana comparável)

- Teste com HTML real da função atual injetado na prévia local confirmou que a home registra uma nova entrada LCP após a troca, mesmo com URL idêntica e dimensões iguais da seção.
- A foto fica no lugar original na tela pronta; textos/controles da tela pronta são ocultados, app assume interação, e sua foto espelho fica oculta até primeira interação. Não move nós React.
- O teste local da busca preservou a entrada da primeira foto anterior ao carregamento do módulo de entrada, mas isso não prova o comportamento do bundle publicado em Lighthouse simulado.
- Meta ≤2,5 s e comparação entre LCP e fim do JavaScript principal seguem **não verificadas**.

## Ordem de publicação

1. Concluir A e executar a medição real.
2. Só então iniciar B e gerar modelos com o novo visual.
3. Novos modelos da função devem ser compatíveis com o app publicado ou protegidos por chave desligada até publicação. Avisar explicitamente antes de mudar a função.

CSS anexos incorporados com tokens de mesmos nomes, Montserrat local, Tailwind, botões, cabeçalho com três abas e busca em tela cheia, barra inferior, rodapé e Lia navy com foto. Prints 390/1440 e fluxos de busca/filtros/Lia conferidos sem erro de execução. A medição oficial e mediana de três cargas ficam com a central; os traces locais confirmam foto LCP da tela pronta antes da avaliação do app (não são nota Lighthouse). Fotos da busca mantêm wsrv.nl com preconnect na primeira linha, alternativa autorizada; geração recorrente de assets locais não foi implementada.