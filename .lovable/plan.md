# Rodada de correções pós-auditoria 16/11

Ordem: 1 Medição, 4 Prévia do link (urgente), 2 Busca, 3 Página de produto + 5 Velocidade, entrega.

## Diagnóstico confirmado da prévia (item 4)
- Já existe uma função que monta a prévia certa: pedida direto, ela devolve "Open Bosque | Passo d'Areia, Porto Alegre | Uhome em Foco".
- O problema é que o uhome.com.br nunca chama essa função: o WhatsApp recebe o HTML genérico (og-default.jpg). Falta o "desvio" dos robôs de prévia para ela.
- A hospedagem do Lovable só entrega o mesmo HTML para todos os endereços, e não há como pré-renderizar por rota neste tipo de projeto. A solução simples e estável é um **Worker da Cloudflare** (o DNS já está lá):
  - se o visitante for robô (WhatsApp, facebookexternalhit, Instagram, Twitterbot, LinkedInBot, Slackbot, TelegramBot, Googlebot, Bingbot) e o endereço for /em-foco/*, /campanha/*, /investir-studios, /imovel/*, / → serve o HTML da função;
  - qualquer outro visitante passa direto, sem mudança. Pessoas não sentem diferença de velocidade.
- **O que você vai precisar fazer** (eu te entrego o código pronto e o passo a passo com prints): Cloudflare > Workers e Pages > Criar Worker > colar o código > Implantar > em "Rotas" adicionar `uhome.com.br/*` e `www.uhome.com.br/*`. Cerca de 5 minutos.

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
- Worker: checa User-Agent por regex de bots e o caminho; faz fetch para `/functions/v1/ssr-render?path=...` com cache de 10 min; em erro, cai no `fetch(request)` original.
- funilAnuncio.ts: `formulario` no payload via `data-form` no form mais próximo; ignora inputs dentro do widget LIA.
- Novos campos do agendamento vão em `contexto` (jsonb existente), repassados pelo sync-to-crm em dados_site.
- Imagens: WebP 2400 e 800 via lovable-assets, `srcset/sizes`.
