# Module: Cart

## 1. Trách nhiệm

Module **Cart** chịu trách nhiệm quản lý giỏ hàng tạm thời và danh sách các sản phẩm yêu thích của người dùng.

-   Quản lý giỏ hàng cho cả khách vãng lai (dựa trên `session_id`) và người dùng đã đăng nhập (dựa trên `user_id`).
-   Cung cấp các chức năng: thêm sản phẩm vào giỏ, xóa sản phẩm, cập nhật số lượng.
-   Hỗ trợ gộp giỏ hàng của khách vãng lai vào tài khoản người dùng sau khi đăng nhập/đăng ký.
-   Quản lý danh sách sản phẩm yêu thích (`Wishlist`) của người dùng.

## 2. Các thực thể chính (Entities)

-   `carts`: Đại diện cho một giỏ hàng, liên kết với `user_id` hoặc `session_id`.
-   `cart_items`: Các sản phẩm cụ thể trong một giỏ hàng, bao gồm `product_id` và `quantity`.
-   `wishlists`: Lưu danh sách các sản phẩm mà người dùng đã đánh dấu là yêu thích.

## 3. Các luồng nghiệp vụ chính (Usecases)

### 3.1. Quản lý giỏ hàng

-   **Thêm vào giỏ:**
    -   **Input:** `productId`, `quantity`.
    -   **Quy trình:**
        1.  Tìm hoặc tạo một giỏ hàng cho `user_id` (nếu đã đăng nhập) hoặc `session_id`.
        2.  Kiểm tra xem sản phẩm đã có trong giỏ chưa. Nếu có, tăng số lượng. Nếu chưa, tạo một `CartItem` mới.
        3.  Kiểm tra số lượng tồn kho có sẵn thông qua `InventoryApi`.
-   **Cập nhật số lượng:**
    -   **Input:** `productId`, `quantity`.
    -   **Quy trình:** Cập nhật số lượng của `CartItem` tương ứng. Nếu số lượng là 0, xóa `CartItem`.
-   **Xóa khỏi giỏ:**
    -   **Input:** `productId`.
    -   **Quy trình:** Xóa `CartItem` tương ứng khỏi giỏ hàng.
-   **Xem giỏ hàng:**
    -   **Quy trình:** Lấy tất cả `CartItem` của giỏ hàng hiện tại, sau đó gọi `CatalogApi` để lấy thông tin chi tiết (tên, giá, hình ảnh) của từng sản phẩm.

### 3.2. Gộp giỏ hàng

-   **Lắng nghe sự kiện:** `UserRegisteredEvent` hoặc `UserLoggedInEvent` từ `identity-access-module`.
-   **Quy trình:**
    1.  Kiểm tra xem có giỏ hàng nào đang liên kết với `session_id` của người dùng không.
    2.  Kiểm tra xem người dùng đã có giỏ hàng nào liên kết với `user_id` của họ chưa.
    3.  Gộp các `CartItem` từ giỏ hàng session vào giỏ hàng của người dùng.

### 3.3. Quản lý Wishlist

-   Cung cấp các API để người dùng (đã đăng nhập) có thể thêm/xóa sản phẩm khỏi danh sách yêu thích của mình.

## 4. API Giao tiếp (Public API)

Module này không cần thiết phải cung cấp API công khai cho các module khác, vì nghiệp vụ của nó chủ yếu là tự quản và chỉ phục vụ cho người dùng cuối thông qua các controller.

## 5. Sự kiện (Events)

Module này có thể lắng nghe các sự kiện:

-   `UserRegisteredEvent` / `UserLoggedInEvent`: Để thực hiện việc gộp giỏ hàng.
-   `ProductPriceChangedEvent` (từ `catalog-module`): Để có thể cập nhật lại tổng giá trị giỏ hàng (tuy nhiên, việc lấy giá real-time khi xem giỏ hàng thường được ưu tiên hơn).