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

## Parte B — Auditoria e evolução do site inteiro
Comparação com os grandes (QuintoAndar, Zillow, Zap/VivaReal, Airbnb, Lopes). Execução em ondas, sempre sem tirar o site do ar.

### Onda 0 — Medir antes de mexer (1º passo)
- Medir a velocidade real dos visitantes por página (busca, imóvel, home) e montar o "antes".
- Teste completo de busca, filtros, mapa, busca por IA, botões e mobile, com lista de falhas.
- Conectar o Google Search Console (hoje não está ligado, então não temos como saber o que o Google indexou) e enviar o mapa do site.
- Já sabemos: o mapa do site está desatualizado (tem páginas que não existem mais e falta bairros e condomínios) e várias páginas mostram a prévia da Home ao serem compartilhadas.

### Onda 1 — Velocidade e fluidez ("clicou, abriu")
- Pré-carregar a página do imóvel ao passar o dedo/mouse no card e abrir com transição suave.
- Fotos em alta qualidade, mas no tamanho certo para cada tela (formato moderno, carregamento progressivo).
- Esqueletos de carregamento em tudo, sem "piscadas" nem saltos de layout.

### Onda 2 — Busca, filtros e mapa nível "portal grande"
- Busca única que entende tudo: bairro, condomínio, código, rua ou frase ("3 quartos com piscina no Bela Vista até 1,5 mi").
- Filtros mais rápidos: chips de filtros ativos, contagem ao vivo, "salvar busca" e alerta de novos imóveis por WhatsApp/e-mail.
- Mapa: desenhar área, "buscar nesta região", tempo até um endereço (trabalho/escola), pins de preço já implementados refinados.
- Ordenações úteis: mais novos, menor preço/m², baixou de preço.
- Comparar imóveis lado a lado.

### Onda 3 — Página do imóvel que converte
- Galeria em tela cheia com plantas e vídeo; custo mensal total (parcela + condomínio + IPTU).
- Preço do m² comparado ao bairro, histórico de preço, "o que tem perto".
- Botões fixos: WhatsApp, agendar visita, simular financiamento.

### Onda 4 — Google (ser muito mais encontrado)
- Mapa do site automático e sempre certo (imóveis, bairros, condomínios, empreendimentos, campanhas).
- Prévias corretas no WhatsApp/Google para todas as páginas; dados estruturados de imóvel, empreendimento e navegação.
- Páginas de bairro e de "tipo + bairro" mais ricas; páginas de lançamentos e campanhas otimizadas para Google Ads.

### Onda 5 — Leads e campanhas Google/Meta
- Páginas de destino por produto com formulário curto e WhatsApp, medição de conversões no Google e Meta.
- Origem do anúncio (campanha, palavra-chave) chega no CRM junto com o lead.
- Painel no admin: leads por campanha e por empreendimento.

### Onda 6 — Visual e acabamento
- Refinamento do design system (tipografia, espaçamentos, cores, ícones) e microinterações, mantendo a identidade Uhome.

## Detalhes técnicos
- Nova tabela `campanhas` (slug, nome, tema, datas, banner, textos, condições, ativo) + tabela de ligação `campanha_empreendimentos` (ordem, condição específica). RLS: leitura pública só das ativas e dentro do período; edição só admin.
- Campo `em_foco` em `empreendimentos` para a /lancamentos.
- Rotas `/lancamentos` e `/campanha/:slug` (também sob `/c/:slug` do corretor), SSR/SEO com JSON-LD, sitemap e canônico.
- Leads com `origem = campanha:<slug>` sincronizados pelos gatilhos do banco já existentes.
- Temas como conjuntos de cores no design system (sem cores fixas nos componentes).
