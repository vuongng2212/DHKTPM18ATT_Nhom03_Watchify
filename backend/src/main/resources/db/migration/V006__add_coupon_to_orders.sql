-- =====================================================
-- Migration: V006__add_coupon_to_orders.sql
-- Description: Add coupon support to orders table
-- Author: Watchify Team
-- Date: 2024
-- =====================================================

-- Add coupon-related columns to orders table
ALTER TABLE orders 
ADD COLUMN coupon_id CHAR(36) AFTER total_amount,
ADD COLUMN coupon_code VARCHAR(50) AFTER coupon_id,
ADD COLUMN discount_amount DECIMAL(15, 2) DEFAULT 0.00 AFTER coupon_code,
ADD COLUMN final_amount DECIMAL(15, 2) AFTER discount_amount;

-- Add foreign key constraint to coupons table
ALTER TABLE orders
ADD CONSTRAINT fk_order_coupon 
FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

-- Add index for coupon_id lookup
CREATE INDEX idx_order_coupon_id ON orders(coupon_id);

-- Add index for coupon_code lookup
CREATE INDEX idx_order_coupon_code ON orders(coupon_code);

-- Add check constraint to ensure discount_amount is not negative
ALTER TABLE orders
ADD CONSTRAINT chk_order_discount_amount CHECK (discount_amount >= 0);

-- Add check constraint to ensure final_amount is not negative
ALTER TABLE orders
ADD CONSTRAINT chk_order_final_amount CHECK (final_amount IS NULL OR final_amount >= 0);

-- Update existing orders to set discount_amount to 0 and final_amount = total_amount
UPDATE orders 
SET discount_amount = 0.00,
    final_amount = total_amount
WHERE discount_amount IS NULL;

-- Add comments for documentation
ALTER TABLE orders MODIFY COLUMN coupon_id CHAR(36) COMMENT 'Reference to applied coupon (nullable)';
ALTER TABLE orders MODIFY COLUMN coupon_code VARCHAR(50) COMMENT 'Coupon code used (for reference)';
ALTER TABLE orders MODIFY COLUMN discount_amount DECIMAL(15, 2) COMMENT 'Discount amount from coupon';
ALTER TABLE orders MODIFY COLUMN final_amount DECIMAL(15, 2) COMMENT 'Final amount after discount (total_amount - discount_amount)';

-- =====================================================
-- End of Migration
-- =====================================================