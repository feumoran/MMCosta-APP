-- RH (engenharia) deixa de ler boletins. Boletim e detalhes usam o mesmo predicado.
DROP POLICY IF EXISTS boletins_read ON public.boletins;
CREATE POLICY boletins_read ON public.boletins FOR SELECT TO authenticated USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));
DROP POLICY IF EXISTS boletim_itens_read ON public.boletim_itens;
CREATE POLICY boletim_itens_read ON public.boletim_itens FOR SELECT TO authenticated USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));
DROP POLICY IF EXISTS boletim_estaca_read ON public.boletim_estaca;
CREATE POLICY boletim_estaca_read ON public.boletim_estaca FOR SELECT TO authenticated USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));
DROP POLICY IF EXISTS boletim_estaca_trecho_read ON public.boletim_estaca_trecho;
CREATE POLICY boletim_estaca_trecho_read ON public.boletim_estaca_trecho FOR SELECT TO authenticated USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));
DROP POLICY IF EXISTS boletim_tirante_read ON public.boletim_tirante;
CREATE POLICY boletim_tirante_read ON public.boletim_tirante FOR SELECT TO authenticated USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));
DROP POLICY IF EXISTS boletim_tirante_fase_read ON public.boletim_tirante_fase;
CREATE POLICY boletim_tirante_fase_read ON public.boletim_tirante_fase FOR SELECT TO authenticated USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));
DROP POLICY IF EXISTS boletim_concreto_item_read ON public.boletim_concreto_item;
CREATE POLICY boletim_concreto_item_read ON public.boletim_concreto_item FOR SELECT TO authenticated USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));
DROP POLICY IF EXISTS boletins_storage_read ON storage.objects;
CREATE POLICY boletins_storage_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'boletins' AND (public.can_manage() OR public.has_role(auth.uid(), 'leitura')));
