-- Add is_promotion field to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT false;

-- Create index for faster queries on promotions
CREATE INDEX IF NOT EXISTS idx_products_is_promotion ON products(is_promotion);

-- Add comment for documentation
COMMENT ON COLUMN products.is_promotion IS 'Indica se o produto está em promoção';
