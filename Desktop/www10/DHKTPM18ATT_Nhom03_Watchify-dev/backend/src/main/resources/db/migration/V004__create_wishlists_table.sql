-- Migration script for creating wishlists table
-- Version: V004
-- Description: Create wishlists table for user product favorites
-- Author: Backend Team
-- Date: 2024

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    notes VARCHAR(500),
    priority INTEGER,
    notify_on_sale BOOLEAN DEFAULT FALSE,
    notify_on_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE,
    
    -- Unique constraint: one user can only add same product once
    CONSTRAINT uk_wishlist_user_product UNIQUE (user_id, product_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_product ON wishlists(user_id, product_id);

-- Create index for notification queries
CREATE INDEX IF NOT EXISTS idx_wishlist_notify_on_sale 
    ON wishlists(product_id) WHERE notify_on_sale = TRUE;
CREATE INDEX IF NOT EXISTS idx_wishlist_notify_on_stock 
    ON wishlists(product_id) WHERE notify_on_stock = TRUE;

-- Add comment to table
COMMENT ON TABLE wishlists IS 'Stores user wishlist/favorite products';
COMMENT ON COLUMN wishlists.id IS 'Primary key';
COMMENT ON COLUMN wishlists.user_id IS 'Reference to users table';
COMMENT ON COLUMN wishlists.product_id IS 'Reference to products table';
COMMENT ON COLUMN wishlists.notes IS 'Optional notes from user about this wishlist item';
COMMENT ON COLUMN wishlists.priority IS 'Priority level (1-5, where 1 is highest)';
COMMENT ON COLUMN wishlists.notify_on_sale IS 'Whether to notify user when product goes on sale';
COMMENT ON COLUMN wishlists.notify_on_stock IS 'Whether to notify user when product is back in stock';
COMMENT ON COLUMN wishlists.created_at IS 'Timestamp when item was added to wishlist';
COMMENT ON COLUMN wishlists.updated_at IS 'Timestamp when item was last updated';