# CHƯƠNG 4: HIỆN THỰC ỨNG DỤNG

## 4.1. Mô tả quá trình xây dựng ứng dụng

Quá trình xây dựng ứng dụng Watchify được triển khai theo phương pháp Agile với các sprint ngắn, cho phép nhóm phát triển từng phần chức năng một cách có tổ chức và có thể demo được sau mỗi sprint. Giai đoạn đầu tiên tập trung vào việc thiết lập môi trường phát triển và khung sườn của ứng dụng. Nhóm đã cấu hình Docker và Docker Compose để đảm bảo tất cả thành viên đều có môi trường phát triển nhất quán, bao gồm MariaDB container cho database, backend container chạy Spring Boot, và frontend container chạy Vite development server. Việc containerization này không chỉ đơn giản hóa quá trình setup mà còn đảm bảo ứng dụng sẽ chạy giống nhau trên mọi môi trường.

Sau khi có môi trường phát triển ổn định, nhóm tiến hành xây dựng các module backend theo thứ tự ưu tiên nghiệp vụ. Module Identity được phát triển đầu tiên vì đây là nền tảng cho tất cả các chức năng khác, cung cấp authentication và authorization cho toàn bộ hệ thống. Việc triển khai Spring Security với JWT đòi hỏi sự hiểu biết sâu về security flow, từ việc hash password bằng BCrypt, generate và validate JWT tokens, cho đến việc implement custom filters và authentication providers. Sau khi Identity module hoạt động ổn định với các endpoints như register, login, refresh token, và logout, nhóm chuyển sang phát triển module Catalog.

Module Catalog là phức tạp nhất về số lượng entities và business logic do phải xử lý nhiều tính năng như quản lý sản phẩm, categories hierarchy, brands, product images, product details, reviews, và wishlists. Việc implement search và filter functionality đòi hỏi sử dụng JPA Specification API để build dynamic queries một cách type-safe. Nhóm đã dành nhiều thời gian để tối ưu hóa các queries này, đảm bảo rằng khi filter theo nhiều tiêu chí đồng thời, performance vẫn được duy trì ở mức chấp nhận được. Việc lazy loading các relationships và sử dụng DTO projection giúp giảm thiểu lượng dữ liệu được truyền tải qua network.

Module Order và Payment được phát triển tiếp theo với sự tích hợp chặt chẽ với các modules khác. Order processing workflow phức tạp đòi hỏi phải coordinate giữa nhiều services: validate cart, check inventory, apply coupon, calculate final amount, create order and order items, reserve inventory, và cuối cùng là process payment. Việc tích hợp MoMo payment gateway là một thách thức đáng kể do phải hiểu rõ về payment flow, webhook mechanism, signature verification, và error handling. Nhóm đã test kỹ lưỡng các scenarios như payment success, payment failure, timeout, và webhook retry để đảm bảo hệ thống xử lý đúng trong mọi trường hợp.

Module Inventory và Promotion được phát triển sau cùng nhưng không kém phần quan trọng. Inventory management phải đảm bảo tính consistency của số lượng hàng tồn kho, đặc biệt trong môi trường concurrent với nhiều orders được tạo đồng thời. Việc sử dụng database transactions với appropriate isolation level và optimistic locking giúp tránh race conditions. Promotion module với coupon system cũng cần careful design để track usage correctly và prevent abuse như việc sử dụng một coupon nhiều lần.

Về phía frontend, nhóm sử dụng component-driven development approach với React. Các reusable components như ProductCard, Button, Input, Modal được xây dựng đầu tiên và được sử dụng xuyên suốt ứng dụng, đảm bảo consistency trong UI. Việc quản lý state được thực hiện thông qua Context API cho global state như authentication state và cart state, trong khi local state được quản lý bằng useState và useEffect hooks. React Router được sử dụng để implement client-side routing với các protected routes chỉ accessible khi đã authenticated.

Tích hợp giữa frontend và backend được thực hiện thông qua Axios HTTP client với interceptors để tự động attach JWT token vào Authorization header và handle token refresh khi access token hết hạn. Error handling được implement consistently với try-catch blocks và user-friendly error messages được hiển thị thông qua Ant Design notification components. Loading states được hiển thị khi đang fetch data để cải thiện user experience.

Testing được thực hiện song song với development. Backend được test với JUnit và Spring Boot Test framework, covering unit tests cho services và integration tests cho controllers và repositories. Frontend được test manually do thời gian hạn chế, nhưng các critical flows như authentication, checkout, và payment đều được test kỹ lưỡng trên nhiều browsers và devices khác nhau.

## 4.2. Phân tích cách hiện thực Frontend

### 4.2.1. Cấu trúc thư mục và tổ chức code

Frontend của Watchify được tổ chức theo cấu trúc modular với các thư mục rõ ràng theo chức năng. Thư mục `src/components` chứa các reusable components được chia thành các sub-folders như `common` cho các components dùng chung như Header, Footer, Button, Input; `product` cho các components liên quan đến sản phẩm như ProductCard, ProductGrid, ProductFilter; và `cart` cho shopping cart components. Mỗi component được đặt trong folder riêng với file component chính và file styles nếu cần, theo pattern component-per-folder giúp dễ dàng locate và maintain.

Thư mục `src/pages` chứa các page components được chia thành `client` và `admin` subdirectories. Client pages bao gồm Home, Men (đồng hồ nam), Women (đồng hồ nữ), Couple (đồng hồ đôi), ProductDetail, Cart, Favorite (wishlist), Profile, History (order history), và Contact. Admin pages bao gồm Dashboard với Overview, ProductsManagement, OrdersManagement, UsersManagement, BrandsManagement, ReviewsManagement, và Analytics. Việc tách biệt rõ ràng giữa client và admin pages giúp code organization tốt hơn và có thể apply different layouts dễ dàng.

Thư mục `src/services` chứa các API service classes được tổ chức theo modules tương ứng với backend. File `authService.js` xử lý authentication-related API calls như login, register, logout. File `productService.js` chứa các functions để fetch products, search, filter, get product details. File `orderService.js` xử lý order creation, fetching order history. Mỗi service file exports các async functions sử dụng Axios để gọi backend APIs, với error handling và response transformation được xử lý tập trung.

Context API được sử dụng để quản lý global state thông qua `src/context` folder. `AuthContext.js` manage authentication state bao gồm user info, access token, và các methods như login, logout, checkAuth. `CartContext.js` quản lý shopping cart state với methods như addToCart, removeFromCart, updateQuantity, clearCart. Việc sử dụng Context giúp tránh prop drilling và cho phép bất kỳ component nào cũng có thể access và update global state một cách dễ dàng.

### 4.2.2. Triển khai giao diện với React và Tailwind CSS

Giao diện người dùng được xây dựng với sự kết hợp giữa React components và Tailwind CSS utility classes. Tailwind CSS được cấu hình trong `tailwind.config.js` với custom theme colors phù hợp với brand identity của Watchify, sử dụng các tông màu chủ đạo là đen, trắng, và vàng gold để tạo cảm giác sang trọng, cao cấp. Custom spacing, font sizes, và breakpoints cũng được define để đảm bảo consistency trong toàn bộ ứng dụng.

Responsive design được implement bằng cách sử dụng Tailwind's responsive modifiers như `sm:`, `md:`, `lg:`, `xl:` để apply different styles ở các breakpoints khác nhau. Ví dụ, product grid hiển thị 2 columns trên mobile (`grid-cols-2`), 3 columns trên tablet (`md:grid-cols-3`), và 4 columns trên desktop (`lg:grid-cols-4`). Navigation menu chuyển từ hamburger menu trên mobile sang horizontal menu trên desktop. Tất cả images đều responsive với proper aspect ratios và lazy loading để optimize performance.

Ant Design components được integrate để cung cấp các UI components phức tạp và đã được tối ưu về accessibility. Components như Table cho product management và order management trong admin panel, Form với validation cho các forms, Modal cho dialogs, Drawer cho filter panel, DatePicker cho date selection, và Pagination cho phân trang đều được sử dụng. Ant Design themes được customize để match với overall design system thông qua ConfigProvider component.

Animation và transitions được thêm vào để enhance user experience sử dụng Framer Motion library. Product cards có hover effects với subtle scale và shadow transitions. Page transitions được implement với fade-in animations. Loading skeletons được hiển thị khi đang fetch data thay vì blank screen. Scroll animations được add cho homepage sections để tạo engaging experience khi user scroll down.

### 4.2.3. Quản lý state và side effects

State management được implement ở nhiều levels khác nhau tùy theo scope của state. Component-local state được quản lý bằng `useState` hook cho các states như form input values, modal visibility, tab selections. Khi cần perform side effects như fetching data khi component mount hoặc khi dependencies thay đổi, `useEffect` hook được sử dụng với dependency array được define cẩn thận để tránh infinite loops.

Global state cho authentication được manage bởi AuthContext. Khi user login successfully, access token và refresh token được lưu vào localStorage, và user info được lưu vào AuthContext state. Tất cả protected routes check authentication state từ AuthContext và redirect đến login page nếu user chưa authenticated. Khi access token hết hạn, Axios interceptor tự động detect 401 response, gọi refresh token endpoint để lấy access token mới, và retry failed request automatically mà không cần user intervention.

Shopping cart state được manage bởi CartContext với local storage sync để persist cart data khi user refresh page hoặc close browser. Mỗi khi cart state thay đổi thông qua addToCart, removeFromCart, hoặc updateQuantity methods, state được update và đồng thời sync vào localStorage. Khi user login, cart từ localStorage được merge với cart từ backend để đảm bảo consistency across devices.

Form state management sử dụng controlled components pattern với form values được lưu trong component state và controlled bởi onChange handlers. Validation được thực hiện ở cả client-side và server-side. Client-side validation provide immediate feedback với error messages hiển thị ngay khi user blur khỏi input field. Server-side validation errors từ backend được extract từ response và hiển thị tương ứng với từng field.

## 4.3. Phân tích cách hiện thực Backend

### 4.3.1. Kiến trúc và tổ chức code

Backend code được tổ chức theo kiến trúc Modular Monolithic với package structure rõ ràng. Root package `fit.iuh.backend` chứa main application class `BackendApplication.java` với `@SpringBootApplication` annotation. Package `config` chứa các configuration classes như `SecurityConfig` cho Spring Security configuration, `JwtConfig` cho JWT settings, `CorsConfig` cho CORS configuration, và `OpenApiConfig` cho Swagger/OpenAPI documentation.

Package `sharedkernel` chứa các components được share across modules như base entities (`BaseEntity`, `BaseAuditEntity`), common exceptions (`ResourceNotFoundException`, `BusinessException`, `ValidationException`), và utility classes. Package `modules` chứa 6 business modules, mỗi module được tổ chức theo layered architecture với 4 layers chính.

Trong mỗi module, layer `api` chứa REST controllers với endpoints definition, request/response DTOs validation, và HTTP status codes handling. Layer `application` chứa service interfaces và implementations với business logic orchestration, transaction management, và interaction với other modules. Layer `domain` chứa domain entities với JPA annotations, repository interfaces extending JpaRepository, và domain events nếu có. Layer `infrastructure` chứa repository implementations nếu cần custom queries, external service integrations, và configuration specific cho module đó.

Ví dụ với Catalog module: `CatalogController` trong api layer expose các endpoints như GET `/api/products`, POST `/api/products`, GET `/api/products/{id}`. `ProductService` trong application layer chứa business logic như `createProduct()`, `updateProduct()`, `searchProducts()` với filtering và pagination. `Product`, `Category`, `Brand` entities trong domain layer define database schema với relationships. `ProductRepository` interface extend `JpaRepository<Product, UUID>` và `JpaSpecificationExecutor<Product>` để support dynamic queries.

### 4.3.2. Triển khai Spring Security và JWT Authentication

Spring Security configuration được define trong `SecurityConfig` class với `@EnableWebSecurity` annotation. Security filter chain được configure để permit all requests đến public endpoints như `/api/auth/login`, `/api/auth/register`, `/api/products/**` (GET requests), và Swagger UI endpoints. Tất cả admin endpoints như `/api/admin/**` require `ROLE_ADMIN`, trong khi user endpoints require `ROLE_USER`. CORS được enable với specific allowed origins, methods, và headers.

JWT authentication được implement thông qua custom filter `JwtAuthenticationFilter` extends `OncePerRequestFilter`. Filter này intercept mỗi request, extract JWT token từ Authorization header, validate token signature và expiration, parse claims để lấy user ID và roles, và set authentication vào SecurityContext. Nếu token invalid hoặc expired, filter throw appropriate exception được handle bởi authentication entry point.

`JwtTokenProvider` utility class chứa logic để generate và validate JWT tokens. Method `generateAccessToken()` tạo token với claims bao gồm user ID, email, roles, và expiration time (1 hour). Method `generateRefreshToken()` tạo random UUID string được lưu vào database với expiration time dài hơn (7 days). Method `validateToken()` verify token signature using secret key và check expiration. Method `getUserIdFromToken()` parse token claims để extract user ID.

Authentication flow hoạt động như sau: User submit credentials đến `/api/auth/login`, `AuthService` validate credentials bằng cách query database và compare password hash, nếu valid thì generate access token và refresh token, save refresh token vào database, và return both tokens. Client store tokens trong localStorage. Subsequent requests include access token trong Authorization header. Khi access token expired, client gọi `/api/auth/refresh` với refresh token để lấy access token mới. Khi logout, refresh token được mark as revoked trong database.

### 4.3.3. Xử lý API và validation

REST API được design theo RESTful principles với proper HTTP methods và status codes. GET requests cho reading data, POST cho creating, PUT/PATCH cho updating, DELETE cho deleting. Response status codes follow conventions: 200 OK cho successful requests, 201 Created cho successful creation, 204 No Content cho successful deletion, 400 Bad Request cho validation errors, 401 Unauthorized cho authentication failures, 403 Forbidden cho authorization failures, 404 Not Found cho resource not found, và 500 Internal Server Error cho unexpected errors.

Request validation được implement ở multiple levels. DTO classes sử dụng Jakarta Validation annotations như `@NotNull`, `@NotBlank`, `@Email`, `@Size(min, max)`, `@Min`, `@Max`, `@Pattern(regex)` để define validation rules. `@Valid` annotation trên controller method parameters trigger automatic validation. Khi validation fails, Spring automatically return 400 status với validation error details.

Custom validators được implement cho complex validation logic. Ví dụ, `UniqueEmailValidator` check email uniqueness trong database, `ProductSkuValidator` validate SKU format và uniqueness. Business validation được thực hiện trong service layer, throw custom exceptions như `InvalidOperationException` khi business rules violated. Exception handlers catch các exceptions này và return appropriate error responses với meaningful messages.

Response formatting được standardize với wrapper class `ApiResponse<T>` chứa `success` flag, `message`, `data`, và `errors` fields. Success responses have structure: `{success: true, data: {...}, message: "Success"}`. Error responses have structure: `{success: false, message: "Error message", errors: [...]}`. Pagination responses include metadata như `totalItems`, `totalPages`, `currentPage`, `pageSize`.

## 4.4. Mô tả chi tiết các chức năng chính đã hoàn thiện

### 4.4.1. Trang chủ (Home Page)

Trang chủ là điểm khởi đầu của trải nghiệm người dùng trên Watchify, được thiết kế để thu hút và dẫn dắt visitors khám phá các sản phẩm. Hero section ở đầu trang hiển thị banner lớn với hình ảnh đồng hồ cao cấp và call-to-action button "Khám phá ngay" dẫn đến trang sản phẩm. Banner sử dụng carousel component từ react-responsive-carousel để rotate giữa nhiều banners quảng bá các collections khác nhau.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Screenshot trang chủ với hero banner]**

Ngay phía dưới hero section là phần "Sản phẩm nổi bật" hiển thị 8 sản phẩm được đánh dấu featured trong database. Mỗi product card hiển thị hình ảnh chính, tên sản phẩm, giá hiện tại, giá gốc nếu có sale (với strikethrough styling), percentage discount badge, và average rating với số lượng reviews. Khi hover lên card, subtle animation scale up và shadow depth tăng để create interactive feel. Click vào card navigate đến product detail page.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Grid sản phẩm nổi bật với product cards]**

Section "Sản phẩm mới" hiển thị các sản phẩm mới nhất được thêm vào hệ thống, sorted by created_at descending. Section "Thương hiệu nổi tiếng" hiển thị grid các brand logos với hover effects, click vào logo filter products by brand đó. Footer chứa thông tin liên hệ, links đến các pages quan trọng, social media links, và newsletter subscription form.

### 4.4.2. Trang danh sách sản phẩm (Product Listing)

Trang danh sách sản phẩm cung cấp comprehensive interface để browse và filter products. Sidebar bên trái chứa filter panel với các options: Categories (checkboxes cho Đồng hồ nam, Đồng hồ nữ, Đồng hồ đôi), Brands (checkboxes cho các brands có trong database), Price range (dual-handle slider từ Ant Design để select min và max price), và Features (checkboxes cho các tính năng như Chống nước, Chronograph, Date display).

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Filter panel với các tùy chọn lọc]**

Main content area hiển thị toolbar với số lượng results found, sort dropdown (Mới nhất, Giá tăng dần, Giá giảm dần, Bán chạy), và view toggle giữa grid và list view. Product grid mặc định hiển thị 12 products per page với pagination controls ở bottom. Khi user thay đổi filters hoặc sort option, URL query parameters được update và new API call được triggered để fetch filtered results.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Product grid với sort và pagination]**

Search functionality được implement với search bar trong header. Khi user type và submit, navigate đến products page với keyword query parameter. Backend sử dụng JPA Specification để build query với WHERE clauses searching trong product name và description columns using LIKE operator. Results highlight matched keywords trong product names.

### 4.4.3. Trang chi tiết sản phẩm (Product Detail)

Product detail page được chia thành hai columns layout. Left column chứa image gallery với primary image hiển thị lớn và thumbnail images bên dưới. Click thumbnail thay đổi primary image. Images support zoom functionality với react-image-gallery library. Right column chứa product information bao gồm product name, SKU, price với discount badge nếu có, rating summary với stars và number of reviews, và stock availability status.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Product detail layout với image gallery và thông tin sản phẩm]**

Product description được hiển thị dưới dạng rich text với proper formatting. Technical specifications từ ProductDetail được hiển thị trong table format với rows cho Case diameter, Case thickness, Case material, Band material, Movement type, Water resistance, và Special features. Add to cart section bao gồm quantity selector (number input với increment/decrement buttons) và "Thêm vào giỏ hàng" button. Add to wishlist button (heart icon) toggle wishlist status.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Specifications table và add to cart section]**

Reviews section hiển thị rating distribution với bar chart showing percentage của mỗi star rating từ 5 đến 1. Individual reviews hiển thị user name, rating stars, review title, review comment, và review date. Nếu user đã mua sản phẩm và chưa review, "Viết đánh giá" button được hiển thị, click mở modal với form để submit rating và review text.

### 4.4.4. Giỏ hàng (Shopping Cart)

Shopping cart page hiển thị table of cart items với columns: Product image and name, Unit price, Quantity (với +/- controls), Subtotal, và Remove button. Quantity changes trigger API call để update cart item quantity trong backend và recalculate totals. Remove button show confirmation modal trước khi delete item.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Cart page với danh sách items]**

Right sidebar hiển thị order summary với Subtotal, Shipping (tính based on total hoặc flat rate), Discount nếu có coupon applied, và Grand Total. Coupon input field cho phép nhập coupon code, click "Áp dụng" validate coupon qua API và update discount amount. "Tiến hành thanh toán" button navigate đến checkout page.

Empty cart state hiển thị message "Giỏ hàng trống" với illustration và "Tiếp tục mua sắm" button navigate về products page. Cart icon trong header hiển thị badge với số lượng items, click dropdown hiển thị mini cart với first 3 items và "Xem giỏ hàng" link.

### 4.4.5. Quy trình thanh toán (Checkout)

Checkout page được chia thành multi-step process với progress indicator ở top showing current step. Step 1 là "Thông tin giao hàng" với form để nhập hoặc select shipping address từ saved addresses. Form fields include Full name, Phone number, Street address, Ward, District, City, và "Lưu địa chỉ" checkbox để save vào account.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Checkout form với shipping information]**

Step 2 là "Phương thức thanh toán" với radio buttons để chọn giữa COD (Cash on Delivery) và MoMo e-wallet. Khi chọn MoMo, brief description về MoMo payment process được hiển thị. Step 3 là "Xác nhận đơn hàng" với review của order details including items, shipping address, payment method, và totals.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Payment method selection]**

"Đặt hàng" button trigger checkout process. Loading spinner hiển thị during processing. Nếu chọn COD, success message hiển thị sau khi order created successfully với order number và estimated delivery date. Nếu chọn MoMo, user được redirect đến MoMo payment page, sau khi complete payment, redirect về success page hoặc failure page tùy result.

### 4.4.6. Lịch sử đơn hàng (Order History)

Order history page trong user profile section hiển thị table of all orders sorted by order date descending. Columns include Order number (clickable để xem detail), Order date, Total amount, Payment method, Status (với color-coded badges), và Actions (view details button).

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Order history table]**

Order detail modal hoặc page hiển thị comprehensive information: Order timeline with status progression (Pending → Confirmed → Processing → Shipping → Completed), Items ordered với images và quantities, Shipping address, Payment information, và Price breakdown. Status-specific actions hiển thị như "Hủy đơn hàng" button nếu status còn CONFIRMED, hoặc "Đánh giá sản phẩm" buttons nếu status là COMPLETED.

### 4.4.7. Danh sách yêu thích (Wishlist)

Wishlist page hiển thị grid of products mà user đã add to wishlist. Mỗi product card tương tự product listing page nhưng có "Remove from wishlist" button thay vì "Add to cart". "Move to cart" button cho phép quickly add product vào cart và remove khỏi wishlist trong một action.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Wishlist grid]**

Empty wishlist state hiển thị message và suggestion để browse products. Wishlist data được sync với backend để persist across devices. Heart icon trong header hiển thị count của wishlist items.

### 4.4.8. Quản lý tài khoản (Profile Management)

Profile page có tabbed interface với tabs: Thông tin cá nhân, Địa chỉ, Đổi mật khẩu, và Lịch sử đơn hàng. Thông tin cá nhân tab hiển thị form với fields: Email (disabled vì không cho edit), First name, Last name, Phone number, và "Cập nhật" button.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Profile form]**

Địa chỉ tab hiển thị list of saved addresses với options để Edit, Delete, hoặc Set as default. "Thêm địa chỉ mới" button mở modal với address form. Đổi mật khẩu tab có form với Current password, New password, Confirm new password fields và validation để ensure new password meets requirements và matches confirmation.

### 4.4.9. Admin Dashboard

Admin dashboard là command center cho quản trị viên với overview của key metrics. Top row hiển thị stat cards với Total revenue (current month), Total orders, Total products, và Total users, mỗi card có icon, number, và percentage change compared to previous period.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Dashboard overview với stat cards]**

Charts section hiển thị revenue chart (line chart showing daily revenue for current month using Chart.js), orders by status (pie chart), và top selling products (bar chart). Recent orders table hiển thị 5 most recent orders với quick actions. Sidebar navigation có links đến các management pages.

### 4.4.10. Quản lý sản phẩm (Products Management)

Products management page hiển thị table of all products với columns: Image thumbnail, Name, SKU, Category, Brand, Price, Stock, Status, và Actions (Edit, Delete buttons). Search bar filter products by name hoặc SKU. "Thêm sản phẩm mới" button navigate đến add product form.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Products management table]**

Add/Edit product form là multi-section form với: Basic Information (name, slug, SKU, description), Pricing (price, original price, discount percentage), Category và Brand selection, Images upload (multiple files với preview và reorder capability), và Technical Details (specifications). Form validation ensure required fields filled và proper data types. Submit button save product và redirect về products list.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Add product form]**

### 4.4.11. Quản lý đơn hàng (Orders Management)

Orders management page hiển thị comprehensive table với filters by status, date range, và payment method. Columns include Order ID, Customer name, Order date, Total amount, Payment method, Payment status, Order status, và Actions.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Orders management table]**

Click vào order row expand detail view hoặc open modal showing full order information. Status update dropdown cho phép admin change order status từ CONFIRMED → PROCESSING → SHIPPING → COMPLETED. Status change trigger notifications đến customer qua email. Export orders button allow download orders data as CSV or Excel file.

### 4.4.12. Quản lý người dùng (Users Management)

Users management page hiển thị table of all registered users với columns: Email, Name, Phone, Roles, Status, Registration date, và Actions. Admin có thể search users by email or name, filter by role or status.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Users management table]**

Actions include View details (showing user profile và order history), Edit (change roles hoặc status), và Lock/Unlock account. "Thêm admin" button cho phép promote user to admin role. Bulk actions allow select multiple users và apply actions like send email, export data.

### 4.4.13. Analytics và báo cáo (Analytics)

Analytics page cung cấp business intelligence với various charts và reports. Revenue analytics hiển thị revenue trends over time với options để view by day, week, month, or year. Sales analytics show top selling products, categories, và brands. Customer analytics include new vs returning customers, customer lifetime value distribution.

**[CHÈN HÌNH ẢNH MINH HỌA TẠI ĐÂY: Analytics dashboard với charts]**

Date range picker allow select custom periods for analysis. Export button generate PDF or Excel reports. Real-time dashboard update metrics automatically mỗi khi có new orders or data changes.

## 4.5. Kết luận chương

Chương Hiện thực Ứng dụng đã trình bày chi tiết quá trình xây dựng hệ thống Watchify từ backend đến frontend, từ cấu trúc code organization đến implementation của từng chức năng cụ thể. Việc áp dụng các best practices trong cả frontend và backend development như component-driven development, service layer pattern, repository pattern, và proper separation of concerns đã tạo ra một codebase clean, maintainable, và scalable.

Frontend được xây dựng với React và Tailwind CSS cung cấp user experience mượt mà với responsive design hoạt động tốt trên mọi devices. Backend với Spring Boot và Spring Security đảm bảo tính bảo mật cao và performance tốt với proper database indexing và query optimization. Việc tích hợp MoMo payment gateway mở rộng khả năng thanh toán cho customers.

Tất cả các chức năng chính từ authentication, product browsing, shopping cart, checkout, payment, order management, cho đến admin panel đều đã được implement đầy đủ và test kỹ lưỡng. Hệ thống đã sẵn sàng để deploy lên production environment và phục vụ real users. Những kinh nghiệm và bài học rút ra từ quá trình implementation sẽ là nền tảng quan trọng cho việc maintain và enhance hệ thống trong tương lai.