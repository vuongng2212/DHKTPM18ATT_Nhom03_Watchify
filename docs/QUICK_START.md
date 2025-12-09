# HƯỚNG DẪN NHANH - CLASS DIAGRAM CẬP NHẬT

## 📋 Tổng Quan

Tài liệu này hướng dẫn nhanh cách sử dụng các class diagram PlantUML đã được cập nhật đầy đủ cho hệ thống Watchify.

**Trạng thái:** ✅ ĐÃ HOÀN THÀNH  
**Coverage:** 100% (20 entities, 8 enums)  
**Số diagrams:** 5 files PlantUML

---

## 🗂️ Danh Sách Files

### PlantUML Diagrams (trong `docs/diagrams/`)

| File | Module | Entities | Dùng cho |
|------|--------|----------|----------|
| `identity-module.puml` | Identity | 4 entities, 2 enums | Hình 3.4.1 |
| `catalog-module.puml` | Catalog | 9 entities, 1 enum | Hình 3.4.2 |
| `inventory-module.puml` | Inventory | 2 entities, 1 enum | Hình 3.4.3 |
| `order-payment-modules.puml` | Order + Payment + Promotion | 6 entities, 5 enums | Hình 3.4.4 |
| `complete-system-class-diagram.puml` | Tất cả | 20+ entities | Hình 3.4.6 |

### Mô Tả (trong `docs/`)

| File | Nội dung | Độ dài |
|------|----------|---------|
| `Chuong3_Section3.4_UPDATED.md` | Mô tả đầy đủ (academic) | ~15,000 từ |
| `Chuong3_Section3.4_CONCISE.md` | Mô tả ngắn gọn | ~4,000 từ |
| `CLASS_DIAGRAM_ANALYSIS.md` | Phân tích chi tiết | ~8,000 từ |
| `EXECUTIVE_SUMMARY.md` | Tóm tắt executive | ~3,000 từ |
| `INVENTORY_MODULE_UPDATE.md` | Chi tiết Inventory update | ~5,000 từ |

---

## ⚡ Bắt Đầu Nhanh (3 Bước)

### Bước 1: Generate Hình Ảnh

**Option A - Online (Không cần cài đặt):**
```
1. Truy cập: https://www.plantuml.com/plantuml/uml/
2. Mở file .puml bất kỳ
3. Copy toàn bộ nội dung
4. Paste vào website
5. Click "Submit"
6. Download PNG hoặc SVG
```

**Option B - Command Line (Nhanh hơn):**
```bash
cd docs/diagrams

# Windows
GENERATE_IMAGES.bat

# Linux/Mac
chmod +x generate_images.sh
./generate_images.sh

# Output: docs/diagrams/output/png/ và output/svg/
```

**Option C - VS Code:**
```
1. Cài extension: PlantUML (Ctrl+P → ext install plantuml)
2. Mở file .puml
3. Alt+D để preview
4. Right-click → Export → PNG/SVG
```

### Bước 2: Copy Nội Dung Mô Tả

**Chọn một trong hai:**

**A. Bản Đầy Đủ** (cho luận văn, báo cáo chi tiết):
```
File: docs/Chuong3_Section3.4_UPDATED.md
Nội dung: Section 3.4.1 → 3.4.6
Độ dài: ~15,000 từ
```

**B. Bản Ngắn Gọn** (cho báo cáo ngắn, presentation):
```
File: docs/Chuong3_Section3.4_CONCISE.md
Nội dung: Section 3.4.1 → 3.4.6
Độ dài: ~4,000 từ
```

### Bước 3: Chèn Vào Báo Cáo

```markdown
## 3.4. Biểu đồ Class và quan hệ giữa các entities

[Copy nội dung từ file đã chọn]

### 3.4.1. Class Diagram: Identity Module

[Mô tả...]

> **[Hình 3.4.1: Class Diagram - Identity Module]**
> 
> ![Identity Module](path/to/identity-module.png)
> 
> *Chú thích: Biểu đồ lớp Identity Module...*

[Tiếp tục mô tả...]
```

---

## 📝 Mapping Hình Ảnh

### Vị Trí Chèn Hình

| Section | Hình | File PlantUML | File PNG |
|---------|------|---------------|----------|
| 3.4.1 | Hình 3.4.1 | `identity-module.puml` | `identity-module.png` |
| 3.4.2 | Hình 3.4.2 | `catalog-module.puml` | `catalog-module.png` |
| 3.4.3 | Hình 3.4.3 | `inventory-module.puml` | `inventory-module.png` |
| 3.4.4 | Hình 3.4.4 | `order-payment-modules.puml` | `order-payment-modules.png` |
| 3.4.5 | Hình 3.4.5 | (included trong 3.4.4) | (dùng chung 3.4.4) |
| 3.4.6 | Hình 3.4.6 | `complete-system-class-diagram.puml` | `complete-system-class-diagram.png` |

### Chú Thích Mẫu

```markdown
> **[Hình 3.4.1: Class Diagram - Identity Module]**
> 
> ![Identity Module](images/identity-module.png)
> 
> *Chú thích: Biểu đồ lớp của Identity Module thể hiện các entities quản lý người dùng, vai trò, địa chỉ và token xác thực. Sử dụng file PlantUML: `docs/diagrams/identity-module.puml`*
```

---

## 🎯 Điểm Nổi Bật Từng Module

### 3.4.1 - Identity Module ✅
- **Entities:** User, Role, Address, RefreshToken
- **Enums:** UserStatus, AddressType
- **Patterns:** RBAC, JWT tokens, Soft delete
- **Highlights:** BCrypt hashing, many-to-many roles

### 3.4.2 - Catalog Module ✅
- **Entities:** Product, Category, Brand, ProductImage, ProductDetail, Review, Cart, Wishlist
- **Key:** Foreign keys thay vì navigation properties
- **Highlights:** SEO slugs, BigDecimal pricing, self-referencing Category

### 3.4.3 - Inventory Module ✅ (MỚI BỔ SUNG)
- **Entities:** Inventory, InventoryTransaction
- **Enum:** TransactionType (9 types)
- **Core Formula:** availableQuantity = quantity - reservedQuantity
- **Highlights:** Reserve/Release/Confirm workflow, concurrency control, audit trail

### 3.4.4 - Order & Payment Modules ✅
- **Entities:** Order, OrderItem, Payment
- **Enums:** OrderStatus (9 states), PaymentStatus, PaymentMethod
- **Patterns:** Snapshot pattern, State machine
- **Highlights:** Address snapshots, product snapshots, payment gateway integration

### 3.4.5 - Promotion Module ✅
- **Entities:** Coupon, CouponUsage
- **Enum:** DiscountType
- **Business Logic:** isValid(), canApplyToOrder(), calculateDiscount()
- **Highlights:** Time-bounded, usage limits, audit trail

### 3.4.6 - System Overview ✅
- **All modules** trong một diagram
- **Dependency graph**
- **Cross-module relationships**
- **Architecture notes**

---

## 🔥 Điểm Khác Biệt So Với Mermaid Cũ

| Aspect | Mermaid Cũ ❌ | PlantUML Mới ✅ |
|--------|--------------|----------------|
| **Inventory Module** | Không có | ✅ Có đầy đủ |
| **Promotion Module** | Không có Coupon | ✅ Có Coupon + CouponUsage |
| **Product Entity** | Dùng navigation properties | ✅ Dùng foreign keys (đúng code) |
| **Category** | Có parent/children | ✅ Chỉ có parentId (đúng code) |
| **Stereotypes** | Không có | ✅ <<Entity>>, <<Aggregate Root>> |
| **Notes** | Hạn chế | ✅ Chi tiết, nhiều vị trí |
| **Audit Trail** | Không đề cập | ✅ InventoryTransaction |
| **Concurrency** | Không đề cập | ✅ Optimistic/Pessimistic locking |

---

## 📊 Checklist Sử Dụng

### Cho Báo Cáo/Luận Văn

- [ ] Generate 5 hình PNG từ PlantUML
- [ ] Chọn mô tả (đầy đủ hoặc ngắn gọn)
- [ ] Copy section 3.4 vào báo cáo
- [ ] Chèn 6 hình ảnh vào đúng vị trí
- [ ] Update caption và chú thích
- [ ] Review format và layout
- [ ] Check tất cả references đúng

### Cho Presentation

- [ ] Generate SVG (scalable, quality tốt hơn)
- [ ] Dùng bản mô tả ngắn gọn
- [ ] Tạo slides cho từng module
- [ ] Highlight key points (dùng notes trong PlantUML)
- [ ] Prepare demo workflow (Inventory reserve/confirm)

### Cho Code Documentation

- [ ] Export PNG/SVG vào `docs/images/`
- [ ] Link diagrams trong README.md
- [ ] Reference trong code comments
- [ ] Update wiki/confluence
- [ ] Share với team

---

## 💡 Tips & Tricks

### Tip 1: High-Quality Export
```bash
# SVG cho presentation (scalable)
java -jar plantuml.jar -tsvg *.puml

# PNG high DPI cho print
java -jar plantuml.jar -tpng -Sdpi=300 *.puml
```

### Tip 2: Selective Export
```bash
# Chỉ generate một file
java -jar plantuml.jar inventory-module.puml

# Generate nhiều files cụ thể
java -jar plantuml.jar identity-module.puml catalog-module.puml
```

### Tip 3: Quick Edit & Preview
```
VS Code:
1. Edit file .puml
2. Alt+D để preview live
3. Ctrl+S save → preview auto update
4. Export khi done
```

### Tip 4: Custom Colors (nếu cần)
```plantuml
!define ENTITY_COLOR #YOUR_COLOR
!define ENUM_COLOR #YOUR_COLOR

skinparam class {
    BackgroundColor ENTITY_COLOR
}
```

---

## ❓ FAQ

### Q1: Tôi nên dùng bản đầy đủ hay ngắn gọn?

**A:** 
- **Đầy đủ** (~15k từ): Luận văn, báo cáo chính thức, technical documentation
- **Ngắn gọn** (~4k từ): Báo cáo môn học, presentation, overview document

### Q2: Làm sao để edit diagrams?

**A:** 
1. Mở file `.puml` trong text editor
2. Edit syntax PlantUML (xem docs/diagrams/README.md)
3. Preview để check
4. Regenerate image

### Q3: Inventory Module có trong file nào?

**A:** 
- **Diagram:** `docs/diagrams/inventory-module.puml` (riêng biệt)
- **Mô tả đầy đủ:** `docs/Chuong3_Section3.4_UPDATED.md` section 3.4.3
- **Mô tả ngắn:** `docs/Chuong3_Section3.4_CONCISE.md` section 3.4.3

### Q4: Tại sao có 5 diagrams nhưng chỉ 6 hình?

**A:** 
- Hình 3.4.5 (Promotion) nằm trong file `order-payment-modules.puml`
- Dùng chung hình 3.4.4, chỉ khác caption

### Q5: File nào là quan trọng nhất?

**A:**
1. `complete-system-class-diagram.puml` - Overview toàn hệ thống
2. `inventory-module.puml` - Module mới bổ sung (critical)
3. Các files còn lại - Chi tiết từng module

---

## 🚀 Next Steps

### Immediate (Ngay)
1. ✅ Generate 5 PNG images
2. ✅ Review chất lượng images
3. ✅ Chọn bản mô tả phù hợp

### Short-term (Tuần này)
4. ✅ Copy nội dung vào báo cáo chính
5. ✅ Chèn hình ảnh
6. ✅ Format và review
7. ✅ Team review

### Long-term (Tháng này)
8. ⏳ Maintain diagrams sync với code
9. ⏳ Training team về PlantUML
10. ⏳ Setup CI/CD auto-generate

---

## 📞 Support

**Có vấn đề?**

1. **Diagrams:** Xem `docs/diagrams/README.md`
2. **Chi tiết:** Xem `docs/CLASS_DIAGRAM_ANALYSIS.md`
3. **Inventory:** Xem `docs/INVENTORY_MODULE_UPDATE.md`
4. **Tổng quan:** Xem `docs/EXECUTIVE_SUMMARY.md`

**Links:**
- PlantUML Guide: https://plantuml.com/class-diagram
- GitHub Issues: [Your repo issues]
- Team Chat: [Your chat link]

---

**Version:** 1.0  
**Last Updated:** 2024  
**Author:** Development Team

**Happy Documenting! 🎉**