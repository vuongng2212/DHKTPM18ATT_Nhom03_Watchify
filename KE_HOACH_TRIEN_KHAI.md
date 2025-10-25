# Kế hoạch Triển khai Dự án Watchify (4 Tuần)

## 1. Tổng quan

- **Dự án:** Watchify - Website Thương mại điện tử đồng hồ.
- **Thời gian:** 4 tuần.
- **Thành viên & Vai trò:**
  - **Vương:** Phụ trách Backend và hỗ trợ Frontend.
  - **Anh Tuấn:** Phụ trách Backend.
  - **Hữu Tuấn:** Phụ trách Frontend.
- **Cơ sở dữ liệu:** MariaDB.
- **Mục tiêu:** Hoàn thành các chức năng cốt lõi để ra mắt phiên bản đầu tiên (MVP).

## 2. Chiến lược Triển khai

- **Phát triển theo mô hình Agile/Iterative:** Mỗi tuần là một "sprint" nhỏ, tập trung vào một nhóm chức năng cụ thể.
- **Tích hợp liên tục (CI):** Backend và Frontend sẽ làm việc chặt chẽ để đảm bảo API được thiết kế và tích hợp trơn tru.
- **Backend First:** Các API sẽ được hoàn thiện trước, sau đó Frontend sẽ tích hợp.
- **Giao tiếp song song:** Vương sẽ đóng vai trò cầu nối, đảm bảo các module backend được phát triển đúng để hỗ trợ các tính năng frontend tương ứng.

## 3. Kế hoạch chi tiết theo Tuần

### **Tuần 1: Nền tảng & Chức năng Cốt lõi**

**Mục tiêu:** Xây dựng nền tảng cho cả hai phía, người dùng có thể xem sản phẩm và đăng ký/đăng nhập.

#### **Backend (Vương & Anh Tuấn)**

| Công việc | Người phụ trách | Mô tả chi tiết | Bảng dữ liệu liên quan |
| :--- | :--- | :--- | :--- |
| 1. Cài đặt dự án Spring Boot | Vương | Cài đặt dự án Spring Boot, cấu hình `application.properties` để kết nối MariaDB, cấu trúc các package theo kiến trúc Modular Monolith. | - |
| 2. Cấu hình Spring Security & JWT | Vương | Cấu hình Spring Security, cài đặt JWT để xác thực và phân quyền người dùng. | - |
| 3. Module `identity-access-module` | Anh Tuấn | Tạo entity `User`, `Role`. Xây dựng API cho **Đăng ký**, **Đăng nhập** (trả về JWT). | `users`, `roles`, `user_roles` |
| 4. Module `catalog-module` (cơ bản) | Anh Tuấn | Tạo entity `Product`, `Category`, `Brand`. Xây dựng API **Lấy danh sách sản phẩm** (có phân trang) và **Xem chi tiết sản phẩm**. | `products`, `categories`, `brands` |
| 5. Seed dữ liệu mẫu | Vương | Chuẩn bị script để seed dữ liệu mẫu cho `products`, `categories`, `users` để Frontend có thể tích hợp. | `products`, `categories`, `users` |

#### **Frontend (Hữu Tuấn & Vương)**

| Công việc | Người phụ trách | Mô tả chi tiết | API tích hợp |
| :--- | :--- | :--- | :--- |
| 1. Cài đặt dự án | Hữu Tuấn | Cài đặt dự án (React/Vue/Angular), cấu trúc thư mục, cài đặt thư viện quản lý state (Redux/Vuex), routing. | - |
| 2. Xây dựng Layout chính | Hữu Tuấn | Xây dựng layout chính (Header, Footer, Sidebar, Content). | - |
| 3. Trang chủ | Hữu Tuấn | Hiển thị các sản phẩm nổi bật. | `GET /api/products` (filter nổi bật) |
| 4. Trang Danh sách sản phẩm | Hữu Tuấn | Hiển thị sản phẩm từ API, có phân trang. | `GET /api/products` |
| 5. Trang Chi tiết sản phẩm | Hữu Tuấn | Hiển thị đầy đủ thông tin, hình ảnh của một sản phẩm. | `GET /api/products/{id}` |
| 6. Trang Đăng ký / Đăng nhập | Vương | Xây dựng form và xử lý logic gọi API, lưu JWT. | `POST /api/auth/register`, `POST /api/auth/login` |
| 7. Tích hợp API | Vương | Hỗ trợ Hữu Tuấn tích hợp API đăng nhập và hiển thị sản phẩm. | `POST /api/auth/login`, `GET /api/products` |

---

### **Tuần 2: Hoàn thiện Luồng Thương mại điện tử**

**Mục tiêu:** Người dùng đã đăng nhập có thể tương tác với sản phẩm bằng cách thêm vào giỏ hàng và danh sách yêu thích.

#### **Backend (Vương & Anh Tuấn)**

| Công việc | Người phụ trách | Mô tả chi tiết | Bảng dữ liệu liên quan |
| :--- | :--- | :--- | :--- |
| 1. Module `cart-module` | Anh Tuấn | Tạo entity `Cart`, `CartItem`. Xây dựng API để **Thêm/sửa/xóa sản phẩm trong giỏ hàng**, **Xem giỏ hàng**. | `carts`, `cart_items` |
| 2. Module `wishlist-module` | Anh Tuấn | Tạo entity `Wishlist`. Xây dựng API **Thêm/xóa sản phẩm yêu thích**. | `wishlists` |
| 3. Cải tiến `catalog-module` | Vương | Nâng cấp API danh sách sản phẩm để hỗ trợ **Tìm kiếm theo tên**, **Lọc** (theo giá, thương hiệu), và **Sắp xếp**. | `products`, `categories`, `brands` |
| 4. Module `inventory-module` (cơ bản) | Vương | Tạo entity `Inventory` để theo dõi số lượng tồn kho. | `inventories` |

#### **Frontend (Hữu Tuấn & Vương)**

| Công việc | Người phụ trách | Mô tả chi tiết | API tích hợp |
| :--- | :--- | :--- | :--- |
| 1. Component Giỏ hàng | Hữu Tuấn | Xây dựng component Giỏ hàng (có thể là trang riêng hoặc popup/drawer). | `GET /api/cart`, `POST /api/cart-items`, `PUT /api/cart-items/{id}`, `DELETE /api/cart-items/{id}` |
| 2. Tích hợp API Giỏ hàng | Hữu Tuấn | Tích hợp API để thêm sản phẩm vào giỏ, thay đổi số lượng, xóa sản phẩm. | `POST /api/cart-items`, v.v. |
| 3. Trang Danh sách yêu thích | Hữu Tuấn | Xây dựng trang quản lý sản phẩm yêu thích. | `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/{productId}` |
| 4. Tích hợp API Yêu thích | Hữu Tuấn | Tích hợp API để thêm/xóa. | `POST /api/wishlist`, `DELETE /api/wishlist/{productId}` |
| 5. Cải tiến Trang danh sách sản phẩm | Vương | Thêm các control UI cho chức năng tìm kiếm, lọc, và sắp xếp. | `GET /api/products` (với params) |
| 6. Tích hợp API tìm kiếm/lọc/sắp xếp | Vương | Tích hợp với API đã được nâng cấp. | `GET /api/products` (với params) |

---

### **Tuần 3: Thanh toán & Quản lý Cá nhân**

**Mục tiêu:** Hoàn thành luồng mua hàng cốt lõi, từ giỏ hàng đến đặt hàng thành công. Người dùng có thể quản lý thông tin cá nhân và xem lại lịch sử mua hàng.

#### **Backend (Vương & Anh Tuấn)**

| Công việc | Người phụ trách | Mô tả chi tiết | Bảng dữ liệu liên quan |
| :--- | :--- | :--- | :--- |
| 1. Module `order-module` | Anh Tuấn | Tạo entity `Order`, `OrderItem`. Xây dựng API **Tạo đơn hàng** từ giỏ hàng. Xây dựng API cho người dùng **Xem lịch sử đơn hàng** và **Xem chi tiết đơn hàng**. | `orders`, `order_items` |
| 2. Module `payment-module` (mock) | Vương | Ghi nhận trạng thái thanh toán (thành công/thất bại) để hoàn tất luồng. | `payments` |
| 3. Giao tiếp Module qua sự kiện | Vương | `OrderCreatedEvent` -> `inventory-module` nghe để giữ hàng (reserve stock). `PaymentSuccessEvent` (mock) -> `order-module` nghe để xác nhận đơn -> `inventory-module` nghe để trừ tồn kho. | `orders`, `inventories` |
| 4. Cải tiến `identity-access-module` | Vương | Xây dựng API cho người dùng **Quản lý thông tin cá nhân**, **Quản lý địa chỉ giao hàng**. | `users`, `addresses` |

#### **Frontend (Hữu Tuấn & Vương)**

| Công việc | Người phụ trách | Mô tả chi tiết | API tích hợp |
| :--- | :--- | :--- | :--- |
| 1. Trang Thanh toán (Checkout) | Hữu Tuấn | Xây dựng form nhiều bước: Nhập địa chỉ giao hàng, chọn phương thức thanh toán, xem lại đơn hàng. | `GET /api/user/addresses`, `POST /api/orders` |
| 2. Trang xác nhận đơn hàng | Hữu Tuấn | Hiển thị sau khi đặt hàng thành công. | `POST /api/orders` |
| 3. Trang cá nhân (Profile) | Vương | Xây dựng các tab/trang con: Thông tin cá nhân, Quản lý địa chỉ, Lịch sử đơn hàng. | `GET /api/user/profile`, `PUT /api/user/profile`, `GET /api/user/addresses`, `GET /api/orders` |
| 4. Tích hợp API cá nhân | Vương | Tích hợp các API tương ứng cho trang cá nhân. | `GET/PUT /api/user/profile`, `GET/POST/PUT/DELETE /api/user/addresses`, `GET /api/orders` |

---

### **Tuần 4: Chức năng Quản trị & Hoàn thiện**

**Mục tiêu:** Xây dựng các chức năng quản trị cơ bản, hoàn thiện các tính năng còn lại và chuẩn bị cho việc triển khai.

#### **Backend (Vương & Anh Tuấn)**

| Công việc | Người phụ trách | Mô tả chi tiết | Bảng dữ liệu liên quan |
| :--- | :--- | :--- | :--- |
| 1. API Quản lý sản phẩm | Anh Tuấn | Xây dựng API CRUD cho `Product`. | `products` |
| 2. API Quản lý đơn hàng | Anh Tuấn | Xây dựng API Xem danh sách đơn hàng, cập nhật trạng thái (đang xử lý, đã giao...). | `orders`, `order_items` |
| 3. API Quản lý người dùng | Anh Tuấn | Xây dựng API Xem danh sách người dùng. | `users` |
| 4. Module `promotion-module` | Vương | Tạo entity `Coupon`. Xây dựng API **Áp dụng mã giảm giá** vào đơn hàng. Xây dựng API CRUD cơ bản cho `Coupon` (phía Admin). | `coupons`, `promotions` |
| 5. Module `catalog-module` (đánh giá) | Vương | Xây dựng API cho phép người dùng **Viết đánh giá** cho sản phẩm đã mua. | `reviews`, `products` |
| 6. Review & Tối ưu | Vương | Review lại toàn bộ code, tối ưu các câu query. | - |
| 7. Cấu hình Docker | Vương | Cấu hình Docker để đóng gói ứng dụng, chuẩn bị cho deployment. | - |

#### **Frontend (Hữu Tuấn & Vương)**

| Công việc | Người phụ trách | Mô tả chi tiết | API tích hợp |
| :--- | :--- | :--- | :--- |
| 1. Giao diện Admin | Hữu Tuấn | Xây dựng giao diện Admin (layout riêng): Trang Quản lý sản phẩm (bảng, form thêm/sửa), Quản lý đơn hàng (bảng, xem chi tiết), Quản lý người dùng (bảng). | `GET/POST/PUT/DELETE /api/admin/products`, `GET/PUT /api/admin/orders`, `GET /api/admin/users` |
| 2. Tích hợp API Admin | Hữu Tuấn | Tích hợp các API Admin tương ứng. | Các API admin từ bảng trên |
| 3. Trang thanh toán (mã giảm giá) | Vương | Thêm ô nhập mã giảm giá và tích hợp API. | `POST /api/coupons/apply` (mock) |
| 4. Trang chi tiết sản phẩm (đánh giá) | Vương | Hiển thị các đánh giá và cho phép người dùng đã mua hàng viết đánh giá. | `GET /api/products/{id}/reviews`, `POST /api/products/{id}/reviews` |
| 5. Rà soát & Tối ưu UI/UX | Vương | Rà soát, chỉnh sửa UI/UX trên toàn bộ trang. Tối ưu responsive cho các thiết bị di động. | - |
| 6. Kiểm thử & Hoàn thiện | Hữu Tuấn | Kiểm thử toàn diện và sửa các lỗi phát sinh. | - |

---

## 4. Ghi chú

- **Tích hợp liên tục:** Vương sẽ đảm bảo rằng các API do Anh Tuấn xây dựng được tích hợp kịp thời vào Frontend bởi Hữu Tuấn.
- **Giao tiếp:** Các thành viên nên thường xuyên trao đổi thông qua các công cụ như Slack, Discord hoặc họp ngắn hàng ngày để cập nhật tiến độ và giải quyết vấn đề phát sinh.
- **Tài liệu API:** Backend nên cập nhật tài liệu API (Swagger/OpenAPI) thường xuyên để Frontend dễ dàng theo dõi và tích hợp.

---
