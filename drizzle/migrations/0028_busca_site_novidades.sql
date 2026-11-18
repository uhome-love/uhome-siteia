DO $mig$
DECLARE d text := pg_get_functiondef('public.busca_site(jsonb)'::regprocedure);
BEGIN
  IF position('novidades' IN d) > 0 THEN RETURN; END IF;
  d := replace(d, $a$c.preco_condominio <= (p->>'condominioMax')::numeric)$a$,
    $b$c.preco_condominio <= (p->>'condominioMax')::numeric) AND
  (coalesce((p->>'novidades')::int,0)=0 OR c.publicado_em >= now() - make_interval(days => (p->>'novidades')::int))$b$);
  d := replace(d, $a$'coberturas',(SELECT count(*) FROM secao WHERE tipo='cobertura')$a$,
    $b$'coberturas',(SELECT count(*) FROM secao WHERE tipo='cobertura'),'novidades',(SELECT count(*) FROM secao WHERE publicado_em >= now() - interval '30 days')$b$);
  IF position('make_interval' IN d) = 0 OR position($c$'novidades',(SELECT$c$ IN d) = 0 THEN RAISE EXCEPTION 'busca_site: trecho não encontrado'; END IF;
  EXECUTE d;
END $mig$;