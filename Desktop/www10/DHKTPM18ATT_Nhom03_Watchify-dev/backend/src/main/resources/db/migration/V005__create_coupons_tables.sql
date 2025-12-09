-- =====================================================
-- Migration: V005__create_coupons_tables.sql
-- Description: Create tables for Promotion Module (Coupons & Usage Tracking)
-- Author: Watchify Team
-- Date: 2024
-- =====================================================

-- =====================================================
-- Table: coupons
-- Description: Stores coupon/voucher codes for discounts
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    id CHAR(36) NOT NULL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(15, 2) NOT NULL,
    min_order_amount DECIMAL(15, 2),
    max_discount_amount DECIMAL(15, 2),
    usage_limit INT,
    used_count INT NOT NULL DEFAULT 0,
    per_user_limit INT,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    
    CONSTRAINT chk_discount_type CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    CONSTRAINT chk_discount_value CHECK (discount_value > 0),
    CONSTRAINT chk_min_order_amount CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
    CONSTRAINT chk_max_discount CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0),
    CONSTRAINT chk_usage_limit CHECK (usage_limit IS NULL OR usage_limit > 0),
    CONSTRAINT chk_used_count CHECK (used_count >= 0),
    CONSTRAINT chk_per_user_limit CHECK (per_user_limit IS NULL OR per_user_limit > 0),
    CONSTRAINT chk_date_range CHECK (valid_from < valid_to)
);

-- =====================================================
-- Table: coupon_usages
-- Description: Tracks each redemption of a coupon by users
-- =====================================================
CREATE TABLE IF NOT EXISTS coupon_usages (
    id CHAR(36) NOT NULL PRIMARY KEY,
    coupon_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    discount_amount DECIMAL(15, 2) NOT NULL,
    order_amount DECIMAL(15, 2) NOT NULL,
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    CONSTRAINT fk_coupon_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_coupon_usage_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT chk_discount_amount CHECK (discount_amount >= 0),
    CONSTRAINT chk_order_amount CHECK (order_amount > 0)
);

-- =====================================================
-- Indexes for coupons table
-- =====================================================

-- Index for code lookup (most common query)
CREATE INDEX idx_coupon_code ON coupons(code);

-- Index for finding active coupons
CREATE INDEX idx_coupon_active ON coupons(is_active);

-- Index for date range queries
CREATE INDEX idx_coupon_valid_dates ON coupons(valid_from, valid_to);

-- Composite index for finding valid coupons
CREATE INDEX idx_coupon_active_dates ON coupons(is_active, valid_from, valid_to);

-- Index for usage tracking
CREATE INDEX idx_coupon_usage_count ON coupons(used_count, usage_limit);

-- Index for creator tracking
CREATE INDEX idx_coupon_created_by ON coupons(created_by);

-- Index for sorting by creation date
CREATE INDEX idx_coupon_created_at ON coupons(created_at DESC);

-- =====================================================
-- Indexes for coupon_usages table
-- =====================================================

-- Index for finding all usages of a coupon
CREATE INDEX idx_coupon_usage_coupon ON coupon_usages(coupon_id);

-- Index for finding all coupons used by a user
CREATE INDEX idx_coupon_usage_user ON coupon_usages(user_id);

-- Index for finding coupon used in an order
CREATE INDEX idx_coupon_usage_order ON coupon_usages(order_id);

-- Composite index for user-coupon combination (enforce per-user limits)
CREATE INDEX idx_coupon_usage_user_coupon ON coupon_usages(user_id, coupon_id);

-- Index for time-based queries (analytics)
CREATE INDEX idx_coupon_usage_used_at ON coupon_usages(used_at DESC);

-- Index for fraud detection
CREATE INDEX idx_coupon_usage_ip ON coupon_usages(ip_address, used_at);

-- =====================================================
-- Sample Data (Optional - for development/testing)
-- =====================================================

-- Sample: 10% off coupon
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, per_user_limit, valid_from, valid_to, is_active, created_by)
VALUES (
    UUID(),
    'WELCOME10',
    'Welcome discount - 10% off your first order',
    'PERCENTAGE',
    10.00,
    50.00,
    20.00,
    100,
    0,
    1,
    '2024-01-01 00:00:00',
    '2024-12-31 23:59:59',
    TRUE,
    'SYSTEM'
);

-- Sample: $20 fixed discount
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, per_user_limit, valid_from, valid_to, is_active, created_by)
VALUES (
    UUID(),
    'SAVE20',
    'Save $20 on orders over $100',
    'FIXED_AMOUNT',
    20.00,
    100.00,
    20.00,
    50,
    0,
    1,
    '2024-01-01 00:00:00',
    '2024-12-31 23:59:59',
    TRUE,
    'SYSTEM'
);

-- Sample: VIP 15% off (unlimited uses)
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, per_user_limit, valid_from, valid_to, is_active, created_by)
VALUES (
    UUID(),
    'VIP15',
    'VIP members get 15% off all orders',
    'PERCENTAGE',
    15.00,
    0.00,
    50.00,
    NULL,
    0,
    NULL,
    '2024-01-01 00:00:00',
    '2024-12-31 23:59:59',
    TRUE,
    'SYSTEM'
);

-- Sample: Flash sale 25% (limited time)
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, per_user_limit, valid_from, valid_to, is_active, created_by)
VALUES (
    UUID(),
    'FLASH25',
    'Flash Sale - 25% off for 24 hours only!',
    'PERCENTAGE',
    25.00,
    30.00,
    100.00,
    200,
    0,
    2,
    CURRENT_TIMESTAMP,
    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
    TRUE,
    'SYSTEM'
);

-- =====================================================
-- Comments for documentation
-- =====================================================

-- Table comments
ALTER TABLE coupons COMMENT = 'Stores discount coupons and vouchers';
ALTER TABLE coupon_usages COMMENT = 'Tracks coupon redemptions by users';

-- Column comments for coupons
ALTER TABLE coupons MODIFY COLUMN id CHAR(36) COMMENT 'Primary key (UUID)';
ALTER TABLE coupons MODIFY COLUMN code VARCHAR(50) COMMENT 'Unique coupon code (uppercase)';
ALTER TABLE coupons MODIFY COLUMN discount_type VARCHAR(20) COMMENT 'PERCENTAGE or FIXED_AMOUNT';
ALTER TABLE coupons MODIFY COLUMN discount_value DECIMAL(15, 2) COMMENT 'Discount value (% or fixed amount)';
ALTER TABLE coupons MODIFY COLUMN min_order_amount DECIMAL(15, 2) COMMENT 'Minimum order amount to use coupon';
ALTER TABLE coupons MODIFY COLUMN max_discount_amount DECIMAL(15, 2) COMMENT 'Maximum discount cap';
ALTER TABLE coupons MODIFY COLUMN usage_limit INT COMMENT 'Total usage limit (NULL = unlimited)';
ALTER TABLE coupons MODIFY COLUMN used_count INT COMMENT 'Current usage count';
ALTER TABLE coupons MODIFY COLUMN per_user_limit INT COMMENT 'Per-user usage limit (NULL = unlimited)';

-- Column comments for coupon_usages
ALTER TABLE coupon_usages MODIFY COLUMN id CHAR(36) COMMENT 'Primary key (UUID)';
ALTER TABLE coupon_usages MODIFY COLUMN discount_amount DECIMAL(15, 2) COMMENT 'Actual discount applied';
ALTER TABLE coupon_usages MODIFY COLUMN order_amount DECIMAL(15, 2) COMMENT 'Order total before discount';
ALTER TABLE coupon_usages MODIFY COLUMN ip_address VARCHAR(45) COMMENT 'User IP for fraud detection';

-- =====================================================
-- End of Migration
-- =====================================================