# Página de Lançamentos + Campanhas temáticas (Natal)

## Ideia geral
Criar um "hub" fixo de produtos em foco, que vocês controlam pelo painel admin, sem precisar mexer no site a cada troca de campanha.

```text
uhome.com.br/lancamentos            -> todos os empreendimentos com campanha ativa
uhome.com.br/campanha/natal-uhome   -> página temática de Natal (só os produtos dela)
uhome.com.br/campanha/<qualquer>    -> próximas campanhas (Black, Verão, Feirão, Mega Cyrela...)
uhome.com.br/empreendimentos/<slug> -> página do produto (já existe, destino dos anúncios Meta)
```

## 1. Vitrine fixa "Uhome em Foco" (/em-foco, com /lancamentos e /destaques levando para ela)
- Uma vitrine grande e bonita de todos os produtos com campanha no ar; o Natal é uma campanha à parte.
- Topo forte: "Uhome em Foco" + filtros rápidos (cidade, estágio: lançamento / em obras / pronto, faixa de preço, construtora).
- Faixa das campanhas ativas (ex.: banner do Natal) levando para a página da campanha.
- Grade de cards dos empreendimentos em foco: foto, nome, bairro, construtora, "a partir de R$", entrega, selo da campanha (ex.: "Condição de Natal").
- Bloco "Por que comprar na planta com a Uhome" + formulário de interesse + WhatsApp.
- Pronto para mostrar aos incorporadores e mandar para clientes.

## 2. Páginas de campanha /campanha/:slug (modelo reutilizável)
Cada campanha tem: nome, período (início/fim), tema visual, banner, título, texto, condições especiais (ex.: entrada facilitada, bônus, desconto) e a lista de empreendimentos.
- Natal: visual temático elegante (tons verde-escuro, dourado e vermelho suave, detalhes de brilho discretos), contagem regressiva até o fim da campanha, condições em destaque, produtos, formulário "Quero a condição de Natal".
- Quando a campanha vence, ela sai sozinha do ar (e da /lancamentos), com redirecionamento para /lancamentos — link nunca quebra.
- A Mega Cyrela atual pode virar uma campanha nesse mesmo modelo.

## 3. Landing page completa de cada produto (destino dos anúncios Meta e Google)
Foco em produto (empreendimento), não em imóvel avulso. Cada produto ganha uma página completa:
- Abertura em tela cheia com foto/vídeo, nome, construtora, "a partir de" e condição da campanha.
- Galeria grande em alta qualidade, tour/vídeo, plantas por tipologia (metragem, quartos, vagas, preço).
- Diferenciais e lazer com ícones, localização no mapa com o que tem perto, estágio da obra e entrega.
- Condições de pagamento e simulador de financiamento; unidades disponíveis puxadas do Jetimob.
- Perguntas frequentes, formulário curto e WhatsApp fixo, sempre visíveis.
- Selo e condição da campanha ativa, botão fixo de WhatsApp/formulário.
- Links com UTM do anúncio continuam sendo gravados e o lead chega ao CRM com o nome da campanha.
- Prévia bonita ao compartilhar no WhatsApp (imagem e título da campanha).

## 4. Painel admin "Campanhas"
- Criar/editar campanha, escolher tema, subir banner, definir datas, marcar quais empreendimentos entram e a ordem.
- Ligar/desligar campanha com um clique; marcar empreendimento como "Em foco" na /lancamentos.

## 5. Acesso fácil na página principal (uhome.com.br)
- Na abertura, junto da busca de todos os imóveis, um botão de destaque "Uhome em Foco".
- Logo abaixo, um banner grande da campanha ativa (ex.: "Natal Uhome"), trocado pelo painel; com mais de uma campanha, vira um carrossel.
- Faixa com os produtos em foco logo em seguida, antes das outras seções.
- Item "Uhome em Foco" no menu do topo e no rodapé, no celular e no computador.

## 6. Página personalizada do corretor (link para mandar no WhatsApp)
- Toda landing de produto, vitrine "Uhome em Foco" e página do Natal ganha uma versão do corretor: `uhome.com.br/c/<corretor>/em-foco/<produto>` (aproveita o link de corretor que já existe no site).
- Nessa versão não há formulário: aparece a foto, o nome, o CRECI e os botões de WhatsApp e ligar do corretor; o cliente fala direto com ele.
- Prévia no WhatsApp com a foto do produto e "Enviado por <corretor>".
- Cada abertura e clique no WhatsApp fica registrado e aparece no CRM para aquele corretor (o caminho de ligação com o CRM já existe).
- No Uhome Sales CRM (outro projeto), na Central de Natal, um botão "Copiar meu link" em cada empreendimento. Daqui eu deixo pronto o endereço e a lista de produtos para o CRM consumir e escrevo o pedido exato para colar no projeto do CRM.
- Teste completo: abrir o link de um corretor real (ex.: Lucas Sarmento), conferir dados, WhatsApp e o registro da visita.

## Material de Natal recebido: o que dá para usar
Já temos: nome e período da campanha (02/11 a 18/12), os 8 empreendimentos (Open Bosque, Essence Canoas, Open Arvoredo, Skyglass, Casa Tua Porto Alegre, Casa Tua Canoas, Boa Vista Country Club, Golden Lake), construtoras, preços por tipologia, selos, textos aprovados, urna premiada, posts, cards, vídeos e elementos visuais (chave de ouro, estrela, luzes, selo).

Falta para landings completas de produto:
1. Fotos originais em alta de cada empreendimento (fachada, lazer, decorado). O pacote cita "FOTO-01..." mas elas não vieram; os cards têm texto por cima e não servem como foto principal.
2. Endereço/bairro de cada um (o campo "local" está vazio em todos).
3. Plantas, metragens, vagas e previsão de entrega.
4. Descrição e lista de lazer/diferenciais de cada produto (só existe nos posts em imagem).
5. Logos das incorporadoras (pasta 07 não veio no arquivo).
6. Regulamento da urna para o cliente (veio só o dos corretores) e a condição da Black Natal (23 a 29/11), quando definida.
7. Material completo do Open Arvoredo (o próprio pacote diz que está faltando).

Se algum desses já estiver no Jetimob ou no cadastro de empreendimentos do site, eu puxo de lá.

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

### Onda 5b — Conversão página por página (padrão dos melhores portais)
Auditoria real, abrindo cada página no celular e no computador, com relatório de falhas antes de mexer.
- **Home:** busca em destaque, banner da campanha, "Uhome em Foco", prova social (vendas, anos, avaliações Google), WhatsApp sempre visível.
- **Busca:** "receber alertas deste filtro", "falar com especialista nesta região" após alguns imóveis vistos, sem resultados vira pedido de imóvel.
- **Página do imóvel/produto:** botões fixos (WhatsApp, agendar visita, simular), "quero saber a parcela", "imóveis parecidos", urgência real (unidades restantes, fim da condição).
- **Formulários:** no máximo 2 campos (nome e WhatsApp), máscara e validação do telefone, envio em 1 toque, confirmação imediata.
- **Captura:** saída da página, scroll profundo e retorno do visitante, sem exagero (limites já existentes).
- **WhatsApp:** mensagem já preenchida com o imóvel e a origem, rodízio de corretor e registro do clique.
- **Medição:** funil completo (visita, clique, formulário, WhatsApp) por página e por campanha no admin.

### Onda 5c — IA que qualifica o lead antes de chegar no corretor
- **Assistente Uhome no site:** conversa curta (no chat do site e após enviar o formulário) que pergunta objetivo (morar/investir), faixa de valor, entrada, uso de FGTS/financiamento, prazo para comprar e região.
- **Nota do lead (quente, morno, frio)** calculada pela IA com base nas respostas e no comportamento (imóveis vistos, tempo, filtros, voltas ao site).
- **Resumo pronto para o corretor** no CRM: "Busca 2 dorm. no Passo d'Areia, até R$ 350 mil, tem FGTS, quer comprar em 3 meses, viu Open Bosque 4x".
- **Sugestão automática** de 3 produtos compatíveis e agendamento de visita no próprio chat.
- Tudo enviado ao CRM pelos gatilhos do banco que já existem; a IA nunca sugere aluguel.

### Onda 6 — Visual e acabamento
- Refinamento do design system (tipografia, espaçamentos, cores, ícones) e microinterações, mantendo a identidade Uhome.

## Detalhes técnicos
- Nova tabela `campanhas` (slug, nome, tema, datas, banner, textos, condições, ativo) + tabela de ligação `campanha_empreendimentos` (ordem, condição específica). RLS: leitura pública só das ativas e dentro do período; edição só admin.
- Campo `em_foco` em `empreendimentos` para a vitrine; novos campos para a landing (vídeo, plantas, lazer, condições de pagamento, FAQ, estágio da obra).
- Rotas `/lancamentos` e `/campanha/:slug` (também sob `/c/:slug` do corretor), SSR/SEO com JSON-LD, sitemap e canônico.
- Leads com `origem = campanha:<slug>` sincronizados pelos gatilhos do banco já existentes.
- Temas como conjuntos de cores no design system (sem cores fixas nos componentes).
