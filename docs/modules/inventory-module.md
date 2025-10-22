# Module: Inventory

## 1. Trách nhiệm

Module **Inventory** chịu trách nhiệm theo dõi và quản lý số lượng tồn kho của tất cả các sản phẩm trong hệ thống.

-   Cập nhật số lượng tồn kho khi có hàng nhập về.
-   "Dự trữ" (reserve) số lượng hàng khi một đơn hàng được tạo nhưng chưa hoàn tất thanh toán.
-   Giảm số lượng tồn kho thực tế khi một đơn hàng đã được xác nhận.
-   Hoàn trả lại số lượng đã dự trữ nếu đơn hàng bị hủy hoặc thanh toán thất bại.

## 2. Các thực thể chính (Entities)

-   `inventories`: Lưu trữ số lượng trong kho (`quantity_in_stock`), số lượng đang được giữ (`quantity_reserved`) cho mỗi sản phẩm.

## 3. Các luồng nghiệp vụ chính (Usecases)

### 3.1. Cập nhật tồn kho (Admin)

-   Cung cấp API cho phép admin cập nhật số lượng `quantity_in_stock` cho một sản phẩm.

### 3.2. Xử lý sự kiện tạo đơn hàng

-   **Lắng nghe sự kiện:** `OrderCreatedEvent` từ `order-module`.
-   **Quy trình:**
    1.  Khi nhận được sự kiện, lặp qua danh sách các sản phẩm trong đơn hàng.
    2.  Kiểm tra xem số lượng yêu cầu có đủ trong kho không (`quantity_in_stock - quantity_reserved >= requested_quantity`).
    3.  Nếu không đủ, phát ra sự kiện `InventoryNotSufficientEvent` để module `order` có thể hủy đơn hàng.
    4.  Nếu đủ, tăng `quantity_reserved` lên tương ứng.

### 3.3. Xử lý sự kiện đơn hàng được xác nhận

-   **Lắng nghe sự kiện:** `OrderConfirmedEvent` từ `order-module`.
-   **Quy trình:**
    1.  Giảm `quantity_in_stock` và `quantity_reserved` tương ứng với số lượng sản phẩm trong đơn hàng.

### 3.4. Xử lý sự kiện đơn hàng bị hủy

-   **Lắng nghe sự kiện:** `OrderCancelledEvent` từ `order-module`.
-   **Quy trình:**
    1.  Giảm `quantity_reserved` tương ứng với số lượng sản phẩm trong đơn hàng đã bị hủy.

## 4. API Giao tiếp (Public API)

Module này chủ yếu hoạt động dựa trên sự kiện và không cần cung cấp nhiều API công khai. Tuy nhiên, có thể cần một API để kiểm tra số lượng tồn kho.

```java
public interface InventoryApi {

    /**
     * Kiểm tra số lượng có sẵn của một sản phẩm.
     * @return số lượng có thể bán (quantity_in_stock - quantity_reserved).
     */
    int getAvailableStock(UUID productId);
}
```

## 5. Sự kiện (Events)

Module này phát ra các sự kiện:

-   `InventoryNotSufficientEvent`: Khi không đủ hàng để đáp ứng một yêu cầu.
-   `ProductOutOfStockEvent`: Khi `quantity_in_stock` của một sản phẩm về 0.
-   `ProductLowStockEvent`: Khi `quantity_in_stock` của một sản phẩm xuống dưới ngưỡng `reorder_level`.