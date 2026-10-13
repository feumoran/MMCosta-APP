-- Match the existing boletins and boletim_itens read audience; do not change write policies.
ALTER POLICY boletim_estaca_read ON public.boletim_estaca TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'::public.app_role));
ALTER POLICY boletim_estaca_trecho_read ON public.boletim_estaca_trecho TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'::public.app_role));
ALTER POLICY boletim_tirante_read ON public.boletim_tirante TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'::public.app_role));
ALTER POLICY boletim_tirante_fase_read ON public.boletim_tirante_fase TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'::public.app_role));
ALTER POLICY boletim_concreto_item_read ON public.boletim_concreto_item TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'::public.app_role));