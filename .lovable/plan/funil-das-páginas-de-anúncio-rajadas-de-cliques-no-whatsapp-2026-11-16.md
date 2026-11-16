# Funil das páginas de anúncio + rajadas de cliques no WhatsApp

## Parte 1 — Passos do funil (sem mudar nada visível)

Páginas: /em-foco/:slug, /campanha/natal-chave-de-ouro, /investir-studios, /busca (também com o prefixo de corretor /c/:corretor/...).

Eventos novos gravados no registro de passos do visitante:
- pagina_anuncio_vista — ao abrir a página.
- rolagem_50 — ao chegar à metade da página.
- galeria_aberta — ao abrir as fotos (galeria de material).
- formulario_iniciado — no primeiro toque em qualquer campo de formulário.

Regras:
- Cada evento no máximo 1 vez por sessão e por página (memória da sessão do navegador).
- Cada evento leva: fonte, utm_source, utm_campaign, se tem gclid (sim/não) e aparelho. Nunca nome, telefone ou e-mail.
- formulario_enviado e whatsapp_click passam a levar a mesma origem e aparelho.
- Sem peso no celular: gravação adiada para quando o navegador estiver ocioso, rolagem medida por um marcador invisível (sem escutar cada rolagem), envio sem esperar resposta.
- Nenhum texto, layout ou elemento visível muda.

## Parte 2 — Rajadas de cliques no WhatsApp (12 e 13/11)

O que já foi visto:
- 2 sessões concentram as rajadas: 1.460 registros (12/11) e 440 (13/11).
- Esses registros vieram da versão antiga do rastreio (sem os campos novos que começaram a ser gravados em 15/11), então foram gerados pela página publicada antes da troca.
- O código de produto tem um aviso de que o registro "deve ser chamado só no clique, nunca ao desenhar a tela" — indício de um defeito antigo de laço.

A fazer:
1. Confirmar a causa: comparar o ritmo dos registros (intervalos regulares de milissegundos = laço da página; irregular = robô) e revisar a página de campanha com prefixo de corretor por qualquer registro disparado fora do clique.
2. Se for defeito, corrigir na origem.
3. Em qualquer caso, limite no navegador: no máximo 1 clique de WhatsApp registrado por sessão a cada 5 segundos (o WhatsApp sempre abre normalmente).
4. Limite também no banco: uma regra que ignora um novo registro da mesma sessão em menos de 5 segundos (protege contra robôs que gravam direto).
5. Marcar ou apagar os ~1.900 registros das rajadas para não distorcer relatórios (vou perguntar antes de apagar).

## Verificação e entrega
- Testes automáticos: "1 vez por sessão/página", "sem dados pessoais", "limite de 5s no WhatsApp".
- Publicar, abrir no celular (390px) com gclid de teste, conferir os 4 eventos gravados e o limite do WhatsApp; apagar os registros de teste.
- Responder com a lista do que foi feito e a causa das rajadas.

## Detalhes técnicos
- trackEvent.ts: novos tipos; anexar origem resumida de getLeadTracking() (fonte, utm_source, utm_campaign, tem_gclid, device) num campo jsonb novo `origem` em lead_events (migração simples); identidade continua só para o CRM quando já existente, nunca nos eventos novos.
- Hook único useFunilAnuncio(paginaTipo) montado nas 4 páginas: pagina_anuncio_vista via requestIdleCallback; IntersectionObserver em sentinela absoluta a 50% da altura; focusin delegado no documento para formulario_iniciado; MaterialGallery chama o evento ao abrir.
- Dedup em sessionStorage com chave tipo+pathname.
- whatsappTracker.ts: throttle por session_id (5s) antes do envio; migração com gatilho BEFORE INSERT em whatsapp_clicks que descarta repetição da mesma session_id em <5s.
- Eventos novos não vão para o CRM (só o site), como hoje com visitantes anônimos.

---

## Parte 3 — Nova página de produto da campanha de Natal (/em-foco/:slug)

Objetivo: página limpa, bonita e objetiva, que leve a pessoa a um único passo — pedir as condições no WhatsApp/formulário. Menos faixas e banners, mais informação que decide a compra.

### Problemas da página atual
- Muitos blocos com o mesmo peso (abertura, resumo, condição, galeria, plantas, lazer, localização, ficha, lembrete, faixa) e várias chamadas competindo.
- Arte de Natal ocupa espaço de foto do produto; pouca prova visual do imóvel logo no início.
- Informação que decide (preço, tamanho, quartos, entrega, bairro) espalhada.

### Nova ordem (celular primeiro)
```text
1. Foto principal grande do produto (sem texto por cima, só um selo discreto "Natal Chave de Ouro")
   Nome · bairro · "a partir de R$ X" · botão "Quero as condições de Natal"
2. Faixa de 4 números: dormitórios · m² · vagas · entrega
3. Condição de Natal em um cartão único e claro (entrada, prazo até 18/12)
4. Galeria curada: 6 melhores fotos em grade, "ver todas" abre a galeria
5. Plantas em abas por tipologia, com preço de cada uma
6. "Por que este produto" — 3 a 4 destaques com ícone (lazer, localização, padrão)
7. Localização: mapa + 3 pontos próximos com distância
8. Formulário curto (nome + WhatsApp) com prova: nota 4,9 no Google, CRECI, atendimento rápido
9. Ficha técnica recolhida ("ver ficha completa")
```
- No computador: mesma ordem, com o formulário fixo à direita.
- Barra fixa no celular mantida (uma chamada só).
- Remover: faixa repetida e o cartão que aparece ao rolar (passam a ser redundantes com a barra fixa).
- Visual: tipografia e cinzas da marca, vermelho do Natal só em detalhes (selo, botão), muito espaço em branco.

### Fotos e materiais
- Produto: usar só material oficial da incorporadora (fotos, perspectivas, plantas) que já está cadastrado; vou selecionar as melhores e ordenar. Foto de banco de imagens nunca representa o produto (seria propaganda enganosa).
- Onde faltar material bom de algum produto, listo o que falta para pedir à incorporadora.
- Fotos de banco de alta qualidade só para o bairro/estilo de vida (ex.: parque, rua), identificadas como ilustrativas.

### Entrega
- Monto a nova página para os produtos da campanha, mantendo todos os textos de oferta já aprovados (sem promessa de tabela, sem MCMV/baixo preço).
- Prints no celular e no computador do antes e depois.
- Publico só depois da sua aprovação dos prints.

## Ordem geral
1. Parte 2 (limitar cliques repetidos) — rápido e protege os números.
2. Parte 1 (funil) — já instalado na página nova.
3. Parte 3 (nova página).
