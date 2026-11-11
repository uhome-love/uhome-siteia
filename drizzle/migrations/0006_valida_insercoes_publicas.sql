DROP POLICY IF EXISTS "Service can insert sync_log" ON public.sync_log;
CREATE POLICY "Admins can insert sync_log" ON public.sync_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Service can insert diagnostico_log" ON public.diagnostico_log;
CREATE POLICY "Admins can insert diagnostico_log" ON public.diagnostico_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER POLICY "Anyone can insert agendamentos" ON public.agendamentos WITH CHECK (
  length(coalesce(nome,'')) BETWEEN 1 AND 120 AND length(regexp_replace(coalesce(telefone,''),'\D','','g')) BETWEEN 10 AND 13
  AND length(coalesce(imovel_titulo,'')) <= 300 AND length(coalesce(horario,'')) <= 60 AND length(coalesce(turno,'')) <= 30
  AND coalesce(pg_column_size(contexto),0) <= 20000);
ALTER POLICY "Anyone can insert saved searches" ON public.buscas_salvas WITH CHECK (
  length(coalesce(email,'')) <= 255 AND length(coalesce(descricao_humana,'')) <= 500 AND coalesce(pg_column_size(filters),0) <= 5000);
ALTER POLICY captacao_insert_public ON public.captacao_imoveis WITH CHECK (
  length(coalesce(nome,'')) BETWEEN 1 AND 120 AND length(regexp_replace(coalesce(telefone,''),'\D','','g')) BETWEEN 10 AND 13
  AND length(coalesce(mensagem,'')) <= 2000 AND length(coalesce(bairro,'')) <= 120 AND coalesce(pg_column_size(dados_imovel),0) <= 10000);
ALTER POLICY insert_public ON public.corretor_visitas WITH CHECK (
  length(coalesce(corretor_slug,'')) <= 120 AND length(coalesce(user_agent,'')) <= 500 AND length(coalesce(referrer,'')) <= 1000);
ALTER POLICY "Anyone can insert views" ON public.imovel_views WITH CHECK (
  length(coalesce(imovel_id,'')) <= 100 AND length(coalesce(session_id,'')) <= 100);
ALTER POLICY "Anyone can insert lead_events" ON public.lead_events WITH CHECK (
  length(coalesce(tipo,'')) <= 60 AND length(coalesce(pagina,'')) <= 1000 AND length(coalesce(imovel_titulo,'')) <= 300
  AND length(coalesce(busca_query,'')) <= 500 AND coalesce(pg_column_size(busca_filtros),0) <= 5000 AND coalesce(pg_column_size(identidade),0) <= 5000);
ALTER POLICY "Anyone can insert notificacoes" ON public.notificacoes WITH CHECK (
  length(coalesce(tipo,'')) <= 60 AND length(coalesce(titulo,'')) <= 200 AND length(coalesce(mensagem,'')) <= 1000);
ALTER POLICY "Public can insert interacoes" ON public.vitrine_interacoes WITH CHECK (
  length(coalesce(tipo,'')) <= 60 AND length(coalesce(lead_nome,'')) <= 120 AND length(coalesce(lead_telefone,'')) <= 30 AND coalesce(pg_column_size(metadata),0) <= 5000);