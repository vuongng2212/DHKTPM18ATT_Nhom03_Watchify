# Module: Promotion

## 1. Trách nhiệm

Module **Promotion** chịu trách nhiệm quản lý tất cả các loại hình khuyến mãi, giảm giá trong hệ thống.

-   Quản lý mã giảm giá (`Coupon`): tạo mã, định nghĩa giá trị (theo % hoặc số tiền cố định), các điều kiện áp dụng (đơn hàng tối thiểu, ngày hết hạn, số lần sử dụng).
-   Quản lý các chương trình khuyến mãi lớn (`Promotion`), ví dụ: Flash Sale, Giảm giá theo danh mục.
-   Xác thực và áp dụng mã giảm giá vào đơn hàng.
-   Theo dõi lịch sử sử dụng mã giảm giá.

## 2. Các thực thể chính (Entities)

-   `coupons`: Lưu thông tin về các mã giảm giá.
-   `promotions`: Lưu thông tin về các chương trình khuyến mãi.
-   `coupon_usages`: Ghi lại lịch sử mỗi lần một mã giảm giá được sử dụng thành công trong một đơn hàng.
-   `promotion_products`: Bảng trung gian để áp dụng một chương trình khuyến mãi cho các sản phẩm cụ thể.

## 3. Các luồng nghiệp vụ chính (Usecases)

### 3.1. Quản lý Coupon & Promotion (Admin)

-   Cung cấp các API CRUD để admin có thể quản lý `coupons` và `promotions`.
-   Cho phép thiết lập các điều kiện phức tạp cho mã giảm giá.

### 3.2. Áp dụng mã giảm giá

-   **Input:** `couponCode`, `orderContext` (chứa thông tin về các sản phẩm và tổng tiền tạm tính).
-   **Quy trình:**
    1.  Tìm `Coupon` dựa trên `couponCode`.
    2.  Kiểm tra tất cả các điều kiện của coupon:
        -   Còn hiệu lực không (`is_active`, `start_date`, `end_date`)?
        -   Còn lượt sử dụng không (`max_usage`)?
        -   Đơn hàng có đủ giá trị tối thiểu không (`min_order_value`)?
        -   Coupon có áp dụng cho các sản phẩm trong giỏ hàng không?
    3.  Nếu tất cả điều kiện hợp lệ, tính toán số tiền được giảm và trả về.
    4.  Nếu không, trả về lỗi tương ứng.

### 3.3. Ghi nhận việc sử dụng Coupon

-   **Lắng nghe sự kiện:** `OrderConfirmedEvent` từ `order-module`.
-   **Quy trình:**
    1.  Nếu đơn hàng có áp dụng mã giảm giá, tạo một bản ghi `CouponUsage` để ghi nhận việc mã này đã được sử dụng cho đơn hàng nào, bởi người dùng nào.

## 4. API Giao tiếp (Public API)

```java
public interface PromotionApi {

    /**
     * Xác thực và tính toán giá trị của một mã giảm giá.
     * Được gọi bởi `order-module` trong quá trình checkout.
     * @param couponCode Mã giảm giá.
     * @param context Chứa thông tin về đơn hàng (tổng tiền, danh sách sản phẩm) để kiểm tra điều kiện.
     * @return một đối tượng chứa số tiền được giảm và các thông tin liên quan.
     */
    DiscountResult applyCoupon(String couponCode, OrderContext context);
}
```

`DiscountResult` và `OrderContext` là các lớp DTO được định nghĩa trong `shared-kernel`.

## 5. Sự kiện (Events)

Module này lắng nghe các sự kiện:

-   `OrderConfirmedEvent` (từ `order-module`): Để ghi nhận việc sử dụng mã giảm giá.