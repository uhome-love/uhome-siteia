# Velocidade mobile — rodada 3

## Diagnóstico oficial antes

Em 20/11/2026, as chamadas públicas sem chave para a Home, busca com cidade e imóvel 61277-LFC retornaram HTTP 429, com mensagem explícita de cota diária excedida. Repetidas mais tarde, as três continuaram em 429. Nenhuma chave do projeto foi usada. Não houve resultado Lighthouse nem audits para extrair.

| Página | TTFB | Resource load delay | Load duration | Render delay |
|---|---|---|---|---|
| `/` | Indisponível | Indisponível | Indisponível | Indisponível |
| `/busca?cidade=Porto%20Alegre` | Indisponível | Indisponível | Indisponível | Indisponível |
| `/imovel/apartamento-3-quartos-santa-cecilia-61277-LFC` | Indisponível | Indisponível | Indisponível | Indisponível |

Não se substituiu essa divisão por medições Vite em desenvolvimento. Os audits solicitados (LCP element/breakdown/discovery, network requests, blocking resources, font display, responsive images) permanecem pendentes.

### Visitantes reais, últimos sete dias

Séries de métricas colapsadas antes de calcular p75; sem robôs. Mistura de dispositivos e versões publicadas, não representa exclusivamente celular nem a última publicação.

| Página | LCP p75 / leituras / boas | FCP p75 / leituras / boas | CLS p75 / leituras / boas |
|---|---|---|---|
| Home | 2,768 s / 265 / 64,5% | 1,848 s / 305 / 73,8% | 0,109 / 200 / 73,5% |
| Busca | 4,614 s / 319 / 28,2% | 2,020 s / 377 / 67,1% | 0,042 / 311 / 83,6% |
| Imóvel 61277-LFC | 5,628 s / 1 / 0% | 5,628 s / 1 / 0% | 0 / 5 / 80% |

O imóvel tem dados insuficientes para classificação (menos de 30 leituras). Referências Google: LCP ≤2,5 s, FCP ≤1,8 s, CLS ≤0,1. Na Home e busca o LCP p75 ultrapassa 2,5 s; os números não determinam as quatro parcelas do LCP.

## Evidências que justificaram os cortes seguros

- O endpoint oficial `site-dobra` da Home **já** anuncia a primeira foto na mesma variante 480×432, WebP q62, e entrega os cinco imóveis. Não foi refeito.
- A Home `lar-1` descarta o antigo molde da paisagem. Portanto sua foto, mesmo pré-carregada, ainda espera o app para aparecer. Não se criou um molde novo às cegas.
- Pelo Worker versionado, busca com parâmetros não recebe molde, e detalhes de imóveis não recebem `site-dobra` para pessoas. As consultas só começavam no `main`, que depende do pacote do app.
- Em `FotosCard`, carregar os dados após idle também iniciava a preparação e o carregamento das fotos extras sem interação. Essas fotos podiam disputar a rede com a principal.
- No navegador local, o primeiro cartão efetivamente usou WebP de **47.588 bytes (46,5 KiB)**. O imóvel usou WebP de **30.956 bytes (30,2 KiB)**. Estes são corpos de respostas observados no navegador, não estimativas nem pesos de PageSpeed.
- Downloads diretos por requests retornaram 403 do transformador; não foram contados como imagens. O navegador conseguiu as duas fotos citadas. As imagens do em-foco e o avatar não ficaram acessíveis nessa conferência; não se contornou o bloqueio regional do domínio oficial.

## Mudanças

1. `index.html`: o pequeno módulo de abertura inicia `iniciarBuscaCedo` e `iniciarDetalheCedo` **antes** da espera pela primeira foto e do import do app. O HTML compilado continua usando a separação existente entre entrada leve e app dinâmico; nenhuma compilação manual foi feita.
2. `src/lib/detalheCedo.ts`: consulta pública antecipada apenas para slug completo do imóvel, com as mesmas colunas, permissões e timeout de 12 s; anuncia só a primeira foto com o mesmo `src`, `srcset`, `sizes` e prioridade usados pela página. Links por código e slugs inválidos seguem o fluxo anterior.
3. `src/services/imoveis.ts`: consome a promessa antecipada, sem repetir a consulta. Falhas voltam ao caminho normal. Centraliza a lista de colunas usada nas duas entradas.
4. `src/main.tsx`: não cria um segundo anúncio de preload quando ele já foi criado pela consulta antecipada.
5. `src/components/search/FotosCard.tsx`: dados, setas e pontos continuam como antes; fotos extras só ganham URL/decodificação após toque, arraste ou clique na seta.
6. `src/test/detalheCedo.test.ts`, `src/components/search/FotosCardLoading.test.tsx`: testes de consulta única, variantes iguais, caminhos excluídos, recuperação de erro e fotos extras sem download antes da interação.
7. `src/lib/AGENTS.md`, `roadmap.md`: regra de inicialização e pendência de diagnóstico oficial.

Nenhuma função foi alterada; não houve publicação de funções nem do front. Google Ads, textos, dimensões, rastreio, consentimento, gtag e conversões não foram alterados.

## Verificação local — não é comparativo de produção

Chromium 375×812, DPR 2, com primeira tela oficial somente nas páginas cobertas pelo Worker (Home e em-foco). Na última conferência:

- Busca filtrada: consulta começou em 138 ms; avaliação do app em 624 ms — cerca de **486 ms antes**.
- Imóvel: consulta começou em 128 ms; avaliação do app em 643 ms — cerca de **515 ms antes**, com uma única consulta do anúncio.
- Nenhuma foto extra do carrossel tinha URL antes da interação.
- CLS observado: Home 0,046; busca 0,019; imóvel 0,021; em-foco 0; busca Ads 0,034. Rodadas locais sem pretensão de mediana/nota oficial.
- Busca Ads: cartão presente, classe inicial aplicada, mapa/LIA com visibility hidden, opacity 0 e pointer-events none; centro do botão livre por elementFromPoint, sem rolar. Aviso de consentimento preservado.
- Imóvel: foto carregada e formulário de visita aberto, sem envio.
- Em-foco: preço, botões e barra presentes; formulário de informações aberto, sem envio. Foto não verificável por indisponibilidade do recurso na sessão.
- LIA abriu ao toque, sem mensagem enviada. Avatar não verificável nessa sessão.
- Favorito salvo e lido de volta pela página de favoritos no mesmo contexto.
- Nenhuma exceção JavaScript observada.
- **286 testes passaram em 60 arquivos**; inclui testes existentes de Lead site, visita e conversões com envios simulados. Nenhum lead real foi enviado.
- Registro automático: build OK.

## Expectativa depois de publicar

- **TTFB:** inalterado; nenhuma mudança de servidor ou cache.
- **Resource load delay:** busca filtrada e imóvel deixam de esperar a avaliação do app para iniciar os dados; o ganho local observado foi aproximadamente 0,5 s na partida da consulta, não uma previsão garantida do PageSpeed. A imagem ainda espera a resposta pública e o pequeno módulo inicial.
- **Load duration:** não se mudou a variante principal; com 1,6 Mbps, só os corpos de 46,5/30,2 KiB demandariam aproximadamente 0,24/0,15 s de transferência, antes de RTT, conexão e concorrência. Fotos extras deixam de competir.
- **Render delay:** não foi imposto um valor; a Home ainda depende do app para pintar seu cartão. Sem o audit oficial não é responsável prometer ≤2,5 s nem uma divisão numérica exata.

## Fora desta rodada

Novo molde da Home, alteração do Worker para páginas filtradas/detalhe, novas variantes DPR/AVIF, qualidade menor, fontes/CSS e animações: faltou a divisão oficial para justificar mudanças com risco de visual, cache ou primeira tela. O preload/seed já existente da Home e a transição pre→app permanecem intactos. A fonte continua self-hosted com swap; não foi acrescentado preload de fonte ou de outras fotos.

Próximo passo: publicar apenas o front e obter os três relatórios oficiais no Brasil, incluindo a divisão LCP. A cota da API permanece como bloqueio do diagnóstico solicitado.