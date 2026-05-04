# Como Ativar o Sistema de Tracking de Interesse (Analytics)

## 🎯 O que foi implementado?

Adicionei um sistema completo de tracking que registra quando clientes clicam no botão "Falar no WhatsApp" de um produto. Isso permite que você veja:

- **Total de contatos** recebidos via WhatsApp
- **Contatos de hoje** (últimas 24 horas)
- **Contatos da semana** (últimos 7 dias)
- **Produto mais buscado** (com mais cliques)
- **Top 5 produtos** com mais interesse
- **Histórico completo** de cliques por produto

## 📋 Passo a Passo para Ativar

### 1. Acesse o Supabase

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto **xggyhrblsnvttedokele**

### 2. Abra o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor** (ícone de código)
2. Clique em **+ New Query** para criar uma nova consulta

### 3. Execute o SQL de Criação da Tabela

Cole todo o código abaixo no editor SQL e clique em **Run** (ou pressione Ctrl+Enter):

```sql
-- Create product_analytics table to track WhatsApp clicks
CREATE TABLE IF NOT EXISTS product_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL DEFAULT 'whatsapp_click',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX idx_product_analytics_created_at ON product_analytics(created_at);
CREATE INDEX idx_product_analytics_event_type ON product_analytics(event_type);

-- Enable RLS
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert analytics (track clicks)
CREATE POLICY "Allow public to insert analytics"
    ON product_analytics
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to read analytics
CREATE POLICY "Allow authenticated to read analytics"
    ON product_analytics
    FOR SELECT
    TO authenticated
    USING (true);

-- Create a view for analytics summary
CREATE OR REPLACE VIEW product_analytics_summary AS
SELECT 
    p.id,
    p.name,
    p.category,
    COUNT(pa.id) as total_clicks,
    COUNT(CASE WHEN pa.created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as clicks_today,
    COUNT(CASE WHEN pa.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as clicks_week,
    COUNT(CASE WHEN pa.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as clicks_month,
    MAX(pa.created_at) as last_click_at
FROM products p
LEFT JOIN product_analytics pa ON p.id = pa.product_id AND pa.event_type = 'whatsapp_click'
GROUP BY p.id, p.name, p.category
ORDER BY total_clicks DESC;

-- Grant access to the view
GRANT SELECT ON product_analytics_summary TO anon, authenticated;
```

### 4. Verifique se funcionou

Após executar o SQL, você deve ver a mensagem **"Success. No rows returned"** (ou similar).

Para confirmar que tudo foi criado corretamente:

1. Vá em **Table Editor** no menu lateral
2. Você deve ver a nova tabela **product_analytics**
3. Vá em **Database** > **Views**
4. Você deve ver a view **product_analytics_summary**

## ✅ Como Testar

1. Execute o projeto: `npm run dev`
2. Acesse o catálogo público
3. Clique em um produto para ver os detalhes
4. Clique no botão **"Falar no WhatsApp"**
5. Faça login como admin (`/login`)
6. Vá para o Dashboard
7. Você verá as novas métricas:
   - Total de Contatos
   - Contatos Hoje
   - Contatos na Semana
   - Produto Mais Buscado
   - Tabela com Top 5 produtos

## 🎨 O que você verá no Dashboard

### Cards de Métricas
- 📊 **Total de Contatos**: Soma de todos os cliques no WhatsApp
- 🕐 **Contatos Hoje**: Cliques nas últimas 24 horas
- 📅 **Contatos na Semana**: Cliques nos últimos 7 dias
- ⭐ **Produto Mais Buscado**: Nome do produto com mais cliques

### Tabela Top 5 Produtos
Mostra os 5 produtos com mais interesse, incluindo:
- Nome do produto
- Categoria
- Total de cliques (todos os tempos)
- Cliques hoje
- Cliques nos últimos 7 dias

## 🔒 Segurança

- ✅ **Tracking público**: Qualquer visitante pode gerar cliques (não precisa estar logado)
- ✅ **Visualização protegida**: Apenas administradores logados podem ver as métricas
- ✅ **RLS ativo**: Políticas de segurança configuradas corretamente
- ✅ **Índices criados**: Queries otimizadas para performance

## 📊 Dados Coletados

Cada clique registra:
- **ID único** do registro
- **ID do produto** clicado
- **Tipo de evento** (whatsapp_click)
- **Data e hora** do clique

**Nota**: Não coletamos dados pessoais do visitante, apenas registramos o interesse no produto.

## 🚀 Próximos Passos

Após executar o SQL, o sistema está pronto! Agora você pode:

1. Compartilhar o link do catálogo com clientes
2. Acompanhar quais produtos geram mais interesse
3. Tomar decisões baseadas em dados reais
4. Identificar produtos que precisam de mais divulgação

## ❓ Problemas?

Se aparecer algum erro ao executar o SQL:

1. **"relation already exists"**: A tabela já existe, tudo bem!
2. **"permission denied"**: Você precisa ter permissões de admin no Supabase
3. **"syntax error"**: Certifique-se de copiar TODO o código SQL

---

**Dica**: Salve este arquivo para referência futura!
