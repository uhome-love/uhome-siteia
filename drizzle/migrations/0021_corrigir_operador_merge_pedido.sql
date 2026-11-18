DO $$ DECLARE d text; BEGIN
 d:=pg_get_functiondef('public.site_merge_pedidos(jsonb,jsonb)'::regprocedure);
 d:=replace(d,'x->>''id''=p->>''id''','(x->>''id'')=(p->>''id'')');
 d:=replace(d,'old_context ? ''primeira_origem''','(old_context ? ''primeira_origem'')');
 d:=replace(d,'incoming->''pedido''','(incoming->''pedido'')');
 EXECUTE d;
END $$;