CREATE OR REPLACE FUNCTION public.sync_obra_status_from_avanco()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_obra_id uuid;
  latest_physical numeric;
BEGIN
  target_obra_id := COALESCE(NEW.obra_id, OLD.obra_id);

  SELECT percentual_fisico
    INTO latest_physical
  FROM public.marcos_avanco
  WHERE obra_id = target_obra_id
  ORDER BY data DESC, created_at DESC
  LIMIT 1;

  UPDATE public.obras
  SET status = CASE WHEN COALESCE(latest_physical, 0) >= 100 THEN 'concluida'::public.obra_status ELSE 'em_andamento'::public.obra_status END
  WHERE id = target_obra_id
    AND status IS DISTINCT FROM CASE WHEN COALESCE(latest_physical, 0) >= 100 THEN 'concluida'::public.obra_status ELSE 'em_andamento'::public.obra_status END;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS sync_obra_status_after_avanco ON public.marcos_avanco;
CREATE TRIGGER sync_obra_status_after_avanco
AFTER INSERT OR UPDATE OR DELETE ON public.marcos_avanco
FOR EACH ROW EXECUTE FUNCTION public.sync_obra_status_from_avanco();

UPDATE public.obras o
SET status = CASE
  WHEN COALESCE((SELECT m.percentual_fisico FROM public.marcos_avanco m WHERE m.obra_id = o.id ORDER BY m.data DESC, m.created_at DESC LIMIT 1), 0) >= 100
    THEN 'concluida'::public.obra_status
  ELSE 'em_andamento'::public.obra_status
END
WHERE o.status IS DISTINCT FROM CASE
  WHEN COALESCE((SELECT m.percentual_fisico FROM public.marcos_avanco m WHERE m.obra_id = o.id ORDER BY m.data DESC, m.created_at DESC LIMIT 1), 0) >= 100
    THEN 'concluida'::public.obra_status
  ELSE 'em_andamento'::public.obra_status
END;