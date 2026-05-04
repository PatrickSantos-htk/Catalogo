-- Enable Row Level Security on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active products (public access)
CREATE POLICY "Public can view active products"
  ON products
  FOR SELECT
  USING (active = true);

-- Policy: Admins can view all products
CREATE POLICY "Admins can view all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can insert products
CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can update products
CREATE POLICY "Admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can delete products
CREATE POLICY "Admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add comments
COMMENT ON POLICY "Public can view active products" ON products IS 'Permite que qualquer pessoa veja produtos ativos';
COMMENT ON POLICY "Admins can view all products" ON products IS 'Administradores podem ver todos os produtos, ativos ou inativos';
COMMENT ON POLICY "Admins can insert products" ON products IS 'Apenas administradores podem criar novos produtos';
COMMENT ON POLICY "Admins can update products" ON products IS 'Apenas administradores podem atualizar produtos';
COMMENT ON POLICY "Admins can delete products" ON products IS 'Apenas administradores podem excluir produtos';
