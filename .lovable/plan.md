

# Diagnóstico da Integração Site → CRM UhomeSales

## Situação Atual

### O que ESTÁ funcionando:
- Leads são enviados e chegam no CRM (todos os recentes têm `uhomesales_lead_id` e `sincronizado_em` preenchidos)
- WhatsApp clicks são registrados com sucesso
- Corretores são sincronizados
- O payload inclui observações completas e origem humanizada

### Problemas encontrados:

**1. Triggers DUPLICADOS — causa dos erros "duplicate key"**
Cada tabela tem **2 triggers** que fazem a mesma coisa:
- `public_leads`: `on_lead_created` + `trg_sync_lead_to_crm` (ambos chamam `trigger_sync_lead_to_crm`)
- `agendamentos`: `on_agendamento_with_corretor` (com WHEN) + `trg_sync_agendamento_to_crm` (sem WHEN)
- `captacao_imoveis`: `on_captacao_with_corretor` (com WHEN) + `trg_sync_captacao_to_crm` (sem WHEN)
- `whatsapp_clicks`: `on_whatsapp_click_with_corretor` (com WHEN) + `trg_sync_whatsapp_to_crm` (sem WHEN)

Resultado: cada lead dispara a Edge Function **2 vezes**. A 1ª insere no CRM ok, a 2ª falha com `duplicate key value violates unique constraint "leads_site_lead_id_key"`.

**2. Leads do floating_whatsapp sem dados de imóvel**
Os 5 leads mais recentes vieram do `floating_whatsapp` e todos têm:
- `imovel_slug: null`
- `imovel_bairro: null`
- `imovel_preco: null`
- `imovel_titulo: "Encontre o imóvel perfeito para você"` (texto genérico do h1 da home)

Isso porque o FloatingWhatsApp tenta extrair dados da página mas na home/busca não há imóvel específico.

## Plano de Correção

### Passo 1: Remover triggers duplicados (migração SQL)
Dropar os triggers antigos `on_lead_created`, `on_agendamento_with_corretor`, `on_captacao_with_corretor`, `on_whatsapp_click_with_corretor` — manter apenas os `trg_sync_*` (que não têm WHEN e cobrem todos os cenários).

### Passo 2: Corrigir FloatingWhatsApp para enviar dados reais do imóvel
Quando o usuário está na página `/imovel/:slug`, o componente já tenta ler o título do h1. Melhorar a extração para pegar também slug, bairro e preço dos metadados da página ou do DOM.

### Passo 3: Adicionar upsert no sync-to-crm
Mudar o `insert` do CRM para `upsert` com `onConflict: 'site_lead_id'` — assim mesmo que a trigger dispare 2x, não dá erro (apenas atualiza o mesmo registro).

---

## Prompt para Conferência no CRM (UhomeSales)

Rode estas consultas no banco do CRM para validar:

```text
-- 1. Últimos 10 leads recebidos do site
SELECT id, nome, telefone, imovel_interesse, origem_detalhe, 
       atribuido_para, status, created_at 
FROM leads 
WHERE origem = 'site_uhome' 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verificar se há leads duplicados por site_lead_id
SELECT site_lead_id, COUNT(*) 
FROM leads 
WHERE origem = 'site_uhome' AND site_lead_id IS NOT NULL
GROUP BY site_lead_id 
HAVING COUNT(*) > 1;

-- 3. Verificar leads sem imovel_interesse preenchido
SELECT id, nome, telefone, origem_detalhe, observacoes, created_at
FROM leads 
WHERE origem = 'site_uhome' AND imovel_interesse IS NULL
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Verificar se atribuido_para aponta para corretores válidos
SELECT l.id, l.nome, l.atribuido_para, p.nome as corretor_nome
FROM leads l
LEFT JOIN profiles p ON l.atribuido_para = p.id
WHERE l.origem = 'site_uhome' AND l.atribuido_para IS NOT NULL
ORDER BY l.created_at DESC
LIMIT 10;

-- 5. Verificar notificações criadas para os corretores
SELECT id, user_id, tipo, titulo, mensagem, created_at
FROM notificacoes
WHERE tipo IN ('novo_lead', 'lead_site', 'agendamento')
ORDER BY created_at DESC
LIMIT 10;
```

---

## Resumo Técnico

| Item | Status | Ação |
|------|--------|------|
| Leads chegam no CRM | ✅ OK | — |
| Dados completos (observações) | ✅ OK | — |
| Rótulos humanizados | ✅ OK | — |
| Triggers duplicados causando erros | ⚠️ Problema | Remover triggers antigos |
| Dados de imóvel vazios (floating_whatsapp na home) | ⚠️ Problema | Melhorar extração no FloatingWhatsApp |
| Proteção contra duplicatas no CRM | ⚠️ Frágil | Usar upsert em vez de insert |

