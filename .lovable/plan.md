# O que falta — Uhome · Site

## 1. Agora (depende só de publicar)
1. Publicar o app: busca compacta no celular + fotos de card menores (480x432, q62).
2. Logo após publicar: ligar a chave da foto nova na tela pronta (UH_FOTO_CARD=1) e renovar o cache das 5 URLs + /busca. Sem isso, a tela pronta e o app usam fotos diferentes e o LCP piora.
3. Central mede /busca, /lancamentos-porto-alegre e /imoveis-canoas (meta 2,5 s) e testa um pedido normal (depois apaga).

## 2. Travados por algo de fora
- /sitemap.xml automático: a central precisa encaminhar para o sitemap dinâmico (sem mexer no Worker).
- Miniaturas próprias de fotos novas: precisam do envio de imagens pela central.
- Jornada sem cartão no CRM: CRM precisa criar o campo leads.dados_site.
- Pixel Meta: falta conectar e informar o ID.

## 3. Próximas partes do visual novo (segundo o design "Site Uhome")
- Página do imóvel (/imovel): Agendar visita como ação principal e "Receber informações" como secundária, tour pelas fotos (com "Ainda sem fotos por dentro"), sem "Preço acima do mercado" para o comprador, corretor real (nome, CRECI, foto, frase) quando houver.
- Favoritos em pastas: nota por imóvel, compartilhar pasta, "Agendar as visitas" num dia, login por WhatsApp.
- Home no visual novo: frase "Você e seu novo lar.", primeira fileira de imóveis na primeira tela do computador, campanha depois.
- Conversa com a Lia no celular, no visual do design.
- Movimento e estados (tempos 150/250/280/420 ms, coração salvo).

## 4. Correções de dados vistas no design (conferir antes de mexer)
- /apartamentos-petropolis com 0 imóveis (acento em Petrópolis).
- Áreas com ponto ("75.45 m²") e preço errado (75 m² a R$ 795 no Farroupilha).
- Selo "Novo no site" em todos os cards; emojis e "Corretor disponível agora".
- Itens de conteúdo que são da equipe, não do código: marca d'água nas fotos, placa RE/MAX na capa 20415-PJ, plantas do Open Arvoredo com áreas diferentes do texto, 28238-UH sem fotos internas.

## Sugestão de ordem
1 → 2 em paralelo → Parte 4 (Imóvel) → Favoritos → Home → Lia/Movimento, com as correções de dados da seção 4 junto da parte da busca/imóvel.

## Detalhes técnicos
- A chave UH_FOTO_CARD é um segredo da função site-dobra; padrão desligado, mantém o app publicado compatível.
- Toda parte nova continua: modelo versionado da tela pronta só com app novo, Worker intacto, lista de robôs intacta, sem lead de teste pelo agente.
