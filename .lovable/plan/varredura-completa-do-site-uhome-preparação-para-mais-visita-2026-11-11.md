# Varredura completa do site Uhome (preparação para mais visitas)

Objetivo: testar o site inteiro e entregar uma lista do que melhorar, por prioridade. Nesta etapa nada é alterado, só testado e reportado. As correções vêm depois, com a sua aprovação.

## O que será testado

1. **Velocidade e estabilidade**
   - Tempo de abertura da Home, busca, página de imóvel, campanha Natal, studios e Em Foco, no celular e no computador.
   - Peso das fotos e das páginas, travamentos e erros que aparecem para o visitante.
   - Como o banco de dados e as funções do site respondem com mais acessos (consultas lentas, limites, saúde geral).

2. **Celular (onde chega a maior parte do anúncio)**
   - Home, busca com mapa, filtros, página de imóvel, comparador do Natal, studios.
   - Textos cortados, botões pequenos, coisas fora da tela, fotos quebradas.

3. **Contato e leads (o mais importante com o anúncio ligado)**
   - Formulários, botão de WhatsApp, LIA e agendamento de visita.
   - Conferir que tudo chega no CRM com campanha e palavra buscada, e que a conversão do Google Ads dispara.
   - Testes marcados como TESTE e apagados no final, no site e no CRM.

4. **Google orgânico (SEO)**
   - Revisão automática de títulos, descrições, links quebrados e páginas que não abrem.
   - Mapa do site, prévias no WhatsApp e dados para o Google nas páginas principais.

5. **Segurança e dados**
   - Varredura de segurança do banco de dados e das funções.
   - Conferir que dados de clientes (leads, visitas) não ficam abertos ao público.

6. **Erros já registrados**
   - Leitura dos erros e avisos recentes do site e das funções.

## O que você recebe

Um relatório em português, separado em:
- **Urgente** (perde lead ou dinheiro do anúncio)
- **Importante** (experiência e Google)
- **Melhorias** (pode esperar)

Cada item com o que acontece, onde e a correção sugerida.

## Limitação conhecida

O site publicado bloqueia meu navegador de teste (proteção do Cloudflare). Testo a versão de pré-visualização, que é a mesma do site, e confirmo o publicado por leitura direta das páginas quando possível.

## Detalhes técnicos

- Playwright em 390px e 1280px nas rotas principais; métricas de carregamento e console.
- seo_chat trigger_scan + list_findings; security run_security_scan; supabase linter, db_health, slow_queries; edge_function_logs de lia-chat, sync-to-crm, ssr-render.
- Teste ponta a ponta via lia-chat e formulários com limpeza dos registros de teste.
