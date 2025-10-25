# Module: Identity & Access

## 1. Trách nhiệm

Module **Identity & Access** chịu trách nhiệm quản lý tất cả các vấn đề liên quan đến **danh tính (identity)** và **quyền truy cập (access)** của người dùng trong hệ thống.

-   Quản lý vòng đời tài khoản người dùng: đăng ký, cập nhật thông tin, thay đổi mật khẩu.
-   Xử lý các luồng xác thực: đăng nhập, đăng xuất, làm mới token.
-   Quản lý vai trò (roles) và phân quyền (permissions).
-   Quản lý sổ địa chỉ (address book) của người dùng.

## 2. Các thực thể chính (Entities)

Module này quản lý các bảng dữ liệu sau:

-   `users`: Lưu trữ thông tin cơ bản của người dùng (email, password hash, tên, trạng thái).
-   `roles`: Định nghĩa các vai trò trong hệ thống (ví dụ: `CUSTOMER`, `ADMIN`).
-   `user_roles`: Bảng trung gian, gán vai trò cho người dùng (quan hệ nhiều-nhiều).
-   `addresses`: Lưu trữ các địa chỉ giao hàng của người dùng.

## 3. Các luồng nghiệp vụ chính (Usecases)

### 3.1. Đăng ký tài khoản

-   **Input:** `firstName`, `lastName`, `email`, `password`.
-   **Quy trình:**
    1.  Validate dữ liệu đầu vào (email hợp lệ, password đủ mạnh).
    2.  Kiểm tra email đã tồn tại trong hệ thống chưa.
    3.  Mã hóa mật khẩu (sử dụng BCrypt).
    4.  Tạo một bản ghi `User` mới với trạng thái `active`.
    5.  Gán vai trò mặc định là `CUSTOMER` cho người dùng mới.
    6.  (Tùy chọn) Gửi email chào mừng.
-   **Output:** Thông tin người dùng vừa được tạo (không bao gồm mật khẩu).

### 3.2. Đăng nhập

-   **Input:** `email`, `password`.
-   **Quy trình:**
    1.  Tìm người dùng theo `email`. Nếu không tìm thấy hoặc tài khoản không ở trạng thái `active`, trả về lỗi.
    2.  So sánh mật khẩu người dùng cung cấp với `password_hash` trong CSDL.
    3.  Nếu thành công, tạo ra một cặp **Access Token** và **Refresh Token** (JWT).
        -   **Access Token:** Chứa thông tin `user_id` và `roles`, có thời gian sống ngắn (ví dụ: 15 phút). Dùng để xác thực cho các yêu cầu truy cập tài nguyên.
        -   **Refresh Token:** Có thời gian sống dài hơn (ví dụ: 7 ngày), dùng để yêu cầu cấp lại Access Token mới khi hết hạn.
-   **Output:** `accessToken`, `refreshToken`.

### 3.3. Quản lý hồ sơ

-   **Input:** `firstName`, `lastName`, `phone`, `avatarUrl`.
-   **Quy trình:**
    1.  Người dùng (đã xác thực) gửi yêu cầu cập nhật.
    2.  Hệ thống cập nhật các thông tin được phép thay đổi vào bản ghi `User` tương ứng.
-   **Output:** Thông tin người dùng đã được cập nhật.

### 3.4. Quản lý địa chỉ

-   Cung cấp các API CRUD (Create, Read, Update, Delete) để người dùng quản lý sổ địa chỉ của mình.
-   Hỗ trợ tính năng đặt một địa chỉ làm **mặc định** (`is_default`).

## 4. API Giao tiếp (Public API)

Module này sẽ cung cấp một interface `IdentityAccessApi` để các module khác có thể tương tác một cách an toàn.

```java
public interface IdentityAccessApi {

    /**
     * Lấy thông tin cơ bản của người dùng bằng ID.
     * Trả về Optional rỗng nếu không tìm thấy.
     */
    Optional<UserDto> findUserById(UUID userId);

    /**
     * Lấy thông tin địa chỉ bằng ID.
     */
    Optional<AddressDto> findAddressById(UUID addressId);
}
```

## 5. Sự kiện (Events)

Module này có thể phát ra các sự kiện sau:

-   `UserRegisteredEvent`: Khi một người dùng mới đăng ký thành công. Các module khác (ví dụ: `cart-module`) có thể lắng nghe sự kiện này để gộp giỏ hàng của khách vãng lai vào tài khoản mới.

Module này cũng có thể lắng nghe các sự kiện từ module khác (hiện tại chưa có).