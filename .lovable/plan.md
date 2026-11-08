# Página de Lançamentos + Campanhas temáticas (Natal)

## Ideia geral
Criar um "hub" fixo de produtos em foco, que vocês controlam pelo painel admin, sem precisar mexer no site a cada troca de campanha.

```text
uhome.com.br/lancamentos            -> todos os empreendimentos com campanha ativa
uhome.com.br/campanha/natal-uhome   -> página temática de Natal (só os produtos dela)
uhome.com.br/campanha/<qualquer>    -> próximas campanhas (Black, Verão, Feirão, Mega Cyrela...)
uhome.com.br/empreendimentos/<slug> -> página do produto (já existe, destino dos anúncios Meta)
```

## 1. Página /lancamentos (fixa)
- Topo forte: "Lançamentos e oportunidades em foco" + filtros rápidos (cidade, estágio: lançamento / em obras / pronto, faixa de preço, construtora).
- Faixa das campanhas ativas (ex.: banner do Natal) levando para a página da campanha.
- Grade de cards dos empreendimentos em foco: foto, nome, bairro, construtora, "a partir de R$", entrega, selo da campanha (ex.: "Condição de Natal").
- Bloco "Por que comprar na planta com a Uhome" + formulário de interesse + WhatsApp.
- Pronto para mostrar aos incorporadores e mandar para clientes.

## 2. Páginas de campanha /campanha/:slug (modelo reutilizável)
Cada campanha tem: nome, período (início/fim), tema visual, banner, título, texto, condições especiais (ex.: entrada facilitada, bônus, desconto) e a lista de empreendimentos.
- Natal: visual temático elegante (tons verde-escuro, dourado e vermelho suave, detalhes de brilho discretos), contagem regressiva até o fim da campanha, condições em destaque, produtos, formulário "Quero a condição de Natal".
- Quando a campanha vence, ela sai sozinha do ar (e da /lancamentos), com redirecionamento para /lancamentos — link nunca quebra.
- A Mega Cyrela atual pode virar uma campanha nesse mesmo modelo.

## 3. Página do produto preparada para Meta Ads
- Na página do empreendimento: selo e condição da campanha ativa, botão fixo de WhatsApp/formulário.
- Links com UTM do anúncio continuam sendo gravados e o lead chega ao CRM com o nome da campanha.
- Prévia bonita ao compartilhar no WhatsApp (imagem e título da campanha).

## 4. Painel admin "Campanhas"
- Criar/editar campanha, escolher tema, subir banner, definir datas, marcar quais empreendimentos entram e a ordem.
- Ligar/desligar campanha com um clique; marcar empreendimento como "Em foco" na /lancamentos.

## 5. Destaques no site
- Item "Lançamentos" no menu e um bloco na Home levando para a campanha ativa.

## Materiais que preciso de vocês (para o Natal)
1. Lista dos empreendimentos da campanha (nome e construtora).
2. Condições especiais de cada um e regulamento/período (início e fim).
3. Fotos e plantas em boa qualidade, vídeo se tiver, e logo das construtoras.
4. Peças da campanha (artes do Meta, slogan, nome da campanha).
5. Preço "a partir de", tipologias, metragens e previsão de entrega.
6. WhatsApp/corretor responsável por produto, se for diferente do padrão.

## Detalhes técnicos
- Nova tabela `campanhas` (slug, nome, tema, datas, banner, textos, condições, ativo) + tabela de ligação `campanha_empreendimentos` (ordem, condição específica). RLS: leitura pública só das ativas e dentro do período; edição só admin.
- Campo `em_foco` em `empreendimentos` para a /lancamentos.
- Rotas `/lancamentos` e `/campanha/:slug` (também sob `/c/:slug` do corretor), SSR/SEO com JSON-LD, sitemap e canônico.
- Leads com `origem = campanha:<slug>` sincronizados pelos gatilhos do banco já existentes.
- Temas como conjuntos de cores no design system (sem cores fixas nos componentes).
