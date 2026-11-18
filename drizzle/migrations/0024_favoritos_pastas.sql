CREATE TABLE public.favorito_pastas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 local_id text NOT NULL,
 nome text NOT NULL,
 ordem int NOT NULL DEFAULT 0,
 itens jsonb NOT NULL DEFAULT '[]'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id, local_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorito_pastas TO authenticated;
GRANT ALL ON public.favorito_pastas TO service_role;
ALTER TABLE public.favorito_pastas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dono le" ON public.favorito_pastas FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "dono cria" ON public.favorito_pastas FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "dono altera" ON public.favorito_pastas FOR UPDATE TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE POLICY "dono apaga" ON public.favorito_pastas FOR DELETE TO authenticated USING (auth.uid()=user_id);

CREATE TABLE public.favorito_pastas_compartilhadas (
 token text PRIMARY KEY,
 nome text NOT NULL,
 imoveis text[] NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.favorito_pastas_compartilhadas TO service_role;
ALTER TABLE public.favorito_pastas_compartilhadas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.compartilhar_pasta(p_nome text, p_imoveis text[])
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','extensions' AS $$
DECLARE t text := encode(gen_random_bytes(12),'hex');
BEGIN
 IF coalesce(array_length(p_imoveis,1),0)=0 OR array_length(p_imoveis,1)>60 THEN RAISE EXCEPTION 'pasta inválida'; END IF;
 INSERT INTO public.favorito_pastas_compartilhadas(token,nome,imoveis) VALUES(t,left(coalesce(nullif(trim(p_nome),''),'Favoritos'),60),p_imoveis);
 RETURN t;
END $$;
CREATE OR REPLACE FUNCTION public.pasta_compartilhada(p_token text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
 SELECT jsonb_build_object('nome',nome,'imoveis',to_jsonb(imoveis)) FROM public.favorito_pastas_compartilhadas WHERE token=p_token;
$$;
GRANT EXECUTE ON FUNCTION public.compartilhar_pasta(text,text[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pasta_compartilhada(text) TO anon, authenticated;