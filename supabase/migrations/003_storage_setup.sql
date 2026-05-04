-- Note: Storage buckets and policies must be created via Supabase Dashboard or API
-- This file contains the SQL commands for reference

-- Create storage bucket 'product-images' (must be done via Dashboard)
-- Bucket configuration:
-- - Name: product-images
-- - Public: true
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- After creating the bucket, apply these policies:

-- Policy: Public can view images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Policy: Admins can upload images
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can update images
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Admins can delete images
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- IMPORTANTE: 
-- 1. Crie o bucket 'product-images' via Supabase Dashboard em Storage
-- 2. Marque como 'Public bucket'
-- 3. Execute as policies acima no SQL Editor
-- 4. Configure o limite de tamanho de arquivo (5MB recomendado)
