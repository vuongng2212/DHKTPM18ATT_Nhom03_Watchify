# Module: Shared Kernel

## 1. Trách nhiệm

**Shared Kernel** không phải là một module nghiệp vụ. Thay vào đó, nó là một thư viện dùng chung, chứa các mã nguồn và định nghĩa được chia sẻ bởi nhiều module khác trong hệ thống.

Mục đích chính của Shared Kernel là:
-   Tránh lặp lại mã nguồn (Don't Repeat Yourself - DRY).
-   Cung cấp một "ngôn ngữ chung" (common language) cho các module, đặc biệt là trong việc giao tiếp qua sự kiện và API.

**Quan trọng:** Chỉ những gì thực sự cần thiết và ổn định mới được đưa vào Shared Kernel. Việc lạm dụng Shared Kernel có thể làm tăng sự khớp nối (coupling) giữa các module, đi ngược lại với triết lý của kiến trúc module.

## 2. Các thành phần chính

### 2.1. Lớp cơ sở (Base Classes)

-   `BaseEntity`: Một lớp cơ sở cho các entity, có thể chứa các trường chung như `id`, `created_at`, `updated_at`.
-   `BaseRepository`: Interface repository cơ sở của Spring Data JPA.

### 2.2. Các lớp DTO dùng chung (Data Transfer Objects)

-   Chứa các lớp DTO được sử dụng trong giao tiếp giữa các module.
-   Ví dụ: `ProductDto`, `UserDto`, `AddressDto`, `DiscountResult`, `OrderContext`.

### 2.3. Định nghĩa Sự kiện (Event Definitions)

-   Đây là phần quan trọng nhất của Shared Kernel. Nó định nghĩa tất cả các lớp sự kiện (events) mà các module có thể phát ra hoặc lắng nghe.
-   Ví dụ: `OrderCreatedEvent`, `PaymentSuccessEvent`, `UserRegisteredEvent`.
-   Bằng cách đặt định nghĩa sự kiện ở đây, các module có thể giao tiếp với nhau một cách bất đồng bộ mà không cần phụ thuộc trực tiếp vào implementation của nhau.

### 2.4. Các tiện ích (Utilities)

-   Các lớp tiện ích không chứa logic nghiệp vụ, ví dụ: các hàm xử lý chuỗi, ngày tháng, hoặc các hằng số chung.

## 3. Quy tắc sử dụng

-   Shared Kernel **không được phép** phụ thuộc (depend on) vào bất kỳ module nghiệp vụ nào khác.
-   Tất cả các module nghiệp vụ đều có thể phụ thuộc vào Shared Kernel.
-   Mọi thay đổi trong Shared Kernel phải được xem xét cẩn thận vì nó có thể ảnh hưởng đến nhiều module khác.