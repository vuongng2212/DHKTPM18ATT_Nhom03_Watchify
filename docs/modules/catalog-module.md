# Module: Catalog

## 1. Trách nhiệm

Module **Catalog** là trái tim của hệ thống, chịu trách nhiệm quản lý toàn bộ thông tin liên quan đến sản phẩm và các thực thể phụ trợ.

-   Quản lý sản phẩm (`Product`), bao gồm thông tin cơ bản, mô tả, giá, và các thuộc tính chi tiết (`ProductDetail`).
-   Quản lý các danh mục phân loại: Danh mục (`Category`), Thương hiệu (`Brand`), và Bộ sưu tập (`Collection`).
-   Quản lý hình ảnh sản phẩm (`ProductImage`).
-   Quản lý và kiểm duyệt các đánh giá, bình luận của khách hàng về sản phẩm (`Review`).

## 2. Các thực thể chính (Entities)

-   `products`: Thông tin cốt lõi của sản phẩm.
-   `categories`: Cây danh mục sản phẩm (ví dụ: Đồng hồ nam, Đồng hồ nữ).
-   `brands`: Các thương hiệu (ví dụ: Rolex, Casio).
-   `collections`: Các bộ sưu tập đặc biệt.
-   `product_details`: Các thông số kỹ thuật chi tiết (loại máy, chất liệu vỏ, size...).
-   `product_images`: Danh sách hình ảnh của sản phẩm.
-   `reviews`: Đánh giá của khách hàng cho sản phẩm.

## 3. Các luồng nghiệp vụ chính (Usecases)

### 3.1. Quản lý sản phẩm (Admin)

-   Cung cấp các API CRUD (Create, Read, Update, Delete) đầy đủ cho `Product`.
-   Khi tạo/cập nhật sản phẩm, cho phép gán sản phẩm vào `Category`, `Brand`, `Collection`.
-   Cho phép quản lý (thêm/xóa/sắp xếp) `ProductImage`.
-   Cho phép cập nhật `ProductDetail`.

### 3.2. Quản lý Đánh giá (Admin)

-   Xem danh sách các đánh giá đang ở trạng thái `pending`.
-   Cung cấp API để `approve` (chấp thuận) hoặc `reject` (từ chối) một đánh giá.

### 3.3. Viết Đánh giá (Customer)

-   **Điều kiện:** Người dùng phải đã mua sản phẩm này (có thể kiểm tra qua module `order`).
-   **Input:** `productId`, `rating` (1-5), `content`.
-   **Quy trình:**
    1.  Kiểm tra xem người dùng đã mua sản phẩm chưa.
    2.  Tạo một bản ghi `Review` mới với trạng thái `pending`.
    3.  Lưu vào CSDL.
-   **Output:** Thông báo gửi đánh giá thành công.

### 3.4. Hiển thị sản phẩm (Guest & Customer)

-   Cung cấp API để lấy danh sách sản phẩm với các chức năng:
    -   **Phân trang (Pagination):** Trả về sản phẩm theo từng trang.
    -   **Sắp xếp (Sorting):** Theo giá (tăng/giảm), sản phẩm mới nhất, bán chạy nhất.
    -   **Lọc (Filtering):** Theo khoảng giá, `category`, `brand`, `collection`, và các thuộc tính trong `ProductDetail`.
-   Cung cấp API để lấy chi tiết một sản phẩm, bao gồm tất cả thông tin liên quan: `ProductDetail`, `ProductImage`, danh sách `Review` đã được `approved`.

## 4. API Giao tiếp (Public API)

```java
public interface CatalogApi {

    /**
     * Lấy thông tin cơ bản của sản phẩm bằng ID.
     * Dùng cho các module khác khi cần tham chiếu thông tin sản phẩm.
     */
    Optional<ProductDto> findProductById(UUID productId);

    /**
     * Lấy danh sách thông tin sản phẩm theo danh sách ID.
     * Hữu ích cho việc lấy thông tin hàng loạt (ví dụ: trong giỏ hàng, đơn hàng).
     */
    List<ProductDto> findProductsByIds(List<UUID> productIds);

    /**
     * Kiểm tra xem một người dùng đã mua một sản phẩm cụ thể hay chưa.
     * Cần thiết cho việc cho phép người dùng viết đánh giá.
     * @return true nếu đã mua, ngược lại false.
     */
    boolean hasUserPurchasedProduct(UUID userId, UUID productId);
}
```

## 5. Sự kiện (Events)

Module này có thể phát ra các sự kiện:

-   `ProductPriceChangedEvent`: Khi giá của một sản phẩm thay đổi. Module `cart` có thể lắng nghe để cập nhật giá trong giỏ hàng.
-   `ReviewSubmittedEvent`: Khi có một đánh giá mới được gửi. Có thể dùng để gửi thông báo cho admin.

Module này sẽ lắng nghe các sự kiện:

-   `OrderLineProcessedEvent` (từ `order-module`): Để cập nhật thông tin về "sản phẩm bán chạy nhất".