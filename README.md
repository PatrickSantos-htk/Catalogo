# Catálogo de Produtos

Sistema completo de catálogo de produtos com painel administrativo. Clientes podem visualizar produtos e entrar em contato via WhatsApp. Administradores gerenciam o catálogo através de um painel protegido.

## 📚 Documentação Adicional

- [docs/README.md](docs/README.md) - Índice da documentação complementar do projeto
- [docs/COPILOT_PROMPTS.md](docs/COPILOT_PROMPTS.md) - Guia dos prompts de interface design usados com GitHub Copilot no VS Code

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilização**: TailwindCSS
- **Roteamento**: React Router v6
- **Notificações**: React Toastify

## ✨ Funcionalidades

### Público
- ✅ Visualização de catálogo de produtos
- ✅ Busca por nome/descrição
- ✅ Filtro por categoria
- ✅ Página de detalhes com galeria de imagens
- ✅ Botão de contato direto via WhatsApp
- ✅ Design responsivo

### Administrador
- ✅ Painel administrativo protegido
- ✅ Dashboard com estatísticas
- ✅ CRUD completo de produtos
- ✅ Upload de múltiplas imagens
- ✅ Especificações técnicas dinâmicas
- ✅ Ativação/desativação de produtos
- ✅ Gerenciamento de estoque

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase (gratuita)
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd Catalogo
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização e projeto
3. Aguarde a criação do banco de dados

#### 3.2. Execute as migrations SQL
1. Acesse o **SQL Editor** no dashboard do Supabase
2. Execute os arquivos na ordem:
   - `supabase/migrations/001_create_products_table.sql`
   - `supabase/migrations/002_enable_rls.sql`

#### 3.3. Configure o Storage
1. Acesse **Storage** no dashboard do Supabase
2. Clique em "Create bucket"
3. Nome: `product-images`
4. Marque como **Public bucket**
5. Clique em "Save"
6. Volte ao **SQL Editor** e execute:
   - `supabase/migrations/003_storage_setup.sql`

### 4. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

**Onde encontrar:**
- Acesse **Settings** > **API** no dashboard do Supabase
- Copie a **Project URL** e a **anon/public key**

### 5. Crie o primeiro usuário admin

#### 5.1. Crie um usuário
1. Acesse **Authentication** > **Users** no dashboard
2. Clique em "Add user" > "Create new user"
3. Preencha email e senha
4. Clique em "Create user"

#### 5.2. Transforme em admin
1. Acesse **SQL Editor**
2. Execute o script `scripts/create-admin.sql`
3. Substitua `'seu@email.com'` pelo email do usuário criado
4. Execute a query

```sql
UPDATE auth.users 
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
    ELSE raw_user_meta_data || '{"role": "admin"}'::jsonb
  END
WHERE email = 'admin@exemplo.com';
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📱 Uso

### Acesso Público
- Visite a página inicial para ver o catálogo
- Use a busca e filtros para encontrar produtos
- Clique em um produto para ver detalhes
- Use o botão "Falar no WhatsApp" para entrar em contato

### Painel Admin
1. Acesse `/login`
2. Entre com email e senha de admin
3. Gerencie produtos, categorias e visualize estatísticas

## 🗂️ Estrutura do Projeto

```
Catalogo/
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── AdminLayout.tsx
│   │   ├── PrivateRoute.tsx
│   │   └── ProductCard.tsx
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.ts
│   ├── lib/               # Configurações
│   │   └── supabase.ts
│   ├── pages/             # Páginas
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   └── ProductForm.tsx
│   │   ├── Login.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ProductList.tsx
│   ├── types/             # TypeScript types
│   │   ├── database.ts
│   │   └── index.ts
│   ├── utils/             # Funções utilitárias
│   │   ├── format.ts
│   │   └── whatsapp.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/        # SQL migrations
├── scripts/               # Scripts utilitários
├── .env.example
├── package.json
└── README.md
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: `products`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do produto |
| description | TEXT | Descrição detalhada |
| price | NUMERIC(10,2) | Preço em reais |
| category | TEXT | Categoria do produto |
| stock | INTEGER | Quantidade em estoque |
| images | TEXT[] | Array de URLs das imagens |
| specifications | JSONB | Especificações técnicas |
| whatsapp_number | TEXT | Número do WhatsApp (só dígitos) |
| whatsapp_message | TEXT | Mensagem personalizada (opcional) |
| active | BOOLEAN | Se está ativo no catálogo |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Data de atualização |

## 🔒 Segurança (RLS)

O sistema usa Row Level Security do Supabase:

- **Público**: Pode visualizar apenas produtos ativos
- **Admin**: Acesso total (CRUD) em todos os produtos
- **Storage**: Imagens públicas para visualização, upload apenas para admins

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Build
npm run build

# O deploy pode ser feito via CLI ou conectando o repositório
vercel --prod
```

**Configuração no Vercel:**
1. Configure as variáveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
2. Em **Settings** do Vercel, adicione as env vars

### Netlify

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Configuração Pós-Deploy

No Supabase, configure as URLs permitidas:
1. Acesse **Authentication** > **URL Configuration**
2. Adicione seu domínio em **Site URL**
3. Adicione `https://seu-dominio.com/**` em **Redirect URLs**

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 💡 Melhorias Futuras

- [ ] Autenticação com múltiplos admins e permissões
- [ ] Sistema de categorias hierárquicas
- [ ] Histórico de alterações em produtos
- [ ] Analytics de visualizações
- [ ] Exportação de relatórios
- [ ] API pública para integração
- [ ] Suporte a variantes de produtos
- [ ] Sistema de comentários/avaliações
- [ ] Integração com sistemas de pagamento
- [ ] Notificações por email

## 🐛 Problemas Conhecidos

Caso encontre erros, verifique:

1. **Erro de autenticação**: Certifique-se que o usuário tem `role: 'admin'` no metadata
2. **Erro de upload**: Verifique se o bucket `product-images` está público
3. **Erro de RLS**: Execute novamente as políticas SQL
4. **Env vars não carregam**: Reinicie o servidor de desenvolvimento após alterar `.env`

## 📧 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação do [Supabase](https://supabase.com/docs)
- Consulte a documentação do [React](https://react.dev)

---

**Desenvolvido com ❤️ usando React + Supabase**
