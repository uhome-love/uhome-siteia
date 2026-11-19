DO $$
DECLARE d text;
BEGIN
  d := pg_get_functiondef('public.busca_site(jsonb)'::regprocedure);
  d := replace(d, $r$AND coalesce(preco,0)<=0 THEN 1 ELSE 0 END /* preco_sem_valor_ultimo */$r$, $r$AND coalesce(preco,0)<1000 THEN 1 ELSE 0 END /* preco_sem_valor_ultimo */$r$);
  EXECUTE d;
END $$;