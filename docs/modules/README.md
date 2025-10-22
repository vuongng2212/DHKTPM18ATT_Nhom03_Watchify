# Tài liệu Chi tiết các Module Backend

Thư mục này chứa các tài liệu mô tả chi tiết về thiết kế và triển khai của từng module trong hệ thống backend Watchify.

Mỗi module được thiết kế để hoạt động như một đơn vị nghiệp vụ độc lập, có trách nhiệm và ranh giới rõ ràng.

## Danh sách các Module

Dưới đây là danh sách các module chính của hệ thống. Click vào từng module để xem tài liệu chi tiết.

1.  **[Identity & Access Module](./identity-access-module.md):**
    -   **Nghiệp vụ:** Quản lý tài khoản người dùng (`User`), vai trò (`Role`), địa chỉ (`Address`), cũng như xử lý các luồng xác thực (đăng nhập, đăng ký) và phân quyền.
    -   **Bảng dữ liệu chính:** `users`, `roles`, `user_roles`, `addresses`.

2.  **[Catalog Module](./catalog-module.md):**
    -   **Nghiệp vụ:** Quản lý toàn bộ thông tin liên quan đến sản phẩm, bao gồm sản phẩm (`Product`), danh mục (`Category`), thương hiệu (`Brand`), bộ sưu tập (`Collection`), thông số kỹ thuật (`ProductDetail`), hình ảnh (`ProductImage`), và đánh giá (`Review`).
    -   **Bảng dữ liệu chính:** `products`, `categories`, `brands`, `collections`, `product_details`, `product_images`, `reviews`.

3.  **[Inventory Module](./inventory-module.md):**
    -   **Nghiệp vụ:** Theo dõi và quản lý số lượng tồn kho (`Inventory`) của sản phẩm. Module này sẽ tương tác với các module khác thông qua cơ chế sự kiện (ví dụ: `OrderCreatedEvent`).
    -   **Bảng dữ liệu chính:** `inventories`.

4.  **[Cart Module](./cart-module.md):**
    -   **Nghiệp vụ:** Quản lý giỏ hàng (`Cart`, `CartItem`) cho cả người dùng đã đăng nhập và khách vãng lai. Quản lý danh sách sản phẩm yêu thích (`Wishlist`).
    -   **Bảng dữ liệu chính:** `carts`, `cart_items`, `wishlists`.

5.  **[Order Module](./order-module.md):**
    -   **Nghiệp vụ:** Xử lý quy trình đặt hàng (`Order`, `OrderItem`), bao gồm việc tạo đơn hàng, tính toán tổng tiền và quản lý thông tin giao hàng. Module này cũng quản lý các lô hàng (`Shipment`).
    -   **Bảng dữ liệu chính:** `orders`, `order_items`, `shipments`.

6.  **[Payment Module](./payment-module.md):**
    -   **Nghiệp vụ:** Ghi nhận và quản lý các giao dịch thanh toán (`Payment`) liên quan đến đơn hàng. Tích hợp với các cổng thanh toán bên ngoài.
    -   **Bảng dữ liệu chính:** `payments`.

7.  **[Promotion Module](./promotion-module.md):**
    -   **Nghiệp vụ:** Quản lý các chương trình khuyến mãi (`Promotion`) và mã giảm giá (`Coupon`), cũng như theo dõi việc sử dụng chúng (`CouponUsage`).
    -   **Bảng dữ liệu chính:** `promotions`, `promotion_products`, `coupons`, `coupon_usages`.

8.  **[Shared Kernel](./shared-kernel.md):**
    -   **Nghiệp vụ:** Không chứa nghiệp vụ cụ thể. Đây là module dùng chung, chứa các thành phần cốt lõi như các lớp base, tiện ích, cấu hình chung, và các định nghĩa sự kiện (Events) để các module khác có thể giao tiếp với nhau một cách bất đồng bộ.