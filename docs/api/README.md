# Tài liệu Đặc tả API (API Specification)

Thư mục này chứa tài liệu chi tiết về các API của hệ thống backend Watchify, được xây dựng theo tiêu chuẩn **OpenAPI 3.0**.

## 1. Giới thiệu

Tài liệu này đóng vai trò là "hợp đồng" (contract) giữa đội ngũ frontend và backend, mô tả rõ ràng các endpoint, định dạng request/response, mã trạng thái (status codes), và các quy tắc xác thực.

Việc sử dụng OpenAPI cho phép:
-   Tự động sinh ra tài liệu API tương tác (Swagger UI).
-   Tự động sinh ra mã nguồn client (client SDK) cho nhiều ngôn ngữ khác nhau.
-   Thực hiện kiểm thử API một cách tự động.

## 2. Cấu trúc

Đặc tả API sẽ được chia thành các tệp nhỏ hơn theo từng **resource** (tài nguyên) để dễ quản lý, và sẽ được gom lại trong một tệp `openapi.yaml` chính.

Ví dụ cấu trúc:

```
docs/api/
├── openapi.yaml              # Tệp chính, tổng hợp các tệp con
├── components/               # Chứa các thành phần tái sử dụng
│   ├── schemas/
│   │   ├── user.yaml
│   │   └── product.yaml
│   └── responses/
│       ├── 400_bad_request.yaml
│       └── 404_not_found.yaml
└── paths/                    # Chứa định nghĩa các endpoint
    ├── auth.yaml
    ├── products.yaml
    └── orders.yaml
```

## 3. Truy cập Swagger UI

Sau khi hệ thống backend được khởi chạy, bạn có thể truy cập vào giao diện Swagger UI để xem tài liệu API tương tác và thử nghiệm các endpoint tại địa chỉ sau:

-   **URL:** `http://localhost:8080/swagger-ui.html`

*(Lưu ý: URL trên là mặc định và có thể thay đổi tùy theo cấu hình dự án.)*