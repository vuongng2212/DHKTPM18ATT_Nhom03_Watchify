# CHƯƠNG 2: PHÂN TÍCH YÊU CẦU

## 2.1. Xác định mục tiêu công việc cụ thể

Quá trình phân tích yêu cầu cho dự án Watchify bắt đầu từ việc xác định rõ ràng các mục tiêu công việc cần đạt được. Mục tiêu tổng quan là xây dựng một hệ thống thương mại điện tử hoàn chỉnh, chuyên nghiệp và có khả năng vận hành thực tế trong môi trường kinh doanh. Để đạt được mục tiêu này, nhóm đã tiến hành khảo sát và nghiên cứu các nền tảng thương mại điện tử hiện có như Shopee, Lazada, và đặc biệt là các website chuyên về đồng hồ như Đồng Hồ Hải Triều, WatchBox để học hỏi kinh nghiệm và xác định các tính năng cần thiết.

Từ góc độ người dùng cuối, hệ thống cần cung cấp trải nghiệm mua sắm trực tuyến toàn diện với khả năng duyệt xem sản phẩm theo nhiều cách khác nhau, tìm kiếm thông minh dựa trên nhiều tiêu chí, xem thông tin chi tiết về sản phẩm bao gồm hình ảnh chất lượng cao và mô tả kỹ thuật đầy đủ. Người dùng cần có khả năng quản lý giỏ hàng linh hoạt, lưu các sản phẩm yêu thích để theo dõi sau này, và thực hiện thanh toán một cách an toàn thông qua các phương thức phổ biến. Sau khi đặt hàng, khách hàng cần có thể theo dõi trạng thái đơn hàng của mình và có quyền đánh giá sản phẩm sau khi nhận được để chia sẻ trải nghiệm với cộng đồng.

Từ góc độ quản trị, hệ thống cần trang bị đầy đủ các công cụ để quản lý hoạt động kinh doanh hiệu quả. Người quản trị cần có khả năng quản lý danh mục sản phẩm một cách toàn diện, từ việc thêm mới, cập nhật thông tin, quản lý tồn kho cho đến ngừng kinh doanh các sản phẩm không còn phù hợp. Việc quản lý đơn hàng cũng cần được thực hiện dễ dàng với khả năng xem, cập nhật trạng thái và xử lý các vấn đề phát sinh. Ngoài ra, hệ thống cần cung cấp các báo cáo và thống kê về doanh thu, sản phẩm bán chạy, hành vi khách hàng để hỗ trợ việc ra quyết định kinh doanh.

Về mặt kỹ thuật, các mục tiêu công việc bao gồm việc thiết kế và triển khai kiến trúc hệ thống theo mô hình Modular Monolithic với khả năng mở rộng cao, xây dựng cơ sở dữ liệu quan hệ được chuẩn hóa và tối ưu hóa hiệu năng, phát triển RESTful API tuân thủ các chuẩn và best practices, triển khai cơ chế bảo mật mạnh mẽ để bảo vệ dữ liệu người dùng, và tích hợp với các dịch vụ bên thứ ba như cổng thanh toán MoMo. Tất cả những mục tiêu này cần được hoàn thành trong khoảng thời gian nhất định với nguồn lực hạn chế của một nhóm sinh viên.

## 2.2. Phân tích chi tiết các chức năng

### Chức năng dành cho người dùng (Customer)

Hành trình của một khách hàng trên nền tảng Watchify bắt đầu từ trang chủ, nơi họ được chào đón bởi giao diện thân thiện với các banner quảng bá sản phẩm nổi bật và các collection được tuyển chọn. Từ đây, người dùng có thể bắt đầu khám phá sản phẩm thông qua nhiều con đường khác nhau. Họ có thể chọn duyệt xem theo danh mục như đồng hồ nam, đồng hồ nữ, hoặc đồng hồ đôi, hoặc họ có thể lọc sản phẩm theo thương hiệu yêu thích như Rolex, Omega, hoặc Casio.

Khi quan tâm đến một sản phẩm cụ thể, người dùng có thể click vào để xem trang chi tiết sản phẩm. Tại đây, họ được cung cấp đầy đủ thông tin từ hình ảnh sản phẩm ở nhiều góc độ khác nhau, mô tả chi tiết về các thông số kỹ thuật như đường kính mặt, độ dày, chất liệu dây đeo, loại máy, độ chống nước, cho đến giá cả, chính sách bảo hành và đánh giá từ những khách hàng đã mua. Hệ thống đánh giá được thiết kế để khách hàng có thể xem đánh giá theo số sao, đọc các nhận xét chi tiết kèm theo hình ảnh thực tế từ người dùng, giúp họ có cái nhìn khách quan hơn về chất lượng sản phẩm.

Khi đã quyết định mua, khách hàng có thể thêm sản phẩm vào giỏ hàng và tiếp tục mua sắm hoặc tiến hành thanh toán ngay. Giỏ hàng được thiết kế linh hoạt, cho phép người dùng điều chỉnh số lượng, xóa sản phẩm không mong muốn, và xem tổng giá trị đơn hàng cập nhật theo thời gian thực. Đối với những sản phẩm mà khách hàng muốn theo dõi nhưng chưa quyết định mua ngay, họ có thể thêm vào danh sách yêu thích để dễ dàng truy cập lại sau này mà không cần phải tìm kiếm lại từ đầu.

Quy trình thanh toán được thiết kế đơn giản nhưng đảm bảo thu thập đầy đủ thông tin cần thiết. Khách hàng cần đăng nhập hoặc đăng ký tài khoản trước khi thanh toán, sau đó họ điền hoặc chọn từ các địa chỉ giao hàng đã lưu, chọn phương thức thanh toán phù hợp trong đó có thanh toán qua ví điện tử MoMo, và kiểm tra lại thông tin đơn hàng trước khi xác nhận. Sau khi thanh toán thành công, khách hàng nhận được email xác nhận và có thể theo dõi trạng thái đơn hàng thông qua trang lịch sử đơn hàng trong tài khoản cá nhân.

Tính năng quản lý tài khoản cá nhân cho phép người dùng cập nhật thông tin cá nhân như họ tên, số điện thoại, email, quản lý nhiều địa chỉ giao hàng khác nhau cho các trường hợp giao hàng tại nhà, văn phòng hoặc địa chỉ khác, xem lại lịch sử các đơn hàng đã đặt kèm theo trạng thái chi tiết, và thay đổi mật khẩu để đảm bảo bảo mật tài khoản. Sau khi nhận được sản phẩm, khách hàng được khuyến khích viết đánh giá và chia sẻ trải nghiệm của mình, góp phần xây dựng cộng đồng người dùng tin cậy trên nền tảng.

### Chức năng dành cho quản trị viên (Admin)

Hệ thống quản trị được thiết kế như một trung tâm điều hành toàn diện cho mọi hoạt động kinh doanh trên nền tảng. Ngay sau khi đăng nhập vào trang quản trị, admin được đón chào bởi dashboard tổng quan với các chỉ số kinh doanh quan trọng được hiển thị trực quan thông qua các biểu đồ và số liệu. Dashboard cung cấp thông tin về doanh thu theo ngày, tuần, tháng, số lượng đơn hàng mới và đơn hàng đang xử lý, danh sách sản phẩm bán chạy nhất, và các cảnh báo về tình trạng tồn kho thấp cần nhập thêm.

Module quản lý sản phẩm là một trong những phần quan trọng nhất của hệ thống quản trị. Tại đây, admin có thể xem danh sách tất cả các sản phẩm hiện có với khả năng tìm kiếm và lọc theo nhiều tiêu chí như tên, thương hiệu, danh mục, khoảng giá, hoặc trạng thái. Khi thêm sản phẩm mới, admin cần nhập đầy đủ thông tin bao gồm tên sản phẩm, mô tả chi tiết, giá bán, giá gốc nếu có khuyến mãi, chọn danh mục và thương hiệu phù hợp, upload nhiều hình ảnh sản phẩm chất lượng cao, và điền các thông số kỹ thuật cụ thể như đường kính mặt, độ dày, chất liệu vỏ, chất liệu dây, loại máy, và độ chống nước. Mỗi sản phẩm cũng có phần quản lý tồn kho riêng, cho phép admin cập nhật số lượng tồn kho hiện tại và thiết lập ngưỡng cảnh báo khi hàng sắp hết.

Việc quản lý đơn hàng yêu cầu sự theo dõi chặt chẽ và xử lý kịp thời. Admin có thể xem danh sách tất cả các đơn hàng với các bộ lọc theo trạng thái như đơn mới, đang xử lý, đang giao, hoàn thành, hoặc đã hủy. Khi click vào một đơn hàng cụ thể, admin có thể xem đầy đủ thông tin chi tiết bao gồm thông tin khách hàng, địa chỉ giao hàng, danh sách sản phẩm trong đơn, tổng giá trị, phương thức thanh toán, và trạng thái thanh toán. Admin có trách nhiệm cập nhật trạng thái đơn hàng theo quy trình từ nhận đơn, chuẩn bị hàng, giao cho đơn vị vận chuyển, cho đến khi khách hàng nhận được hàng. Trong trường hợp có vấn đề phát sinh như khách hàng muốn hủy đơn hoặc đổi trả sản phẩm, admin cần xử lý một cách nhanh chóng và chuyên nghiệp.

Module quản lý người dùng giúp admin có cái nhìn tổng quan về cơ sở khách hàng. Admin có thể xem danh sách tất cả người dùng đã đăng ký, tìm kiếm theo tên hoặc email, xem chi tiết thông tin từng người dùng bao gồm lịch sử đơn hàng và tổng giá trị đã mua, và thực hiện các thao tác như khóa tài khoản vi phạm hoặc gán quyền quản trị cho nhân viên. Việc quản lý thương hiệu và danh mục cũng được tích hợp trong hệ thống, cho phép admin thêm mới, chỉnh sửa hoặc xóa các thương hiệu và danh mục sản phẩm một cách linh hoạt.

Hệ thống quản lý đánh giá cho phép admin theo dõi tất cả các đánh giá mà khách hàng đã để lại cho sản phẩm. Admin có quyền duyệt hoặc ẩn các đánh giá không phù hợp, trả lời các thắc mắc của khách hàng trong phần đánh giá, và sử dụng thông tin từ đánh giá để cải thiện chất lượng sản phẩm và dịch vụ. Module khuyến mãi và mã giảm giá cho phép admin tạo các chương trình khuyến mãi với các điều kiện cụ thể như giảm giá theo phần trăm hoặc số tiền cố định, áp dụng cho toàn bộ sản phẩm hoặc chỉ một số sản phẩm nhất định, thiết lập thời gian hiệu lực và số lượng mã có thể sử dụng.

### Chức năng dành cho khách vãng lai (Guest)

Người dùng chưa đăng nhập vẫn có thể trải nghiệm phần lớn các tính năng của website để khám phá sản phẩm. Họ có thể tự do duyệt xem trang chủ với các banner và sản phẩm nổi bật, xem danh sách sản phẩm theo các danh mục khác nhau, sử dụng chức năng tìm kiếm để tìm sản phẩm mong muốn, và xem chi tiết thông tin của từng sản phẩm bao gồm hình ảnh, mô tả, giá cả, và đánh giá từ người dùng khác. Tuy nhiên, để thực hiện các hành động như thêm sản phẩm vào giỏ hàng, lưu sản phẩm yêu thích, viết đánh giá, hoặc đặt hàng, họ cần phải đăng ký tài khoản và đăng nhập vào hệ thống. Việc yêu cầu đăng nhập cho các tính năng này không chỉ giúp quản lý thông tin khách hàng tốt hơn mà còn đảm bảo tính xác thực của các đánh giá và giao dịch.

## 2.3. Xác định các ràng buộc phi chức năng

### Bảo mật thông tin

Bảo mật là ưu tiên hàng đầu trong thiết kế hệ thống Watchify do tính chất nhạy cảm của dữ liệu khách hàng và giao dịch thanh toán. Hệ thống áp dụng nhiều lớp bảo mật khác nhau để đảm bảo an toàn cho dữ liệu. Đầu tiên, tất cả mật khẩu người dùng được mã hóa bằng thuật toán BCrypt trước khi lưu vào cơ sở dữ liệu, đảm bảo rằng ngay cả khi cơ sở dữ liệu bị xâm nhập, kẻ tấn công cũng không thể biết được mật khẩu gốc của người dùng. Việc xác thực người dùng được thực hiện thông qua cơ chế JWT (JSON Web Token), trong đó mỗi request từ client đều phải gửi kèm token hợp lệ trong header, và server sẽ kiểm tra tính hợp lệ của token trước khi xử lý request.

Hệ thống phân quyền được thiết kế rõ ràng với hai vai trò chính là ROLE_USER cho khách hàng thường và ROLE_ADMIN cho quản trị viên. Mỗi API endpoint được bảo vệ bởi Spring Security với các annotation xác định quyền truy cập cụ thể, đảm bảo rằng người dùng chỉ có thể truy cập vào các tài nguyên mà họ được phép. Ví dụ, chỉ có admin mới có thể truy cập vào các API quản lý sản phẩm, đơn hàng, và người dùng, trong khi khách hàng chỉ có thể xem và chỉnh sửa thông tin của chính họ.

Để chống lại các cuộc tấn công phổ biến, hệ thống tích hợp các cơ chế bảo vệ như CORS (Cross-Origin Resource Sharing) để kiểm soát nguồn gốc của các request, validation đầu vào nghiêm ngặt để ngăn chặn SQL Injection và XSS (Cross-Site Scripting), và CSRF (Cross-Site Request Forgery) protection cho các form quan trọng. Việc tích hợp với cổng thanh toán MoMo cũng tuân thủ các tiêu chuẩn bảo mật của nhà cung cấp, đảm bảo rằng thông tin thanh toán được truyền tải an toàn qua kênh được mã hóa.

### Hiệu năng hệ thống

Hiệu năng là yếu tố then chốt quyết định trải nghiệm người dùng. Hệ thống được thiết kế để đáp ứng yêu cầu về tốc độ xử lý và khả năng phục vụ đồng thời nhiều người dùng. Cơ sở dữ liệu được tối ưu hóa thông qua việc thiết kế các index phù hợp trên các cột thường xuyên được sử dụng trong điều kiện WHERE và JOIN, như product_id, user_id, category_id, và brand_id. Các truy vấn phức tạp được tối ưu hóa để tránh N+1 query problem thông qua việc sử dụng JOIN FETCH trong JPA khi cần thiết.

Frontend được xây dựng với React và Vite, tận dụng các kỹ thuật như code splitting để chia nhỏ bundle size, lazy loading cho các component không cần thiết ngay lập tức, và image optimization để giảm kích thước hình ảnh mà vẫn đảm bảo chất lượng hiển thị. Pagination được áp dụng cho tất cả các danh sách có khả năng chứa nhiều bản ghi như danh sách sản phẩm, đơn hàng, và đánh giá, đảm bảo rằng mỗi lần chỉ tải một lượng dữ liệu vừa phải thay vì tải toàn bộ.

Caching là một chiến lược quan trọng để cải thiện hiệu năng. Dữ liệu ít thay đổi như danh mục sản phẩm, thương hiệu, và thông tin chi tiết sản phẩm có thể được cache ở nhiều lớp khác nhau từ browser cache, CDN, cho đến application-level cache. Response time mục tiêu cho các API thông thường là dưới 500ms, và dưới 2 giây cho các trang web bao gồm cả thời gian tải assets.

### Giao diện người dùng

Giao diện người dùng được thiết kế theo nguyên tắc UI/UX hiện đại với trọng tâm là tính dễ sử dụng và thẩm mỹ. Website cần responsive hoàn toàn, tự động điều chỉnh layout phù hợp với các kích thước màn hình khác nhau từ điện thoại di động, tablet, cho đến desktop. Việc sử dụng Tailwind CSS giúp đảm bảo tính nhất quán trong thiết kế với hệ thống màu sắc, typography, và spacing được định nghĩa rõ ràng.

Navigation cần trực quan với menu được tổ chức hợp lý, breadcrumb giúp người dùng biết vị trí hiện tại của họ trong website, và search bar nổi bật để người dùng dễ dàng tìm kiếm sản phẩm. Các thông điệp thành công, lỗi, hoặc cảnh báo cần được hiển thị rõ ràng thông qua notification hoặc toast message, giúp người dùng hiểu được kết quả của hành động họ vừa thực hiện. Loading states cần được hiển thị trong quá trình xử lý các thao tác tốn thời gian để người dùng biết hệ thống đang làm việc.

Accessibility cũng là một yếu tố quan trọng, đảm bảo rằng website có thể sử dụng được bởi người khuyết tật thông qua việc tuân thủ các tiêu chuẩn WCAG như sử dụng semantic HTML, cung cấp alt text cho hình ảnh, đảm bảo contrast ratio phù hợp cho text, và hỗ trợ keyboard navigation. Màu sắc được lựa chọn cẩn thận để phù hợp với ngành hàng đồng hồ cao cấp, thường sử dụng tông màu sang trọng, tinh tế kết hợp với white space hợp lý để tạo cảm giác thoáng đãng.

### Khả năng mở rộng

Hệ thống được thiết kế với khả năng mở rộng cao để đáp ứng nhu cầu tăng trưởng trong tương lai. Kiến trúc Modular Monolithic cho phép dễ dàng thêm các module mới hoặc refactor các module hiện có mà không ảnh hưởng đến toàn bộ hệ thống. Nếu trong tương lai có nhu cầu scale lớn hơn, các module này có thể được tách ra thành các microservices độc lập với chi phí refactoring tương đối thấp do ranh giới giữa các module đã được định nghĩa rõ ràng từ đầu.

Database schema được thiết kế với khả năng mở rộng trong tâm trí, cho phép thêm các bảng hoặc cột mới mà không cần thay đổi cấu trúc hiện có. Việc sử dụng Flyway migration giúp quản lý các thay đổi database một cách có tổ chức và có thể rollback khi cần thiết. API được thiết kế theo RESTful principles với versioning để đảm bảo backward compatibility khi có thay đổi breaking changes.

## 2.4. Cơ sở lý thuyết và lựa chọn công nghệ

### Lựa chọn công nghệ Frontend

Việc lựa chọn React 19 làm thư viện chính cho frontend xuất phát từ nhiều lý do thuyết phục. React là một trong những thư viện JavaScript phổ biến nhất hiện nay với cộng đồng developer đông đảo, tài liệu phong phú, và hệ sinh thái thư viện phụ trợ rất lớn. Component-based architecture của React cho phép xây dựng giao diện theo cách modular, trong đó mỗi component là một đơn vị độc lập có thể tái sử dụng, dễ dàng test và maintain. Virtual DOM của React giúp tối ưu hóa hiệu năng bằng cách chỉ cập nhật những phần thay đổi trên giao diện thay vì re-render toàn bộ trang.

Vite được chọn làm build tool thay vì Create React App truyền thống do tốc độ build và hot reload nhanh hơn đáng kể nhờ việc tận dụng ES modules native của browser. Trong quá trình development, Vite không cần bundle toàn bộ ứng dụng mà chỉ transform và serve từng module khi được request, giúp server khởi động gần như tức thì ngay cả với project lớn. Khi build cho production, Vite sử dụng Rollup để tạo ra bundle được tối ưu hóa với code splitting và tree shaking tự động.

Tailwind CSS được lựa chọn như framework CSS chính do cách tiếp cận utility-first giúp xây dựng giao diện nhanh chóng mà không cần viết CSS từ đầu. Thay vì định nghĩa các class CSS custom, developer sử dụng các utility class có sẵn như flex, pt-4, text-center ngay trong JSX, giúp giảm context switching và tăng tốc độ phát triển. Tailwind cũng có hệ thống design tokens mạnh mẽ cho spacing, colors, typography giúp đảm bảo tính nhất quán trong thiết kế. Kết hợp với Ant Design component library, nhóm có sẵn các component phức tạp như Table, Form, Modal, Drawer đã được tối ưu về accessibility và UX, tiết kiệm thời gian phát triển đáng kể.

React Router DOM được sử dụng để quản lý routing trong single-page application, cho phép navigation giữa các trang mà không cần reload toàn bộ trang. Việc sử dụng Axios làm HTTP client giúp thực hiện các API calls với cú pháp đơn giản, hỗ trợ interceptors để xử lý authentication token tự động, và có khả năng cancel requests khi component unmount. Các thư viện animation như Framer Motion được tích hợp để tạo các hiệu ứng chuyển động mượt mà, nâng cao trải nghiệm người dùng.

### Lựa chọn công nghệ Backend

Spring Boot 3.4.10 được chọn làm framework chính cho backend do đây là framework enterprise-grade được tin dùng rộng rãi trong các dự án production lớn. Spring Boot cung cấp convention over configuration, giúp giảm thiểu boilerplate code và cho phép developer tập trung vào business logic thay vì cấu hình. Auto-configuration của Spring Boot tự động cấu hình các bean dựa trên classpath dependencies, giúp việc setup project trở nên đơn giản và nhanh chóng.

Java 21 là phiên bản LTS (Long-Term Support) mới nhất, cung cấp nhiều tính năng hiện đại như record classes giúp định nghĩa immutable data classes ngắn gọn, pattern matching giúp code dễ đọc hơn, sealed classes cho type hierarchy được kiểm soát chặt chẽ, và virtual threads (Project Loom) cho khả năng xử lý concurrent tốt hơn với resource footprint thấp hơn. Việc sử dụng Java cũng mang lại lợi ích về type safety với static typing, giúp phát hiện lỗi sớm trong quá trình compile thay vì runtime.

Spring Security kết hợp với JWT được sử dụng cho authentication và authorization. Spring Security cung cấp một framework bảo mật toàn diện với khả năng bảo vệ chống lại các lỗ hổng bảo mật phổ biến, hỗ trợ nhiều cơ chế authentication khác nhau, và có thể tùy chỉnh linh hoạt theo nhu cầu. JWT (JSON Web Token) là tiêu chuẩn mở cho việc truyền tải thông tin an toàn giữa các bên dưới dạng JSON object, đặc biệt phù hợp với kiến trúc stateless REST API. Với JWT, server không cần lưu session state, giúp dễ dàng scale horizontally và phù hợp với kiến trúc microservices trong tương lai.

Spring Data JPA kết hợp với Hibernate được sử dụng làm ORM (Object-Relational Mapping) layer, giúp mapping giữa Java objects và database tables một cách tự động. Spring Data JPA cung cấp repository abstraction giúp developer không cần viết boilerplate code cho các thao tác CRUD cơ bản, chỉ cần định nghĩa interface kế thừa từ JpaRepository là có sẵn các phương thức như save(), findById(), findAll(), delete(). Đối với các query phức tạp, Spring Data JPA hỗ trợ method name query derivation, @Query annotation với JPQL, hoặc Specification API cho dynamic queries.

Lombok được sử dụng để giảm boilerplate code trong Java thông qua các annotation như @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor giúp tự động generate getters, setters, constructors, equals, hashCode, và toString. Điều này làm cho code ngắn gọn hơn, dễ đọc hơn, và giảm khả năng mắc lỗi khi phải viết tay các phương thức này. Jakarta Validation (Bean Validation) được sử dụng để validation dữ liệu đầu vào thông qua các annotation như @NotNull, @NotBlank, @Email, @Min, @Max ngay trên các field của DTO classes, giúp code validation rõ ràng và dễ maintain.

### Lựa chọn Database và Migration Tool

MariaDB được chọn làm hệ quản trị cơ sở dữ liệu quan hệ chính do đây là một fork open-source của MySQL với hiệu năng tốt hơn, nhiều tính năng mới hơn, và hoàn toàn compatible với MySQL. MariaDB hỗ trợ đầy đủ ACID transactions, foreign key constraints, và indexes, đảm bảo tính toàn vẹn dữ liệu. Việc sử dụng database quan hệ phù hợp với tính chất dữ liệu của hệ thống thương mại điện tử, nơi có nhiều mối quan hệ phức tạp giữa các entities như users, products, orders, payments.

Flyway được sử dụng làm database migration tool, giúp quản lý các thay đổi database schema một cách có tổ chức thông qua các migration scripts. Mỗi thay đổi database được định nghĩa trong một file SQL với version number, và Flyway tự động theo dõi version nào đã được applied và apply các version mới khi cần. Điều này đảm bảo database schema của tất cả môi trường (development, staging, production) luôn đồng bộ và có thể reproduce được. Flyway cũng hỗ trợ rollback migrations trong trường hợp cần quay lại version trước đó.

### Lựa chọn công nghệ triển khai

Docker và Docker Compose được sử dụng để containerize ứng dụng, giúp đảm bảo môi trường development và production nhất quán. Với Docker, toàn bộ ứng dụng cùng với dependencies được đóng gói trong các container độc lập, có thể chạy trên bất kỳ máy nào có Docker mà không cần lo về việc cài đặt dependencies. Docker Compose cho phép định nghĩa và chạy multi-container application với một file YAML duy nhất, giúp đơn giản hóa việc orchestrate các services như frontend, backend, và database.

Nginx được sử dụng làm web server cho frontend trong production, cung cấp khả năng serve static files hiệu quả, HTTP/2 support, và có thể cấu hình làm reverse proxy cho backend API. OpenAPI (Swagger) được tích hợp để tự động generate API documentation từ code thông qua các annotation, giúp documentation luôn đồng bộ với implementation và cung cấp giao diện tương tác để test API ngay trên browser.

Gradle được chọn làm build tool cho Java project do tốc độ build nhanh hơn Maven nhờ incremental builds và build cache, cú pháp Groovy/Kotlin DSL linh hoạt hơn XML của Maven, và khả năng tùy biến cao. MoMo Payment Gateway được tích hợp như payment provider chính, cho phép khách hàng thanh toán qua ví điện tử MoMo một cách an toàn và tiện lợi. Việc tích hợp này được thực hiện thông qua REST API của MoMo với các cơ chế bảo mật như HMAC-SHA256 signature để đảm bảo tính toàn vẹn của dữ liệu.

Tất cả các lựa chọn công nghệ trên đều được cân nhắc kỹ lưỡng dựa trên các tiêu chí như độ phổ biến và cộng đồng hỗ trợ, khả năng đáp ứng yêu cầu của dự án, tính ổn định và bảo mật, learning curve phù hợp với năng lực của nhóm, và khả năng mở rộng trong tương lai. Sự kết hợp hài hòa của các công nghệ này tạo nên một tech stack mạnh mẽ, hiện đại, và có khả năng đáp ứng cả nhu cầu học tập lẫn triển khai thực tế.