# 🔥 Como Ativar o Sistema de Promoções

## O que foi implementado?

Adicionei um sistema completo de Promoções que permite:
- ✅ Marcar produtos como "em promoção" no formulário admin
- ✅ Seção especial de "PROMOÇÕES EM DESTAQUE" no catálogo
- ✅ Badge visual "🔥 PROMOÇÃO" nos cards de produtos
- ✅ Separação automática entre promoções e produtos normais
- ✅ Carrossel específico para promoções (quando houver muitas)

## 📋 Como Ativar (PASSO A PASSO)

### 1. Acesse o Supabase SQL Editor

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login e selecione seu projeto **xggyhrblsnvttedokele**
3. No menu lateral, clique em **SQL Editor**
4. Clique em **+ New Query**

### 2. Execute o SQL

Cole o código abaixo no editor e clique em **Run** (Ctrl+Enter):

```sql
-- Add is_promotion field to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT false;

-- Create index for faster queries on promotions
CREATE INDEX IF NOT EXISTS idx_products_is_promotion ON products(is_promotion);

-- Add comment for documentation
COMMENT ON COLUMN products.is_promotion IS 'Indica se o produto está em promoção';
```

### 3. Confirme que funcionou

Você deve ver a mensagem: **"Success. No rows returned"**

Para confirmar:
1. Vá em **Table Editor** no menu lateral
2. Clique na tabela **products**
3. Você verá uma nova coluna chamada **is_promotion** (tipo boolean)

## 🎨 Como Usar

### 1. Marcar Produto como Promoção

1. Acesse o painel admin (`/admin`)
2. Vá em **Produtos**
3. Criar novo ou editar produto existente
4. Marque o checkbox **"🔥 Produto em promoção"**
5. Salve

### 2. Visualizando no Catálogo

Quando houver produtos em promoção, o catálogo público mostrará:

**Seção de Promoções (no topo)**
```
╔═══════════════════════════════════════╗
║   🔥 PROMOÇÕES EM DESTAQUE 🔥        ║
║                                       ║
║   [Card com badge] [Card com badge]  ║
║                                       ║
╚═══════════════════════════════════════╝
```

**Seção de Produtos Normais (abaixo)**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Todos os Produtos
   
   [Card normal] [Card normal] [Card normal]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🎯 Recursos Visuais

### Badge de Promoção
- **🔥 Animação pulsante** no canto superior esquerdo
- **Gradiente vermelho-laranja** chamativo
- **Efeito blur** de fundo para destaque

### Seção de Promoções
- **Fundo especial** com gradiente suave (vermelho/laranja)
- **Borda destacada** em vermelho
- **Título grande** com emojis de fogo
- **Contador** de produtos em promoção
- **Carrossel automático** (se mais de 8 promoções)
  - Transição a cada **4 segundos**
  - Setas de navegação personalizadas
  - Responsivo em todos os dispositivos

### Produtos Normais
- Aparecem logo abaixo das promoções
- Visual padrão (sem badge de promoção)
- Mesmo sistema de carrossel (se mais de 8 produtos)

## 📊 Estrutura do Banco

| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `is_promotion` | boolean | false | Indica se produto está em promoção |

## ✨ Dicas de Uso

1. **Promoções Temporárias**: Marque produtos em oferta e desmarque quando a promoção acabar
2. **Destaque Estratégico**: Use para produtos que quer vender mais rápido
3. **Máximo Impacto**: Produtos em promoção sempre aparecem PRIMEIRO
4. **Analytics**: No dashboard você verá quais promoções geram mais cliques

## 🔧 Personalizações Possíveis

Se quiser modificar:

### Mudar cores da seção de promoções
Arquivo: `src/pages/ProductList.tsx`
Linhas: 150-160 (classes: `from-red-600`, `to-orange-600`)

### Mudar tempo do autoplay
Arquivo: `src/pages/ProductList.tsx`
Linha: 175 (propriedade: `delay: 4000` → mudar para milissegundos desejados)

### Mudar texto do badge
Arquivo: `src/components/ProductCard.tsx`
Linha: 25 (texto: `🔥 PROMOÇÃO`)

## ❓ Solução de Problemas

### "Checkbox de promoção não aparece"
- Execute o SQL no Supabase primeiro
- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se está na última versão do código

### "Seção de promoções não aparece"
- Certifique-se de ter pelo menos 1 produto marcado como promoção
- Produto precisa estar também **ativo** (checkbox "Produto ativo")
- Recarregue a página do catálogo

### "Badge não aparece no card"
- Verifique se o campo `is_promotion` foi criado no banco
- Execute: `SELECT is_promotion FROM products LIMIT 1;` no SQL Editor
- Se der erro, execute novamente o SQL de criação da coluna

## 🚀 Pronto!

Após executar o SQL, o sistema de promoções está 100% funcional!

Teste:
1. Criar um produto e marcar como promoção
2. Acessar o catálogo público
3. Ver a seção de promoções destacada no topo

---

**Arquivos modificados:**
- ✅ `supabase/migrations/005_add_promotions.sql` (novo)
- ✅ `src/types/index.ts` (campo is_promotion)
- ✅ `src/pages/admin/ProductForm.tsx` (checkbox)
- ✅ `src/pages/ProductList.tsx` (seções separadas)
- ✅ `src/components/ProductCard.tsx` (badge visual)
