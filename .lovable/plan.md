# Auditoria completa do uhome.com.br (somente análise)

Não vou alterar nada no site, no banco, nos anúncios nem no CRM. Também não vou publicar e não vou criar lead de teste. O resultado é um relatório e um plano priorizado. Você aprova depois o que for feito.

## O que já mudou desde os dados de 12 a 14/11 (vou confirmar)
- As páginas de produto já têm "Agendar visita", "Receber informações", menu enxuto e barra fixa com duas ações.
- A página do Natal perdeu os banners e ganhou um formulário com escolha do produto.
- Os eventos de funil já são gravados (página vista, rolagem, galeria, início de formulário).
- O registro do WhatsApp agora tem limite de um clique a cada 5 segundos por sessão.
- O WhatsApp voltou a ser conversão secundária; formulário e visita são as principais.

A auditoria parte do site publicado hoje, não do de 12/11.

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
