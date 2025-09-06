-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create optimized indexes for performance
-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_loyalty_tier ON users(loyalty_tier);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_active ON users(is_active);

-- User addresses indexes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_addresses_type ON user_addresses(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(is_default);

-- Categories indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Products indexes (critical for e-commerce performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_base_price ON products(base_price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Product variants indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);

-- Orders indexes (critical for order management)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);

-- Order items indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Cart items indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_created_at ON cart_items(created_at);

-- Reviews indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);

-- Wishlist indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items(product_id);

-- Loyalty transactions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);

-- Inventory logs indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_variant_id ON inventory_logs(variant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_change_type ON inventory_logs(change_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);

-- Order status history indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_status_history_to_status ON order_status_history(to_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_active_featured 
ON products(category_id, is_active, is_featured) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search_text 
ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' ')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status_date 
ON orders(user_id, status, created_at DESC);

-- Performance optimization views
CREATE OR REPLACE VIEW v_product_catalog AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.short_desc,
    p.base_price,
    p.compare_price,
    p.stock_quantity,
    p.images,
    p.tags,
    p.is_featured,
    p.status,
    p.created_at,
    c.name as category_name,
    c.slug as category_slug,
    AVG(pr.rating)::numeric(3,2) as average_rating,
    COUNT(pr.id) as review_count,
    CASE 
        WHEN p.stock_quantity > p.low_stock_threshold THEN 'in_stock'
        WHEN p.stock_quantity > 0 THEN 'low_stock'
        ELSE 'out_of_stock'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = true
WHERE p.is_active = true AND p.status = 'ACTIVE'
GROUP BY p.id, c.id;

-- Function to update product stock after order
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Decrease stock when order item is added
        UPDATE products SET 
            stock_quantity = stock_quantity - NEW.quantity,
            sales_count = sales_count + NEW.quantity
        WHERE id = NEW.product_id;
        
        IF NEW.variant_id IS NOT NULL THEN
            UPDATE product_variants SET 
                stock_quantity = stock_quantity - NEW.quantity
            WHERE id = NEW.variant_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stock
CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Function to calculate loyalty points
CREATE OR REPLACE FUNCTION calculate_loyalty_points(order_total DECIMAL, user_tier TEXT)
RETURNS INTEGER AS $$
BEGIN
    CASE user_tier
        WHEN 'BRONZE' THEN RETURN FLOOR(order_total * 0.01); -- 1%
        WHEN 'SILVER' THEN RETURN FLOOR(order_total * 0.015); -- 1.5%
        WHEN 'GOLD' THEN RETURN FLOOR(order_total * 0.02); -- 2%
        WHEN 'PLATINUM' THEN RETURN FLOOR(order_total * 0.025); -- 2.5%
        ELSE RETURN FLOOR(order_total * 0.01); -- Default 1%
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_sales_analytics AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(o.id) as orders_count,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as average_order_value,
    COUNT(DISTINCT o.user_id) as unique_customers,
    SUM(oi.quantity) as items_sold
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- Index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_sales_analytics_date ON mv_sales_analytics(sale_date);

-- Security: Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Create security policies (users can only access their own data)
CREATE POLICY user_isolation_policy ON users
    FOR ALL USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY user_address_isolation_policy ON user_addresses
    FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY user_order_isolation_policy ON orders
    FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY user_cart_isolation_policy ON cart_items
    FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY user_wishlist_isolation_policy ON wishlist_items
    FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY user_loyalty_isolation_policy ON loyalty_transactions
    FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = NOW();
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_users BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_products BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_orders BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO coffee_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO coffee_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO coffee_user;
