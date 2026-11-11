DROP POLICY IF EXISTS cat_read ON public.categorias_lancamento;
CREATE POLICY cat_read ON public.categorias_lancamento FOR SELECT TO authenticated
  USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));