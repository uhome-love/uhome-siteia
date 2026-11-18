DO $do$
DECLARE d text;
BEGIN
  d := pg_get_functiondef('public.busca_site(jsonb)'::regprocedure);
  IF position('c.cidade=p->>''cidade''' in d) = 0 THEN RAISE EXCEPTION 'trecho de cidade não encontrado'; END IF;
  d := replace(d, 'c.cidade=p->>''cidade''', 'public.busca_normalizar(c.cidade)=public.busca_normalizar(p->>''cidade'')');
  EXECUTE d;
END
$do$;