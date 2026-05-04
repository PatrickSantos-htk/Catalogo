-- Script para criar o primeiro usuário admin
-- 
-- INSTRUÇÕES:
-- 1. Primeiro, crie um usuário normalmente pela interface do Supabase ou via signup
-- 2. Depois, execute este comando substituindo 'seu@email.com' pelo email do usuário
-- 3. O usuário precisará fazer logout e login novamente para as mudanças terem efeito

-- Tornar um usuário existente em admin
UPDATE auth.users 
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
    ELSE raw_user_meta_data || '{"role": "admin"}'::jsonb
  END
WHERE email = 'seu@email.com';

-- Verificar se o usuário foi atualizado corretamente
SELECT 
  id,
  email, 
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users 
WHERE email = 'seu@email.com';

-- ALTERNATIVA: Criar um novo usuário admin diretamente (avançado)
-- Nota: Normalmente você deve criar usuários via API ou interface
-- Este é apenas um exemplo de referência

/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@exemplo.com',
  crypt('sua_senha_aqui', gen_salt('bf')), -- Requer extensão pgcrypto
  now(),
  '{"role": "admin"}'::jsonb,
  now(),
  now()
);
*/
