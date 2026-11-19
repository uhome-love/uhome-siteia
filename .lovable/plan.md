# Busca na Home + auditoria e campanhas de lead

## 1. Resposta: a Home precisa mandar a pessoa buscar?
Precisa, sim. O Airbnb põe a busca como a primeira coisa da tela, e quase todo visitante começa por ela. No nosso celular, a barra "Onde vai ser seu novo lar?" fica no topo, mas parece um cabeçalho e não um convite. Quem chega por anúncio quase nunca rola a tela até "Novos no site".
O que fazer:
- Barra de busca maior e mais à vista no topo da Home, com o texto "Buscar imóveis" e as dicas "cidade, bairro ou código".
- Logo abaixo, atalhos de 1 toque: Porto Alegre, Canoas, Litoral, Na planta, Até R$ 500 mil. Cada um abre a busca já filtrada.
- "Continue de onde parou" aparece primeiro para quem já visitou o site.
- Vamos medir quantas pessoas tocam na busca, nos atalhos e nos cards, para saber se a mudança funcionou.

## 2. Auditoria dos anúncios (Google Ads, últimos 30 dias)
- 3 campanhas: Natal Chave de Ouro, Imóveis do Site e Investimento em Studios.
- Gasto de cerca de R$ 620, com 3 leads registrados e 6 cliques no WhatsApp.
- "Visita agendada" e "Visita realizada" estão zeradas.
- Os anúncios já levam às páginas novas de produto, à Natal e à busca. Falta conferir cada página e o tempo de abertura.
- Studios gastou R$ 149 sem nenhum lead. A página dele é antiga, então vai para revisão.
- Hoje os lances buscam cliques ("máximo de cliques"), e não leads.

## 3. Estrutura de campanhas de lead
- **Natal (até 18/12):** cada produto em Foco tem o seu grupo e o seu anúncio, levando à página dele. Visita agendada e formulário contam como objetivo.
- **Imóveis do Site:** grupos por intenção ("apartamento Porto Alegre", "apartamento Canoas", "Litoral", "na planta"). Cada grupo leva à busca já filtrada, com o mapa e o "Salvar busca".
- **Studios:** levar para uma página no padrão novo, ou pausar se continuar sem leads.
- Palavras negativas: aluguel, MCMV, FGTS, barato, emprego, corretor.
- Textos dos anúncios iguais à oferta da página, para o anúncio e a página prometerem o mesmo.
- Os lances só mudam para "maximizar conversões" quando houver leads suficientes. Até lá, ficam por cliques com limite.
- Nenhuma mudança de verba sem a sua aprovação.

## 4. Rastreamento da jornada
- Verificar de ponta a ponta, com um lead de teste que a central apaga depois: formulário, agendamento, "Salvar busca", Lia e WhatsApp chegam ao Google Ads com valor (visita R$ 100, formulário R$ 50).
- Enviar ao Google o código do clique (gclid) junto com o lead, para o CRM devolver a "Visita realizada" como conversão de qualidade.
- Contar "Salvar busca" e "Comparar" como conversões secundárias.
- Pixel da Meta continua desligado até termos o número.

## 5. Entrega
Um documento de auditoria com o placar de cada anúncio e de cada página, e a lista do que foi alterado. As mudanças nas campanhas só valem depois que você aprovar no cartão.

## Detalhes técnicos
- HomeVitrine: barra de busca em destaque e atalhos (links com URL de filtros), eventos `home_busca_click` e `home_atalho_click`.
- Google Ads via mutate: grupos e palavras-chave, negativas e RSAs. Conferir o vínculo das conversões com gtag `send_to` e a deduplicação.
- gclid/gbraid guardados na chegada (session) e enviados ao contexto do lead e ao CRM, para depois subir a conversão offline.
- É preciso publicar o site antes de mexer nos anúncios.

## 6. Busca abre mais leve no celular
Hoje, 75% das visitas veem a foto principal em até 4,5 s. A meta é 2,5 s.
- Medir o que a busca baixa ao abrir, peça por peça, na versão final do site.
- Deixar para depois da primeira tela o que não aparece nela: filtros completos, mapa, "Salvar busca", calendário, Lia e as medições.
- Cortar bibliotecas pesadas que a primeira tela não usa, e o que a busca baixa duas vezes.
- Medir de novo no celular simulado lento e comparar com 3,8 s.
- Depois de publicar, medir com os visitantes reais.

Detalhes técnicos: analisar o bundle de /busca (vite build + rollup visualizer em /tmp). Usar import dinâmico para SearchFilterDialog, BuscaEtapas, SalvarBusca e framer-motion onde estiver na rota. Conferir que o cliente do banco continua fora da entrada. Sem manualChunks.
