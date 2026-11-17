# Rodada de correções pós-auditoria 16/11

Ordem: 1 Medição, 4 Prévia do link (urgente), 2 Busca, 3 Página de produto + 5 Velocidade, entrega.

## Diagnóstico confirmado da prévia (item 4)
- Já existe uma função que monta a prévia certa: pedida direto, ela devolve "Open Bosque | Passo d'Areia, Porto Alegre | Uhome em Foco".
- O problema é que o uhome.com.br nunca chama essa função: o WhatsApp recebe o HTML genérico (og-default.jpg). Falta o "desvio" dos robôs de prévia para ela.
- A hospedagem do Lovable entrega o mesmo HTML para todos os endereços. Solução: um **Worker da Cloudflare** que desvia só os robôs de prévia para a função.
- Robôs no desvio: WhatsApp, facebookexternalhit/Facebot, Instagram, Twitterbot, LinkedInBot, Slackbot, TelegramBot. **Googlebot e Bingbot ficam fora**: conferi que o HTML da função tem só título, descrição e 1 imagem, não o conteúdo visível da página. O Google continua lendo a página normal (ele executa JavaScript).
- Rotas só das páginas (nada de `uhome.com.br/*`): `uhome.com.br/`, `uhome.com.br/em-foco*`, `uhome.com.br/campanha/*`, `uhome.com.br/investir-studios*`, `uhome.com.br/imovel/*`, e as mesmas com `www.`. Imagens e scripts não passam pelo Worker.
- Deixar passar (fail open): no código, qualquer erro ou demora acima de 3 s devolve a página normal; e no painel, em Worker > Configurações > Rotas, cada rota fica com **"Falha em caso de erro: Abrir (Fail open)"** para que, se passar das 100 mil requisições/dia, a Cloudflare sirva o site direto em vez de erro.

### Proxy (nuvem laranja) — já conferido
- O uhome.com.br já está com proxy ligado: o endereço responde por IPs da Cloudflare e o cabeçalho diz "server: cloudflare". Então a rota funciona sem mudar nada no DNS, e o domínio e o certificado do Lovable continuam como estão hoje.
- Onde conferir: Cloudflare > uhome.com.br > DNS > Registros; nas linhas `uhome.com.br` e `www`, a coluna "Status do proxy" deve mostrar a nuvem laranja "Com proxy". Não altere esses registros.
- Observação: o www.uhome.com.br aparece no Lovable como "drifted" (registro diferente do esperado); vou checar isso à parte e te dizer o ajuste.

### Passo a passo do Worker (você faz, ~5 min; eu entrego o código)
1. Cloudflare > Workers e Pages > Criar > Criar Worker > nome `uhome-previa` > Implantar.
2. Editar código > colar o código que vou te mandar > Implantar.
3. No Worker: Configurações > Domínios e rotas > Adicionar > Rota > zona uhome.com.br > colar cada rota acima > modo de falha "Abrir" > Adicionar.
4. Me avisar; eu rodo os testes com curl e passo os links para o Depurador do Facebook.

### Alerta de texto
- A descrição do Open Bosque no banco fala "Minha Casa Minha Vida" e aparece na prévia. Pela regra "sem MCMV", vou tirar esse trecho da prévia (sem mudar o dado do produto) — me diga se prefere manter.

## 1. Medição
- formulario_iniciado passa a gravar qual formulário: agendar_visita, receber_informacoes, natal, busca, captacao. Campo da LIA deixa de contar; LIA ganha evento próprio lia_mensagem.
- /investir-studios: testar no celular se grava pagina_anuncio_vista e corrigir.
- PageSpeed (celular e computador) nas 5 páginas antes de mexer; números guardados para comparar no fim.

## 4. Prévia do link e Google (lado do site)
- Ajustar a função de prévia: título do produto "Nome · Bairro, Cidade | Uhome"; descrição com tipologia, "a partir de R$" e entrega; imagem = capa recortada 1200x630; og:url, canonical e twitter:card summary_large_image próprios.
- Acrescentar /investir-studios, /campanha/natal-chave-de-ouro e /imovel/:slug (título, bairro, preço, primeira foto) se ainda não estiverem cobertos.
- Home e demais: prévia padrão com um número só de imóveis, contado no banco (some "14.600+" vs "21.400+").
- JSON-LD de produto e de imóvel.
- Sitemap refeito com /em-foco/*, a campanha e /investir-studios, com a data real de atualização.
- Conferir antes do Worker chamando a função direto com os três robôs; depois do Worker, com curl em uhome.com.br.

## 2. Busca
- Formulário curto (nome, WhatsApp, e-mail opcional) aberto depois do 3º imóvel.
- Campos em 16 px; telefone com DDD obrigatório (10–11 dígitos); sucesso fica na tela.
- Barra fixa no celular: "Falar com corretor" (WhatsApp) e "Criar alerta".

## 3. Página de produto
- "Agendar visita" sempre no azul da marca; dourado só no selo e na faixa da condição.
- Capa clara, sem arcos dourados; degradê só atrás do texto.
- Open Arvoredo: as 19 imagens e 2 vídeos do decorado da pasta "material-pronto" do zip que você mandou (não vieram novos anexos nesta mensagem; se forem outros, me reenvie). Open Bosque: as 10 imagens + vídeo do YouTube carregado só ao tocar.
- Versão ~800 px para celular; a grande só em tela grande.
- Atalhos sobre a capa: Fotos, Vídeo (quando houver), Plantas, Mapa.
- Barra fixa celular: "Agendar visita" (azul) e "WhatsApp" (verde), mesmo tamanho. "Receber informações" vira o link "Só quero receber as condições" perto do bloco de visita.
- Visita: "É para morar ou investir?", botão "Agendar minha visita", nova mensagem de sucesso; dia, período, objetivo e planta vão ao CRM.
- "Quero esta planta" abre o formulário de visita com a planta marcada.
- Parcela estimada: só se o simulador da página de imóvel servir com segurança; senão fica de fora e eu aviso.

## 5. Velocidade
- LIA, mapa, galeria completa e vídeos carregam só depois da primeira tela. Meta LCP ≤ 2,5 s, CLS ≤ 0,1 no celular.

## Entrega
- Publicar; prints 390 px (Open Arvoredo, Open Bosque, busca); curl com WhatsApp para produto, Natal e um imóvel; PageSpeed antes/depois; um teste de cada formulário até o CRM (com origem e campos novos), apagados depois com lista; lista do que ficou de fora.
- Depurador do Facebook: eu te digo os links para colar (precisa da sua conta Facebook).
- Regras mantidas: sem "tabela"/"simulação", sem MCMV/FGTS/"barato", nenhum dado de produto inventado, anúncios intocados.

## Detalhes técnicos
- Worker: regex de User-Agent só de robôs de prévia; demais passam com `fetch(request)`; bots chamam `/functions/v1/ssr-render?path=...` com timeout 3 s e cache 10 min; qualquer erro cai no `fetch(request)`; rotas configuradas com fail open.
- funilAnuncio.ts: `formulario` no payload via `data-form` no form mais próximo; ignora inputs dentro do widget LIA.
- Novos campos do agendamento vão em `contexto` (jsonb existente), repassados pelo sync-to-crm em dados_site.
- Imagens: WebP 2400 e 800 via lovable-assets, `srcset/sizes`.
