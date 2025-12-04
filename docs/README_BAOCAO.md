# BÁO CÁO ĐỒ ÁN: WEBSITE BÁN ĐỒNG HỒ TRỰC TUYẾN - WATCHIFY

## 📚 Tổng quan

Thư mục này chứa báo cáo tổng kết đồ án "Xây dựng Website Bán Đồng Hồ Trực Tuyến - Watchify" của **Nhóm 03 - DHKTPM18ATT**.

Báo cáo được viết theo văn phong học thuật, chuyên nghiệp, với nội dung liền mạch (prose) thay vì gạch đầu dòng, tuân thủ theo hướng dẫn trong file `instructor.md`.

---

## 📂 Cấu trúc báo cáo

Báo cáo được chia thành 5 chương, mỗi chương trong một file Markdown riêng biệt:

### [Chương 1: Giới thiệu đề tài](Chuong1_GioiThieu.md)
**Nội dung chính:**
- Giới thiệu thành viên và phân công nhiệm vụ cụ thể
- Đánh giá mức độ đóng góp của từng thành viên
- Bối cảnh và lý do chọn đề tài bán đồng hồ trực tuyến
- Nhu cầu thị trường và tính cấp thiết của dự án
- Mục tiêu thực hiện về mặt kinh doanh và kỹ thuật

**Điểm nổi bật:** Phân tích sâu về thị trường thương mại điện tử đồng hồ tại Việt Nam và lý do chọn nền tảng chuyên biệt.

---

### [Chương 2: Phân tích yêu cầu](Chuong2_PhanTichYeuCau.md)
**Nội dung chính:**
- Xác định mục tiêu công việc cụ thể
- Phân tích chi tiết các chức năng:
  - Chức năng cho Customer (khách hàng)
  - Chức năng cho Admin (quản trị viên)
  - Chức năng cho Guest (khách vãng lai)
- Các ràng buộc phi chức năng:
  - Bảo mật thông tin (Spring Security, JWT, BCrypt)
  - Hiệu năng hệ thống (Indexing, Caching, Pagination)
  - Giao diện người dùng (Responsive, Accessibility)
  - Khả năng mở rộng
- Cơ sở lý thuyết và lựa chọn công nghệ:
  - Frontend: React 19, Vite, Tailwind CSS, Ant Design
  - Backend: Spring Boot 3.4.10, Java 21, Spring Security, JWT
  - Database: MariaDB, Flyway Migration
  - Deployment: Docker, Docker Compose

**Điểm nổi bật:** Giải thích chi tiết lý do lựa chọn từng công nghệ dựa trên yêu cầu dự án.

---

### [Chương 3: Phân tích thiết kế](Chuong3_PhanTichThietKe.md)
**Nội dung chính:**
- Mô tả chi tiết về thiết kế hệ thống:
  - Kiến trúc Modular Monolithic kết hợp Domain-Driven Design
  - Phân tầng: API, Application, Domain, Infrastructure
  - 6 modules nghiệp vụ: Identity, Catalog, Order, Inventory, Payment, Promotion
- Biểu đồ Use Case và mô tả luồng nghiệp vụ
- Biểu đồ Activity (3 flows chính):
  - User Registration and Authentication
  - Product Search and Filter
  - Complete Order Processing
- Biểu đồ Class cho các modules:
  - Identity Module (User, Role, Address, RefreshToken)
  - Catalog Module (Product, Category, Brand, Review, Wishlist)
  - Order and Payment Modules (Order, OrderItem, Cart, Payment)
- Biểu đồ Sequence:
  - MoMo Payment Processing Flow
  - Product Review Submission Flow
- Biểu đồ Database Schema (ERD):
  - 18 bảng chính với quan hệ rõ ràng
  - Mô tả chi tiết các bảng quan trọng

**Điểm nổi bật:** Tất cả biểu đồ đều được vẽ bằng Mermaid và có phần mô tả chi tiết bằng văn xuôi, giải thích ý nghĩa và luồng xử lý.

---

### [Chương 4: Hiện thực ứng dụng](Chuong4_HienThucUngDung.md)
**Nội dung chính:**
- Quá trình xây dựng ứng dụng theo phương pháp Agile
- Phân tích cách hiện thực Frontend:
  - Cấu trúc thư mục và tổ chức code
  - Triển khai giao diện với React và Tailwind CSS
  - Quản lý state với Context API và hooks
  - Responsive design và animations
- Phân tích cách hiện thực Backend:
  - Kiến trúc và tổ chức code theo modules
  - Spring Security và JWT Authentication flow
  - Xử lý API và validation (Jakarta Validation)
  - Repository Pattern, DTO Pattern, Service Layer
- Mô tả chi tiết 13 chức năng chính:
  1. Trang chủ (Home Page)
  2. Trang danh sách sản phẩm (Product Listing)
  3. Trang chi tiết sản phẩm (Product Detail)
  4. Giỏ hàng (Shopping Cart)
  5. Quy trình thanh toán (Checkout)
  6. Lịch sử đơn hàng (Order History)
  7. Danh sách yêu thích (Wishlist)
  8. Quản lý tài khoản (Profile Management)
  9. Admin Dashboard
  10. Quản lý sản phẩm (Products Management)
  11. Quản lý đơn hàng (Orders Management)
  12. Quản lý người dùng (Users Management)
  13. Analytics và báo cáo

**Điểm nổi bật:** Mỗi chức năng đều có chỗ đánh dấu `[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY]` để bạn có thể chèn screenshots sau.

---

### [Chương 5: Kết luận](Chuong5_KetLuan.md)
**Nội dung chính:**
- Tóm tắt kết quả đạt được:
  - Hoàn thành kiến trúc Modular Monolithic với DDD
  - Triển khai thành công tất cả modules nghiệp vụ
  - Tích hợp MoMo payment gateway
  - Responsive UI với React và Tailwind CSS
  - Containerization với Docker
- Những hạn chế tồn đọng:
  - Test coverage chưa cao
  - Performance optimization chưa tối ưu
  - Chưa có full-text search engine
  - Image handling chưa dùng CDN
  - Thiếu real-time features
  - Chưa support multi-language
  - Analytics còn basic
  - Chưa có mobile app
- Đề xuất hướng phát triển (4 giai đoạn):
  - **Giai đoạn 1 (3-6 tháng):** Củng cố nền tảng - Testing, Performance, Security
  - **Giai đoạn 2 (6-12 tháng):** Mở rộng tính năng - Search, Analytics, Payment, Marketing
  - **Giai đoạn 3 (12-18 tháng):** Scale - Microservices, Cloud, Database scaling
  - **Giai đoạn 4 (18-24 tháng):** Platform expansion - Mobile apps, i18n, AI features
- Tổng kết và cảm ơn

**Điểm nổi bật:** Roadmap phát triển chi tiết và thực tế cho tương lai.

---

## 🎯 Đặc điểm của báo cáo

### ✅ Tuân thủ yêu cầu
- ✔️ Văn phong học thuật, chuyên nghiệp, chặt chẽ
- ✔️ **Hạn chế tối đa gạch đầu dòng**, ưu tiên văn xuôi liền mạch
- ✔️ Sử dụng từ nối để dẫn dắt giữa các đoạn văn
- ✔️ Tính liên kết cao giữa các ý
- ✔️ Ngôn ngữ: Tiếng Việt

### 📊 Biểu đồ và sơ đồ
Tất cả biểu đồ được vẽ bằng **Mermaid**, có thể xem trực tiếp trên GitHub hoặc:
- VS Code: Cài extension "Markdown Preview Mermaid Support"
- Online: Copy code vào https://mermaid.live/

Các loại biểu đồ trong báo cáo:
- Use Case Diagram
- Activity Diagrams (3 flows)
- Class Diagrams (3 modules)
- Sequence Diagrams (2 flows)
- ERD (Entity Relationship Diagram)

### 🖼️ Vị trí chèn hình ảnh
Trong **Chương 4**, có 20+ vị trí được đánh dấu:
```
[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Mô tả hình ảnh]
```

Bạn cần chụp screenshots của ứng dụng và chèn vào các vị trí này.

---

## 📝 Hướng dẫn sử dụng

### Bước 1: Điền thông tin thành viên
Mở file `Chuong1_GioiThieu.md` và điền thông tin thực tế:
```
**[Cần điền tên và nhiệm vụ cụ thể của các thành viên]**
```

Thay thế phần ví dụ mẫu bằng thông tin thực tế của nhóm.

### Bước 2: Chèn hình ảnh minh họa
1. Chạy ứng dụng và chụp screenshots các chức năng
2. Lưu hình vào thư mục `docs/images/` (tạo mới nếu chưa có)
3. Thay thế các dòng `[CHÈN HÌNH ẢNH...]` bằng:
   ```markdown
   ![Mô tả hình](images/ten-file.png)
   ```

### Bước 3: Review và chỉnh sửa
- Đọc kỹ từng chương
- Bổ sung thông tin cụ thể về dự án của bạn
- Kiểm tra tính nhất quán giữa các chương
- Đảm bảo tất cả biểu đồ hiển thị đúng

### Bước 4: Export sang PDF (nếu cần)
Có thể sử dụng:
- VS Code extension: "Markdown PDF"
- Typora: File > Export > PDF
- Pandoc: `pandoc input.md -o output.pdf`

---

## 🔧 Tech Stack đã phân tích

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 6.2.0
- **CSS:** Tailwind CSS 4.1.1
- **UI Library:** Ant Design 5.24.2
- **Routing:** React Router DOM 7.2.0
- **HTTP Client:** Axios 1.8.3
- **Animation:** Framer Motion 12.12.1
- **Charts:** Chart.js 4.4.9 + React-ChartJS-2

### Backend
- **Framework:** Spring Boot 3.4.10
- **Language:** Java 21
- **Security:** Spring Security 6.x + JWT (jjwt 0.12.3)
- **ORM:** Spring Data JPA + Hibernate
- **Database:** MariaDB 10.11
- **Migration:** Flyway
- **API Docs:** SpringDoc OpenAPI 2.8.0
- **Build Tool:** Gradle 8.x
- **Code Gen:** Lombok

### DevOps
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx (production frontend)

### Architecture
- **Pattern:** Modular Monolithic + Domain-Driven Design
- **Modules:** Identity, Catalog, Order, Inventory, Payment, Promotion

---

## 📖 Tài liệu bổ sung

Tham khảo thêm:
- [Backend Documentation](../backend/docs/) - Chi tiết về API, Database, Architecture
- [Frontend README](../frontend/README.md) - Hướng dẫn setup frontend
- [Backend README](../backend/README.md) - Hướng dẫn setup backend
- [Docker Compose](../docker-compose.yml) - Configuration deployment

---

## 👥 Thông tin liên hệ

**Nhóm:** 03 - DHKTPM18ATT  
**Dự án:** Watchify E-commerce System  
**Năm:** 2024

---

## 📌 Lưu ý quan trọng

1. **Phần thành viên:** Nhớ cập nhật thông tin thật của nhóm trong Chương 1
2. **Hình ảnh:** Chèn đủ screenshots để minh họa các chức năng
3. **Biểu đồ:** Kiểm tra tất cả Mermaid diagrams render đúng
4. **Tính nhất quán:** Đảm bảo thông tin giữa các chương không mâu thuẫn
5. **Văn phong:** Giữ văn phong học thuật, tránh ngôn ngữ quá casual

---

## ✨ Điểm mạnh của báo cáo này

- 📝 **Nội dung đầy đủ:** 5 chương với hơn 100 trang nội dung chi tiết
- 🎨 **Văn xuôi liền mạch:** Tối thiểu gạch đầu dòng, đọc như một câu chuyện
- 📊 **Nhiều biểu đồ:** 10+ diagrams minh họa kiến trúc và luồng xử lý
- 🔍 **Chi tiết kỹ thuật:** Giải thích sâu về implementation
- 🎯 **Thực tế:** Dựa trên code thực tế của dự án
- 🚀 **Có roadmap:** Hướng phát triển rõ ràng cho tương lai

---

**Chúc các bạn hoàn thành tốt đồ án! 🎓**