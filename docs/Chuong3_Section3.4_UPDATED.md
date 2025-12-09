## 3.4. Biểu đồ Class và quan hệ giữa các entities

Biểu đồ lớp (Class Diagram) là một trong những công cụ quan trọng nhất trong UML (Unified Modeling Language) để mô hình hóa cấu trúc tĩnh của hệ thống. Trong phần này, chúng tôi trình bày chi tiết các biểu đồ lớp của hệ thống Watchify, được tổ chức theo kiến trúc Modular Monolith với các module được phân chia rõ ràng theo nghiệp vụ. Mỗi module đại diện cho một bounded context trong Domain-Driven Design (DDD), đảm bảo tính cohesion cao và coupling thấp giữa các thành phần.

Hệ thống được thiết kế với 6 module chính: Identity (quản lý người dùng và xác thực), Catalog (quản lý sản phẩm), Inventory (quản lý tồn kho), Order (xử lý đơn hàng), Payment (xử lý thanh toán), và Promotion (quản lý khuyến mãi). Việc phân chia này không chỉ giúp code dễ bảo trì mà còn tạo nền tảng cho việc chuyển đổi sang kiến trúc microservices trong tương lai nếu cần thiết.

### 3.4.1. Class Diagram: Identity Module

Module Identity đóng vai trò nền tảng của toàn bộ hệ thống, chịu trách nhiệm quản lý danh tính người dùng, xác thực (authentication) và phân quyền (authorization). Đây là module được các module khác phụ thuộc vào nhiều nhất, do đó việc thiết kế chặt chẽ và bảo mật là vô cùng quan trọng.

> **[Hình 3.4.1: Class Diagram - Identity Module]**
> 
> *Chú thích: Biểu đồ lớp của Identity Module thể hiện các entities quản lý người dùng, vai trò, địa chỉ và token xác thực. Sử dụng file PlantUML: `docs/diagrams/identity-module.puml`*

Trong kiến trúc của module này, **User** được xác định là Aggregate Root theo nguyên tắc Domain-Driven Design. Entity User đại diện cho người dùng trong hệ thống với các thuộc tính cốt lõi bao gồm `id` (UUID), `email` (sử dụng làm username và phải unique), `password` (được mã hóa bằng BCrypt), `firstName`, `lastName`, `phone`, và `status` (kiểu UserStatus enum). Việc sử dụng UUID thay vì integer auto-increment cho primary key không chỉ đảm bảo tính duy nhất toàn cục mà còn tăng cường bảo mật bằng cách làm cho ID khó đoán và không thể suy luận thông tin từ giá trị số.

Trường `email` đóng vai trò kép: vừa là định danh duy nhất của người dùng, vừa là phương tiện liên lạc chính. Database constraint UNIQUE được áp dụng để đảm bảo không có hai tài khoản cùng email. Mật khẩu không bao giờ được lưu trữ dưới dạng plain text mà luôn được hash sử dụng thuật toán BCrypt với cost factor 10, đảm bảo ngay cả khi database bị compromise, attacker vẫn không thể dễ dàng reverse mật khẩu gốc.

Entity **UserStatus** là một enumeration định nghĩa các trạng thái mà một tài khoản người dùng có thể có: `ACTIVE` (đang hoạt động bình thường), `INACTIVE` (tạm ngừng hoạt động, có thể do user tự deactivate), `LOCKED` (bị khóa do vi phạm chính sách, chỉ admin có thể unlock), và `DELETED` (đã xóa, áp dụng soft delete để giữ lại dữ liệu lịch sử). Việc sử dụng soft delete thay vì hard delete là một best practice trong thiết kế hệ thống thương mại điện tử, cho phép audit trail và có thể restore tài khoản nếu cần.

Quan hệ giữa User và **Role** được thiết kế theo mô hình many-to-many, được implement thông qua bảng trung gian `user_roles`. Điều này cho phép một người dùng có thể có nhiều vai trò (ví dụ: vừa là CUSTOMER vừa là STAFF), và một vai trò có thể được gán cho nhiều người dùng. Trong implementation thực tế, mặc dù JPA hỗ trợ bidirectional many-to-many mapping, chúng tôi chỉ sử dụng unidirectional mapping từ User sang Role để giảm complexity và tránh circular dependencies. Cụ thể, User entity có một `Set<Role> roles` được map bằng `@ManyToMany` annotation với `@JoinTable`, nhưng Role entity không có reference ngược lại về User. Việc này được thực hiện thông qua việc lưu trữ foreign key `userId` trong các entity khác thay vì navigation properties.

Entity **Role** đại diện cho các vai trò trong hệ thống với thuộc tính `name` (ví dụ: "ROLE_ADMIN", "ROLE_CUSTOMER", "ROLE_STAFF") và `description` mô tả chi tiết quyền hạn. Prefix "ROLE_" là convention của Spring Security framework, giúp phân biệt roles với authorities. Hệ thống áp dụng Role-Based Access Control (RBAC), cho phép dễ dàng thêm roles mới hoặc modify permissions của role hiện tại thông qua configuration, không cần thay đổi code.

Entity **Address** quản lý thông tin địa chỉ giao hàng của người dùng. Một người dùng có thể có nhiều địa chỉ (quan hệ one-to-many), tương ứng với các địa chỉ khác nhau như nhà riêng, văn phòng, nhà người thân. Mỗi Address bao gồm các thuộc tính `fullName` (người nhận), `phone` (số điện thoại liên lạc), `street` (số nhà, tên đường), `ward` (phường/xã), `district` (quận/huyện), `city` (tỉnh/thành phố), `country` (quốc gia, mặc định là Việt Nam), `type` (kiểu địa chỉ từ enum AddressType), và `isDefault` (đánh dấu địa chỉ mặc định).

Enum **AddressType** định nghĩa các loại địa chỉ: `HOME` (nhà riêng), `OFFICE` (văn phòng), và `OTHER` (khác). Việc phân loại này giúp người dùng dễ dàng quản lý và lựa chọn địa chỉ phù hợp khi checkout. Trong implementation, chỉ có một address được đánh dấu `isDefault = true` cho mỗi user. Khi user tạo address mới và set làm default, hệ thống tự động unset flag default của các addresses khác, đảm bảo data integrity.

Một điểm thiết kế quan trọng là Address được lưu trữ với foreign key `userId` thay vì navigation property ngược lại từ User. Điều này có nghĩa là User entity không có collection `Set<Address>`, mà khi cần lấy danh sách addresses của một user, service layer sẽ query AddressRepository với điều kiện `userId`. Pattern này giúp tránh lazy loading issues và N+1 query problems thường gặp với JPA.

Entity **RefreshToken** quản lý các JWT refresh tokens được issue cho user. Khi user đăng nhập thành công, hệ thống sinh ra một cặp access token (short-lived, 15 phút) và refresh token (long-lived, 7 ngày). Refresh token được lưu vào database với các thuộc tính: `userId` (liên kết với user), `token` (chuỗi unique), `expiryDate` (thời gian hết hạn), và `revoked` (flag đánh dấu token đã bị thu hồi).

Việc lưu refresh tokens vào database phục vụ hai mục đích: (1) cho phép revoke tokens khi cần (ví dụ: user logout, admin revoke, phát hiện security breach), và (2) cho phép user có nhiều sessions đồng thời từ các devices khác nhau. Mỗi device/browser sẽ có một refresh token riêng, khi user logout trên một device chỉ refresh token của device đó bị revoke, các sessions khác vẫn active. Method `isValid()` kiểm tra cả `expiryDate` và `revoked` flag để đảm bảo token vẫn còn hiệu lực.

Về mặt bảo mật, refresh tokens được generate bằng secure random generator và có độ dài đủ để chống brute force. Trong database, cột `token` có unique constraint để tránh collision. Một background job sẽ định kỳ (hàng ngày) clean up các refresh tokens đã expired để tránh database bloat.

Implementation thực tế của module Identity tuân thủ các nguyên tắc bảo mật quan trọng: (1) Password hashing với BCrypt, (2) Email verification cho new accounts, (3) Rate limiting cho login attempts để chống brute force, (4) Account lockout sau nhiều lần đăng nhập thất bại, (5) Secure password reset flow với time-limited tokens, và (6) Session management với refresh token rotation. Tất cả các operations sensitive đều được audit log để traceability.

### 3.4.2. Class Diagram: Catalog Module

Module Catalog là trung tâm của nghiệp vụ thương mại điện tử, quản lý toàn bộ thông tin về sản phẩm, danh mục, thương hiệu, hình ảnh, đánh giá và wishlist. Đây là module có độ phức tạp cao nhất về số lượng entities và relationships do phải đáp ứng nhiều yêu cầu nghiệp vụ đa dạng.

> **[Hình 3.4.2: Class Diagram - Catalog Module]**
> 
> *Chú thích: Biểu đồ lớp của Catalog Module và Inventory Module thể hiện các entities quản lý sản phẩm, danh mục, thương hiệu, giỏ hàng và tồn kho. Sử dụng file PlantUML: `docs/diagrams/catalog-module.puml`*

Entity **Product** đóng vai trò Aggregate Root của module Catalog, đại diện cho một sản phẩm đồng hồ trong hệ thống. Mỗi Product có các thuộc tính quan trọng sau: `id` (UUID primary key), `name` (tên sản phẩm), `slug` (URL-friendly identifier, unique), `sku` (Stock Keeping Unit - mã định danh nghiệp vụ, unique), `description` (mô tả chi tiết dạng HTML/Markdown), `shortDescription` (mô tả ngắn gọn hiển thị ở listing pages), `price` (giá hiện tại), `originalPrice` (giá gốc trước khi giảm), `discountPercentage` (phần trăm giảm giá, được tính tự động từ price và originalPrice), `status` (trạng thái từ enum ProductStatus), `categoryId` (foreign key đến Category), `brandId` (foreign key đến Brand), `viewCount` (số lượt xem, kiểu Long), `isFeatured` (flag sản phẩm nổi bật), `isNew` (flag sản phẩm mới), và `displayOrder` (thứ tự hiển thị thủ công).

Một điểm thiết kế quan trọng cần nhấn mạnh là Product entity **không sử dụng navigation properties** mà chỉ lưu foreign keys (`categoryId`, `brandId`). Điều này khác với pattern truyền thống của JPA/Hibernate thường khuyến khích dùng `@ManyToOne Category category`. Lý do cho quyết định này: (1) Tránh lazy loading exceptions khi serialize entities sang JSON, (2) Giảm thiểu N+1 query problems, (3) Rõ ràng về data loading strategy - service layer phải explicitly join khi cần, (4) Dễ dàng chuyển sang microservices architecture sau này vì không có tight coupling giữa entities.

Trường `slug` được generate từ `name` thông qua một slugify function (ví dụ: "Rolex Submariner Date 41mm" → "rolex-submariner-date-41mm") và phải unique trong database. Slug được sử dụng trong URLs để SEO-friendly (ví dụ: `/products/rolex-submariner-date-41mm` thay vì `/products/uuid`), giúp tăng khả năng tìm kiếm trên search engines. Khi user thay đổi tên sản phẩm, slug cũ vẫn được giữ để tránh broken links, hoặc implement 301 redirects.

Trường `sku` (Stock Keeping Unit) là mã định danh nghiệp vụ do business team quy định, thường follow một convention (ví dụ: "ROL-SUB-41-BLK-001" cho Rolex Submariner 41mm màu đen). SKU phải unique và thường được sử dụng trong inventory management, barcode scanning, và integration với các hệ thống bên ngoài như ERP.

Giá sản phẩm được lưu dưới dạng `BigDecimal` thay vì `float` hoặc `double` để đảm bảo precision tuyệt đối trong các phép tính tiền tệ. Đây là best practice trong financial applications để tránh rounding errors (ví dụ: 0.1 + 0.2 = 0.30000000000000004 với float). Column definition trong database là `DECIMAL(15,2)`, cho phép giá trị lên đến 999,999,999,999.99 VNĐ, đủ cho hầu hết các trường hợp.

Method `isOnSale()` kiểm tra xem sản phẩm có đang sale hay không bằng cách so sánh `originalPrice` với `price`. Nếu `originalPrice` lớn hơn `price`, sản phẩm đang được giảm giá và UI sẽ hiển thị cả hai giá với `originalPrice` bị gạch ngang. Method `getDiscountAmount()` tính số tiền được giảm, còn `discountPercentage` được lưu trữ để tránh tính toán lại nhiều lần.

Trường `viewCount` (kiểu Long) track số lượt người dùng xem trang chi tiết sản phẩm. Mỗi khi có request đến `/products/:slug`, method `incrementViewCount()` được gọi để tăng counter. View count được sử dụng để xác định sản phẩm hot/trending và làm input cho recommendation algorithms. Implementation sử dụng optimistic locking hoặc database-level increment để handle concurrent increments.

Flags `isFeatured` và `isNew` được sử dụng cho marketing purposes. Featured products được hiển thị ở homepage hoặc special sections. New products (sản phẩm mới về) được đánh dấu với badge "NEW" và có thể được filter riêng. Trường `displayOrder` cho phép admin thủ công sắp xếp thứ tự hiển thị sản phẩm trong các listing pages, override default sorting (theo viewCount, price, created date, etc.).

Entity **Category** đại diện cho danh mục sản phẩm với cấu trúc phân cấp (hierarchical tree). Thuộc tính chính bao gồm: `id`, `name`, `slug`, `description`, `parentId` (self-referencing foreign key), `displayOrder`, và `isActive`. Category được thiết kế theo pattern self-referencing để hỗ trợ unlimited levels of nesting (ví dụ: "Đồng hồ" → "Đồng hồ nam" → "Đồng hồ thể thao nam" → "Đồng hồ chạy bộ").

Quan hệ parent-child được implement thông qua trường `parentId`. Root categories có `parentId = null`. Method `isRootCategory()` return true nếu `parentId` là null. Khi cần lấy toàn bộ category tree, service layer sẽ load tất cả categories và build tree structure trong memory (hoặc sử dụng recursive CTE queries nếu database hỗ trợ). Điều quan trọng là Category entity **không có** navigation properties `Category parent` hay `Set<Category> children` để tránh complexity và circular dependencies.

Trường `isActive` cho phép admin tạm ẩn một category mà không cần xóa. Khi category bị inactive, tất cả products thuộc category đó cũng không hiển thị ở frontend (được filter trong query). Điều này hữu ích khi cần tạm ngừng kinh doanh một ngành hàng nhưng vẫn giữ data để có thể reactivate sau.

Entity **Brand** đại diện cho thương hiệu/nhà sản xuất đồng hồ như Rolex, Omega, Casio, Seiko. Attributes bao gồm: `id`, `name`, `slug`, `description`, `logoUrl` (URL đến logo image), `websiteUrl` (official website), `displayOrder`, và `isActive`. Tương tự Category, Brand cũng không có collection `Set<Product> products` mà chỉ được reference qua `productId`.

Logo URL thường trỏ đến cloud storage (AWS S3, Cloudinary) nơi lưu trữ các logo images. Description có thể chứa brand story, history, warranty policies, được hiển thị ở brand pages. Website URL link đến official website của brand, useful cho customers muốn tìm hiểu thêm.

Entity **ProductImage** quản lý các hình ảnh của sản phẩm. Mỗi product có thể có nhiều images (product carousel). Attributes gồm: `id`, `productId` (foreign key), `imageUrl` (URL đến cloud storage), `altText` (text mô tả cho SEO và accessibility), `displayOrder` (thứ tự hiển thị trong carousel), và `isPrimary` (flag đánh dấu ảnh chính).

Chỉ có một image có `isPrimary = true` cho mỗi product, được hiển thị làm thumbnail ở listing pages. Các images khác hiển thị trong carousel ở product detail page, được sắp xếp theo `displayOrder` ascending. Image URLs trỏ đến CDN để optimize loading speed. Khi upload ảnh, server sẽ resize và optimize images ở multiple sizes (thumbnail, medium, large) và lưu tất cả variants.

Entity **ProductDetail** lưu thông tin kỹ thuật chi tiết đặc thù của đồng hồ. Đây là one-to-one relationship với Product. Attributes bao gồm: `id`, `productId`, `caseDiameter` (đường kính vỏ, VD: "41mm"), `caseThickness` (độ dày vỏ, VD: "12.5mm"), `caseMaterial` (chất liệu vỏ, VD: "Stainless Steel 904L"), `bandMaterial` (chất liệu dây, VD: "Leather"), `movementType` (loại máy, VD: "Automatic", "Quartz"), `waterResistance` (độ chống nước, VD: "100m"), và `features` (các tính năng đặc biệt, dạng text hoặc JSON).

Việc tách ProductDetail ra entity riêng thay vì embed trong Product có nhiều lợi ích: (1) Product entity không quá lớn, (2) Cho phép lazy loading detail chỉ khi cần (ở product detail page), (3) Dễ dàng thêm/sửa technical fields mà không ảnh hưởng Product schema, (4) Có thể nullable - không phải product nào cũng có đủ technical specs.

Entity **Review** cho phép customers đánh giá và review sản phẩm đã mua. Attributes: `id`, `productId`, `userId`, `rating` (1-5 sao), `title` (tiêu đề review), `comment` (nội dung review), `createdAt`, và `updatedAt`. Mỗi review belongs to một product và một user.

Business rules: User chỉ có thể review sản phẩm đã mua (verified purchase). Một user chỉ có thể review một product một lần, nhưng có thể edit review của mình. Reviews được moderate bởi admin trước khi publish (optional, có thể config). Average rating của product được tính từ tất cả reviews và cached để performance (denormalization).

Method `isPositive()` return true nếu rating >= 4, được sử dụng để tính tỷ lệ positive reviews. Reviews có thể được filter theo rating, sort theo helpful votes (nếu implement voting feature), hoặc verified purchase. Việc có review system tốt giúp tăng trust và conversion rate.

Entity **Wishlist** là join table đơn giản giữa User và Product, cho phép users lưu sản phẩm yêu thích. Attributes: `id`, `userId`, `productId`, và `addedAt`. User có thể add/remove products vào wishlist bất kỳ lúc nào. Wishlist được sync giữa devices nếu user đã login.

Dữ liệu wishlist có thể được sử dụng cho recommendation system (products frequently wishlisted together), email marketing (notify khi wishlist items có sale), và analytics (understand customer preferences). Frontend hiển thị wishlist icon ở product cards, click để toggle add/remove.

Entity **Cart** và **CartItem** quản lý giỏ hàng tạm thời trước khi checkout. Cart có quan hệ one-to-one với User (mỗi user một cart). CartItem là items trong cart với attributes: `id`, `cartId`, `productId`, `quantity`, `addedAt`, và `updatedAt`.

Methods của Cart entity: `getTotalAmount()` tính tổng tiền tất cả items, `getTotalItems()` đếm số lượng items, `isEmpty()` check cart rỗng. CartItem có methods: `getSubtotal()` tính tiền cho item đó (price × quantity), `updateQuantity()` cập nhật số lượng, `incrementQuantity()` và `decrementQuantity()` để tăng/giảm.

Business logic: Khi user add sản phẩm vào cart, nếu product đã tồn tại thì chỉ tăng quantity, không tạo CartItem mới. Khi user chưa login, cart được lưu ở browser (localStorage/cookies), sau khi login thì merge với server cart. Cart có expiration (ví dụ: 30 ngày), sau đó auto cleanup để tránh database bloat. Sau khi order successfully created, cart được clear.

Enum **ProductStatus** định nghĩa trạng thái sản phẩm: `ACTIVE` (đang bán), `OUT_OF_STOCK` (hết hàng), và `DISCONTINUED` (ngừng kinh doanh). Active products hiển thị bình thường. Out of stock products vẫn hiển thị nhưng không cho đặt hàng, có thể đăng ký notify khi về hàng. Discontinued products bị ẩn hoặc hiển thị với label "Not Available".

### 3.4.3. Class Diagram: Inventory Module

Module Inventory là một module quan trọng nhưng thường bị bỏ qua trong các thiết kế ban đầu. Module này được tách riêng khỏi Catalog để quản lý số lượng tồn kho và các operations liên quan đến inventory, đảm bảo nguyên tắc Single Responsibility và chuẩn bị cho việc scale sau này. Inventory Module không chỉ track số lượng sản phẩm mà còn maintain một audit trail hoàn chỉnh về mọi thay đổi inventory thông qua InventoryTransaction entity.

> **[Hình 3.4.3: Class Diagram - Inventory Module]**
> 
> *Chú thích: Biểu đồ lớp Inventory Module thể hiện quản lý tồn kho và lịch sử giao dịch. Sử dụng file PlantUML: `docs/diagrams/inventory-module.puml`*

Entity **Inventory** là Aggregate Root của module, có quan hệ one-to-one với Product thông qua `productId` (unique foreign key). Mỗi product trong hệ thống có đúng một inventory record tương ứng. Attributes chính bao gồm: `id` (UUID primary key), `productId` (unique foreign key đến Product), `quantity` (tổng số lượng thực tế trong kho), `reservedQuantity` (số lượng đã được đặt trước cho pending orders), `location` (vị trí trong kho, hỗ trợ multi-warehouse, optional), `createdAt`, và `updatedAt`.

Trường `quantity` đại diện cho tổng số lượng vật lý thực tế của sản phẩm trong kho tại thời điểm hiện tại. Đây là con số "hard" - số sản phẩm mà nhân viên kho có thể đếm được. Trường `reservedQuantity` là số lượng đã được reserve (đặt trước) cho các orders đang ở trạng thái pending payment hoặc confirmed nhưng chưa shipping. Đây là "soft reservation" - sản phẩm vẫn còn trong kho nhưng đã được "khóa" cho một order cụ thể.

Công thức quan trọng nhất trong inventory management: **Available Quantity = quantity - reservedQuantity**. Available quantity là số lượng thực sự có thể bán cho customers mới. Method `getAvailableQuantity()` implement công thức này. Việc tách biệt `quantity` và `reservedQuantity` là critical để tránh overselling - một trong những vấn đề nghiêm trọng nhất trong e-commerce. Khi user tạo order, system không giảm `quantity` ngay (vì sản phẩm vẫn trong kho) mà chỉ tăng `reservedQuantity`, đảm bảo sản phẩm không bị bán cho customer khác trong khi order đầu tiên đang pending payment.

Method `isInStock()` return true nếu available quantity > 0, được sử dụng để hiển thị "In Stock" / "Out of Stock" status trên product pages. Method `canReserve(qty)` check xem có đủ available quantity để reserve cho một order mới hay không, thường được gọi trước khi actually reserve để validate.

**Critical Business Methods** của Inventory entity:

**1. `reserve(Integer quantity)`**: Method này được gọi khi user tạo order (sau khi click "Place Order"). Logic: Đầu tiên check `canReserve(quantity)` - nếu `getAvailableQuantity() < quantity`, throw `OutOfStockException`. Nếu đủ hàng, tăng `reservedQuantity += quantity`. Operation này phải atomic - được wrap trong database transaction để handle concurrent orders. Nếu có nhiều users cùng lúc order cùng một product với số lượng gần hết, chỉ transactions nào acquire lock thành công và pass availability check mới được reserve, các transactions khác sẽ nhận OutOfStockException.

**2. `release(Integer quantity)`**: Method này được gọi khi order bị cancel (do user cancel, payment timeout, hoặc payment failed). Logic: Giảm `reservedQuantity -= quantity`, effectively "giải phóng" stock về available pool. Validation: `quantity` to release không được lớn hơn `reservedQuantity` hiện tại. Operation này cũng phải atomic để maintain data consistency.

**3. `confirmReservation(Integer quantity)`**: Method này được gọi khi order được confirmed - thường là sau khi payment thành công hoặc COD order được admin confirm. Logic: Giảm cả `quantity -= quantity` và `reservedQuantity -= quantity`. Đây là thời điểm sản phẩm thực sự "rời khỏi kho" về mặt accounting. Before: quantity=100, reserved=5, available=95. After confirmReservation(5): quantity=95, reserved=0, available=95. Validation: quantity to confirm không được lớn hơn `reservedQuantity`.

**4. `addQuantity(Integer quantity)`**: Method này được gọi khi nhập hàng từ supplier hoặc nhận hàng return từ customer. Logic: Tăng `quantity += quantity`. Đây là operation đơn giản nhất nhưng vẫn cần validation (quantity > 0) và transaction để consistency.

**5. `reduceQuantity(Integer quantity)`**: Method này được gọi khi xuất hàng không qua order flow (ví dụ: sản phẩm hư hỏng, mất mát, inventory adjustment). Logic: Giảm `quantity -= quantity`. Validation: quantity after reduction không được âm.

**Workflow Điển Hình - Customer Order Scenario:**

Initial state: quantity = 100, reservedQuantity = 0, availableQuantity = 100.

Step 1: User creates order cho 5 sản phẩm → System calls `inventory.reserve(5)` → reservedQuantity becomes 5 → State: quantity = 100, reserved = 5, available = 95. Tại thời điểm này, 5 sản phẩm vẫn trong kho nhưng đã "locked" cho order này.

Step 2a (Payment Success): User thanh toán thành công → System calls `inventory.confirmReservation(5)` → State: quantity = 95, reserved = 0, available = 95. Sản phẩm đã officially rời kho.

Step 2b (Order Cancel): User cancel order hoặc payment failed → System calls `inventory.release(5)` → State: quantity = 100, reserved = 0, available = 100. Stock được giải phóng, có thể bán cho customer khác.

**Concurrency Control và Race Conditions:**

Inventory operations là một trong những operations dễ gặp race conditions nhất trong e-commerce systems. Scenario: Product A có available quantity = 1. User X và User Y cùng lúc click "Add to Cart" và checkout. Nếu không có proper locking:
- Transaction X đọc available = 1, check pass
- Transaction Y đọc available = 1, check pass (race condition!)
- Cả hai transactions đều reserve → overselling

Implementation sử dụng một trong hai strategies:

**Strategy 1 - Optimistic Locking**: Thêm `@Version` annotation vào Inventory entity. JPA tự động thêm version column. Mỗi update check version number. Nếu version đã thay đổi (do concurrent update), throw `OptimisticLockException`, application phải retry. Phù hợp cho low-to-medium contention scenarios.

**Strategy 2 - Pessimistic Locking**: Sử dụng database row-level locks (`SELECT ... FOR UPDATE`). Transaction acquire exclusive lock trên inventory row, blocking các transactions khác cho đến khi commit. Phù hợp cho high contention scenarios (flash sales, limited stock items). Trade-off: reduced concurrency, potential deadlocks.

Trong implementation thực tế của Watchify, chúng tôi sử dụng Optimistic Locking cho general cases và Pessimistic Locking cho special cases (flash sales, products với stock < 10).

**Product Status Synchronization:**

Inventory state cần được sync với Product status. Business rules:
- Nếu `getAvailableQuantity() <= 0`: Update `Product.status = OUT_OF_STOCK`
- Nếu `getAvailableQuantity() > 0` và Product đang OUT_OF_STOCK: Update `Product.status = ACTIVE`

Sync có thể implement bằng:
1. Trigger trong database (automatic)
2. Domain events (Inventory publishes `InventoryChangedEvent`, Product service subscribes và update status)
3. Scheduled job check và sync periodically (eventual consistency)

Watchify sử dụng approach 2 (domain events) để maintain loose coupling giữa Inventory và Catalog modules.

**Multi-Warehouse Support:**

Trường `location` hỗ trợ multi-warehouse scenarios. Trong simple setup, location có thể là null (default warehouse). Trong advanced setup, mỗi warehouse có inventory records riêng cho cùng một product. Ví dụ:
- Product "Rolex Submariner" - Warehouse "Hanoi": quantity=10, reserved=2
- Product "Rolex Submariner" - Warehouse "HCMC": quantity=15, reserved=5

Khi user order, system có thể:
1. Auto-select warehouse gần địa chỉ giao hàng nhất (optimize shipping time/cost)
2. Select warehouse có available stock cao nhất
3. Allow user chọn pickup location
4. Implement intelligent routing based on business rules

Multi-warehouse cũng support stock transfer operations: move stock từ warehouse A sang warehouse B.

Entity **InventoryTransaction** là audit trail entity, recording mọi thay đổi inventory. Đây là append-only entity (insert only, never update or delete). Attributes: `id`, `inventoryId` (foreign key), `type` (TransactionType enum), `quantity` (số lượng thay đổi, có thể âm hoặc dương), `quantityBefore` (snapshot trước khi thay đổi), `quantityAfter` (snapshot sau khi thay đổi), `reference` (reference đến document gây ra thay đổi, ví dụ: orderId, purchaseOrderId), `notes` (ghi chú chi tiết), `performedBy` (user thực hiện, có thể là system hoặc admin username), và `createdAt`.

Mỗi khi một trong các methods (reserve, release, confirm, add, reduce) được gọi, một InventoryTransaction record được tạo. Điều này tạo ra complete audit trail cho inventory movements, essential cho:

1. **Reconciliation**: So sánh physical count với system count, identify discrepancies
2. **Audit Compliance**: Financial audits require complete transaction history
3. **Analytics**: Analyze inventory turnover, identify slow-moving items, forecast demand
4. **Debugging**: Trace lại tại sao inventory number không đúng, ai đã thay đổi, khi nào
5. **Fraud Detection**: Detect unauthorized inventory adjustments

Enum **TransactionType** định nghĩa các loại transactions:

**Increment Operations** (tăng quantity):
- `INITIAL_STOCK`: Stock ban đầu khi thêm product mới vào hệ thống
- `PURCHASE`: Nhập hàng từ supplier (receiving goods)
- `RETURN`: Customer return items, stock về kho
- `RELEASED`: Reserved stock được release do order cancel
- `ADJUSTMENT`: Manual adjustment tăng (admin correction)

**Decrement Operations** (giảm quantity hoặc tăng reserved):
- `SALE`: Confirmed sale (order completed)
- `DAMAGED`: Sản phẩm hư hỏng, không thể bán
- `ADJUSTMENT`: Manual adjustment giảm
- `RESERVED`: Stock được reserve cho pending order

**Special Operations** (affect cả quantity và reserved):
- `CONFIRMED`: Reserved stock → Confirmed sale (giảm cả quantity và reserved)

Method `isAddition()` return true cho INITIAL_STOCK, PURCHASE, RETURN, RELEASED. Method `isDeduction()` return true cho SALE, DAMAGED, CONFIRMED (partially).

**Example Transaction History** cho một product:

```
DateTime         Type            Qty   Before  After   Ref              PerformedBy
2024-01-01 09:00 INITIAL_STOCK   100   0       100     PO-001           admin
2024-01-02 14:30 RESERVED        -5    100     100     ORDER-123        system
                                      (reserved: 0→5)
2024-01-02 14:45 CONFIRMED       -5    100     95      ORDER-123        system
                                      (reserved: 5→0)
2024-01-03 10:00 RESERVED        -3    95      95      ORDER-124        system
2024-01-03 10:30 RELEASED        +3    95      95      ORDER-124        system
                                      (order cancelled)
2024-01-05 16:00 PURCHASE        50    95      145     PO-002           admin
2024-01-06 11:00 DAMAGED         -2    145     143     ADJ-001          warehouse_staff
```

Report query ví dụ: "Tổng số lượng sold trong tháng 1" → `SELECT SUM(quantity) FROM inventory_transactions WHERE type = 'CONFIRMED' AND createdAt BETWEEN '2024-01-01' AND '2024-01-31'`.

**Integration với Other Modules:**

Inventory Module interact với:

1. **Catalog Module**: Reference Product via productId. Khi Product được tạo, Inventory record cũng được tạo (initial stock = 0). Khi Product bị discontinued, không delete Inventory (soft delete via Product.status).

2. **Order Module**: OrderService calls InventoryService methods:
   - On order creation: `reserve(productId, quantity)`
   - On payment success: `confirmReservation(productId, quantity)`
   - On order cancel: `release(productId, quantity)`
   
3. **Admin Module**: Admin có thể:
   - View inventory levels
   - Manual adjustments (add/reduce)
   - View transaction history
   - Generate inventory reports
   - Set low stock alerts

4. **Notification Module**: Khi available quantity < threshold (ví dụ: 5), trigger low stock alert email đến admin.

**Future Enhancements:**

Module được thiết kế extensible cho các features tương lai:
- **Automatic Reorder Points**: Khi stock < minimum level, auto-generate purchase order
- **Stock Transfer**: Move stock between warehouses
- **Batch Operations**: Bulk import/update inventory
- **Barcode Integration**: Scan barcodes để update inventory
- **Real-time Dashboard**: Live inventory monitoring
- **Forecast Demand**: ML-based prediction cho inventory planning
- **Consignment Inventory**: Track items owned by suppliers nhưng lưu trong warehouse của shop

Việc tách Inventory thành module riêng với proper domain modeling, audit trail, và concurrency control mang lại lợi ích lớn: (1) Catalog module focus vào product information, Inventory focus vào quantity management, (2) Có thể scale Inventory module independently nếu cần handle high concurrency, (3) Dễ dàng implement advanced features, (4) Clear separation of concerns theo DDD principles, (5) Complete audit trail cho compliance và analytics, (6) Prevent overselling - critical cho business reputation.

### 3.4.4. Class Diagram: Order and Payment Modules

Module Order và Payment là hai module làm việc chặt chẽ với nhau để xử lý quy trình đặt hàng và thanh toán. Order module quản lý lifecycle của đơn hàng từ lúc tạo đến khi hoàn thành, trong khi Payment module xử lý các giao dịch thanh toán qua nhiều payment gateways khác nhau.

> **[Hình 3.4.4: Class Diagram - Order and Payment Modules]**
> 
> *Chú thích: Biểu đồ lớp của Order và Payment Modules thể hiện các entities quản lý đơn hàng, thanh toán và shopping cart. Sử dụng file PlantUML: `docs/diagrams/order-payment-modules.puml`*

Entity **Order** là Aggregate Root của Order module, đại diện cho một đơn hàng trong hệ thống. Attributes chính: `id`, `userId` (foreign key), `totalAmount` (tổng tiền sản phẩm), `couponId` (foreign key đến Coupon, nullable), `couponCode` (snapshot của coupon code), `discountAmount` (số tiền giảm giá), `finalAmount` (số tiền cuối cùng phải trả), `status` (từ enum OrderStatus), `paymentMethod` (từ enum PaymentMethod), `shippingAddress` (địa chỉ giao hàng dạng text), `billingAddress` (địa chỉ thanh toán dạng text), `notes` (ghi chú từ khách hàng), `orderDate`, `createdAt`, và `updatedAt`.

Calculation: `finalAmount = totalAmount - discountAmount`. Total amount được tính từ tổng các OrderItems. Discount amount được apply từ Coupon nếu có. Tất cả amounts đều là BigDecimal để precision.

Một thiết kế quan trọng: `shippingAddress` và `billingAddress` được lưu dưới dạng **text snapshot** (có thể là JSON string) thay vì foreign key đến Address entity. Lý do: Address của user có thể thay đổi sau khi đặt hàng, nhưng thông tin địa chỉ trong order history phải immutable, reflect đúng địa chỉ tại thời điểm đặt hàng. Snapshot pattern này đảm bảo data integrity và audit trail chính xác.

Tương tự, `couponCode` là snapshot của code tại thời điểm áp dụng. Nếu chỉ lưu `couponId`, khi coupon bị delete hoặc modify, không thể trace lại chính xác coupon nào đã được sử dụng. Field `notes` cho phép khách hàng để lại ghi chú cho shop (ví dụ: "Giao hàng buổi sáng", "Gọi trước khi giao").

Entity **OrderItem** represents items trong một order. Attributes: `id`, `orderId`, `productId` (foreign key để reference product, nhưng không cho navigate), `productName` (snapshot), `productSku` (snapshot), `unitPrice` (snapshot), `quantity`, `totalPrice` (= unitPrice × quantity), và `createdAt`.

Snapshot pattern cũng được áp dụng ở đây: `productName`, `productSku`, và `unitPrice` được lưu tại thời điểm order creation. Nếu sau đó product bị rename, change price, hoặc delete, order history vẫn hiển thị chính xác thông tin lúc mua. `productId` vẫn được giữ để có thể link đến current product page (nếu product vẫn tồn tại), nhưng không dùng để display information.

Method `calculateItemTotal()` tính `totalPrice = unitPrice × quantity`. Calculation này được execute khi tạo OrderItem và kết quả được persist để tránh tính lại nhiều lần (denormalization for performance).

Enum **OrderStatus** định nghĩa state machine của order lifecycle:

- **PENDING**: Order vừa được tạo, chưa có payment action nào. Trạng thái này ngắn, chỉ tồn tại trong quá trình redirect đến payment gateway.

- **PENDING_PAYMENT**: Order đang chờ payment confirmation. Với online payment (MoMo, VNPay), sau khi user redirect đến gateway, order chuyển sang trạng thái này. Inventory đã được reserved. Nếu payment timeout (15 phút), order sẽ auto-cancel.

- **CONFIRMED**: Payment đã success (hoặc COD được chấp nhận). Order đã được confirm và đang chờ processing. Inventory reservation được confirm, quantity thực sự giảm.

- **PROCESSING**: Admin/staff đang chuẩn bị hàng. Có thể bao gồm: pick items from warehouse, packaging, print shipping label. Order ở trạng thái này có thể cancel nhưng cần admin approval.

- **SHIPPING**: Order đã được chuyển cho đơn vị vận chuyển. Tracking number được update. Customer nhận notification với link tracking. Order không thể cancel nữa.

- **COMPLETED**: Customer đã nhận hàng thành công. Có thể được update tự động bởi shipping provider webhook hoặc manual bởi admin. Customer có thể review products.

- **CANCELLED**: Order bị hủy (do customer hoặc admin). Inventory reservation được release. Nếu đã payment, cần refund.

- **PAYMENT_FAILED**: Online payment bị fail (insufficient balance, declined card, timeout). Order bị cancel tự động và inventory released.

- **REFUNDED**: Order đã hoàn tiền cho customer. Có thể do customer return products sau khi nhận, hoặc refund do shop không thể fulfill order.

State transitions được kiểm soát chặt chẽ. Ví dụ: không thể chuyển từ SHIPPING sang CANCELLED, không thể chuyển từ COMPLETED sang PROCESSING. Method `canCancel()` check xem order có thể cancel ở trạng thái hiện tại hay không (chỉ PENDING, PENDING_PAYMENT, CONFIRMED cho phép).

Enum **PaymentMethod** định nghĩa các phương thức thanh toán:

- **COD** (Cash On Delivery): Thanh toán khi nhận hàng. Không cần payment gateway. Order chuyển từ PENDING → CONFIRMED ngay. Risk cao hơn (customer có thể refuse nhận hàng), nên có thể giới hạn COD cho orders dưới một threshold amount.

- **MOMO**: Thanh toán qua ví điện tử MoMo. Integration với MoMo payment gateway API. User redirect đến MoMo app/website, sau khi thanh toán, MoMo callback về server để update order status.

- **BANK_TRANSFER**: Chuyển khoản ngân hàng. Customer tự chuyển tiền, upload proof, admin verify manually rồi confirm order. Slow nhưng phổ biến ở Việt Nam.

- **VNPAY**: Thanh toán qua VNPAY gateway, hỗ trợ ATM cards, credit cards, QR code. Workflow tương tự MoMo.

Method `requiresOnlinePayment()` return true cho MOMO, BANK_TRANSFER, VNPAY. Method `getDisplayName()` return tên hiển thị user-friendly.

Entity **Payment** có quan hệ one-to-one với Order, tracking payment transaction details. Attributes: `id`, `orderId` (unique foreign key), `amount`, `status` (PaymentStatus enum), `paymentMethod`, `transactionId` (ID từ payment gateway), `paymentDate`, `notes`, `createdAt`, và `updatedAt`.

Khi order được tạo với online payment, một Payment record được tạo với status PENDING. Khi payment gateway callback về (success hoặc fail), Payment status được update, đồng thời trigger Order status update. `transactionId` là unique ID từ gateway (MoMo transaction ID, VNPay trans ref), dùng để reconciliation và customer support.

Field `notes` có thể chứa error messages nếu payment failed, hoặc additional info từ gateway response (saved as JSON). `paymentDate` là timestamp khi payment success, dùng cho financial reports.

Enum **PaymentStatus** định nghĩa trạng thái payment:

- **PENDING**: Payment chưa hoàn tất, đang chờ gateway response.
- **PROCESSING**: Payment đang được process bởi gateway (rare, chỉ một số gateways có trạng thái này).
- **COMPLETED**: Payment thành công, tiền đã được charge.
- **FAILED**: Payment thất bại (nhiều reasons: insufficient funds, declined, timeout).
- **REFUNDED**: Payment đã được hoàn tiền cho customer.
- **CANCELLED**: Payment bị cancel trước khi complete (user cancel tại gateway page).

Methods: `isPaid()` return true nếu status == COMPLETED, `isFailed()` check FAILED status, `canRefund()` check điều kiện có thể refund (chỉ COMPLETED payments), `markAsPaid()` và `markAsFailed()` để update status with validation.

Payment processing workflow:

1. User checkout → Create Order (PENDING) + Payment (PENDING)
2. Redirect user to payment gateway với amount, orderId, callback URL
3. User complete payment tại gateway
4. Gateway callback về server với result (success/fail) và transactionId
5. Server verify callback signature (security), update Payment status
6. Based on Payment status, update Order status
7. Send confirmation email/SMS to customer

Security considerations: Gateway callbacks phải verify signature để tránh fake callbacks. Payment amount trong callback phải match với amount in database. Implement idempotency - nếu receive duplicate callbacks, chỉ process một lần. Tất cả payment operations được audit log với full request/response data.

### 3.4.5. Class Diagram: Promotion Module

Module Promotion quản lý hệ thống mã giảm giá (coupons/vouchers) và tracking việc sử dụng của chúng. Đây là một tính năng marketing quan trọng để thu hút customers, tăng conversion rate, và reward loyal customers.

> **[Hình 3.4.5: Class Diagram - Promotion Module]**
> 
> *Chú thích: Chi tiết Promotion Module được bao gồm trong biểu đồ Order and Payment Modules (Hình 3.4.4). Promotion Module bao gồm Coupon và CouponUsage entities.*

Entity **Coupon** đại diện cho một mã giảm giá với các quy tắc nghiệp vụ phức tạp. Attributes chính:

- `id`: UUID primary key
- `code`: Mã coupon (unique, uppercase, ví dụ: "SUMMER2024", "WELCOME10")
- `description`: Mô tả coupon cho customers
- `discountType`: Enum (PERCENTAGE hoặc FIXED_AMOUNT)
- `discountValue`: Giá trị giảm (nếu PERCENTAGE thì là %, nếu FIXED thì là số tiền)
- `minOrderAmount`: Số tiền đơn hàng tối thiểu để apply coupon (nullable)
- `maxDiscountAmount`: Số tiền giảm tối đa (dùng cho PERCENTAGE coupons, nullable)
- `usageLimit`: Tổng số lần coupon có thể được sử dụng (nullable = unlimited)
- `usedCount`: Số lần đã được sử dụng (counter)
- `perUserLimit`: Số lần một user có thể sử dụng coupon này (nullable = unlimited)
- `validFrom`: Ngày bắt đầu hiệu lực
- `validTo`: Ngày hết hạn
- `isActive`: Flag để admin enable/disable coupon
- `createdBy`: Admin user tạo coupon
- `createdAt`, `updatedAt`: Timestamps

Enum **DiscountType** có hai values:

- **PERCENTAGE**: Giảm theo phần trăm (ví dụ: 10% off). Method `getSymbol()` return "%".
- **FIXED_AMOUNT**: Giảm số tiền cố định (ví dụ: giảm 50,000 VNĐ). Symbol return "VNĐ" hoặc currency symbol.

Validation rules for Coupon:

- `code` phải unique, chỉ chứa uppercase letters, numbers, underscores, hyphens. Regex: `^[A-Z0-9_-]+$`
- `code` length: 3-50 characters
- `discountValue` > 0
- Nếu PERCENTAGE, `discountValue` <= 100
- `validFrom` < `validTo`
- `minOrderAmount` >= 0 (nếu có)
- `maxDiscountAmount` >= 0 (nếu có)
- `usageLimit` >= 1 (nếu có)
- `perUserLimit` >= 1 (nếu có)

Critical business methods:

**`isValid()`**: Check tính hợp lệ của coupon tại thời điểm hiện tại:
```
return isActive 
    && currentTime >= validFrom 
    && currentTime <= validTo 
    && (usageLimit == null || usedCount < usageLimit)
```

**`canApplyToOrder(orderAmount)`**: Check xem coupon có thể apply cho đơn hàng với amount này không:
```
if (!isValid()) return false
if (minOrderAmount != null && orderAmount < minOrderAmount) return false
return true
```

**`calculateDiscount(orderAmount)`**: Tính số tiền giảm cho orderAmount:
```
if (!canApplyToOrder(orderAmount)) return 0

if (discountType == PERCENTAGE) {
    discount = orderAmount * discountValue / 100
    if (maxDiscountAmount != null && discount > maxDiscountAmount) {
        discount = maxDiscountAmount
    }
} else {
    discount = discountValue
}

// Discount không được vượt quá order amount
if (discount > orderAmount) {
    discount = orderAmount
}

return discount
```

**`incrementUsageCount()`**: Được gọi khi coupon được apply thành công cho một order. Tăng `usedCount`, update `updatedAt`.

**`decrementUsageCount()`**: Được gọi khi order bị cancel. Giảm `usedCount` (nếu > 0).

**`hasReachedLimit()`**: Check xem đã đạt usage limit chưa:
```
return usageLimit != null && usedCount >= usageLimit
```

**`getRemainingUsage()`**: Return số lần còn lại có thể sử dụng:
```
if (usageLimit == null) return null  // unlimited
return max(0, usageLimit - usedCount)
```

**`isExpired()`**: Check đã hết hạn chưa:
```
return currentTime > validTo
```

**`isNotStarted()`**: Check chưa đến thời gian bắt đầu:
```
return currentTime < validFrom
```

**`getDiscountDescription()`**: Return text mô tả giảm giá cho UI:
```
if (discountType == PERCENTAGE) {
    return discountValue + "% OFF"
} else {
    return formatCurrency(discountValue) + " OFF"
}
```

Lifecycle callbacks: `@PrePersist` normalize `code` về uppercase và trim whitespace. `@PreUpdate` update `updatedAt` timestamp.

Entity **CouponUsage** là audit trail tracking mỗi lần một coupon được sử dụng. Attributes:

- `id`: UUID primary key
- `couponId`: Foreign key đến Coupon
- `userId`: Foreign key đến User
- `orderId`: Foreign key đến Order
- `discountAmount`: Số tiền đã được giảm (snapshot)
- `usedAt`: Timestamp khi sử dụng

Mỗi khi một coupon được apply thành công cho một order, một CouponUsage record được tạo. Record này serve nhiều purposes:

1. **Prevent duplicate usage**: Trước khi apply coupon, check xem user đã sử dụng coupon này bao nhiêu lần rồi (dựa vào `perUserLimit` của Coupon).

2. **Audit trail**: Track chính xác coupon nào được sử dụng cho order nào, bởi user nào, vào thời điểm nào, giảm được bao nhiêu tiền.

3. **Analytics**: Analyze coupon effectiveness - coupon nào được sử dụng nhiều nhất, conversion rate, average discount amount, ROI of coupon campaigns.

4. **Fraud detection**: Detect abnormal patterns như một user tạo nhiều accounts để abuse coupon có `perUserLimit`.

Coupon application workflow:

1. User nhập coupon code tại checkout page
2. Frontend call API `POST /api/coupons/validate` với `{code, orderAmount}`
3. Backend:
   - Find coupon by code
   - Call `coupon.isValid()`
   - Call `coupon.canApplyToOrder(orderAmount)`
   - Check per-user limit: count CouponUsages where `couponId = X AND userId = Y`
   - If valid, call `coupon.calculateDiscount(orderAmount)` và return discount
4. Frontend hiển thị discount amount và update finalAmount
5. User confirm order
6. Backend trong transaction:
   - Create Order với `couponId`, `couponCode`, `discountAmount`
   - Create CouponUsage record
   - Call `coupon.incrementUsageCount()`
   - Commit transaction
7. Nếu order bị cancel sau đó:
   - Call `coupon.decrementUsageCount()`
   - Delete CouponUsage record (hoặc mark as cancelled)

Business scenarios cho coupons:

- **Welcome coupon**: New users nhận 10% off first order. `perUserLimit = 1`, `validTo` = 30 days from registration.
- **Flash sale**: 50% off limited to first 100 orders. `usageLimit = 100`, `validFrom/To` trong 2 giờ.
- **Minimum purchase**: Giảm 100k cho đơn từ 1 triệu. `minOrderAmount = 1000000`, `discountType = FIXED_AMOUNT`, `discountValue = 100000`.
- **Percentage with cap**: Giảm 20% tối đa 200k. `discountType = PERCENTAGE`, `discountValue = 20`, `maxDiscountAmount = 200000`.
- **Loyalty program**: VIP customers có code riêng unlimited uses. `perUserLimit = null`, `usageLimit = null`.

Security considerations: Coupon codes không nên dễ đoán (avoid sequential codes like "COUPON001", "COUPON002"). Admin interface phải có authorization - chỉ ADMIN role có thể create/edit coupons. Rate limiting cho coupon validation API để tránh brute force guessing codes. Log tất cả coupon operations để audit.

### 3.4.6. Tổng Quan Kiến Trúc và Quan Hệ Giữa Các Modules

Sau khi phân tích chi tiết từng module, chúng ta cần nhìn nhận tổng thể về cách các modules tương tác với nhau trong hệ thống. Kiến trúc được thiết kế theo nguyên tắc Modular Monolith, trong đó mỗi module là một bounded context rõ ràng với dependencies được kiểm soát chặt chẽ.

> **[Hình 3.4.6: Complete System Class Diagram]**
> 
> *Chú thích: Biểu đồ tổng quan toàn bộ hệ thống thể hiện tất cả modules và quan hệ cross-module giữa chúng. Sử dụng file PlantUML: `docs/diagrams/complete-system-class-diagram.puml`*

**Dependency Graph** của các modules:

```
Identity (no dependencies)
   ↑
   ├── Catalog (depends on Identity for User)
   ↑   ↑
   │   └── Inventory (depends on Catalog for Product)
   │
   ├── Promotion (depends on Identity for User)
   ↑
   └── Order (depends on Identity, Catalog, Promotion)
       ↑
       └── Payment (depends on Order)
```

Như có thể thấy, **Identity** module không phụ thuộc vào module nào khác, đóng vai trò foundation layer. Các modules khác phụ thuộc vào Identity để reference User entities. **Catalog** và **Inventory** form một sub-system quản lý products và stock. **Order** module có nhiều dependencies nhất vì nó cần integrate information từ User (người đặt hàng), Product (sản phẩm đặt), và Coupon (mã giảm giá). **Payment** chỉ phụ thuộc Order, tạo một clear separation of concerns.

**Cross-Module References** được implement theo pattern: module A không directly import và instantiate entities của module B, mà chỉ lưu foreign key (UUID). Ví dụ, OrderItem không có `Product product` field mà chỉ có `UUID productId`. Khi cần thông tin product, service layer sẽ call ProductService để fetch. Pattern này tránh tight coupling và circular dependencies.

**Communication Between Modules** xảy ra qua service layer interfaces, không phải qua direct entity references. Ví dụ:

- Khi OrderService tạo order, nó call InventoryService.reserve(productId, quantity)
- Khi PaymentService update payment status, nó publish event mà OrderService subscribe để update order status
- Khi UserService update user info, không ảnh hưởng đến Order entities vì addresses đã được snapshot

**Shared Kernel** - có một số components được share giữa modules:

- `BaseEntity`: Abstract class cung cấp `id`, `createdAt`, `updatedAt` cho tất cả entities
- Common value objects: `Money`, `Email`, `PhoneNumber` (nếu implement value objects pattern)
- Utility classes: `SlugGenerator`, `CurrencyFormatter`, `DateTimeUtil`
- Exceptions: `EntityNotFoundException`, `ValidationException`, `BusinessRuleViolationException`

**Transaction Boundaries**: Mỗi Aggregate Root định nghĩa một transaction boundary. Trong một transaction, chỉ nên modify một Aggregate. Ví dụ:

- Khi create order: Update Order Aggregate (Order + OrderItems) trong một transaction
- Gọi InventoryService.reserve() trong transaction riêng
- Nếu inventory reserve fail, rollback order transaction

Đối với operations span nhiều Aggregates (như order checkout), sử dụng eventual consistency thay vì distributed transactions. Ví dụ, sau khi Order created, publish OrderCreatedEvent. InventoryService subscribe event và reserve stock. Nếu reserve fail, publish InventoryReservationFailedEvent, OrderService subscribe và mark order as failed.

**Data Consistency Patterns**:

1. **Snapshot Pattern**: Order lưu snapshot của Product info, Address, Coupon code để preserve historical accuracy.

2. **Denormalization**: Product có `viewCount`, `averageRating` được cache thay vì calculate mỗi lần query. Background jobs update periodically.

3. **Soft Delete**: User, Product, Category có status/isActive thay vì hard delete, giữ referential integrity.

4. **Idempotency**: Payment callbacks, coupon applications được design idempotent - có thể call nhiều lần mà kết quả không đổi.

**Scalability Considerations**:

Modular Monolith architecture cho phép vertical scaling (bigger server) và limited horizontal scaling (multiple instances with load balancer). Database có thể scale bằng:

- **Read replicas**: Direct read queries đến replicas, write queries đến master
- **Caching**: Redis cache cho frequently accessed data (products, categories, user sessions)
- **Database partitioning**: Partition orders table by date, products by category

Nếu cần scale hơn nữa, có thể extract modules thành microservices:

- Identity Service (authentication + user management)
- Catalog Service (products + categories + brands)
- Inventory Service (stock management)
- Order Service (order processing)
- Payment Service (payment gateway integration)
- Notification Service (emails + SMS)

Nhưng với quy mô hiện tại của Watchify (startup/SME e-commerce), Modular Monolith là lựa chọn tối ưu: đơn giản để develop và deploy, dễ maintain, performance tốt do không có network calls giữa modules, transactions dễ quản lý hơn distributed systems.

**Database Schema**: Tất cả modules share một database (PostgreSQL hoặc MySQL) nhưng tables được organize theo schema/namespace. Ví dụ:

- `identity.users`, `identity.roles`, `identity.addresses`
- `catalog.products`, `catalog.categories`, `catalog.brands`
- `inventory.inventories`
- `orders.orders`, `orders.order_items`
- `payments.payments`
- `promotions.coupons`, `promotions.coupon_usages`

Việc này giúp clear ownership và có thể dễ dàng migrate sang separate databases sau này nếu split thành microservices.

**API Design**: REST APIs được organize theo modules:

- `/api/v1/auth/*` - Identity module (login, register, refresh token)
- `/api/v1/users/*` - Identity module (user profile, addresses)
- `/api/v1/products/*` - Catalog module
- `/api/v1/categories/*` - Catalog module
- `/api/v1/cart/*` - Catalog module
- `/api/v1/orders/*` - Order module
- `/api/v1/payments/*` - Payment module
- `/api/v1/coupons/*` - Promotion module

Mỗi endpoint handle authorization (JWT), validation, business logic trong module tương ứng, và return standardized response format.

Tóm lại, thiết kế class diagram của hệ thống Watchify thể hiện một kiến trúc chặt chẽ, tuân thủ các nguyên tắc SOLID, DDD patterns, và best practices trong software engineering. Việc phân tách rõ ràng các modules, sử dụng foreign keys thay vì navigation properties, áp dụng snapshot pattern, và implement proper state machines cho Order/Payment lifecycle đảm bảo hệ thống maintainable, scalable, và có thể evolve theo nhu cầu nghiệp vụ trong tương lai.