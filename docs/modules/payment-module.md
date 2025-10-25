# Module: Payment

## 1. Trách nhiệm

Module **Payment** chịu trách nhiệm xử lý và ghi nhận tất cả các giao dịch tài chính của hệ thống.

-   Tích hợp với các cổng thanh toán bên thứ ba (ví dụ: VNPAY, Stripe) để xử lý thanh toán trực tuyến.
-   Ghi nhận kết quả giao dịch (thành công, thất bại) vào hệ thống.
-   Cung cấp thông tin giao dịch cho các module khác, đặc biệt là `order-module`.

## 2. Các thực thể chính (Entities)

-   `payments`: Lưu trữ thông tin về một giao dịch thanh toán, bao gồm `order_id`, số tiền, phương thức, trạng thái, và mã giao dịch từ bên thứ ba.

## 3. Các luồng nghiệp vụ chính (Usecases)

### 3.1. Tạo giao dịch thanh toán

-   **Lắng nghe sự kiện:** `OrderCreatedEvent` từ `order-module`.
-   **Quy trình:**
    1.  Khi một đơn hàng được tạo, module này sẽ tạo một bản ghi `Payment` tương ứng với trạng thái `pending`.
    2.  Dựa trên `paymentMethod` được chọn trong đơn hàng, nó sẽ chuẩn bị các thông tin cần thiết để gọi API của cổng thanh toán.

### 3.2. Xử lý Callback/IPN từ Cổng thanh toán

-   **Quy trình:**
    1.  Cung cấp một endpoint (API) để cổng thanh toán có thể gọi lại (callback) hoặc gửi thông báo xử lý tức thời (Instant Payment Notification - IPN).
    2.  Xác thực tính toàn vẹn của dữ liệu nhận được từ cổng thanh toán (ví dụ: qua chữ ký số).
    3.  Cập nhật trạng thái của bản ghi `Payment` tương ứng (`success` hoặc `failed`).
    4.  Nếu thanh toán thành công, phát ra sự kiện `PaymentSuccessEvent`.
    5.  Nếu thanh toán thất bại, phát ra sự kiện `PaymentFailedEvent`.

## 4. API Giao tiếp (Public API)

Module này không cần cung cấp API công khai vì nó hoạt động chủ yếu dựa trên sự kiện và tương tác với hệ thống bên ngoài.

## 5. Sự kiện (Events)

Module này phát ra các sự kiện:

-   `PaymentSuccessEvent`: Khi một giao dịch được xác nhận là thành công.
-   `PaymentFailedEvent`: Khi một giao dịch thất bại.

Module này lắng nghe các sự kiện:

-   `OrderCreatedEvent` (từ `order-module`): Để khởi tạo một giao dịch thanh toán.