# Jornada do site — contrato UhomeSales v1

## Transporte
A integração do site mantém `sync-to-crm` e atualiza `pipeline_leads.dados_site` no CRM existente, sem alterar o esquema nem telas do CRM. Não foi criado um novo endpoint receptor. Cada evento canônico aceito após identificação dispara o mesmo transporte por gatilho, com referência de registro e autorização de uso único. Os dados anteriores de `dados_site` são preservados. `dados_site.site_events` contém a mesma lista de `dados_site.jornada.site_events`.

## Formato exato
```ts
interface Origem {
  at?: string; // ISO UTC
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_content?: string; utm_term?: string;
  gclid?: string; gbraid?: string; wbraid?: string; fbclid?: string;
  referrer?: string; landing_page?: string; landing_url?: string;
}
interface Evento {
  event_id: string; visitor_id: string; session_id: string;
  tipo: string; pagina: string;
  imovel: { slug: string | null; titulo: string | null };
  dados: Record<string, unknown>;
  quando: string; is_bot: false;
}
interface Jornada {
  schema_version: 1; visitor_id: string; visitor_ids: string[];
  janela_dias: 90; primeira_origem: Origem; ultima_origem: Origem;
  numero_visitas: number; primeira_visita: string;
  imoveis_vistos: { slug: string | null; titulo: string | null; vezes: number }[];
  buscas: ({ quando: string } & Record<string, unknown>)[];
  filtros: ({ quando: string } & Record<string, unknown>)[];
  favoritos: ({ imovel: Evento['imovel'] } & Record<string, unknown>)[];
  pedido: Evento | null; pedidos: Evento[]; site_events: Evento[];
}
// Mesclado aos campos já existentes:
interface DadosSite { visitor_id: string; jornada: Jornada; site_events: Evento[]; }
```
Campos ausentes de origem são omitidos, não inventados. `pagina` contém só caminho, sem parâmetros de contato. `dados` usa lista permitida (filtros, seção, categoria, foto_index, formulário, dia/período/horário, assunto/planta, imóvel, botão e números de simulação). Nunca inclui nome, telefone, e-mail ou texto livre da LIA/busca. Contatos continuam exclusivamente no lead.

Imóvel tem slug original; produto usa `em-foco/<slug>`. Pedido de visita inclui `dados.dia`, `dados.periodo`, `dados.horario` quando existente, e `dados.planta`; informações incluem `dados.assunto` e `dados.planta`. `pedido` é a última ação de interesse; `pedidos` conserva as anteriores. Favoritos são ações de salvamento (não lista atual removida).

Eventos: pagina_vista, busca_feita, categoria_tocada, filtro_aplicado, imovel_visto, foto_aberta, favorito_salvo, dia_escolhido, formulario_iniciado, visita_pedida, informacoes_pedidas, lia_aberta, lia_lead, whatsapp_tocado, simulacao_feita, pedido_corretor, rolagem_50, pagina_anuncio_vista.
Aliases legados até 17/12/2026 05:06 UTC: imovel_visualizado, busca_realizada, whatsapp_click, galeria_aberta, formulario_enviado. Aliases não entram duas vezes na jornada enviada. Telas inexistentes não produzem eventos.

## Evidência observada
Visitante de teste `39b19c57-5604-4dae-af9e-9ccfcab66839`:
- sessões `38a8b226-c54d-4bb0-b00d-5166fc4df8fa`, `000a745b-e530-40db-bed3-2f484286e8ba`, `a340ee1a-6ed4-4685-a582-9fee8db91aba`;
- primeiro Google / teste_jornada, retorno Meta / teste_retorno;
- contato por informações e visita de 18/11/2026 à tarde; um único public_leads `4fb47a26-a580-423f-bf4a-0271a1cebebd`;
- CRM lead `5e94df6c-275e-419f-bc7d-03b6246a316c`;
- entregas confirmadas, crescimento de 30 até 36 eventos (inclui tentativas anteriores deste contato de teste); após contato, Open Arvoredo também enviado;
- dois registros solicitados para mesmo botão imediatamente: 1 registro aceito, 0 duplicações abaixo de 2 segundos.
Teste realizado no celular 390×844, sem erros de execução; imagens próprias não renderizam no localhost, limitação do ambiente de mídia, sem alteração de fotos.

## Consultas de auditoria
```sql
WITH clicks AS (
 SELECT session_id, button_key, created_at,
 lag(created_at) OVER (PARTITION BY session_id,button_key ORDER BY created_at) AS anterior
 FROM public.whatsapp_clicks
 WHERE button_key IS NOT NULL AND is_bot = false
)
SELECT count(*) AS registros,
 count(*) FILTER (WHERE created_at-anterior < interval '2 seconds') AS duplicados
FROM clicks;

SELECT created_at::date AS dia,
 count(*) FILTER (WHERE is_bot=true) AS marcados_robo,
 count(*) FILTER (WHERE is_bot=false) AS humanos,
 count(*) FILTER (WHERE is_bot IS NULL) AS historico_sem_classificacao
FROM public.lead_events
WHERE created_at >= '2026-11-09'
GROUP BY 1 ORDER BY 1;

SELECT status,event_count,crm_lead_id,error,sent_at
FROM public.site_journey_deliveries
WHERE visitor_id='39b19c57-5604-4dae-af9e-9ccfcab66839'
ORDER BY created_at;
```

## Limites e pendências explícitos
- Antes desta implantação não havia user agent ou evidência de toque/rolagem em cada sessão: não é possível classificar retroativamente 9–13/11 como robô com honestidade. Histórico fica `is_bot=NULL`, não convertido em humano. As repetições históricas são atribuídas ao rastreamento dentro da função que gerava links durante renderização (confirmado no histórico do código); o contador por segundo repetia os produtos.
- Sessões novas sem interação ficam provisoriamente como robô e passam a humanas ao toque/rolagem; crawlers permanecem robôs. Medições usam `is_bot=false`. Isso é heurística, não prova infalível de pessoa.
- Cookies da jornada exigem análise permitida; recusa remove identificadores locais e interrompe novos eventos. Contato necessário ao atendimento continua. Jornada só cobre este navegador ou visitantes ligados pelo mesmo telefone informado, nunca identidade de todos os navegadores sem contato.
- IDs, valores e prioridades Google Ads não foram alterados. Nomes canônicos são enviados para GA4/Google Ads como eventos, sem criar conversões novas ou mudar principal/secundária da conta. Meta recebe `trackCustom` apenas se Pixel estiver instalado e publicidade permitida; a conexão/ID Meta não estão configurados neste projeto, portanto recebimento Meta não foi validado.
- Falhas de entrega ficam pendentes; não há retentativa automática agendada nesta implementação. Uma nova entrega bem-sucedida envia novamente toda a janela de 90 dias. Exibição/consumo no CRM pertence ao pedido separado.
- Frontend precisa ser publicado; funções e alterações do banco já foram aplicadas.
