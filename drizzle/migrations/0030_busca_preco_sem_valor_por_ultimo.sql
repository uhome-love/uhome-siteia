DO $$
DECLARE d text;
BEGIN
  d := pg_get_functiondef('public.busca_site(jsonb)'::regprocedure);
  IF position('preco_sem_valor_ultimo' in d) = 0 THEN
    d := replace(d, $r$ CASE WHEN p->>'ordem'='preco_asc' THEN preco END ASC,$r$,
      $r$ CASE WHEN p->>'ordem' IN ('preco_asc','preco_desc') AND coalesce(preco,0)<=0 THEN 1 ELSE 0 END /* preco_sem_valor_ultimo */,
 CASE WHEN p->>'ordem'='preco_asc' THEN preco END ASC,$r$);
    EXECUTE d;
  END IF;
END $$;