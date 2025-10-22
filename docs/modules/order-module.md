# Module: Order

## 1. Trách nhiệm

Module **Order** chịu trách nhiệm cho toàn bộ quy trình xử lý đơn hàng sau khi người dùng hoàn tất giỏ hàng.

-   Tạo đơn hàng từ thông tin giỏ hàng.
-   Tính toán các giá trị tài chính của đơn hàng (tạm tính, phí vận chuyển, giảm giá, tổng cộng).
-   Quản lý vòng đời của đơn hàng (từ `pending` đến `delivered` hoặc `cancelled`).
-   Quản lý thông tin vận chuyển và các lô hàng (`Shipment`).
-   Tương tác với các module khác để hoàn tất quy trình.

## 2. Các thực thể chính (Entities)

-   `orders`: Lưu thông tin chính của đơn hàng (mã đơn hàng, thông tin người nhận, trạng thái, tổng tiền...).
-   `order_items`: Các sản phẩm cụ thể trong một đơn hàng.
-   `shipments`: Thông tin về lô hàng được tạo ra từ một đơn hàng (nhà vận chuyển, mã vận đơn...).

## 3. Các luồng nghiệp vụ chính (Usecases)

### 3.1. Tạo đơn hàng (Checkout)

-   **Input:** `addressId`, `paymentMethod`, (tùy chọn) `couponCode`.
-   **Quy trình:**
    1.  Lấy thông tin giỏ hàng của người dùng từ `cart-module`.
    2.  Lấy thông tin địa chỉ từ `identity-access-module`.
    3.  (Nếu có `couponCode`) Tương tác với `promotion-module` để xác thực và lấy thông tin giảm giá.
    4.  Tạo một bản ghi `Order` mới với trạng thái `pending`.
    5.  Sao chép các `CartItem` thành các `OrderItem`, lưu lại giá sản phẩm tại thời điểm đặt hàng.
    6.  Tính toán `subtotal`, `shipping_fee`, `discount_amount`, `total_amount`.
    7.  Phát ra sự kiện `OrderCreatedEvent` chứa thông tin đơn hàng. Module `inventory` sẽ lắng nghe sự kiện này để giữ hàng.
    8.  Chuyển hướng người dùng đến cổng thanh toán hoặc hiển thị thông tin thanh toán (tùy `paymentMethod`).

### 3.2. Xử lý sau thanh toán

-   **Lắng nghe sự kiện:** `PaymentSuccessEvent` hoặc `PaymentFailedEvent` từ `payment-module`.
-   **Quy trình (khi thành công):**
    1.  Cập nhật trạng thái `Order` thành `confirmed`.
    2.  Cập nhật `payment_status` thành `completed`.
    3.  Phát ra sự kiện `OrderConfirmedEvent`. Module `inventory` sẽ lắng nghe để trừ tồn kho thực tế.
-   **Quy trình (khi thất bại):**
    1.  Cập nhật trạng thái `Order` thành `cancelled`.
    2.  Cập nhật `payment_status` thành `failed`.
    3.  Phát ra sự kiện `OrderCancelledEvent`. Module `inventory` sẽ lắng nghe để hoàn trả lại hàng đã giữ.

### 3.3. Quản lý đơn hàng (Admin)

-   Cung cấp API để admin xem danh sách đơn hàng, xem chi tiết, và cập nhật trạng thái đơn hàng (ví dụ: từ `confirmed` sang `processing`, `shipped`...).
-   Khi admin cập nhật trạng thái sang `shipped`, hệ thống cho phép nhập thông tin `tracking_number` và `carrier`, tạo ra một bản ghi `Shipment`.

### 3.4. Theo dõi đơn hàng (Customer)

-   Cung cấp API để người dùng xem lịch sử đơn hàng và trạng thái chi tiết của từng đơn hàng.

## 4. API Giao tiếp (Public API)

```java
public interface OrderApi {

    /**
     * Kiểm tra xem một người dùng đã từng mua một sản phẩm hay chưa.
     * Được sử dụng bởi `catalog-module` để cho phép/không cho phép viết review.
     */
    boolean hasUserPurchasedProduct(UUID userId, UUID productId);
}
```

## 5. Sự kiện (Events)

Module này phát ra các sự kiện:

-   `OrderCreatedEvent`: Khi một đơn hàng mới được tạo.
-   `OrderConfirmedEvent`: Khi đơn hàng đã được thanh toán thành công và xác nhận.
-   `OrderCancelledEvent`: Khi đơn hàng bị hủy.
-   `OrderShippedEvent`: Khi đơn hàng được giao cho đơn vị vận chuyển.

Module này lắng nghe các sự kiện:

-   `PaymentSuccessEvent` / `PaymentFailedEvent` (từ `payment-module`).
-   `InventoryNotSufficientEvent` (từ `inventory-module`): Để hủy đơn hàng nếu không đủ hàng.