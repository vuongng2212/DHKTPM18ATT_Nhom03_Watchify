# PHÂN TÍCH CLASS DIAGRAM - WATCHIFY E-COMMERCE SYSTEM

## 📋 Tổng Quan

Tài liệu này phân tích chi tiết các class diagram được trình bày trong `Chuong3_PhanTichThietKe.md`, so sánh với codebase thực tế, và đề xuất cải tiến bằng PlantUML.

**Ngày phân tích:** 2024  
**Người thực hiện:** Team Analysis  
**Phiên bản:** 1.0

---

## 🎯 Đánh Giá Tổng Thể

### ✅ Điểm Mạnh

1. **Cấu trúc module rõ ràng**
   - Chia thành 3 modules chính: Identity, Catalog, Order/Payment
   - Tuân thủ nguyên tắc Separation of Concerns
   - Phù hợp với kiến trúc Modular Monolith

2. **Mô tả nghiệp vụ chi tiết**
   - Giải thích rõ ràng vai trò của từng entity
   - Phân tích quan hệ giữa các entities
   - Cung cấp context nghiệp vụ tốt

3. **Sử dụng Mermaid diagram**
   - Dễ đọc, trực quan
   - Tích hợp tốt trong Markdown
   - Phù hợp cho documentation nhanh

### ❌ Vấn Đề Nghiêm Trọng

#### 1. THIẾU Module Inventory

**Vấn đề:** Class diagram hoàn toàn không đề cập đến Inventory module.

**Thực tế trong code:**
```java
// File: backend/src/main/java/fit/iuh/backend/modules/inventory/domain/entity/Inventory.java
@Entity
@Table(name = "inventories")
public class Inventory {
    private UUID id;
    private UUID productId; // One-to-One với Product
    private Integer quantity;
    private Integer reservedQuantity; // QUAN TRỌNG: Quản lý đặt trước
    private String location;
    
    // Business logic methods
    public Integer getAvailableQuantity() { return quantity - reservedQuantity; }
    public void reserve(Integer qty) { ... }
    public void release(Integer qty) { ... }
    public void confirmReservation(Integer qty) { ... }
}
```

**Tác động:**
- Inventory là entity QUAN TRỌNG cho business logic
- Quản lý tồn kho, đặt trước, tránh overselling
- Thiếu entity này làm diagram KHÔNG phản ánh đúng hệ thống

**Mức độ nghiêm trọng:** 🔴 CRITICAL

---

#### 2. THIẾU Module Promotion

**Vấn đề:** Không có Coupon và CouponUsage entities trong diagram.

**Thực tế trong code:**
```java
// File: backend/src/main/java/fit/iuh/backend/modules/promotion/domain/entity/Coupon.java
@Entity
@Table(name = "coupons")
public class Coupon {
    private UUID id;
    private String code; // Unique coupon code
    private DiscountType discountType; // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer perUserLimit;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private Boolean isActive;
    
    // Rich business logic
    public boolean isValid() { ... }
    public boolean canApplyToOrder(BigDecimal amount) { ... }
    public BigDecimal calculateDiscount(BigDecimal amount) { ... }
}

// File: backend/src/main/java/fit/iuh/backend/modules/promotion/domain/entity/CouponUsage.java
@Entity
@Table(name = "coupon_usages")
public class CouponUsage {
    private UUID id;
    private UUID couponId;
    private UUID userId;
    private UUID orderId;
    private BigDecimal discountAmount;
    private LocalDateTime usedAt;
}
```

**Tác động:**
- Coupon là tính năng marketing quan trọng
- CouponUsage tracking prevents fraud
- Order entity references couponId nhưng diagram không hiển thị relationship

**Mức độ nghiêm trọng:** 🔴 CRITICAL

---

#### 3. Không Khớp Với Implementation Thực Tế

##### 3.1. Product Entity

**Diagram (SAI):**
```mermaid
class Product {
    -Category category          # SAI!
    -Brand brand                # SAI!
    -Set~ProductImage~ images   # SAI!
    -Set~Review~ reviews        # SAI!
    -Integer viewCount          # SAI! (type)
}
```

**Code Thực Tế (ĐÚNG):**
```java
@Entity
@Table(name = "products")
public class Product extends BaseEntity {
    private String name;
    private String slug;
    private String sku;
    private String description;
    private String shortDescription;  // THIẾU trong diagram
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private ProductStatus status;
    
    // Foreign Keys - KHÔNG phải navigation properties
    private UUID categoryId;   // Chỉ lưu ID
    private UUID brandId;      // Chỉ lưu ID
    
    private Long viewCount;    // Long, không phải Integer
    private Boolean isFeatured;
    private Boolean isNew;
    private Integer displayOrder;  // THIẾU trong diagram
    
    // KHÔNG có collections
    // KHÔNG có Set<ProductImage>
    // KHÔNG có Set<Review>
}
```

**Vấn đề:**
- ❌ Diagram vẽ navigation properties (Category category, Brand brand)
- ✅ Code chỉ lưu foreign keys (UUID categoryId, UUID brandId)
- ❌ Diagram hiển thị collections (Set<ProductImage>, Set<Review>)
- ✅ Code KHÔNG có collections (unidirectional relationships)
- ❌ Thiếu fields: shortDescription, displayOrder
- ❌ Sai kiểu dữ liệu: viewCount là Long, không phải Integer

**Nguyên nhân:** Diagram được vẽ theo lý thuyết JPA, không theo implementation thực tế.

##### 3.2. Category Entity

**Diagram (SAI):**
```mermaid
class Category {
    -Category parent           # SAI!
    -Set~Category~ children    # SAI!
}
```

**Code Thực Tế (ĐÚNG):**
```java
@Entity
@Table(name = "categories")
public class Category extends BaseEntity {
    private String name;
    private String slug;
    private String description;
    
    private UUID parentId;     // Self-referencing bằng ID
    
    private Integer displayOrder;
    private Boolean isActive;   // THIẾU trong diagram
    
    // KHÔNG có navigation properties
    // KHÔNG có Category parent
    // KHÔNG có Set<Category> children
}
```

**Vấn đề:**
- ❌ Diagram vẽ bidirectional tree structure
- ✅ Code chỉ lưu parentId (unidirectional)
- ❌ Thiếu field: isActive

##### 3.3. User Entity

**Diagram (Chấp nhận được):**
```mermaid
class User {
    -Set~Role~ roles
    -Set~Address~ addresses
    -Set~RefreshToken~ refreshTokens
}
```

**Code Thực Tế:**
```java
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private UserStatus status;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", ...)
    private Set<Role> roles = new HashSet<>();  // OK: Có trong code
    
    // KHÔNG có Set<Address>
    // KHÔNG có Set<RefreshToken>
}
```

**Vấn đề:**
- ✅ roles collection tồn tại (many-to-many)
- ❌ addresses collection KHÔNG tồn tại (chỉ có unidirectional từ Address)
- ❌ refreshTokens collection KHÔNG tồn tại

##### 3.4. Address Entity

**Code Thực Tế:**
```java
@Entity
@Table(name = "addresses")
public class Address extends BaseEntity {
    private UUID userId;       // Foreign key
    private String fullName;
    private String phone;
    private String street;
    private String ward;
    private String district;
    private String city;
    private String country;    // Có trong code
    private AddressType type;  // ENUM - THIẾU trong diagram
    private Boolean isDefault;
}

public enum AddressType {  // THIẾU hoàn toàn trong diagram
    HOME,
    OFFICE,
    OTHER
}
```

**Vấn đề:**
- ❌ Thiếu AddressType enum
- ❌ Thiếu field: country, type

##### 3.5. Order Entity

**Diagram (Thiếu):**
```mermaid
class Order {
    -String shippingAddress
    -String billingAddress
    # Thiếu: notes
}
```

**Code Thực Tế:**
```java
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {
    private UUID userId;
    private BigDecimal totalAmount;
    private UUID couponId;        // Reference to Coupon
    private String couponCode;    // Snapshot
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private String billingAddress;
    private String notes;         // THIẾU trong diagram
    private LocalDateTime orderDate;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items; // OK: Collection tồn tại
}
```

**Vấn đề:**
- ❌ Thiếu field: notes
- ✅ items collection đúng (composition relationship)

##### 3.6. Payment Entity

**Diagram:**
```mermaid
class Payment {
    -PaymentProvider provider   # SAI! Không tồn tại
    -String responseData        # Có trong diagram
}
```

**Code Thực Tế:**
```java
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {
    private UUID orderId;
    private BigDecimal amount;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;  // Không phải PaymentProvider!
    private String transactionId;
    private LocalDateTime paymentDate;    // THIẾU trong diagram
    private String notes;                 // Không phải responseData
}
```

**Vấn đề:**
- ❌ PaymentProvider enum KHÔNG tồn tại
- ✅ Sử dụng PaymentMethod enum từ Order module
- ❌ Thiếu field: paymentDate
- ❌ Sai tên field: notes (không phải responseData)

---

#### 4. Vấn Đề Về OrderStatus Enum

**Diagram:**
```mermaid
enum OrderStatus {
    PENDING_PAYMENT
    CONFIRMED
    PROCESSING
    SHIPPING
    COMPLETED
    CANCELLED
    PAYMENT_FAILED
}
```

**Code Thực Tế:**
```java
public enum OrderStatus {
    PENDING,            // THIẾU trong diagram
    PENDING_PAYMENT,
    CONFIRMED,
    PROCESSING,
    SHIPPING,
    COMPLETED,
    CANCELLED,
    PAYMENT_FAILED,
    REFUNDED            // THIẾU trong diagram
}
```

**Vấn đề:**
- ❌ Thiếu: PENDING
- ❌ Thiếu: REFUNDED

---

## 📊 So Sánh Chi Tiết: Mermaid vs Thực Tế

### Module Identity

| Entity | Trong Diagram | Trong Code | Đánh Giá |
|--------|---------------|------------|----------|
| User | ✅ Có | ✅ Có | ⚠️ Collections không chính xác |
| Role | ✅ Có | ✅ Có | ✅ Khớp |
| Address | ✅ Có | ✅ Có | ❌ Thiếu AddressType enum |
| RefreshToken | ✅ Có | ✅ Có | ⚠️ Relationship không chính xác |
| UserStatus | ✅ Có | ✅ Có | ✅ Khớp |
| AddressType | ❌ Không có | ✅ Có | ❌ THIẾU |

### Module Catalog

| Entity | Trong Diagram | Trong Code | Đánh Giá |
|--------|---------------|------------|----------|
| Product | ✅ Có | ✅ Có | ❌ Nhiều sai khác |
| Category | ✅ Có | ✅ Có | ❌ Relationships sai |
| Brand | ✅ Có | ✅ Có | ✅ Tương đối khớp |
| ProductImage | ✅ Có | ✅ Có | ⚠️ Relationship khác |
| ProductDetail | ✅ Có | ✅ Có | ✅ Khớp |
| Review | ✅ Có | ✅ Có | ⚠️ Foreign key pattern |
| Wishlist | ✅ Có | ✅ Có | ✅ Khớp |
| Cart | ✅ Có | ✅ Có | ✅ Khớp |
| CartItem | ✅ Có | ✅ Có | ✅ Khớp |
| ProductStatus | ✅ Có | ✅ Có | ✅ Khớp |

### Module Inventory

| Entity | Trong Diagram | Trong Code | Đánh Giá |
|--------|---------------|------------|----------|
| Inventory | ❌ KHÔNG CÓ | ✅ Có | 🔴 CRITICAL - THIẾU |

### Module Order

| Entity | Trong Diagram | Trong Code | Đánh Giá |
|--------|---------------|------------|----------|
| Order | ✅ Có | ✅ Có | ❌ Thiếu notes field |
| OrderItem | ✅ Có | ✅ Có | ✅ Khớp |
| OrderStatus | ✅ Có | ✅ Có | ❌ Thiếu PENDING, REFUNDED |
| PaymentMethod | ✅ Có | ✅ Có | ⚠️ Thiếu VNPAY |

### Module Payment

| Entity | Trong Diagram | Trong Code | Đánh Giá |
|--------|---------------|------------|----------|
| Payment | ✅ Có | ✅ Có | ❌ Sai enum, thiếu fields |
| PaymentStatus | ✅ Có | ✅ Có | ⚠️ Thiếu CANCELLED |
| PaymentProvider | ✅ Có | ❌ KHÔNG TỒN TẠI | ❌ Entity ảo |

### Module Promotion

| Entity | Trong Diagram | Trong Code | Đánh Giá |
|--------|---------------|------------|----------|
| Coupon | ❌ KHÔNG CÓ | ✅ Có | 🔴 CRITICAL - THIẾU |
| CouponUsage | ❌ KHÔNG CÓ | ✅ Có | 🔴 CRITICAL - THIẾU |
| DiscountType | ❌ KHÔNG CÓ | ✅ Có | ❌ THIẾU |

---

## 🎨 Tại Sao Nên Dùng PlantUML?

### 1. **Chuyên Nghiệp và Chuẩn Mực**

PlantUML là công cụ được sử dụng rộng rãi trong industry:
- ✅ Chuẩn UML 2.0
- ✅ Hỗ trợ đầy đủ các loại relationships
- ✅ Có stereotypes (<<Entity>>, <<Aggregate Root>>, <<Enumeration>>)
- ✅ Export sang nhiều format (PNG, SVG, PDF)

### 2. **Syntax Rõ Ràng và Mạnh Mẽ**

**Mermaid (hạn chế):**
```mermaid
User "1" -- "*" Role : has
Product "*" -- "1" Category : belongs to
```

**PlantUML (mạnh mẽ hơn):**
```plantuml
User "1" -- "0..*" Address : owns >
Product "*" ..> "1" Category : belongs to\n{categoryId}
Order "1" *-- "1..*" OrderItem : contains >
```

**Ưu điểm PlantUML:**
- `*--` = Composition (strong ownership)
- `o--` = Aggregation (weak ownership)
- `-->` = Dependency
- `..>` = Weak dependency (cross-module)
- Hỗ trợ multiplicity chi tiết: `0..1`, `1..*`, `0..*`
- Có thể thêm role names và constraints

### 3. **Notes và Documentation**

PlantUML cho phép thêm notes chi tiết:

```plantuml
note right of Product
    **Aggregate Root**
    - Uses UUID foreign keys (categoryId, brandId)
    - NO JPA navigation properties
    - Slug for SEO-friendly URLs
end note
```

### 4. **Packages và Modularity**

PlantUML hỗ trợ packages với màu sắc:

```plantuml
package "Identity Module" #E8F5E9 {
    class User { ... }
    class Role { ... }
}

package "Catalog Module" #E3F2FD {
    class Product { ... }
    class Category { ... }
}
```

### 5. **Stereotypes**

```plantuml
class User <<Entity, Aggregate Root>> { ... }
class Address <<Value Object>> { ... }
enum UserStatus <<Enumeration>> { ... }
```

### 6. **Legend và Documentation**

```plantuml
legend right
    **Notation Guide:**
    --> Dependency (FK reference)
    -- Association
    *-- Composition (owns lifecycle)
    o-- Aggregation (has)
    ..> Weak dependency (cross-module)
endlegend
```

---

## 🔧 Đề Xuất Cải Tiến

### 1. Sử dụng PlantUML Scripts

Đã tạo 4 file PlantUML trong `docs/diagrams/`:

#### ✅ `identity-module.puml`
- User, Role, Address, RefreshToken
- **BỔ SUNG:** AddressType enum
- Notes giải thích patterns
- Đúng với implementation (foreign keys)

#### ✅ `catalog-module.puml`
- Product, Category, Brand, ProductImage, ProductDetail, Review
- Cart, CartItem, Wishlist
- **BỔ SUNG:** Inventory module
- **SỬA:** Product dùng categoryId/brandId (không phải objects)
- **SỬA:** Category dùng parentId (không phải parent/children)
- **BỔ SUNG:** shortDescription, displayOrder fields
- **SỬA:** viewCount type thành Long

#### ✅ `order-payment-modules.puml`
- Order, OrderItem, Payment
- **BỔ SUNG:** Coupon, CouponUsage entities
- **BỔ SUNG:** DiscountType enum
- **SỬA:** Payment dùng PaymentMethod (không phải PaymentProvider)
- **BỔ SUNG:** notes field trong Order
- **BỔ SUNG:** paymentDate field trong Payment
- State machine diagram cho OrderStatus

#### ✅ `complete-system-class-diagram.puml`
- Tất cả modules trong một diagram tổng quan
- Hiển thị cross-module dependencies
- Color-coded packages
- Architecture notes
- Business rules documentation

### 2. Cách Sử Dụng PlantUML

#### Option 1: Online (Nhanh)
```
https://www.plantuml.com/plantuml/uml/
```
Copy nội dung file .puml và paste vào.

#### Option 2: VS Code Extension
```
Extension: PlantUML
Cài đặt: Ctrl+P -> ext install plantuml
Xem: Alt+D
```

#### Option 3: Local Server
```bash
# Install
npm install -g node-plantuml

# Generate PNG
puml generate identity-module.puml -o output/
```

#### Option 4: IntelliJ IDEA
```
Plugin: PlantUML Integration
Settings -> Plugins -> Marketplace -> Search "PlantUML"
```

### 3. Cập Nhật Documentation

**Cần làm:**

1. ✅ **Tạo PlantUML diagrams** (DONE - 4 files)
2. ⏳ **Generate PNG/SVG images** từ PlantUML
3. ⏳ **Cập nhật Chuong3_PhanTichThietKe.md:**
   - Thay thế Mermaid diagrams bằng PlantUML images
   - Hoặc giữ cả hai (Mermaid cho quick view, PlantUML cho chi tiết)
4. ⏳ **Bổ sung các module còn thiếu:**
   - Section 3.4.4: Inventory Module
   - Section 3.4.5: Promotion Module (Coupon & CouponUsage)
5. ⏳ **Sửa các mô tả:**
   - Product entity: categoryId, brandId (không phải objects)
   - Category entity: parentId (không phải parent/children)
   - Payment entity: PaymentMethod (không phải PaymentProvider)
   - Bổ sung các fields còn thiếu

---

## 📝 Template Cho Documentation Mới

### Đề xuất cấu trúc section mới:

```markdown
### 3.4.4. Class Diagram: Inventory Module

Module Inventory quản lý tồn kho sản phẩm và xử lý logic đặt trước (reservation).

![Inventory Module Class Diagram](diagrams/inventory-module.png)

Inventory entity có quan hệ one-to-one với Product, theo dõi số lượng 
tồn kho (quantity) và số lượng đã đặt trước (reservedQuantity). 

**Business Logic:**
- `getAvailableQuantity()`: Tính số lượng khả dụng (quantity - reservedQuantity)
- `reserve(qty)`: Đặt trước số lượng khi tạo order
- `confirmReservation(qty)`: Xác nhận và trừ số lượng khi thanh toán thành công
- `release(qty)`: Giải phóng đặt trước khi order bị hủy

**Tại sao tách riêng module Inventory:**
1. Separation of Concerns: Catalog quản lý thông tin sản phẩm, Inventory quản lý số lượng
2. Future scalability: Có thể thêm multi-warehouse, location-based inventory
3. Concurrency handling: Inventory operations cần locking mechanism riêng
4. Prevent overselling: Critical business logic tách biệt khỏi catalog
```

```markdown
### 3.4.5. Class Diagram: Promotion Module

Module Promotion quản lý mã giảm giá (coupons) và tracking việc sử dụng.

![Promotion Module Class Diagram](diagrams/promotion-module.png)

**Coupon Entity:**
- Hỗ trợ 2 loại giảm giá: PERCENTAGE (phần trăm) và FIXED_AMOUNT (số tiền cố định)
- Time-bounded: validFrom, validTo
- Usage limits: usageLimit (tổng), perUserLimit (mỗi user)
- Business rules: minOrderAmount (đơn tối thiểu), maxDiscountAmount (giảm tối đa)

**CouponUsage Entity:**
- Audit trail: Ghi lại mỗi lần coupon được sử dụng
- Links: userId, couponId, orderId
- Prevents fraud: Kiểm tra duplicate usage
- Analytics: Track coupon effectiveness

**Workflow:**
1. User áp dụng coupon code tại checkout
2. System validates: isValid(), canApplyToOrder()
3. Calculate discount: calculateDiscount(orderAmount)
4. Create CouponUsage record
5. Increment Coupon.usedCount
6. Link to Order via couponId
```

---

## 🎯 Action Items

### High Priority 🔴

- [ ] Generate PNG images từ 4 PlantUML files
- [ ] Thêm Section 3.4.4: Inventory Module vào documentation
- [ ] Thêm Section 3.4.5: Promotion Module vào documentation
- [ ] Sửa Product entity diagram (categoryId/brandId thay vì objects)
- [ ] Sửa Category entity diagram (parentId thay vì parent/children)
- [ ] Thêm AddressType enum vào Identity Module

### Medium Priority 🟡

- [ ] Bổ sung fields còn thiếu: notes, paymentDate, shortDescription, displayOrder
- [ ] Sửa Payment entity (PaymentMethod thay vì PaymentProvider)
- [ ] Update OrderStatus enum (thêm PENDING, REFUNDED)
- [ ] Update PaymentStatus enum (thêm CANCELLED)
- [ ] Thêm notes giải thích implementation patterns

### Low Priority 🟢

- [ ] Tạo sequence diagrams với PlantUML
- [ ] Tạo state machine diagrams với PlantUML
- [ ] Setup CI/CD để auto-generate diagrams
- [ ] Create interactive documentation với Structurizr

---

## 📚 Tài Liệu Tham Khảo

### PlantUML Resources

1. **Official Documentation:**
   - https://plantuml.com/class-diagram
   - https://plantuml.com/guide

2. **Best Practices:**
   - https://modeling-languages.com/plantuml-tutorial/
   - https://real-world-plantuml.com/

3. **Tools:**
   - VS Code Extension: PlantUML
   - IntelliJ Plugin: PlantUML Integration
   - Online Editor: plantuml.com/plantuml

### UML Best Practices

1. **Martin Fowler - UML Distilled**
   - Focus on communication, not perfection
   - Use stereotypes to add context
   - Keep diagrams focused and modular

2. **Domain-Driven Design Patterns:**
   - Aggregate Root pattern
   - Value Objects vs Entities
   - Bounded Contexts

3. **JPA Implementation Patterns:**
   - Foreign keys vs Navigation properties
   - Unidirectional vs Bidirectional relationships
   - Lazy loading considerations

---

## 📊 Bảng So Sánh: Mermaid vs PlantUML

| Tiêu Chí | Mermaid | PlantUML | Ghi Chú |
|----------|---------|----------|---------|
| **Syntax** | Đơn giản | Phức tạp hơn | PlantUML mạnh mẽ hơn |
| **Relationships** | Cơ bản | Đầy đủ | PlantUML có aggregation, composition |
| **Stereotypes** | ❌ Không | ✅ Có | <<Entity>>, <<Aggregate Root>> |
| **Notes** | ⚠️ Hạn chế | ✅ Mạnh mẽ | PlantUML có positioning, formatting |
| **Packages** | ❌ Không | ✅ Có | Color-coded modules |
| **Legend** | ❌ Không | ✅ Có | Documentation trong diagram |
| **Export** | SVG | PNG, SVG, PDF | PlantUML đa dạng hơn |
| **Tooling** | Browser | Editor, IDE | PlantUML có nhiều tools hơn |
| **Learning Curve** | Dễ | Trung bình | Mermaid dễ học hơn |
| **Professional Use** | ⚠️ Github/Gitlab | ✅ Industry standard | PlantUML chuẩn hơn |
| **Maintenance** | Dễ | Dễ | Cả hai đều text-based |
| **Version Control** | ✅ Tốt | ✅ Tốt | Cả hai friendly với Git |

**Kết luận:** 
- **Mermaid**: Tốt cho quick documentation, README files, simple diagrams
- **PlantUML**: Tốt cho professional documentation, complex systems, formal design

**Đề xuất:** Sử dụng PlantUML cho project documentation chính thức.

---

## ✅ Kết Luận

### Điểm Tích Cực
1. Team đã có ý thức về documentation
2. Mermaid diagrams dễ đọc và trực quan
3. Mô tả nghiệp vụ chi tiết và rõ ràng

### Vấn Đề Cần Khắc Phục Ngay
1. 🔴 **CRITICAL**: Thiếu Inventory module (ảnh hưởng business logic)
2. 🔴 **CRITICAL**: Thiếu Promotion module (Coupon, CouponUsage)
3. ❌ **HIGH**: Product entity không đúng với code (relationships sai)
4. ❌ **HIGH**: Category entity không đúng với code (parent/children sai)
5. ⚠️ **MEDIUM**: Nhiều fields và enums còn thiếu

### Khuyến Nghị
1. ✅ **Chuyển sang PlantUML** cho professional documentation
2. ✅ **Sử dụng PlantUML files đã tạo** trong `docs/diagrams/`
3. ✅ **Bổ sung đầy đủ các module còn thiếu**
4. ✅ **Sync diagram với code thực tế** (dùng foreign keys, không phải navigation)
5. ✅ **Thêm notes giải thích patterns và business rules**

### Next Steps
1. Review và approve PlantUML diagrams
2. Generate images (PNG/SVG)
3. Update documentation với diagrams mới
4. Team training về PlantUML basics
5. Establish process: Code changes → Update PlantUML → Generate images

---

**Tài liệu này sẽ được cập nhật khi có thay đổi về architecture hoặc implementation.**

**Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Development Team