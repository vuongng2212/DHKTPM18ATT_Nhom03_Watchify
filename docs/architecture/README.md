# Tài liệu Kiến trúc Backend - Dự án Watchify

## 1. Giới thiệu

Tài liệu này mô tả kiến trúc kỹ thuật của hệ thống backend cho dự án Watchify. Mục tiêu là cung cấp một cái nhìn tổng quan về các quyết định thiết kế, công nghệ sử dụng, và cấu trúc các thành phần hệ thống.

## 2. Tổng quan Kiến trúc

Hệ thống được xây dựng theo mô hình **Client-Server**.

-   **Client (Frontend):** Là một ứng dụng web (Single Page Application - SPA) hoặc ứng dụng di động, chịu trách nhiệm cho việc hiển thị giao diện và tương tác với người dùng.
-   **Server (Backend):** Là một ứng dụng Spring Boot, cung cấp các API để client có thể truy xuất và xử lý dữ liệu. Backend chịu trách nhiệm cho toàn bộ logic nghiệp vụ, quản lý dữ liệu và tương tác với các hệ thống bên thứ ba.

## 3. Công nghệ sử dụng (Technology Stack)

-   **Ngôn ngữ:** Java (phiên bản 17+).
-   **Framework:** Spring Boot 3.x.
-   **Truy cập dữ liệu:** Spring Data JPA (với Hibernate).
-   **Cơ sở dữ liệu:** PostgreSQL (hoặc MySQL) - một hệ quản trị CSDL quan hệ.
-   **Xác thực & Phân quyền:** Spring Security, JWT (JSON Web Tokens).
-   **API Documentation:** OpenAPI 3 (Swagger).

## 4. Kiến trúc Modular Monolith

Để cân bằng giữa tốc độ phát triển và khả năng bảo trì, mở rộng trong tương lai, backend sẽ được xây dựng theo kiến trúc **Modular Monolith**.

### 4.1. Triết lý thiết kế

-   **Monolith:** Toàn bộ hệ thống được đóng gói và triển khai như một ứng dụng duy nhất (một file `.jar`). Điều này giúp đơn giản hóa việc build, deploy và quản lý trong giai đoạn đầu.
-   **Modular:** Mã nguồn được chia thành các **module** độc lập một cách logic. Mỗi module đại diện cho một miền nghiệp vụ (business domain) cụ thể của hệ thống.

### 4.2. Nguyên tắc thiết kế Module

-   **Tính gắn kết cao (High Cohesion):** Mỗi module chỉ nên chứa các chức năng liên quan chặt chẽ đến một nghiệp vụ duy nhất (ví dụ: module `catalog` chỉ quản lý sản phẩm, danh mục; module `order` chỉ quản lý đơn hàng).
-   **Khớp nối lỏng lẻo (Loose Coupling):**
    -   Các module giao tiếp với nhau thông qua các **public API** (Java interfaces) được định nghĩa rõ ràng, không được truy cập trực tiếp vào các lớp implementation nội bộ của nhau.
    -   Việc giao tiếp giữa các module nên được ưu tiên sử dụng cơ chế bất đồng bộ (asynchronous) thông qua **sự kiện** (Spring Events) để giảm sự phụ thuộc trực tiếp. Ví dụ: khi một đơn hàng được tạo (trong module `order`), nó sẽ phát ra một sự kiện `OrderCreatedEvent`. Module `inventory` sẽ lắng nghe sự kiện này để trừ tồn kho.
-   **Ranh giới rõ ràng (Well-defined Boundaries):** Mỗi module có không gian tên (package) riêng biệt và không chia sẻ các bảng dữ liệu cốt lõi với các module khác (trừ các bảng dữ liệu dùng chung được định nghĩa trong `shared-kernel`).

### 4.3. Cấu trúc Module đề xuất

Dựa trên phân tích nghiệp vụ, hệ thống backend sẽ được chia thành các module chính sau:

-   `identity-access-module`: Quản lý người dùng, vai trò, xác thực và phân quyền.
-   `catalog-module`: Quản lý sản phẩm, danh mục, thương hiệu, đánh giá.
-   `inventory-module`: Quản lý tồn kho.
-   `cart-module`: Quản lý giỏ hàng và danh sách yêu thích.
-   `order-module`: Quản lý đơn hàng và vận chuyển.
-   `payment-module`: Xử lý thanh toán.
-   `promotion-module`: Quản lý khuyến mãi và mã giảm giá.
-   `shared-kernel`: Chứa các mã nguồn dùng chung như các lớp tiện ích, cấu hình chung, và các định nghĩa sự kiện.

Sơ đồ tương tác cấp cao giữa các module sẽ được mô tả trong tài liệu chi tiết của từng module.