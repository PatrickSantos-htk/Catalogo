-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  whatsapp_number TEXT NOT NULL,
  whatsapp_message TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE products IS 'Catálogo de produtos com informações completas';
COMMENT ON COLUMN products.id IS 'Identificador único do produto';
COMMENT ON COLUMN products.name IS 'Nome do produto';
COMMENT ON COLUMN products.description IS 'Descrição detalhada do produto';
COMMENT ON COLUMN products.price IS 'Preço do produto em reais';
COMMENT ON COLUMN products.category IS 'Categoria do produto';
COMMENT ON COLUMN products.stock IS 'Quantidade em estoque';
COMMENT ON COLUMN products.images IS 'Array de URLs das imagens do produto';
COMMENT ON COLUMN products.specifications IS 'Especificações técnicas em formato JSON';
COMMENT ON COLUMN products.whatsapp_number IS 'Número do WhatsApp para contato (apenas dígitos)';
COMMENT ON COLUMN products.whatsapp_message IS 'Mensagem personalizada para o WhatsApp';
COMMENT ON COLUMN products.active IS 'Se o produto está ativo e visível no catálogo';
