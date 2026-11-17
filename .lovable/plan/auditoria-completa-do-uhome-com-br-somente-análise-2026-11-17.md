# Auditoria completa do uhome.com.br (somente análise)

Não vou alterar nada no site, no banco, nos anúncios nem no CRM. Também não vou publicar e não vou criar lead de teste. O resultado é um relatório e um plano priorizado. Você aprova depois o que for feito.

## O que já mudou desde os dados de 12 a 14/11 (vou confirmar)
- As páginas de produto já têm "Agendar visita", "Receber informações", menu enxuto e barra fixa com duas ações.
- A página do Natal perdeu os banners e ganhou um formulário com escolha do produto.
- Os eventos de funil já são gravados (página vista, rolagem, galeria, início de formulário).
- O registro do WhatsApp agora tem limite de um clique a cada 5 segundos por sessão.
- O WhatsApp voltou a ser conversão secundária; formulário e visita são as principais.

A auditoria parte do site publicado hoje, não do de 12/11.


## Acréscimos (prioridade)
1. **Prioridade 1: formulário começado e não enviado no celular.** Em 16/11, 15 sessões de anúncio no celular começaram um formulário (6 em /em-foco, 9 em /busca) e só 1 enviou. Para cada formulário, vou testar num celular de 390 px até a tela de sucesso:
   - campos, validação e máscara do telefone;
   - teclado que aparece;
   - se a barra fixa, a LIA ou o teclado cobrem o botão;
   - erros silenciosos no envio e tempo de resposta.
   Envios de teste só se forem inevitáveis, e serão apagados e listados no relatório. Também vou separar os envios reais dos testes meus e seus, pelos nomes com TESTE, telefones de teste e horários dos testes.
2. **Página de produto publicada x pedido da fase 1.** Vou listar cada diferença. As três já apontadas entram como confirmadas para verificação:
   - capa escura com arcos dourados;
   - Open Arvoredo com 10 fotos (as 19 imagens em alta do zip não entraram);
   - "Agendar visita" dourado em vez do azul da marca.
   Vou usar o zip "motor de leads" (auditoria, conteúdo dos produtos, referências, fotos, plantas e vídeos) como régua.
3. **Funil no resumo do chat.** De 16/11 em diante, por página e aparelho: vista, rolagem, galeria, início de formulário, envio e WhatsApp, separando quem veio de anúncio.

## Como vou fazer
1. **Navegador:** abrir as páginas no celular (390x844) e no computador (1440x900), com e sem parâmetros de anúncio, e tirar print da primeira tela e da página inteira. As páginas são:
   - home
   - os 10 produtos /em-foco
   - /campanha/natal-chave-de-ouro
   - /investir-studios
   - /busca com filtros
   - uma página /imovel
   - uma página de bairro
   Se o uhome.com.br bloquear o acesso automático, uso o endereço publicado alternativo, que mostra a mesma versão.
2. **Velocidade:** PageSpeed Insights das 7 páginas pedidas, no celular e no computador. Trago LCP, INP, CLS, TBT, o peso total e o que mais pesa.
3. **O que o Google e o WhatsApp leem:** baixar o HTML de cada rota como robô (Googlebot, Facebook, WhatsApp), e conferir sitemap, robots e canônicos.
4. **Anúncios:** ler (sem alterar) os textos e destinos de todos os anúncios ativos da conta 104-122-6095 e comparar cada um com a página de destino. Também leio as ações de conversão.
5. **Banco (só leitura):**
   - os 404 mais frequentes em page_404_log
   - leads, WhatsApp e eventos de funil por página e aparelho
   - origem (gclid, UTM) presente ou faltando em cada formulário
   - duplicidades
6. **Código:**
   - levantar o design system real: cores, tipos, botões, raios, sombras
   - formulários, pop-ups e LIA
   - JSON-LD
   - links internos
7. **Formulários:** testar até a tela de erro e de validação, sem enviar.
8. **Referências:** comparar a mesma página (produto, busca, imóvel) com QuintoAndar, Lopes e uma referência de fora.

## O que vou entregar
Um relatório em PDF nos seus Arquivos, com os prints, e um resumo aqui no chat. O relatório traz:
1. Os 5 maiores problemas que impedem contato, em 10 linhas, cada um com o número que o prova.
2. Uma tabela com nota de 0 a 10 por página e por dimensão (A a G).
3. A lista completa de achados. Cada achado traz página, problema, evidência, impacto, esforço e correção proposta.
4. O design system enxuto proposto, em uma página.
5. O plano em fases, com o que medir em cada uma.
6. O que não consegui verificar e por quê.

Regras dos textos propostos:
- nada de MCMV, FGTS ou "barato";
- nada de prometer "tabela" ou "simulação";
- nenhum dado de produto inventado.

## Limites já conhecidos
- O acesso automático ao uhome.com.br pode ser bloqueado pela proteção do domínio.
- As fotos não carregam no ambiente de teste, então algumas avaliações visuais serão feitas pelo código e pelo PageSpeed.
- Fluidez real de toque e o leitor de tela são verificados só em parte, porque o navegador é automático.
