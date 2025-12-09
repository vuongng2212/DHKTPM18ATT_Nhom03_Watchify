## 3.4. Biểu đồ Class và quan hệ giữa các entities

Biểu đồ lớp (Class Diagram) mô tả cấu trúc tĩnh của hệ thống Watchify theo kiến trúc Modular Monolith. Hệ thống được chia thành 6 modules chính: Identity, Catalog, Inventory, Order, Payment và Promotion. Mỗi module đại diện cho một bounded context trong Domain-Driven Design, đảm bảo tính cohesion cao và coupling thấp.

### 3.4.1. Class Diagram: Identity Module

Module Identity quản lý người dùng, xác thực và phân quyền trong hệ thống.

> **[Hình 3.4.1: Class Diagram - Identity Module]**
> 
> *Chú thích: Biểu đồ lớp Identity Module. Sử dụng file PlantUML: `docs/diagrams/identity-module.puml`*

**User** là Aggregate Root của module, đại diện người dùng với các thuộc tính: `id` (UUID), `email` (username, unique), `password` (BCrypt hash), `firstName`, `lastName`, `phone`, và `status` (UserStatus enum). Việc sử dụng UUID thay vì integer tăng cường bảo mật và đảm bảo tính duy nhất toàn cục.

Enum **UserStatus** định nghĩa các trạng thái: `ACTIVE` (hoạt động bình thường), `INACTIVE` (tạm ngừng), `LOCKED` (bị khóa), và `DELETED` (soft delete). Soft delete giữ lại dữ liệu lịch sử thay vì xóa vĩnh viễn.

**Role** quản lý vai trò với `name` (ví dụ: "ROLE_ADMIN", "ROLE_CUSTOMER") và `description`. Quan hệ User-Role là many-to-many qua bảng `user_roles`, áp dụng Role-Based Access Control (RBAC). Implementation chỉ sử dụng unidirectional mapping từ User sang Role để giảm complexity.

**Address** lưu thông tin giao hàng với các thuộc tính: `fullName`, `phone`, `street`, `ward`, `district`, `city`, `country`, `type` (AddressType enum), và `isDefault`. Enum **AddressType** gồm: `HOME`, `OFFICE`, `OTHER`. Mỗi user chỉ có một địa chỉ mặc định.

Thiết kế quan trọng: Address sử dụng foreign key `userId` thay vì navigation property, tránh lazy loading issues và N+1 query problems.

**RefreshToken** quản lý JWT refresh tokens với các thuộc tính: `userId`, `token` (unique), `expiryDate`, và `revoked`. Cho phép user có nhiều sessions đồng thời từ các devices khác nhau và revoke tokens khi cần thiết (logout, security breach).

Module tuân thủ các nguyên tắc bảo mật: password hashing với BCrypt, email verification, rate limiting cho login, account lockout, và secure password reset flow.

### 3.4.2. Class Diagram: Catalog Module

Module Catalog quản lý sản phẩm, danh mục, thương hiệu và các thông tin liên quan.

> **[Hình 3.4.2: Class Diagram - Catalog Module]**
> 
> *Chú thích: Biểu đồ lớp Catalog và Inventory Modules. Sử dụng file PlantUML: `docs/diagrams/catalog-module.puml`*

**Product** là Aggregate Root với các thuộc tính chính: `id`, `name`, `slug` (SEO-friendly URL), `sku` (Stock Keeping Unit, unique), `description`, `shortDescription`, `price`, `originalPrice`, `discountPercentage`, `status`, `categoryId`, `brandId`, `viewCount` (Long), `isFeatured`, `isNew`, và `displayOrder`.

Điểm thiết kế quan trọng: Product **không sử dụng navigation properties** mà chỉ lưu foreign keys (`categoryId`, `brandId`). Điều này tránh lazy loading exceptions, giảm N+1 query problems, và dễ dàng chuyển sang microservices.

Giá sản phẩm dùng `BigDecimal` thay vì float/double để đảm bảo precision trong tính toán tiền tệ. Method `isOnSale()` kiểm tra `originalPrice > price` để xác định sản phẩm đang giảm giá.

**Category** hỗ trợ cấu trúc phân cấp qua self-referencing với thuộc tính `parentId`. Root categories có `parentId = null`. Method `isRootCategory()` kiểm tra điều kiện này. Category không có navigation properties `parent` hay `children` để tránh circular dependencies.

**Brand** đại diện thương hiệu với `name`, `slug`, `description`, `logoUrl`, `websiteUrl`, và `isActive`.

**ProductImage** quản lý hình ảnh sản phẩm: `productId`, `imageUrl`, `altText`, `displayOrder`, `isPrimary`. Chỉ một ảnh có `isPrimary = true` làm thumbnail.

**ProductDetail** lưu thông tin kỹ thuật đồng hồ (one-to-one với Product): `caseDiameter`, `caseThickness`, `caseMaterial`, `bandMaterial`, `movementType`, `waterResistance`. Tách riêng để Product không quá lớn và cho phép lazy loading.

**Review** cho phép đánh giá sản phẩm: `productId`, `userId`, `rating` (1-5 sao), `title`, `comment`. User chỉ review sản phẩm đã mua (verified purchase).

**Wishlist** là join table giữa User và Product: `userId`, `productId`, `addedAt`.

**Cart** và **CartItem** quản lý giỏ hàng tạm thời. Cart có quan hệ one-to-one với User. CartItem gồm: `cartId`, `productId`, `quantity`. Method `getSubtotal()` tính giá cho từng item.

Enum **ProductStatus**: `ACTIVE`, `OUT_OF_STOCK`, `DISCONTINUED`.

### 3.4.3. Class Diagram: Inventory Module

Module Inventory quản lý tồn kho và lịch sử giao dịch, tách riêng khỏi Catalog theo nguyên tắc Single Responsibility.

> **[Hình 3.4.3: Class Diagram - Inventory Module]**
> 
> *Chú thích: Biểu đồ lớp Inventory Module. Sử dụng file PlantUML: `docs/diagrams/inventory-module.puml`*

**Inventory** có quan hệ one-to-one với Product: `id`, `productId` (unique), `quantity` (tổng số trong kho), `reservedQuantity` (đã đặt trước cho pending orders), `location` (hỗ trợ multi-warehouse), `createdAt`, `updatedAt`.

**Công thức quan trọng**: Available quantity = `quantity - reservedQuantity`. Method `getAvailableQuantity()` tính số lượng thực sự có thể bán.

**Business methods quan trọng:**

- `reserve(qty)`: Tăng `reservedQuantity` khi user tạo order. Check available quantity, throw exception nếu không đủ hàng. Phải atomic để tránh overselling.
- `release(qty)`: Giảm `reservedQuantity` khi order bị cancel, giải phóng stock về available pool.
- `confirmReservation(qty)`: Giảm cả `quantity` và `reservedQuantity` khi payment success. Sản phẩm thực sự rời kho.
- `addQuantity(qty)`: Tăng `quantity` khi nhập hàng từ supplier.
- `reduceQuantity(qty)`: Giảm `quantity` khi hư hỏng hoặc mất mát.

**Workflow điển hình**: 
- Initial: quantity=100, reserved=0, available=100
- User tạo order (qty=5) → `reserve(5)` → quantity=100, reserved=5, available=95
- Payment success → `confirmReservation(5)` → quantity=95, reserved=0, available=95
- Nếu cancel → `release(5)` → quantity=100, reserved=0, available=100

**InventoryTransaction** (audit trail): `id`, `inventoryId`, `type` (TransactionType enum), `quantity`, `quantityBefore`, `quantityAfter`, `reference` (orderId, purchaseOrderId), `notes`, `performedBy`, `createdAt`.

Mỗi thay đổi inventory tạo một transaction record (append-only, never update/delete). Phục vụ: reconciliation, audit compliance, analytics, debugging, fraud detection.

**Enum TransactionType**: `INITIAL_STOCK`, `PURCHASE`, `SALE`, `RETURN`, `RESERVED`, `RELEASED`, `CONFIRMED`, `DAMAGED`, `ADJUSTMENT`.

**Concurrency control**: Sử dụng optimistic locking (`@Version`) cho general cases, pessimistic locking (`SELECT FOR UPDATE`) cho high contention (flash sales, low stock items).

**Product status sync**: Available ≤ 0 → Product.status = OUT_OF_STOCK. Available > 0 → Product.status = ACTIVE.

Tách Inventory module riêng giúp: clear separation of concerns, independent scaling, complete audit trail, prevent overselling, dễ implement multi-warehouse.

### 3.4.4. Class Diagram: Order and Payment Modules

Module Order và Payment xử lý đặt hàng và thanh toán.

> **[Hình 3.4.4: Class Diagram - Order and Payment Modules]**
> 
> *Chú thích: Biểu đồ lớp Order và Payment Modules. Sử dụng file PlantUML: `docs/diagrams/order-payment-modules.puml`*

**Order** là Aggregate Root: `id`, `userId`, `totalAmount`, `couponId`, `couponCode`, `discountAmount`, `finalAmount`, `status`, `paymentMethod`, `shippingAddress`, `billingAddress`, `notes`, `orderDate`.

Calculation: `finalAmount = totalAmount - discountAmount`.

**Snapshot pattern**: `shippingAddress` và `billingAddress` lưu dưới dạng text/JSON, không phải foreign key. Điều này đảm bảo thông tin order không thay đổi khi user update địa chỉ sau này.

**OrderItem** lưu snapshot sản phẩm: `orderId`, `productId`, `productName`, `productSku`, `unitPrice`, `quantity`, `totalPrice`. Snapshot đảm bảo order history hiển thị đúng thông tin tại thời điểm mua.

**Enum OrderStatus** - state machine:
- `PENDING`: Vừa tạo
- `PENDING_PAYMENT`: Chờ thanh toán
- `CONFIRMED`: Đã thanh toán/COD accepted
- `PROCESSING`: Admin chuẩn bị hàng
- `SHIPPING`: Đã giao vận chuyển
- `COMPLETED`: Đã nhận hàng
- `CANCELLED`: Đã hủy
- `PAYMENT_FAILED`: Thanh toán thất bại
- `REFUNDED`: Đã hoàn tiền

State transitions được kiểm soát chặt chẽ. Method `canCancel()` kiểm tra khả năng hủy order.

**Enum PaymentMethod**: `COD` (thanh toán khi nhận hàng), `MOMO`, `BANK_TRANSFER`, `VNPAY`.

**Payment** (one-to-one với Order): `orderId`, `amount`, `status`, `paymentMethod`, `transactionId` (từ gateway), `paymentDate`, `notes`.

**Enum PaymentStatus**: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `REFUNDED`, `CANCELLED`.

**Payment workflow**:
1. User checkout → Create Order + Payment (cả hai PENDING)
2. Redirect đến payment gateway
3. User thanh toán → Gateway callback về server
4. Verify callback signature → Update Payment status
5. Update Order status based on Payment status
6. Send confirmation

### 3.4.5. Class Diagram: Promotion Module

Module Promotion quản lý mã giảm giá và tracking sử dụng.

> **[Hình 3.4.5: Class Diagram - Promotion Module]**
> 
> *Chú thích: Promotion Module nằm trong Hình 3.4.4*

**Coupon**: `id`, `code` (unique, uppercase), `description`, `discountType`, `discountValue`, `minOrderAmount`, `maxDiscountAmount`, `usageLimit`, `usedCount`, `perUserLimit`, `validFrom`, `validTo`, `isActive`.

**Enum DiscountType**: `PERCENTAGE` (giảm %), `FIXED_AMOUNT` (giảm số tiền cố định).

**Business methods:**

- `isValid()`: Check coupon còn hiệu lực (active, trong thời hạn, chưa hết lượt).
- `canApplyToOrder(amount)`: Check đơn hàng đủ điều kiện (đạt minOrderAmount).
- `calculateDiscount(amount)`: Tính số tiền giảm, áp dụng maxDiscountAmount nếu có.
- `incrementUsageCount()`: Tăng `usedCount` khi apply coupon.
- `decrementUsageCount()`: Giảm `usedCount` khi order cancel.

**CouponUsage** - audit trail: `couponId`, `userId`, `orderId`, `discountAmount`, `usedAt`.

Mỗi lần apply coupon tạo một CouponUsage record để:
- Prevent duplicate usage (check `perUserLimit`)
- Audit trail (ai dùng coupon nào, khi nào)
- Analytics (coupon effectiveness)
- Fraud detection

**Workflow**:
1. User nhập code → Validate coupon
2. Check `isValid()`, `canApplyToOrder()`, per-user limit
3. Calculate discount → Apply vào order
4. User confirm → Create CouponUsage + increment `usedCount`
5. Nếu cancel → Delete CouponUsage + decrement `usedCount`

### 3.4.6. Tổng Quan Kiến Trúc

> **[Hình 3.4.6: Complete System Class Diagram]**
> 
> *Chú thích: Tổng quan toàn hệ thống. Sử dụng file PlantUML: `docs/diagrams/complete-system-class-diagram.puml`*

**Dependency graph:**
```
Identity (foundation, no dependencies)
   ↑
   ├── Catalog → Inventory
   ├── Promotion
   └── Order → Payment
```

Identity là foundation layer. Order có nhiều dependencies nhất (User, Product, Coupon).

**Key patterns:**

1. **Foreign Keys thay vì Navigation Properties**: Entities chỉ lưu UUID foreign keys, không có JPA navigation. Service layer explicit join khi cần.

2. **Snapshot Pattern**: Order/OrderItem lưu snapshot của Product/Address info để preserve historical accuracy.

3. **Soft Delete**: Dùng status/isActive thay vì xóa vĩnh viễn.

4. **State Machine**: OrderStatus và PaymentStatus có controlled transitions.

5. **Aggregate Root**: User, Product, Order, Coupon là Aggregate Roots, định nghĩa transaction boundaries.

**Cross-module communication** qua service layer interfaces, không direct entity references. Ví dụ: OrderService gọi InventoryService.reserve(), không trực tiếp access Inventory entity.

**Transaction boundaries**: Mỗi Aggregate Root một transaction. Operations span nhiều Aggregates dùng eventual consistency (events).

**Scalability**: Modular Monolith cho phép vertical scaling và limited horizontal scaling. Có thể extract modules thành microservices nếu cần scale hơn nữa.

**Database**: Tất cả modules share một database nhưng tables organized theo schema (identity.users, catalog.products, orders.orders, etc.).

Thiết kế tuân thủ SOLID principles, DDD patterns, đảm bảo hệ thống maintainable, scalable và có thể evolve theo nhu cầu nghiệp vụ.