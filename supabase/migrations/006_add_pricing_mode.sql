-- Add pricing mode to products so each item can be configured as
-- "somente orçamento" or "valor inicial".
ALTER TABLE products
ADD COLUMN IF NOT EXISTS pricing_mode TEXT NOT NULL DEFAULT 'quote';

-- Ensure existing rows preserve the current public behavior.
UPDATE products
SET pricing_mode = 'quote'
WHERE pricing_mode IS NULL;

-- Replace the original price constraint so quote-only items can keep 0
-- while items with visible starting price must remain positive.
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_price_check;

ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_pricing_mode_check;

ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_price_pricing_mode_check;

ALTER TABLE products
ADD CONSTRAINT products_pricing_mode_check
CHECK (pricing_mode IN ('quote', 'starting_price'));

ALTER TABLE products
ADD CONSTRAINT products_price_pricing_mode_check
CHECK (
  (pricing_mode = 'quote' AND price >= 0)
  OR (pricing_mode = 'starting_price' AND price > 0)
);

COMMENT ON COLUMN products.price IS 'Valor inicial do produto/serviço quando pricing_mode = starting_price';
COMMENT ON COLUMN products.pricing_mode IS 'Define se o item exibe valor inicial ou funciona somente por orçamento';