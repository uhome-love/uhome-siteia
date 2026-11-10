# Auditoria de conversão e qualidade: site, Natal e páginas de produto

Objetivo: deixar as páginas que vão receber anúncios no melhor nível de conversão, beleza e confiança, sem mexer na estrutura (busca, mapa, sincronização Jetimob, CRM).

Prioridade: celular primeiro. A maioria das buscas é no celular, então cada página é desenhada e validada antes em 360px e 390px (botões grandes ao alcance do polegar, texto legível sem zoom, carregamento rápido no 4G, nada cobrindo o conteúdo) e só depois no computador.

## 1. Checagem do site publicado (primeiro passo)
- Confirmar que o site no ar carrega o Google Analytics e o Google Ads, e que um contato de teste conta como conversão (marcado como teste).
- Investigar um alerta: um acesso automático à página de Natal recebeu "bloqueado" (403). Se o robô do Google Ads também for barrado, os anúncios podem ser reprovados. Verificar e, se for o caso, liberar os robôs do Google (sem abrir para robôs ruins).
- Medir velocidade real (celular e computador) da Home, Natal e 2 produtos.

## 2. Auditoria página por página (celular 390px e computador)
Páginas: Home, Natal Chave de Ouro, 3 páginas de produto, busca, página de imóvel, link personalizado de corretor.
Para cada uma, nota de 0 a 10 em: primeira impressão, clareza da oferta, prova/confiança, chamada para ação, facilidade de contato, velocidade, acabamento visual.
Resultado salvo em relatório para você ler.

## 3. Natal mais persuasivo
- Topo: promessa clara em uma frase (o benefício da Chave de Ouro), prazo da campanha e um botão principal.
- Prova: selos de construtora, entrega, "a partir de" e condições reais da Black/Natal (só dados que você já passou — nada inventado).
- Urgência honesta: contador até o fim da campanha, sem "últimas unidades" falso.
- Comparador simples dos 10 produtos (cidade, preço inicial, entrega, quartos).
- Perguntas frequentes da campanha.

## 4. Páginas de produto que convertem
- Primeira tela: nome, preço "a partir de", entrega, localização e botão "Quero condições de Natal".
- Contato em 1 passo: LIA abre já sabendo o produto; formulário curto (nome + WhatsApp) com opção de agendar visita.
- Barra fixa no celular com "Falar com a LIA" e "Agendar visita".
- Galeria, plantas e mapa revisados; diferenciais em blocos curtos.
- Nos links de corretor: mantém foto e WhatsApp do corretor, sem formulário.

## 5. LIA e qualidade dos leads
- Testar 5 conversas reais: busca de imóvel, produto do Natal, agendamento, pergunta sobre aluguel (deve recusar), cliente indeciso.
- Conferir que cada lead chega ao CRM na fila do CEO com páginas vistas, produto, campanha, origem do anúncio e resumo da LIA. Leads de teste ficam marcados e listados para você apagar.
- Ajustar a LIA para sempre tentar pegar nome, WhatsApp, objetivo (morar/investir), faixa de preço e prazo.

## 6. Preparar a campanha do Google Ads (pausada)
- Campanha na pesquisa do Google: Natal + "apartamento à venda Porto Alegre" e bairros fortes, levando para a página do Natal ou do produto.
- Te mostro textos e palavras-chave para aprovar; criada pausada até você colocar verba.

## Regras mantidas
- Só venda, nunca aluguel. Nenhum dado, avaliação ou número inventado.
- Busca, mapa, sincronização e integrações com o CRM não mudam de estrutura.
- Tudo validado no celular e no computador antes de dizer que está pronto.

## Detalhes técnicos
- Verificar WAF/Cloudflare para user-agents AdsBot-Google e Googlebot em /natal, /em-foco/:slug e /campanha/:slug.
- Conversões: gtag AW-18567893155 com send_to de lead, visita e WhatsApp em `src/lib/gtag.ts` e `LiaChat`.
- Mudanças visuais em `CampanhaPage.tsx`, `ProdutoFocoPage.tsx` e componentes de `foco/`, usando os tokens `--natal-*`.
- Testes Playwright 390/1280px e testes unitários existentes.
