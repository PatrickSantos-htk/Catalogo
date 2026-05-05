# Guia de Configuração Rápida

## ✅ Estrutura Criada

A estrutura completa do projeto foi criada com sucesso! Todos os arquivos estão prontos para uso.

## 🚀 Próximos Passos

### 1. Instale as Dependências (Se ainda não instalou)

```bash
npm install
```

### 2. Configure o Supabase

#### 2.1. Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha os dados:
   - **Name**: catalogo-produtos (ou nome de sua escolha)
   - **Database Password**: escolha uma senha segura
   - **Region**: escolha a região mais próxima (ex: South America - São Paulo)
4. Clique em "Create new project" e aguarde alguns minutos

#### 2.2. Configure o Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em "+ New query"
3. Copie e cole o conteúdo de `supabase/migrations/001_create_products_table.sql`
4. Clique em "Run" (ou pressione Ctrl+Enter)
5. Repita o processo para `supabase/migrations/002_enable_rls.sql`

#### 2.3. Configure o Storage

1. No dashboard, vá em **Storage** (ícone de pasta no menu lateral)
2. Clique em "Create a new bucket"
3. Preencha:
   - **Name**: `product-images`
   - Marque **Public bucket**: ✅ (importante!)
4. Clique em "Create bucket" e depois em "Save"
5. Volte ao **SQL Editor** e execute `supabase/migrations/003_storage_setup.sql`

#### 2.4. Obtenha as Credenciais

1. Vá em **Settings** (ícone de engrenagem) > **API**
2. Copie:
   - **Project URL** (algo como `https://xxx.supabase.co`)
   - **anon public key** (uma chave longa começando com `eyJ...`)

### 3. Configure as Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```

2. Abra o `.env` e atualize com suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
   ```

### 4. Crie o Primeiro Usuário Admin

#### 4.1. Crie um usuário no Supabase
1. No dashboard, vá em **Authentication** > **Users**
2. Clique em "Add user" > **Create new user**
3. Preencha:
   - **Email**: seu@email.com
   - **Password**: sua-senha-segura
   - Desmarque "Auto Confirm User" se quiser
4. Clique em "Create user"

#### 4.2. Transforme em Admin
1. Vá em **SQL Editor**
2.  Execute (substituindo o email):
   ```sql
   UPDATE auth.users 
   SET raw_user_meta_data = 
     CASE 
       WHEN raw_user_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
       ELSE raw_user_meta_data || '{"role": "admin"}'::jsonb
     END
   WHERE email = 'seu@email.com';
   ```
3. Verifique se funcionou:
   ```sql
   SELECT email, raw_user_meta_data->>'role' as role 
   FROM auth.users 
   WHERE email = 'seu@email.com';
   ```
   - Deve retornar `role: admin`

### 5. Inicie o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 📝 Testando a Aplicação

### Testar Catálogo Público
1. Acesse `http://localhost:5173`
2. Como não há produtos ainda, verá a mensagem "Nenhum produto disponível"

### Testar Painel Admin
1.  Acesse `http://localhost:5173/login`
2. Entre com o email e senha do admin criado
3. Você será redirecionado para `/admin`
4. Experimente:
   - Criar um novo produto
   - Upload de imagens
   - Adicionar especificações
   - Voltar ao catálogo público para ver o produto

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env` existe e está preenchido corretamente
- Reinicie o servidor de desenvolvimento (`Ctrl+C` e `npm run dev`)

### Erro no Login: "Acesso negado"
- Verifique se executou o UPDATE para tornar o usuário admin
- Confira se o campo `role` está como `"admin"` (com aspas)

### Erro ao fazer upload de imagens
- Verifique se o bucket `product-images` foi criado 
- Certifique-se que está marcado como **Public bucket**
- Execute novamente o script `003_storage_setup.sql`

### Produtos não aparecem no catálogo
- Verifique se o produto está com `active = true`
- Confira  as políticas RLS no SQL Editor:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'products';
  ```

### Erros de TypeScript no VS Code
- Alguns erros de tipagem podem aparecer até que você configure o Supabase
- Uma vez configurado e com o servidor rodando, a maioria dos erros desaparece
- Para refrescar, feche e abra o VS Code

## đź"š Arquivos Importantes

- `README.md` - Documentação completa
- `supabase/migrations/` - Scripts SQL do banco de dados
- `src/lib/supabase.ts` - Configuração do cliente Supabase
- `src/hooks/useAuth.ts` - Hook de autenticação
- `src/pages/admin/` - Páginas do painel admin

## 🎉 Pronto!

Seu catálogo de produtos está configurado e pronto para uso!

**Próximas melhorias sugeridas**:
- Adicionar mais categorias
- Implementar busca avançada
- Adicionar filtros adicionais
- Melhorar responsividade mobile
- Adicionar analytics

---

**Dúvidas?** Consulte o README.md para documentação completa.
