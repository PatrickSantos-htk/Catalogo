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
