-- RH (papel "engenharia") fica restrito a Comprovantes, Funcionários e Documentos das obras.
-- Curva planejada e marcos de avanço (painel da obra) deixam de ser legíveis pelo RH.
DROP POLICY IF EXISTS curva_read ON public.curva_planejada;
CREATE POLICY curva_read ON public.curva_planejada FOR SELECT TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));
DROP POLICY IF EXISTS marcos_read ON public.marcos_avanco;
CREATE POLICY marcos_read ON public.marcos_avanco FOR SELECT TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));
