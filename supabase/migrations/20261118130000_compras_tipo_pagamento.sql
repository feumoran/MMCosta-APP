-- Tipo de pagamento informado ao lançar a compra (PIX, boleto, transferência, cartão, dinheiro...).
ALTER TABLE public.compras ADD COLUMN IF NOT EXISTS tipo_pagamento text;
