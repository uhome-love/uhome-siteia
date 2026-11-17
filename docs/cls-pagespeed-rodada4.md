# CLS no PageSpeed — 17/11/2026

## Relatórios oficiais

API `runPagespeed`, estratégia mobile, home e busca: ambas retornaram HTTP 429, cota diária esgotada. Sem Lighthouse JSON, audit layout-shifts ou filmstrip oficiais disponíveis. Não acessamos o domínio por fora da regra regional. Valores fornecidos pelo dono: home LCP 1,4 s e CLS 1,000; não constituem medição nossa.

## Reprodução e correção

O script remove `data-uh-alvo` da tela pronta e revela o app. Os estilos `.uh-foto-retida` existiam só no CSS assíncrono. Se ainda não aplicados, a tela pronta continua no fluxo e empurra `#root` uma tela; quando chegam, root volta ao topo.

Chrome local 390×844, mesma URL/dimensões de imagem, estilo de retenção atrasado: antes root top 844→0, layout-shift 1,000 a ~949 ms; depois root top 0→0, nenhum layout-shift. Regras críticas agora inline antes do script de troca. Nenhuma alteração em URL da capa, tamanho, prioridade, carregador do app, função site-dobra ou Worker.

## Validação com a função atual

Head/script/pre atuais injetados no HTML local como Worker. Não são Lighthouse simulado nem medição oficial. Home CLS 0,00015, busca 0,00019; fotos LCP: gasometro-mobile-45.webp e primeira foto wsrv.nl. Open Bosque CLS 0,00068; Natal 0,01937 na prévia local. Nas quatro, root top zero, um h1 visível, sem overflow horizontal e sem erros de execução. Resultados dependem da prévia de desenvolvimento, não devem substituir os números oficiais da central.

## Lia

No celular, rosto flutuante oculto nas páginas com barra de ação, inclusive Open Bosque. O ícone de conversa da barra de produto dispara o evento existente de abertura da Lia (testado no app com o produto real). Links WhatsApp restantes conservados. Nenhum envio automático de mensagem ou lead.

## Publicação

Publicar somente o app. site-dobra e Worker não mudaram: o app continua usando site-v1 e os mesmos modelos publicados. Depois de publicado, central pode repetir PageSpeed home e busca; antes/depois oficial ainda não verificado por cota/API e publicação pendente.