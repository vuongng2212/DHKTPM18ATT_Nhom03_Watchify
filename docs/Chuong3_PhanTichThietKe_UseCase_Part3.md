# CHƯƠNG 3: PHÂN TÍCH THIẾT KẾ - ĐẶC TẢ USE CASE (PHẦN 3)

## Các Use Cases quan trọng (tiếp theo - Admin & Order Management)

---

### UC34: Make Payment (Thanh toán qua MoMo) - HOÀN THIỆN

#### Bảng đặc tả Use Case

| Thành phần | Mô tả |
|---|---|
| **Use Case ID** | UC34 |
| **Tên Use Case** | Make Payment (Thanh toán qua MoMo) |
| **Actor** | Customer, MoMo Gateway |
| **Mô tả** | Khách hàng thanh toán đơn hàng qua cổng thanh toán MoMo |
| **Tiền điều kiện** | - Order đã được tạo với status PENDING<br>- Payment record đã được tạo với status PENDING<br>- Có MoMo partner code và secret key |
| **Hậu điều kiện** | - Payment status được cập nhật (SUCCESS/FAILED)<br>- Order status được cập nhật<br>- Nếu thành công: Inventory được giảm<br>- Email xác nhận được gửi |
| **Luồng chính** | 1. Sau khi tạo order thành công, hệ thống tạo Payment entity<br>2. Hệ thống generate requestId và orderId unique<br>3. Hệ thống build MoMo payment request:<br>&nbsp;&nbsp;- partnerCode, amount, orderId, requestId<br>&nbsp;&nbsp;- orderInfo, redirectUrl, ipnUrl<br>4. Hệ thống tạo signature = HMAC_SHA256(rawData, secretKey)<br>5. Hệ thống gửi request đến MoMo API<br>6. MoMo trả về payUrl<br>7. Hệ thống lưu payment details<br>8. Customer được redirect đến MoMo payUrl<br>9. Customer thực hiện thanh toán trên app MoMo<br>10. MoMo gọi IPN callback về hệ thống với kết quả<br>11. Hệ thống verify signature từ MoMo<br>12. Hệ thống cập nhật Payment và Order status<br>13. Nếu thành công: Giảm inventory, gửi email<br>14. MoMo redirect customer về returnUrl<br>15. Hiển thị kết quả thanh toán |
| **Luồng thay thế** | **5a. MoMo API error**<br>&nbsp;&nbsp;1. Log error<br>&nbsp;&nbsp;2. Hiển thị "Lỗi kết nối cổng thanh toán"<br>&nbsp;&nbsp;3. Đề xuất thử lại hoặc chọn COD<br><br>**9a. Customer hủy thanh toán**<br>&nbsp;&nbsp;1. MoMo gọi callback với resultCode != 0<br>&nbsp;&nbsp;2. Cập nhật Payment status = CANCELLED<br>&nbsp;&nbsp;3. Order vẫn giữ status PENDING<br>&nbsp;&nbsp;4. Hiển thị "Thanh toán đã bị hủy"<br><br>**11a. Signature không hợp lệ**<br>&nbsp;&nbsp;1. Log security warning<br>&nbsp;&nbsp;2. Không cập nhật status<br>&nbsp;&nbsp;3. Trả về lỗi cho MoMo |
| **Ngoại lệ** | - MoMo gateway timeout<br>- Invalid signature<br>- Database error<br>- Email service error |

#### Activity Diagram

```plantuml
@startuml
|Customer|
start
:Đã tạo order thành công;

|System|
:Tạo Payment entity
status: PENDING;

:Generate requestId, orderId unique;

:Build MoMo payment request:
- partnerCode
- amount
- orderId
- requestId
- orderInfo
- redirectUrl
- ipnUrl;

:Tạo signature = 
HMAC_SHA256(rawData, secretKey);

:Gửi POST request đến MoMo API;

|MoMo Gateway|
:Nhận request;
:Validate signature;

if (Request hợp lệ?) then (không)
  :Trả về error;
  |System|
  :Log error;
  :Hiển thị "Lỗi kết nối";
  |Customer|
  stop
else (có)
  :Tạo payment session;
  :Trả về payUrl;
  
  |System|
  :Lưu payment details;
  :Redirect customer đến payUrl;
  
  |Customer|
  :Mở MoMo app/web;
  :Xác nhận thanh toán;
  
  if (Xác nhận thanh toán?) then (hủy)
    |MoMo Gateway|
    :resultCode != 0;
    :Gọi IPN callback;
    
    |System|
    :Nhận callback;
    :Verify signature;
    :Cập nhật Payment status = CANCELLED;
    :Redirect về returnUrl;
    
    |Customer|
    :Xem "Thanh toán đã bị hủy";
    stop
    
  else (xác nhận)
    |MoMo Gateway|
    :Xử lý thanh toán;
    
    if (Thanh toán thành công?) then (không)
      :resultCode != 0;
      :Gọi IPN callback;
      
      |System|
      :Verify signature;
      :Cập nhật Payment status = FAILED;
      :Cập nhật Order status = PAYMENT_FAILED;
      :Redirect về returnUrl;
      
      |Customer|
      :Xem "Thanh toán thất bại";
      stop
      
    else (có)
      :resultCode = 0;
      :Gọi IPN callback;
      
      |System|
      :Nhận callback;
      :Verify signature;
      
      if (Signature hợp lệ?) then (không)
        :Log security warning;
        :Trả về error;
        stop
      else (có)
        :Cập nhật Payment:
        - status = SUCCESS
        - transactionId
        - paidAt = now();
        
        :Cập nhật Order:
        - status = CONFIRMED
        - paymentStatus = PAID;
        
        :Giảm inventory cho các sản phẩm;
        
        :Gửi email xác nhận đơn hàng;
        
        :Redirect về returnUrl;
        
        |Customer|
        :Xem "Thanh toán thành công";
        :Xem chi tiết đơn hàng;
        stop
      endif
    endif
  endif
endif

@enduml
```

#### Sequence Diagram

```plantuml
@startuml
actor Customer
participant "OrderPage" as UI
participant "PaymentController" as PayCtrl
participant "PaymentService" as PaySvc
participant "MoMoGateway" as Gateway
participant "PaymentRepository" as PayRepo
participant "OrderRepository" as OrderRepo
participant "InventoryService" as InvSvc
participant "EmailService" as EmailSvc
participant "MoMo API" as MoMo
database "PostgreSQL" as DB

Customer -> UI: Đã tạo order thành công
UI -> UI: Đang chờ thanh toán...

UI -> PayCtrl: POST /api/v1/payment/momo\n{orderId: xxx}

PayCtrl -> PaySvc: createMoMoPayment(orderId)

PaySvc -> OrderRepo: findById(orderId)
OrderRepo -> DB: SELECT * FROM orders WHERE id = ?
DB -> OrderRepo: Order entity
OrderRepo -> PaySvc: Order

PaySvc -> PaySvc: Generate requestId = UUID
PaySvc -> PaySvc: Generate orderId = "ORDER_" + timestamp

PaySvc -> PaySvc: Build payment request:\n- partnerCode: "MOMO_PARTNER"\n- amount: 5000000\n- orderId: "ORDER_123456"\n- requestId: "REQ_UUID"\n- orderInfo: "Thanh toán đơn hàng #123"\n- redirectUrl: "http://localhost:3000/payment/return"\n- ipnUrl: "http://api/payment/ipn/momo"\n- requestType: "captureWallet"

PaySvc -> PaySvc: Create rawSignature = \n"accessKey=...&amount=5000000&extraData=..."\n(sorted params)

PaySvc -> PaySvc: signature = HMAC_SHA256(rawSignature, secretKey)

PaySvc -> Gateway: sendPaymentRequest(momoRequest)

Gateway -> MoMo: POST https://payment.momo.vn/v2/gateway/api/create\n{\n  partnerCode, accessKey, requestId,\n  amount, orderId, orderInfo,\n  redirectUrl, ipnUrl, signature, ...\n}

alt MoMo API error
  MoMo -> Gateway: 500 Internal Server Error
  Gateway -> PaySvc: throw MoMoApiException
  PaySvc -> PayCtrl: Exception
  PayCtrl -> UI: 500 Server Error
  UI -> Customer: "Lỗi kết nối cổng thanh toán. Vui lòng thử lại"
  
else MoMo API success
  MoMo -> MoMo: Validate signature
  MoMo -> MoMo: Create payment session
  MoMo -> Gateway: 200 OK\n{\n  resultCode: 0,\n  message: "Success",\n  payUrl: "https://momo.vn/pay/xxx",\n  deeplink: "momo://pay/xxx"\n}
  
  Gateway -> PaySvc: MoMoResponse
  
  PaySvc -> PaySvc: Create Payment entity:\n- order\n- amount: 5000000\n- paymentMethod: MOMO\n- status: PENDING\n- transactionId: requestId\n- gatewayResponse: momoResponse
  
  PaySvc -> PayRepo: save(payment)
  PayRepo -> DB: INSERT INTO payments...
  DB -> PayRepo: Payment saved
  PayRepo -> PaySvc: Payment entity
  
  PaySvc -> PayCtrl: PaymentDto with payUrl
  
  PayCtrl -> UI: 200 OK\n{\n  paymentId: xxx,\n  payUrl: "https://momo.vn/pay/xxx"\n}
  
  UI -> Customer: Redirect to MoMo payUrl
  
  Customer -> MoMo: Mở MoMo payment page
  MoMo -> Customer: Hiển thị thông tin thanh toán
  
  Customer -> MoMo: Xác nhận thanh toán
  
  alt Payment successful
    MoMo -> MoMo: Xử lý thanh toán
    MoMo -> PayCtrl: POST /api/v1/payment/ipn/momo (IPN Callback)\n{\n  partnerCode, orderId, requestId,\n  amount, resultCode: 0,\n  message: "Success",\n  transId: "MOMO_TRANS_123",\n  signature: "..."\n}
    
    PayCtrl -> PaySvc: processIpn(ipnData)
    
    PaySvc -> PaySvc: Verify signature
    PaySvc -> PaySvc: Create rawSignature from ipnData
    PaySvc -> PaySvc: expectedSignature = HMAC_SHA256(rawSignature, secretKey)
    
    alt Signature mismatch
      PaySvc -> PaySvc: Log security warning
      PaySvc -> PayCtrl: throw InvalidSignatureException
      PayCtrl -> MoMo: 400 Bad Request
      
    else Signature valid
      PaySvc -> PayRepo: findByTransactionId(requestId)
      PayRepo -> DB: SELECT * FROM payments WHERE transaction_id = ?
      DB -> PayRepo: Payment entity
      PayRepo -> PaySvc: Payment
      
      PaySvc -> PaySvc: Update Payment:\n- status = SUCCESS\n- momoTransId = "MOMO_TRANS_123"\n- paidAt = NOW()
      
      PaySvc -> PayRepo: save(payment)
      PayRepo -> DB: UPDATE payments SET status = 'SUCCESS', paid_at = NOW()
      DB -> PayRepo: Updated
      
      PaySvc -> OrderRepo: findById(payment.orderId)
      OrderRepo -> DB: SELECT * FROM orders WHERE id = ?
      DB -> OrderRepo: Order
      OrderRepo -> PaySvc: Order
      
      PaySvc -> PaySvc: Update Order:\n- status = CONFIRMED\n- paymentStatus = PAID
      
      PaySvc -> OrderRepo: save(order)
      OrderRepo -> DB: UPDATE orders SET status = 'CONFIRMED'
      DB -> OrderRepo: Updated
      
      ' Reduce inventory
      loop For each OrderItem
        PaySvc -> InvSvc: reduceQuantity(productId, quantity)
        InvSvc -> DB: UPDATE inventory\nSET available_quantity = available_quantity - ?\nWHERE product_id = ?
        DB -> InvSvc: Updated
      end
      
      ' Send email
      PaySvc -> EmailSvc: sendOrderConfirmation(order, payment)
      EmailSvc -> EmailSvc: Build email template
      EmailSvc -> EmailSvc: Send via SMTP
      EmailSvc -> PaySvc: Email sent
      
      PaySvc -> PayCtrl: IPN processed successfully
      PayCtrl -> MoMo: 200 OK\n{message: "Success"}
      
      ' Redirect customer
      MoMo -> Customer: Redirect to redirectUrl\n+ params (resultCode, message, etc.)
      
      Customer -> UI: GET /payment/return?resultCode=0&...
      
      UI -> UI: Parse result
      UI -> PayCtrl: GET /api/v1/payment/order/{orderId}
      PayCtrl -> PaySvc: getPaymentByOrderId(orderId)
      PaySvc -> DB: Get payment details
      DB -> PaySvc: Payment (SUCCESS)
      PaySvc -> PayCtrl: PaymentDto
      PayCtrl -> UI: 200 OK {payment details}
      
      UI -> UI: Show success page
      UI -> Customer: "Thanh toán thành công!\nMã đơn hàng: #123456"
    end
    
  else Payment failed
    MoMo -> PayCtrl: POST /api/v1/payment/ipn/momo\n{resultCode: 1004, message: "Transaction failed"}
    
    PayCtrl -> PaySvc: processIpn(ipnData)
    PaySvc -> PaySvc: Verify signature
    
    PaySvc -> PayRepo: findByTransactionId(requestId)
    PayRepo -> DB: Get payment
    DB -> PayRepo: Payment
    
    PaySvc -> PaySvc: Update Payment status = FAILED
    PaySvc -> PayRepo: save(payment)
    PayRepo -> DB: UPDATE payments SET status = 'FAILED'
    
    PaySvc -> PayCtrl: IPN processed
    PayCtrl -> MoMo: 200 OK
    
    MoMo -> Customer: Redirect to redirectUrl
    Customer -> UI: GET /payment/return?resultCode=1004
    UI -> Customer: "Thanh toán thất bại. Vui lòng thử lại"
  end
end

@enduml
```

---

### UC35: View Order History (Xem lịch sử đơn hàng)

#### Bảng đặc tả Use Case

| Thành phần | Mô tả |
|---|---|
| **Use Case ID** | UC35 |
| **Tên Use Case** | View Order History (Xem lịch sử đơn hàng) |
| **Actor** | Customer |
| **Mô tả** | Khách hàng xem danh sách các đơn hàng đã đặt |
| **Tiền điều kiện** | Customer đã đăng nhập |
| **Hậu điều kiện** | Danh sách đơn hàng được hiển thị theo thời gian |
| **Luồng chính** | 1. Customer click vào "Đơn hàng của tôi"<br>2. Hệ thống kiểm tra authentication<br>3. Hệ thống query danh sách orders của customer<br>4. Hệ thống sắp xếp theo createdAt DESC<br>5. Hệ thống hiển thị với pagination (10 orders/page)<br>6. Mỗi order hiển thị:<br>&nbsp;&nbsp;- Order ID, ngày đặt<br>&nbsp;&nbsp;- Tổng tiền<br>&nbsp;&nbsp;- Trạng thái đơn hàng (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED)<br>&nbsp;&nbsp;- Trạng thái thanh toán<br>&nbsp;&nbsp;- Số lượng sản phẩm<br>&nbsp;&nbsp;- Thumbnail sản phẩm đầu tiên<br>&nbsp;&nbsp;- Nút "Xem chi tiết"<br>7. Customer có thể lọc theo trạng thái<br>8. Customer có thể click vào order để xem chi tiết (UC36) |
| **Luồng thay thế** | **3a. Chưa có đơn hàng nào**<br>&nbsp;&nbsp;1. Hiển thị "Bạn chưa có đơn hàng nào"<br>&nbsp;&nbsp;2. Hiển thị nút "Khám phá sản phẩm"<br><br>**7a. Lọc theo trạng thái**<br>&nbsp;&nbsp;1. Customer chọn tab "Đang giao", "Đã giao", etc.<br>&nbsp;&nbsp;2. Hệ thống filter orders theo status<br>&nbsp;&nbsp;3. Hiển thị kết quả lọc |
| **Ngoại lệ** | - Token hết hạn<br>- Database error |

#### Activity Diagram

```plantuml
@startuml
|Customer|
start
:Click "Đơn hàng của tôi";

|System|
:Kiểm tra JWT token;

if (Token hợp lệ?) then (không)
  :Redirect to login;
  |Customer|
  stop
else (có)
  :Query orders của customer;
  :Sắp xếp theo createdAt DESC;
  :Apply pagination (page=0, size=10);
  
  if (Có đơn hàng?) then (không)
    :Hiển thị "Chưa có đơn hàng";
    :Hiển thị nút "Khám phá sản phẩm";
    |Customer|
    stop
  else (có)
    :Hiển thị danh sách orders:
    - Order ID, ngày đặt
    - Tổng tiền
    - Trạng thái
    - Thumbnail sản phẩm
    - Nút "Xem chi tiết";
    
    :Hiển thị các tab filter:
    - Tất cả
    - Chờ xác nhận
    - Đang giao
    - Đã giao
    - Đã hủy;
    
    |Customer|
    :Xem danh sách đơn hàng;
    
    if (Lọc theo trạng thái?) then (có)
      :Chọn tab;
      |System|
      :Filter orders theo status;
      :Cập nhật danh sách;
      |Customer|
    endif
    
    if (Click "Xem chi tiết"?) then (có)
      |System|
      :Chuyển đến UC36
      (View Order Details);
    endif
    
    stop
  endif
endif

@enduml
```

#### Sequence Diagram

```plantuml
@startuml
actor Customer
participant "OrderHistoryPage" as UI
participant "OrderController" as Controller
participant "OrderService" as Service
participant "OrderRepository" as OrderRepo
database "PostgreSQL" as DB

Customer -> UI: Click "Đơn hàng của tôi"
UI -> UI: Navigate to /orders/history

UI -> Controller: GET /api/v1/orders?\npage=0&size=10\nAuthorization: Bearer {token}

Controller -> Controller: Extract userId from JWT

Controller -> Service: getUserOrders(userId, pageable)

Service -> OrderRepo: findByUserId(userId, pageable)
OrderRepo -> DB: SELECT o.*, oi.*, p.*\nFROM orders o\nLEFT JOIN order_items oi ON o.id = oi.order_id\nLEFT JOIN products p ON oi.product_id = p.id\nWHERE o.user_id = ?\nORDER BY o.created_at DESC\nLIMIT 10 OFFSET 0

alt No orders found
  DB -> OrderRepo: empty list
  OrderRepo -> Service: Page<Order> (empty)
  Service -> Controller: OrderListResponse (empty)
  Controller -> UI: 200 OK\n{orders: [], totalElements: 0}
  UI -> UI: Show "Chưa có đơn hàng nào"
  UI -> Customer: Hiển thị empty state

else Orders found
  DB -> OrderRepo: List<Order> with items
  OrderRepo -> Service: Page<Order>
  
  Service -> Service: For each order, map to OrderSummaryDto:\n- orderId, orderNumber\n- createdAt\n- status, paymentStatus\n- totalAmount\n- itemCount\n- firstProductImage
  
  Service -> Service: Build OrderListResponse:\n- orders: List<OrderSummaryDto>\n- totalElements, totalPages, currentPage
  
  Service -> Controller: OrderListResponse
  
  Controller -> UI: 200 OK\n{\n  orders: [...],\n  totalElements: 25,\n  totalPages: 3,\n  currentPage: 0\n}
  
  UI -> UI: Render order list with tabs:\n- Tất cả (25)\n- Chờ xác nhận (3)\n- Đang giao (5)\n- Đã giao (15)\n- Đã hủy (2)
  
  UI -> Customer: Hiển thị 10 đơn hàng đầu tiên
  
  opt Filter by status
    Customer -> UI: Click tab "Đang giao"
    UI -> Controller: GET /api/v1/orders?\nstatus=SHIPPING&page=0&size=10
    
    Controller -> Service: getUserOrders(userId, status=SHIPPING, pageable)
    
    Service -> OrderRepo: findByUserIdAndStatus(userId, SHIPPING, pageable)
    OrderRepo -> DB: SELECT ... WHERE user_id = ? AND status = 'SHIPPING'
    DB -> OrderRepo: Filtered orders
    OrderRepo -> Service: Page<Order>
    Service -> Controller: OrderListResponse
    Controller -> UI: 200 OK {5 orders with status SHIPPING}
    UI -> Customer: Hiển thị 5 đơn đang giao
  end
  
  opt View order details
    Customer -> UI: Click "Xem chi tiết" on order #12345
    UI -> UI: Navigate to /orders/12345
    UI -> Customer: Chuyển đến UC36 (View Order Details)
  end
  
  opt Pagination
    Customer -> UI: Click page 2
    UI -> Controller: GET /api/v1/orders?page=1&size=10
    Controller -> Service: getUserOrders(userId, page=1)
    Service -> OrderRepo: findByUserId(..., LIMIT 10 OFFSET 10)
    OrderRepo -> DB: Get next 10 orders
    DB -> OrderRepo: Orders page 2
    OrderRepo -> Service: Page<Order>
    Service -> Controller: OrderListResponse
    Controller -> UI: 200 OK
    UI -> Customer: Hiển thị 10 đơn hàng tiếp theo
  end
end

@enduml
```

---

### UC38: Create Product (Tạo sản phẩm mới)

#### Bảng đặc tả Use Case

| Thành phần | Mô tả |
|---|---|
| **Use Case ID** | UC38 |
| **Tên Use Case** | Create Product (Tạo sản phẩm mới) |
| **Actor** | Admin |
| **Mô tả** | Admin tạo sản phẩm mới trong hệ thống |
| **Tiền điều kiện** | - Admin đã đăng nhập<br>- Có role ADMIN<br>- Có ít nhất 1 Category và 1 Brand trong hệ thống |
| **Hậu điều kiện** | - Product mới được tạo với status AVAILABLE<br>- ProductDetail được tạo<br>- ProductImages được upload<br>- Inventory được khởi tạo với quantity = 0 |
| **Luồng chính** | 1. Admin truy cập trang "Quản lý sản phẩm"<br>2. Admin click "Thêm sản phẩm mới"<br>3. Hệ thống hiển thị form với các trường:<br>&nbsp;&nbsp;**Thông tin cơ bản:**<br>&nbsp;&nbsp;- Tên sản phẩm (*)<br>&nbsp;&nbsp;- Slug (auto-generate từ tên, có thể edit)<br>&nbsp;&nbsp;- SKU (*)<br>&nbsp;&nbsp;- Danh mục (*)<br>&nbsp;&nbsp;- Thương hiệu (*)<br>&nbsp;&nbsp;- Mô tả ngắn<br>&nbsp;&nbsp;- Mô tả chi tiết (*)<br>&nbsp;&nbsp;**Giá:**<br>&nbsp;&nbsp;- Giá bán (*)<br>&nbsp;&nbsp;- Giá gốc<br>&nbsp;&nbsp;- % giảm giá (auto-calculate)<br>&nbsp;&nbsp;**Thông số kỹ thuật:**<br>&nbsp;&nbsp;- Đường kính mặt (mm)<br>&nbsp;&nbsp;- Độ dày (mm)<br>&nbsp;&nbsp;- Chất liệu vỏ<br>&nbsp;&nbsp;- Chất liệu dây<br>&nbsp;&nbsp;- Loại máy<br>&nbsp;&nbsp;- Độ chống nước (ATM)<br>&nbsp;&nbsp;- Các tính năng đặc biệt<br>&nbsp;&nbsp;**Hình ảnh:**<br>&nbsp;&nbsp;- Upload ít nhất 1 hình (*)<br>&nbsp;&nbsp;- Chọn hình đại diện<br>4. Admin nhập đầy đủ thông tin<br>5. Admin upload hình ảnh sản phẩm<br>6. Admin click "Lưu"<br>7. Hệ thống validate dữ liệu<br>8. Hệ thống kiểm tra SKU chưa tồn tại<br>9. Hệ thống kiểm tra Slug chưa tồn tại<br>10. Hệ thống upload images lên storage<br>11. Hệ thống tạo Product entity<br>12. Hệ thống tạo ProductDetail entity<br>13. Hệ thống tạo ProductImage entities<br>14. Hệ thống tạo Inventory entity với quantity = 0<br>15. Hệ thống lưu tất cả vào database trong transaction<br>16. Hiển thị thông báo thành công<br>17. Redirect đến trang danh sách sản phẩm |
| **Luồng thay thế** | **7a. Dữ liệu không hợp lệ**<br>&nbsp;&nbsp;1. Hiển thị lỗi validation (tên trống, giá < 0, không có hình)<br>&nbsp;&nbsp;2. Quay lại bước 4<br><br>**8a. SKU đã tồn tại**<br>&nbsp;&nbsp;1. Hiển thị "SKU đã được sử dụng"<br>&nbsp;&nbsp;2. Quay lại bước 4<br><br>**9a. Slug đã tồn tại**<br>&nbsp;&nbsp;1. Auto-generate slug mới (thêm số suffix)<br>&nbsp;&nbsp;2. Tiếp tục<br><br>**10a. Upload image failed**<br>&nbsp;&nbsp;1. Hiển thị lỗi upload<br>&nbsp;&nbsp;2. Yêu cầu upload lại |
| **Ngoại lệ** | - Token hết hạn<br>- Không có permission<br>- Storage service error<br>- Database error |

#### Activity Diagram

```plantuml
@startuml
|Admin|
start
:Truy cập "Quản lý sản phẩm";
:Click "Thêm sản phẩm mới";

|System|
:Kiểm tra role ADMIN;

if (Có quyền ADMIN?) then (không)
  :Trả về 403 Forbidden;
  |Admin|
  stop
else (có)
  :Load Categories và Brands;
  :Hiển thị form tạo sản phẩm;
  
  |Admin|
  :Nhập thông tin sản phẩm:
  - Tên, SKU
  - Category, Brand
  - Mô tả
  - Giá bán, giá gốc
  - Thông số kỹ thuật;
  
  :Upload hình ảnh (1-5 hình);
  
  :Click "Lưu";
  
  |System|
  :Validate dữ liệu;
  
  if (Dữ liệu hợp lệ?) then (không)
    :Hiển thị lỗi validation;
    |Admin|
    stop
  else (có)
    :Kiểm tra SKU trong DB;
    
    if (SKU đã tồn tại?) then (có)
      :Hiển thị "SKU đã được sử dụng";
      |Admin|
      stop
    else (không)
      :Generate/validate slug;
      
      if (Slug đã tồn tại?) then (có)
        :Tạo slug mới với suffix số;
      endif
      
      :Upload images lên storage;
      
      if (Upload thành công?) then (không)
        :Hiển thị lỗi upload;
        |Admin|
        stop
      else (có)
        :Begin transaction;
        
        :Tạo Product entity:
        - name, slug, SKU
        - category, brand
        - description
        - price, originalPrice
        - status: AVAILABLE;
        
        :Tạo ProductDetail entity:
        - dialDiameter
        - thickness
        - caseMaterial
        - strapMaterial
        - movement
        - waterResistance
        - features;
        
        :Tạo ProductImage entities
        cho mỗi hình upload;
        
        :Tạo Inventory entity:
        - product
        - availableQuantity: 0
        - reservedQuantity: 0;
        
        :Lưu tất cả vào DB;
        
        if (Lưu thành công?) then (có)
          :Commit transaction;
          :Hiển thị "Tạo sản phẩm thành công";
          :Redirect đến danh sách sản phẩm;
          |Admin|
          stop
        else (không)
          :Rollback transaction;
          :Xóa images đã upload;
          :Hiển thị lỗi;
          |Admin|
          stop
        endif
      endif
    endif
  endif
endif

@enduml
```

#### Sequence Diagram

```plantuml
@startuml
actor Admin
participant "ProductManagementPage" as UI
participant "ProductController" as Controller
participant "ProductService" as Service
participant "CategoryRepository" as CatRepo
participant "BrandRepository" as BrandRepo
participant "ProductRepository" as ProdRepo
participant "ImageStorageService" as Storage
participant "InventoryService" as InvSvc
database "PostgreSQL" as DB

Admin -> UI: Click "Thêm sản phẩm mới"

UI -> Controller: GET /api/v1/categories
Controller -> CatRepo: findAll()
CatRepo -> DB: SELECT * FROM categories
DB -> CatRepo: List<Category>
CatRepo -> Controller: List<CategoryDto>
Controller -> UI: Categories

UI -> Controller: GET /api/v1/brands
Controller -> BrandRepo: findAll()
BrandRepo -> DB: SELECT * FROM brands
DB -> BrandRepo: List<Brand>
BrandRepo -> Controller: List<BrandDto>
Controller -> UI: Brands

UI -> Admin: Hiển thị form với dropdowns

Admin -> UI: Nhập thông tin:\n- Tên: "Casio G-Shock GA-2100"\n- SKU: "CASIO-GA2100-1A"\n- Category: "Men Watch"\n- Brand: "Casio"\n- Price: 3500000\n- Original Price: 4000000\n- Description: "..."

Admin -> UI: Upload 3 hình ảnh

Admin -> UI: Click "Lưu"

UI -> UI: Validate client-side

UI -> Controller: POST /api/v1/products\nAuthorization: Bearer {token}\nContent-Type: multipart/form-data\n{\n  productData: {...},\n  images: [file1, file2, file3]\n}

Controller -> Controller: Check @PreAuthorize("hasRole('ADMIN')")

alt Not ADMIN
  Controller -> UI: 403 Forbidden
  UI -> Admin: "Không có quyền truy cập"
else Is ADMIN
  Controller -> Service: createProduct(createProductRequest, images)
  
  Service -> Service: Validate request data
  
  Service -> ProdRepo: existsBySku("CASIO-GA2100-1A")
  ProdRepo -> DB: SELECT EXISTS(SELECT 1 FROM products WHERE sku = ?)
  
  alt SKU exists
    DB -> ProdRepo: true
    ProdRepo -> Service: true
    Service -> Controller: throw SkuAlreadyExistsException
    Controller -> UI: 409 Conflict
    UI -> Admin: "SKU đã được sử dụng"
    
  else SKU available
    DB -> ProdRepo: false
    ProdRepo -> Service: false
    
    Service -> Service: Generate slug from name:\nslug = "casio-g-shock-ga-2100"
    
    Service -> ProdRepo: existsBySlug(slug)
    ProdRepo -> DB: SELECT EXISTS(SELECT 1 FROM products WHERE slug = ?)
    
    alt Slug exists
      DB -> ProdRepo: true
      Service -> Service: Append timestamp:\nslug = "casio-g-shock-ga-2100-1234567890"
    else Slug available
      DB -> ProdRepo: false
    end
    
    ' Upload images
    loop For each image file
      Service -> Storage: uploadImage(file, "products/")
      Storage -> Storage: Generate unique filename
      Storage -> Storage: Save to disk/S3
      Storage -> Service: imageUrl: "/uploads/products/abc123.jpg"
    end
    
    alt Image upload failed
      Storage -> Service: throw ImageUploadException
      Service -> Controller: Exception
      Controller -> UI: 500 Server Error
      UI -> Admin: "Lỗi upload hình ảnh"
    else All images uploaded
      
      Service -> Service: Begin database transaction
      
      Service -> CatRepo: findById(categoryId)
      CatRepo -> DB: SELECT * FROM categories WHERE id = ?
      DB -> CatRepo: Category
      CatRepo -> Service: Category
      
      Service -> BrandRepo: findById(brandId)
      BrandRepo -> DB: SELECT * FROM brands WHERE id = ?
      DB -> BrandRepo: Brand
      BrandRepo -> Service: Brand
      
      Service -> Service: Create Product entity:\n- name: "Casio G-Shock GA-2100"\n- slug: "casio-g-shock-ga-2100"\n- sku: "CASIO-GA2100-1A"\n- category, brand\n- price: 3500000\n- originalPrice: 4000000\n- discountPercent: 12.5\n- status: AVAILABLE\n- isFeatured: false
      
      Service -> ProdRepo: save(product)
      ProdRepo -> DB: INSERT INTO products (name, slug, sku, ...) VALUES (...)
      DB -> ProdRepo: Product created with ID
      ProdRepo -> Service: Product entity
      
      Service -> Service: Create ProductDetail entity:\n- product\n- dialDiameter: 45\n- thickness: 11\n- caseMaterial: "Resin"\n- strapMaterial: "Resin"\n- movement: "Quartz"\n- waterResistance: 20\n- features: "Shock resistant, LED light"
      
      Service -> ProdRepo: save(productDetail)
      ProdRepo -> DB: INSERT INTO product_details (...) VALUES (...)
      DB -> ProdRepo: ProductDetail created
      
      loop For each uploaded image
        Service -> Service: Create ProductImage entity:\n- product\n- imageUrl\n- displayOrder\n- isPrimary (true for first image)
        
        Service -> ProdRepo: save(productImage)
        ProdRepo -> DB: INSERT INTO product_images (...) VALUES (...)
        DB -> ProdRepo: ProductImage created
      end
      
      Service -> InvSvc: createInventory(productId, initialQuantity=0)
      InvSvc -> DB: INSERT INTO inventory\n(product_id, available_quantity, reserved_quantity)\nVALUES (?, 0, 0)
      DB -> InvSvc: Inventory created
      InvSvc -> Service: InventoryDto
      
      Service -> Service: Commit transaction
      
      Service -> Service: Map to ProductDto
      
      Service -> Controller: ProductDto
      
      Controller -> UI: 201 Created\n{product details with images}
      
      UI -> UI: Show success notification
      UI -> UI: Navigate to /admin/products
      
      UI -> Admin: "Tạo sản phẩm thành công!"
    end
  end
end

@enduml
```

---

### UC39: Update Product (Cập nhật sản phẩm)

#### Bảng đặc tả Use Case

| Thành phần | Mô tả |
|---|---|
| **Use Case ID** | UC39 |
| **Tên Use Case** | Update Product (Cập nhật sản phẩm) |
| **Actor** | Admin |
| **Mô tả** | Admin cập nhật thông tin sản phẩm đã có |
| **Tiền điều kiện** | - Admin đã đăng nhập<br>- Có role ADMIN<br>- Sản phẩm tồn tại trong hệ thống |
| **Hậu điều kiện** | - Thông tin sản phẩm được cập nhật<br>- Lịch sử thay đổi được ghi nhận (updatedAt) |
| **Luồng chính** | 1. Admin xem danh sách sản phẩm<br>2. Admin click "Sửa" trên sản phẩm cần cập nhật<br>3. Hệ thống load thông tin hiện tại của sản phẩm<br>4. Hệ thống hiển thị form với dữ liệu đã điền sẵn<br>5. Admin chỉnh sửa các trường cần thiết:<br>&nbsp;&nbsp;- Có thể đổi tên (slug sẽ không đổi để giữ SEO)<br>&nbsp;&nbsp;- Có thể đổi giá<br>&nbsp;&nbsp;- Có thể đổi category, brand<br>&nbsp;&nbsp;- Có thể cập nhật mô tả<br>&nbsp;&nbsp;- Có thể cập nhật thông số kỹ thuật<br>&nbsp;&nbsp;- Có thể thêm/xóa/thay hình ảnh<br>&nbsp;&nbsp;- Có thể đổi trạng thái (AVAILABLE/DISCONTINUED)<br>6. Admin click "Cập nhật"<br>7. Hệ thống validate dữ liệu<br>8. Nếu có hình mới: Upload lên storage<br>9. Nếu xóa hình cũ: Xóa khỏi storage<br>10. Hệ thống cập nhật Product entity<br>11. Hệ thống cập nhật ProductDetail entity<br>12. Hệ thống cập nhật ProductImages<br>13. Hệ thống set updatedAt = now()<br>14. Hệ thống lưu vào database<br>15. Hiển thị thông báo thành công |
| **Luồng thay thế** | **3a. Sản phẩm không tồn tại**<br>&nbsp;&nbsp;1. Trả về 404<br>&nbsp;&nbsp;2. Hiển thị "Sản phẩm không tồn tại"<br><br>**7a. Dữ liệu không hợp lệ**<br>&nbsp;&nbsp;1. Hiển thị lỗi validation<br>&nbsp;&nbsp;2. Quay lại bước 5<br><br>**8a. Upload hình mới failed**<br>&nbsp;&nbsp;1. Hiển thị lỗi<br>&nbsp;&nbsp;2. Không cập nhật hình ảnh<br>&nbsp;&nbsp;3. Tiếp tục cập nhật các trường khác |
| **Ngoại lệ** | - Token hết hạn<br>- Không có permission<br>- Storage error<br>- Database error |

#### Activity Diagram

```plantuml
@startuml
|Admin|
start
:Click "Sửa" trên sản phẩm;

|System|
:Kiểm tra role ADMIN;

if (Có quyền?) then (không)
  :Trả về 403;
  |Admin|
  stop
else (có)
  :Load thông tin sản phẩm hiện tại;
  
  if (Sản phẩm tồn tại?) then (không)
    :Trả về 404;
    |Admin|
    stop
  else (có)
    :Hiển thị form với dữ liệu sẵn có;
    
    |Admin|
    :Chỉnh sửa thông tin:
    - Đổi tên
    - Đổi giá
    - Cập nhật mô tả
    - Cập nhật thông số
    - Thêm/Xóa hình ảnh;
    
    :Click "Cập nhật";
    
    |System|
    :Validate dữ liệu;
    
    if (Dữ liệu hợp lệ?) then (không)
      :Hiển thị lỗi validation;
      |Admin|
      stop
    else (có)
      if (Có hình mới?) then (có)
        :Upload hình mới lên storage;
        
        if (Upload thành công?) then (không)
          :Log error;
          :Bỏ qua hình mới;
        else (có)
          :Lưu URL hình mới;
        endif
      endif
      
      if (Xóa hình cũ?) then (có)
        :Xóa file khỏi storage;
        :Xóa record khỏi DB;
      endif
      
      :Begin transaction;
      
      :Update Product entity:
      - name, price
      - category, brand
      - description
      - status
      - updatedAt = now();
      
      :Update ProductDetail entity;
      
      if (Có thay đổi hình?) then (có)
        :Update ProductImages;
      endif
      
      :Lưu vào database;
      
      if (Lưu thành công?) then (có)
        :Commit transaction;
        :Hiển thị "Cập nhật thành công";
        |Admin|
        stop
      else (không)
        :Rollback transaction;
        :Hiển thị lỗi;
        |Admin|
        stop
      endif
    endif
  endif
endif

@enduml
```

#### Sequence Diagram

```plantuml
@startuml
actor Admin
participant "ProductManagementPage" as UI
participant "ProductController" as Controller
participant "ProductService" as Service
participant "ProductRepository" as ProdRepo
participant "ImageStorageService" as Storage
database "PostgreSQL" as DB

Admin -> UI: Click "Sửa" trên sản phẩm ID: abc-123

UI -> Controller: GET /api/v1/products/{productId}

Controller -> Service: getProductById(productId)

Service -> ProdRepo: findById(productId)
ProdRepo -> DB: SELECT p.*, pd.*, pi.*\nFROM products p\nLEFT JOIN product_details pd ON p.id = pd.product_id\nLEFT JOIN product_images pi ON p.id = pi.product_id\nWHERE p.id = ?

alt Product not found
  DB -> ProdRepo: empty
  ProdRepo -> Service: Optional.empty()
  Service -> Controller: throw ProductNotFoundException
  Controller -> UI: 404 Not Found
  UI -> Admin: "Sản phẩm không tồn tại"
  
else Product found
  DB -> ProdRepo: Product with details and images
  ProdRepo -> Service: Product entity
  
  Service -> Service: Map to ProductDto
  
  Service -> Controller: ProductDto
  
  Controller -> UI: 200 OK\n{product full details}
  
  UI -> UI: Populate form with existing data
  
  UI -> Admin: Hiển thị form chỉnh sửa
  
  Admin -> UI: Chỉnh sửa:\n- Price: 3500000 -> 3200000\n- Description: "..." (updated)\n- Thêm 1 hình mới\n- Xóa 1 hình cũ
  
  Admin -> UI: Click "Cập nhật"
  
  UI -> Controller: PUT /api/v1/products/{productId}\nAuthorization: Bearer {token}\nContent-Type: multipart/form-data\n{\n  productData: {...},\n  newImages: [file1],\n  deleteImageIds: [img-id-2]\n}
  
  Controller -> Controller: Check @PreAuthorize("hasRole('ADMIN')")
  
  Controller -> Service: updateProduct(productId, updateRequest, newImages, deleteImageIds)
  
  Service -> ProdRepo: findById(productId)
  ProdRepo -> DB: SELECT * FROM products WHERE id = ?
  DB -> ProdRepo: Product entity
  ProdRepo -> Service: Product
  
  Service -> Service: Validate update data
  
  ' Handle new images
  opt Has new images
    loop For each new image
      Service -> Storage: uploadImage(file, "products/")
      Storage -> Storage: Save to storage
      Storage -> Service: imageUrl
      
      Service -> Service: Create new ProductImage entity
    end
  end
  
  ' Handle delete images
  opt Has images to delete
    loop For each deleteImageId
      Service -> ProdRepo: findProductImageById(deleteImageId)
      ProdRepo -> DB: SELECT * FROM product_images WHERE id = ?
      DB -> ProdRepo: ProductImage
      ProdRepo -> Service: ProductImage
      
      Service -> Storage: deleteImage(imageUrl)
      Storage -> Storage: Remove file from storage
      Storage -> Service: Deleted
      
      Service -> ProdRepo: delete(productImage)
      ProdRepo -> DB: DELETE FROM product_images WHERE id = ?
    end
  end
  
  Service -> Service: Begin transaction
  
  Service -> Service: Update Product entity:\n- name (if changed)\n- price: 3200000\n- originalPrice (if changed)\n- discountPercent: recalculate\n- description: updated\n- category, brand (if changed)\n- updatedAt: NOW()
  
  Service -> ProdRepo: save(product)
  ProdRepo -> DB: UPDATE products\nSET price = 3200000,\n    description = '...',\n    updated_at = NOW()\nWHERE id = ?
  DB -> ProdRepo: Updated
  ProdRepo -> Service: Product entity
  
  opt ProductDetail changed
    Service -> Service: Update ProductDetail entity
    Service -> ProdRepo: save(productDetail)
    ProdRepo -> DB: UPDATE product_details SET ... WHERE product_id = ?
  end
  
  opt New images added
    loop For each new ProductImage
      Service -> ProdRepo: save(productImage)
      ProdRepo -> DB: INSERT INTO product_images (...) VALUES (...)
    end
  end
  
  Service -> Service: Commit transaction
  
  Service -> Service: Map to ProductDto
  
  Service -> Controller: ProductDto (updated)
  
  Controller -> UI: 200 OK\n{updated product details}
  
  UI -> UI: Show success notification
  UI -> UI: Refresh product list
  
  UI -> Admin: "Cập nhật sản phẩm thành công!"
end

@enduml
```

---

### UC50: View All Orders (Xem tất cả đơn hàng - Admin)

#### Bảng đặc tả Use Case

| Thành phần | Mô tả |
|---|---|
| **Use Case ID** | UC50 |
| **Tên Use Case** | View All Orders (Xem tất cả đơn hàng - Admin) |
| **Actor** | Admin |
| **Mô tả** | Admin xem và quản lý tất cả đơn hàng trong hệ thống |
| **Tiền điều kiện** | - Admin đã đăng nhập<br>- Có role ADMIN |
| **Hậu điều kiện** | Danh sách đơn hàng được hiển thị với các bộ lọc và thống kê |
| **Luồng chính** | 1. Admin truy cập "Quản lý đơn hàng"<br>2. Hệ thống kiểm tra role ADMIN<br>3. Hệ thống query tất cả orders với pagination<br>4. Hệ thống tính toán thống kê:<br>&nbsp;&nbsp;- Tổng số đơn hàng<br>&nbsp;&nbsp;- Số đơn theo trạng thái<br>&nbsp;&nbsp;- Tổng doanh thu<br>&nbsp;&nbsp;- Doanh thu hôm nay<br>5. Hệ thống hiển thị bảng orders với:<br>&nbsp;&nbsp;- Order ID, Mã đơn<br>&nbsp;&nbsp;- Khách hàng (tên, email, SĐT)<br>&nbsp;&nbsp;- Ngày đặt<br>&nbsp;&nbsp;- Tổng tiền<br>&nbsp;&nbsp;- Trạng thái đơn hàng<br>&nbsp;&nbsp;- Trạng thái thanh toán<br>&nbsp;&nbsp;- Phương thức thanh toán<br>&nbsp;&nbsp;- Actions (Xem chi tiết, Cập nhật trạng thái)<br>6. Admin có thể:<br>&nbsp;&nbsp;- Lọc theo trạng thái<br>&nbsp;&nbsp;- Lọc theo phương thức thanh toán<br>&nbsp;&nbsp;- Lọc theo khoảng thời gian<br>&nbsp;&nbsp;- Tìm kiếm theo mã đơn/tên KH/email<br>&nbsp;&nbsp;- Sắp xếp theo các cột<br>&nbsp;&nbsp;- Xuất Excel/PDF<br>7. Admin click vào order để xem chi tiết (UC51)<br>8. Admin có thể cập nhật trạng thái (UC52) |
| **Luồng thay thế** | **6a. Apply filters**<br>&nbsp;&nbsp;1. Admin chọn bộ lọc<br>&nbsp;&nbsp;2. Hệ thống query lại với điều kiện<br>&nbsp;&nbsp;3. Cập nhật danh sách và thống kê<br><br>**6b. Search orders**<br>&nbsp;&nbsp;1. Admin nhập từ khóa tìm kiếm<br>&nbsp;&nbsp;2. Hệ thống search trong orderNumber, customer name, email<br>&nbsp;&nbsp;3. Hiển thị kết quả |
| **Ngoại lệ** | - Token hết hạn<br>- Không có permission<br>- Database error |

#### Activity Diagram

```plantuml
@startuml
|Admin|
start
:Truy cập "Quản lý đơn hàng";

|System|
:Kiểm tra role ADMIN;

if (Có role ADMIN?) then (không)
  :Trả về 403 Forbidden;
  |Admin|
  stop
else (có)
  :Query all orders với pagination;
  
  :Tính thống kê:
  - Tổng đơn hàng
  - Đơn theo trạng thái
  - Tổng doanh thu
  - Doanh thu hôm nay;
  
  :Hiển thị dashboard:
  - Cards thống kê
  - Bộ lọc
  - Bảng đơn hàng
  - Pagination;
  
  |Admin|
  :Xem danh sách đơn hàng;
  
  if (Apply filters?) then (có)
    :Chọn:
    - Trạng thái
    - Phương thức TT
    - Khoảng thời gian;
    
    |System|
    :Query với filters;
    :Cập nhật danh sách;
    :Cập nhật thống kê;
    |Admin|
  endif
  
  if (Search?) then (có)
    :Nhập từ khóa;
    |System|
    :Search trong:
    - Order number
    - Customer name
    - Email;
    :Hiển thị kết quả;
    |Admin|
  endif
  
  if (View details?) then (có)
    |System|
    :Chuyển đến UC51;
  endif
  
  if (Update status?) then (có)
    |System|
    :Chuyển đến UC52;
  endif
  
  if (Export?) then (có)
    |System|
    :Generate Excel/PDF;
    :Download file;
  endif
  
  stop
endif

@enduml
```

#### Sequence Diagram

```plantuml
@startuml
actor Admin
participant "OrderManagementPage" as UI
participant "OrderController" as Controller
participant "OrderService" as Service
participant "OrderRepository" as OrderRepo
database "PostgreSQL" as DB

Admin -> UI: Truy cập /admin/orders

UI -> Controller: GET /api/v1/orders/all?\npage=0&size=20&sort=createdAt,desc\nAuthorization: Bearer {token}

Controller -> Controller: Check @PreAuthorize("hasRole('ADMIN')")

alt Not ADMIN
  Controller -> UI: 403 Forbidden
  UI -> Admin: "Không có quyền truy cập"
  
else Is ADMIN
  Controller -> Service: getAllOrders(filters, pageable)
  
  ' Get statistics
  Service -> OrderRepo: count()
  OrderRepo -> DB: SELECT COUNT(*) FROM orders
  DB -> OrderRepo: totalOrders: 1250
  
  Service -> OrderRepo: countByStatus(PENDING)
  OrderRepo -> DB: SELECT COUNT(*) FROM orders WHERE status = 'PENDING'
  DB -> OrderRepo: pendingOrders: 45
  
  Service -> OrderRepo: countByStatus(CONFIRMED)
  OrderRepo -> DB: SELECT COUNT(*) FROM orders WHERE status = 'CONFIRMED'
  DB -> OrderRepo: confirmedOrders: 120
  
  Service -> OrderRepo: countByStatus(SHIPPING)
  OrderRepo -> DB: SELECT COUNT(*) WHERE status = 'SHIPPING'
  DB -> OrderRepo: shippingOrders: 80
  
  Service -> OrderRepo: countByStatus(DELIVERED)
  OrderRepo -> DB: SELECT COUNT(*) WHERE status = 'DELIVERED'
  DB -> OrderRepo: deliveredOrders: 1000
  
  Service -> OrderRepo: sumTotalAmount()
  OrderRepo -> DB: SELECT SUM(total_amount) FROM orders\nWHERE payment_status = 'PAID'
  DB -> OrderRepo: totalRevenue: 2500000000
  
  Service -> OrderRepo: sumTotalAmountToday()
  OrderRepo -> DB: SELECT SUM(total_amount) FROM orders\nWHERE DATE(created_at) = CURRENT_DATE\nAND payment_status = 'PAID'
  DB -> OrderRepo: todayRevenue: 50000000
  
  ' Get orders list
  Service -> OrderRepo: findAll(specification, pageable)
  OrderRepo -> DB: SELECT o.*, u.*\nFROM orders o\nJOIN users u ON o.user_id = u.id\nORDER BY o.created_at DESC\nLIMIT 20 OFFSET 0
  
  DB -> OrderRepo: Page<Order>
  OrderRepo -> Service: Page<Order>
  
  Service -> Service: For each order, map to OrderAdminDto:\n- orderId, orderNumber\n- customer info (name, email, phone)\n- createdAt, updatedAt\n- status, paymentStatus, paymentMethod\n- totalAmount\n- itemCount
  
  Service -> Service: Build OrderListResponse:\n- orders: List<OrderAdminDto>\n- statistics: OrderStatistics\n- pagination metadata
  
  Service -> Controller: OrderListResponse
  
  Controller -> UI: 200 OK\n{\n  orders: [...],\n  statistics: {\n    total: 1250,\n    pending: 45,\n    confirmed: 120,\n    shipping: 80,\n    delivered: 1000,\n    totalRevenue: 2500000000,\n    todayRevenue: 50000000\n  },\n  totalElements: 1250,\n  totalPages: 63,\n  currentPage: 0\n}
  
  UI -> UI: Render dashboard:\n- Statistics cards\n- Filter panel\n- Orders table
  
  UI -> Admin: Hiển thị 20 đơn hàng đầu tiên
  
  opt Apply filters
    Admin -> UI: Chọn filter:\n- Status: PENDING\n- Date range: Last 7 days
    
    UI -> Controller: GET /api/v1/orders/all?\nstatus=PENDING&\nstartDate=2024-01-01&endDate=2024-01-07
    
    Controller -> Service: getAllOrders(filters)
    
    Service -> OrderRepo: findAll(specification with filters)
    OrderRepo -> DB: SELECT ... WHERE status = 'PENDING'\nAND created_at BETWEEN ? AND ?
    DB -> OrderRepo: Filtered orders
    OrderRepo -> Service: Page<Order>
    Service -> Controller: OrderListResponse
    Controller -> UI: 200 OK {filtered results}
    UI -> Admin: Hiển thị 45 đơn PENDING
  end
  
  opt Search orders
    Admin -> UI: Nhập search: "nguyen van a"
    
    UI -> Controller: GET /api/v1/orders/all?\nsearch=nguyen van a
    
    Controller -> Service: searchOrders("nguyen van a")
    
    Service -> OrderRepo: findAll(search specification)
    OrderRepo -> DB: SELECT o.*, u.*\nFROM orders o JOIN users u ON o.user_id = u.id\nWHERE o.order_number LIKE '%nguyen van a%'\nOR u.first_name LIKE '%nguyen%'\nOR u.last_name LIKE '%van a%'\nOR u.email LIKE '%nguyen van a%'
    
    DB -> OrderRepo: Search results
    OrderRepo -> Service: Page<Order>
    Service -> Controller: OrderListResponse
    Controller -> UI: 200 OK
    UI -> Admin: Hiển thị kết quả tìm kiếm
  end
  
  opt View order details
    Admin -> UI: Click "Xem chi tiết" on order #12345
    UI -> UI: Navigate to /admin/orders/12345
    UI -> Admin: Chuyển đến UC51
  end
  
  opt Update order status
    Admin -> UI: Click "Cập nhật trạng thái"
    UI -> Admin: Chuyển đến UC52
  end
end

@enduml
```

---

### UC52: Update Order Status (Cập nhật trạng thái đơn hàng)

#### Bảng đặc tả Use Case

| Thành phần | Mô tả |
|---|---|
| **Use Case ID** | UC52 |
| **Tên Use Case** | Update Order Status (Cập nhật trạng thái đơn hàng) |
| **Actor** | Admin |
| **Mô tả** | Admin cập nhật trạng thái xử lý đơn hàng |
| **Tiền điều kiện** | - Admin đã đăng nhập<br>- Có role ADMIN<br>- Order tồn tại trong hệ thống |
| **Hậu điều kiện** | - Trạng thái order được cập nhật<br>- Email thông báo được gửi cho customer<br>- Lịch sử thay đổi được ghi nhận |
| **Luồng chính** | 1. Admin xem chi tiết đơn hàng<br>2. Admin click "Cập nhật trạng thái"<br>3. Hệ thống hiển thị dropdown với các trạng thái hợp lệ:<br>&nbsp;&nbsp;- PENDING → CONFIRMED hoặc CANCELLED<br>&nbsp;&nbsp;- CONFIRMED → SHIPPING hoặc CANCELLED<br>&nbsp;&nbsp;- SHIPPING → DELIVERED hoặc CANCELLED<br>&nbsp;&nbsp;- DELIVERED (final state)<br>4. Admin chọn trạng thái mới<br>5. Admin có thể nhập ghi chú (optional)<br>6. Admin click "Xác nhận"<br>7. Hệ thống validate chuyển trạng thái hợp lệ<br>8. Hệ thống cập nhật Order status<br>9. Hệ thống cập nhật updatedAt = now()<br>10. Hệ thống lưu vào database<br>11. Hệ thống gửi email thông báo cho customer<br>12. Hiển thị thông báo thành công |
| **Luồng thay thế** | **7a. Chuyển trạng thái không hợp lệ**<br>&nbsp;&nbsp;1. Hiển thị "Không thể chuyển từ X sang Y"<br>&nbsp;&nbsp;2. Quay lại bước 4<br><br>**8a. Update sang CANCELLED**<br>&nbsp;&nbsp;1. Nếu đã thanh toán: Yêu cầu xác nhận hoàn tiền<br>&nbsp;&nbsp;2. Hoàn lại inventory<br>&nbsp;&nbsp;3. Cập nhật status = CANCELLED<br>&nbsp;&nbsp;4. Gửi email thông báo hủy đơn |
| **Ngoại lệ** | - Token hết hạn<br>- Order không tồn tại<br>- Email service error |

#### Activity Diagram

```plantuml
@startuml
|Admin|
start
:Xem chi tiết đơn hàng;
:Click "Cập nhật trạng thái";

|System|
:Lấy trạng thái hiện tại;
:Xác định các trạng thái hợp lệ tiếp theo;
:Hiển thị dropdown trạng thái;

|Admin|
:Chọn trạng thái mới;
:Nhập ghi chú (optional);
:Click "Xác nhận";

|System|
:Validate chuyển trạng thái;

if (Chuyển trạng thái hợp lệ?) then (không)
  :Hiển thị lỗi "Không thể chuyển";
  |Admin|
  stop
else (có)
  if (Trạng thái mới = CANCELLED?) then (có)
    if (Đã thanh toán?) then (có)
      :Tạo request hoàn tiền;
      :Update paymentStatus = REFUNDING;
    endif
    
    :Hoàn lại inventory;
  endif
  
  :Update Order:
  - status = trạng thái mới
  - note = ghi chú
  - updatedAt = now();
  
  :Lưu vào database;
  
  :Gửi email thông báo cho customer;
  
  :Hiển thị "Cập nhật thành công";
  
  |Admin|
  :Xem trạng thái mới;
  stop
endif

@enduml
```

#### Sequence Diagram

```plantuml
@startuml
actor Admin
participant "OrderDetailPage" as UI
participant "OrderController" as Controller
participant "OrderService" as Service
participant "OrderRepository" as OrderRepo
participant "InventoryService" as InvSvc
participant "EmailService" as EmailSvc
database "PostgreSQL" as DB

Admin -> UI: Click "Cập nhật trạng thái"

UI -> UI: Show status update modal with dropdown

Admin -> UI: Chọn status: SHIPPING
Admin -> UI: Nhập note: "Đã giao cho GHTK"
Admin -> UI: Click "Xác nhận"

UI -> Controller: PUT /api/v1/orders/{orderId}/status\nAuthorization: Bearer {token}\n{\n  status: "SHIPPING",\n  note: "Đã giao cho GHTK"\n}

Controller -> Controller: Check @PreAuthorize("hasRole('ADMIN')")

Controller -> Service: updateOrderStatus(orderId, newStatus, note)

Service -> OrderRepo: findById(orderId)
OrderRepo -> DB: SELECT * FROM orders WHERE id = ?
DB -> OrderRepo: Order entity
OrderRepo -> Service: Order (current status: CONFIRMED)

Service -> Service: Validate status transition:\nCONFIRMED -> SHIPPING: OK

alt Invalid status transition
  Service -> Controller: throw InvalidStatusTransitionException
  Controller -> UI: 400 Bad Request
  UI -> Admin: "Không thể chuyển từ CONFIRMED sang DELIVERED"
else Valid transition
  
  alt New status is CANCELLED
    Service -> Service: Check if order is paid
    
    alt Order is paid
      Service -> Service: Create refund request
      Service -> Service: Update paymentStatus = REFUNDING
    end
    
    ' Restore inventory
    Service -> OrderRepo: getOrderItems(orderId)
    OrderRepo -> DB: SELECT * FROM order_items WHERE order_id = ?
    DB -> OrderRepo: List<OrderItem>
    
    loop For each OrderItem
      Service -> InvSvc: addQuantity(productId, quantity)
      InvSvc -> DB: UPDATE inventory\nSET available_quantity = available_quantity + ?\nWHERE product_id = ?
      DB -> InvSvc: Updated
    end
  end
  
  Service -> Service: Update Order:\n- status = SHIPPING\n- note = "Đã giao cho GHTK"\n- updatedAt = NOW()
  
  Service -> OrderRepo: save(order)
  OrderRepo -> DB: UPDATE orders\nSET status = 'SHIPPING',\n    note = 'Đã giao cho GHTK',\n    updated_at = NOW()\nWHERE id = ?
  DB -> OrderRepo: Updated
  OrderRepo -> Service: Order entity
  
  ' Send notification email
  Service -> EmailSvc: sendOrderStatusUpdate(order, newStatus)
  EmailSvc -> EmailSvc: Build email:\n"Đơn hàng #12345 đang được giao"
  EmailSvc -> EmailSvc: Send via SMTP to customer
  EmailSvc -> Service: Email sent
  
  Service -> Service: Map to OrderDto
  
  Service -> Controller: OrderDto
  
  Controller -> UI: 200 OK\n{order with updated status}
  
  UI -> UI: Close modal
  UI -> UI: Refresh order details
  UI -> UI: Show success notification
  
  UI -> Admin: "Đã cập nhật trạng thái thành công"
end

@enduml
```

---

### UC59: Approve Review (Phê duyệt đánh giá)

#### Bảng đặc tả Use Case

| Thành phần | Mô tả |
|---|---|
| **Use Case ID** | UC59 |
| **Tên Use Case** | Approve Review (Phê duyệt đánh giá) |
| **Actor** | Admin |
| **Mô tả** | Admin phê duyệt đánh giá sản phẩm từ khách hàng |
| **Tiền điều kiện** | - Admin đã đăng nhập<br>- Có role ADMIN<br>- Review có status PENDING |
| **Hậu điều kiện** | - Review status được cập nhật thành APPROVED<br>- Review hiển thị công khai trên trang sản phẩm<br>- Rating trung bình của sản phẩm được cập nhật |
| **Luồng chính** | 1. Admin truy cập "Quản lý đánh giá"<br>2. Admin click tab "Chờ duyệt"<br>3. Hệ thống hiển thị danh sách reviews có status PENDING<br>4. Mỗi review hiển thị:<br>&nbsp;&nbsp;- Thông tin customer<br>&nbsp;&nbsp;- Sản phẩm được đánh giá<br>&nbsp;&nbsp;- Số sao<br>&nbsp;&nbsp;- Tiêu đề và nội dung<br>&nbsp;&nbsp;- Ngày đăng<br>&nbsp;&nbsp;- Actions (Duyệt/Từ chối)<br>5. Admin đọc nội dung đánh giá<br>6. Admin click "Phê duyệt"<br>7. Hệ thống cập nhật Review status = APPROVED<br>8. Hệ thống cập nhật approvedAt = now()<br>9. Hệ thống lưu vào database<br>10. Hệ thống tính lại average rating của product<br>11. Hệ thống cập nhật Product.averageRating<br>12. Hiển thị thông báo thành công<br>13. Review được remove khỏi danh sách pending |
| **Luồng thay thế** | **5a. Nội dung không phù hợp**<br>&nbsp;&nbsp;1. Admin click "Từ chối" (UC60)<br>&nbsp;&nbsp;2. Cập nhật status = REJECTED<br>&nbsp;&nbsp;3. Không hiển thị công khai<br><br>**6a. Batch approve**<br>&nbsp;&nbsp;1. Admin chọn nhiều reviews<br>&nbsp;&nbsp;2. Admin click "Duyệt tất cả"<br>&nbsp;&nbsp;3. Hệ thống approve từng review<br>&nbsp;&nbsp;4. Cập nhật rating cho các products liên quan |
| **Ngoại lệ** | - Token hết hạn<br>- Review không tồn tại<br>- Review đã được xử lý |

#### Activity Diagram

```plantuml
@startuml
|Admin|
start
:Truy cập "Quản lý đánh giá";
:Click tab "Chờ duyệt";

|System|
:Kiểm tra role ADMIN;

if (Có quyền ADMIN?) then (không)
  :Trả về 403;
  |Admin|
  stop
else (có)
  :Query reviews với status = PENDING;
  :Sắp xếp theo createdAt ASC;
  
  :Hiển thị danh sách:
  - Customer info
  - Product name
  - Rating (stars)
  - Title, Content
  - Created date
  - Actions;
  
  |Admin|
  :Đọc nội dung đánh giá;
  
  if (Nội dung phù hợp?) then (không)
    :Click "Từ chối";
    |System|
    :Chuyển đến UC60 (Reject);
    stop
  else (có)
    :Click "Phê duyệt";
    
    |System|
    :Update Review:
    - status = APPROVED
    - approvedAt = now()
    - approvedBy = adminId;
    
    :Lưu vào database;
    
    :Query tất cả reviews APPROVED
    của product này;
    
    :Tính average rating =
    SUM(rating) / COUNT(*);
    
    :Update Product.averageRating;
    
    :Lưu product;
    
    :Hiển thị "Đã phê duyệt";
    
    :Remove review khỏi danh sách pending;
    
    |Admin|
    :Xem danh sách cập nhật;
    stop
  endif
endif

@enduml
```

#### Sequence Diagram

```plantuml
@startuml
actor Admin
participant "ReviewManagementPage" as UI
participant "ReviewController" as Controller
participant "ReviewService" as Service
participant "ReviewRepository" as ReviewRepo
participant "ProductRepository" as ProdRepo
database "PostgreSQL" as DB

Admin -> UI: Truy cập /admin/reviews
Admin -> UI: Click tab "Chờ duyệt"

UI -> Controller: GET /api/v1/reviews/pending\nAuthorization: Bearer {token}

Controller -> Controller: Check @PreAuthorize("hasRole('ADMIN')")

Controller -> Service: getPendingReviews()

Service -> ReviewRepo: findByStatus(PENDING, Sort.by("createdAt").ascending())
ReviewRepo -> DB: SELECT r.*, u.*, p.*\nFROM reviews r\nJOIN users u ON r.user_id = u.id\nJOIN products p ON r.product_id = p.id\nWHERE r.status = 'PENDING'\nORDER BY r.created_at ASC

DB -> ReviewRepo: List<Review>
ReviewRepo -> Service: List<Review>

Service -> Service: Map to ReviewPendingDto for each:\n- reviewId\n- customer (name, email)\n- product (name, image)\n- rating, title, content\n- createdAt

Service -> Controller: List<ReviewPendingDto>

Controller -> UI: 200 OK\n{pendingReviews: [...], count: 15}

UI -> UI: Render pending reviews table

UI -> Admin: Hiển thị 15 đánh giá chờ duyệt

Admin -> UI: Đọc review ID: rev-123\n"Sản phẩm rất tốt, giao hàng nhanh"

Admin -> UI: Click "Phê duyệt" on review rev-123

UI -> Controller: PUT /api/v1/reviews/{reviewId}/approve\nAuthorization: Bearer {token}

Controller -> Controller: Check @PreAuthorize("hasRole('ADMIN')")

Controller -> Service: approveReview(reviewId, adminId)

Service -> ReviewRepo: findById(reviewId)
ReviewRepo -> DB: SELECT * FROM reviews WHERE id = ?

alt Review not found
  DB -> ReviewRepo: empty
  ReviewRepo -> Service: Optional.empty()
  Service -> Controller: throw ReviewNotFoundException
  Controller -> UI: 404 Not Found
  UI -> Admin: "Đánh giá không tồn tại"
  
else Review found
  DB -> ReviewRepo: Review entity (status: PENDING)
  ReviewRepo -> Service: Review
  
  alt Review already processed
    Service -> Service: Check status != PENDING
    Service -> Controller: throw ReviewAlreadyProcessedException
    Controller -> UI: 409 Conflict
    UI -> Admin: "Đánh giá đã được xử lý"
    
  else Review is pending
    Service -> Service: Update Review:\n- status = APPROVED\n- approvedAt = NOW()\n- approvedBy = adminId
    
    Service -> ReviewRepo: save(review)
    ReviewRepo -> DB: UPDATE reviews\nSET status = 'APPROVED',\n    approved_at = NOW(),\n    approved_by = ?\nWHERE id = ?
    DB -> ReviewRepo: Updated
    ReviewRepo -> Service: Review entity
    
    ' Recalculate product average rating
    Service -> ReviewRepo: findByProductIdAndStatus(productId, APPROVED)
    ReviewRepo -> DB: SELECT * FROM reviews\nWHERE product_id = ?\nAND status = 'APPROVED'
    DB -> ReviewRepo: List<Review> (approved reviews)
    ReviewRepo -> Service: List<Review>
    
    Service -> Service: Calculate average:\ntotalRating = SUM(review.rating)\ncount = reviews.size()\naverageRating = totalRating / count\naverageRating = 4.5
    
    Service -> ProdRepo: findById(productId)
    ProdRepo -> DB: SELECT * FROM products WHERE id = ?
    DB -> ProdRepo: Product
    ProdRepo -> Service: Product
    
    Service -> Service: Update Product:\n- averageRating = 4.5\n- reviewCount = count
    
    Service -> ProdRepo: save(product)
    ProdRepo -> DB: UPDATE products\nSET average_rating = 4.5,\n    review_count = ?\nWHERE id = ?
    DB -> ProdRepo: Updated
    
    Service -> Service: Map to ReviewDto
    
    Service -> Controller: ReviewDto
    
    Controller -> UI: 200 OK\n{review with status APPROVED}
    
    UI -> UI: Remove review from pending list
    UI -> UI: Show success notification
    UI -> UI: Update pending count badge: 15 -> 14
    
    UI -> Admin: "Đã phê duyệt đánh giá thành công"
  end
end

@enduml
```

---

## Tổng kết

Đã hoàn thành đặc tả chi tiết cho **20 Use Cases quan trọng** của hệ thống Watchify:

### Guest/Customer Use Cases (14 UCs):
1. ✅ UC01: Register Account
2. ✅ UC02: Login
3. ✅ UC07: Browse Products
4. ✅ UC08: View Product Details
5. ✅ UC09: Search Products
6. ✅ UC15: Write Review
7. ✅ UC18: View Cart
8. ✅ UC19: Add to Cart
9. ✅ UC20: Update Cart Item
10. ✅ UC23: View Wishlist
11. ✅ UC24: Add to Wishlist
12. ✅ UC28: Add Address
13. ✅ UC32: Checkout Order
14. ✅ UC33: Apply Coupon
15. ✅ UC34: Make Payment (MoMo)
16. ✅ UC35: View Order History

### Admin Use Cases (6 UCs):
17. ✅ UC38: Create Product
18. ✅ UC39: Update Product
19. ✅ UC50: View All Orders
20. ✅ UC52: Update Order Status
21. ✅ UC59: Approve Review

Mỗi Use Case đều bao gồm đầy đủ:
- **Bảng đặc tả Use Case** (ID, Tên, Actor, Mô tả, Tiền/Hậu điều kiện, Luồng chính/thay thế, Ngoại lệ)
- **Activity Diagram** (PlantUML, 2 cột: Actor | System)
- **Sequence Diagram** (PlantUML, chi tiết tương tác giữa các components)

Tài liệu được chia thành 3 files để dễ quản lý:
- **Part 1**: UC01, UC02, UC07, UC08, UC09, UC15, UC18
- **Part 2**: UC19, UC20, UC23, UC24, UC28, UC32, UC33
- **Part 3**: UC34, UC35, UC38, UC39, UC50, UC52, UC59