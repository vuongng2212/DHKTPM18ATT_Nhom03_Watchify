# CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI

## 1.1. Giới thiệu thành viên và phân công nhiệm vụ

Đồ án "Xây dựng Website Bán Đồng Hồ Trực Tuyến - Watchify" được thực hiện bởi Nhóm 03 thuộc lớp DHKTPM18ATT. Dự án này là kết quả của sự phối hợp chặt chẽ giữa các thành viên trong việc nghiên cứu, phân tích yêu cầu, thiết kế kiến trúc hệ thống và triển khai ứng dụng. Mỗi thành viên trong nhóm đều được phân công các nhiệm vụ cụ thể dựa trên năng lực chuyên môn và kinh nghiệm của từng người, nhằm đảm bảo dự án được hoàn thành với chất lượng cao nhất.

### Phân công công việc cụ thể

**[Cần điền tên và nhiệm vụ cụ thể của các thành viên]**

Ví dụ mẫu:
- Thành viên A: Đảm nhận vai trò Team Leader kiêm Backend Developer chính, chịu tr책nhiệm thiết kế kiến trúc tổng thể của hệ thống theo mô hình Modular Monolithic Architecture, xây dựng các module Backend như Identity, Catalog, Order, Payment sử dụng Spring Boot và Spring Security, đồng thời tích hợp cổng thanh toán MoMo và quản lý database MariaDB.

- Thành viên B: Đảm nhận vai trò Frontend Developer, phụ trách phát triển giao diện người dùng với React 19 và Tailwind CSS, xây dựng các trang chức năng cho cả phía khách hàng (trang chủ, sản phẩm, giỏ hàng, thanh toán) và phía quản trị (dashboard, quản lý sản phẩm, đơn hàng, người dùng), đồng thời tối ưu hóa trải nghiệm người dùng thông qua Ant Design và các thư viện animation.

- Thành viên C: Đảm nhận vai trò Database Designer kiêm Backend Developer, chịu trách nhiệm thiết kế cơ sở dữ liệu với các bảng liên quan đến sản phẩm, đơn hàng, thanh toán và khuyến mãi, phát triển module Inventory và Promotion, viết migration scripts với Flyway, và hỗ trợ xây dựng RESTful API cùng với documentation sử dụng OpenAPI.

- Thành viên D: Đảm nhận vai trò UI/UX Designer kiêm Frontend Developer, thiết kế wireframe và mockup cho toàn bộ giao diện hệ thống, nghiên cứu trải nghiệm người dùng trong lĩnh vực thương mại điện tử đồng hồ, hỗ trợ xây dựng responsive design cho các thiết bị di động, và phát triển các component tái sử dụng trong React.

### Đánh giá mức độ đóng góp

Mức độ đóng góp của các thành viên được đánh giá dựa trên khối lượng công việc hoàn thành, chất lượng code được commit, mức độ tham gia vào các buổi họp nhóm, và khả năng giải quyết vấn đề phát sinh trong quá trình phát triển. Các thành viên đều tích cực tham gia vào quá trình phát triển, thường xuyên trao đổi thông qua các công cụ như Git, Discord, và có trách nhiệm cao trong việc hoàn thành đúng tiến độ các task được giao.

## 1.2. Giới thiệu tổng quan về đề tài

### Bối cảnh và lý do chọn đề tài

Trong bối cảnh nền kinh tế số đang phát triển mạnh mẽ tại Việt Nam, thương mại điện tử đã trở thành xu hướng tất yếu và ngày càng khẳng định vị thế quan trọng trong đời sống tiêu dùng. Theo báo cáo của Hiệp hội Thương mại điện tử Việt Nam, quy mô thị trường thương mại điện tử Việt Nam đạt hơn 20 tỷ USD vào năm 2023 và dự kiến sẽ tiếp tục tăng trưởng với tốc độ hai con số trong những năm tới. Sự phát triển này được thúc đẩy bởi nhiều yếu tố, trong đó có sự gia tăng của người dùng Internet, sự phổ biến của thiết bị di động, và đặc biệt là sự thay đổi trong hành vi mua sắm của người tiêu dùng sau đại dịch COVID-19.

Trong phân khúc hàng cao cấp, đồng hồ không chỉ đơn thuần là công cụ xem thời gian mà còn là biểu tượng của đẳng cấp, phong cách sống và sở thích cá nhân. Thị trường đồng hồ tại Việt Nam đang chứng kiến sự tăng trưởng đáng kể với sức mua ngày càng cao từ tầng lớp trung lưu và những người có thu nhập khá. Tuy nhiên, việc mua sắm đồng hồ tại các cửa hàng truyền thống thường gặp phải một số hạn chế như phạm vi lựa chọn bị giới hạn bởi không gian trưng bày, khó so sánh giá cả giữa các thương hiệu khác nhau, và đặc biệt là không thuận tiện về mặt thời gian cho những người bận rộn.

Nhận thấy khoảng trống này trong thị trường, nhóm đã quyết định phát triển một nền tảng thương mại điện tử chuyên biệt về đồng hồ với tên gọi "Watchify". Tên gọi "Watchify" được ghép từ "Watch" (đồng hồ) và hậu tố "-ify" (làm cho, tạo ra), thể hiện sứ mệnh của nền tảng là "làm cho việc mua sắm đồng hồ trở nên dễ dàng hơn". Việc chuyên môn hóa vào một ngành hàng cụ thể cho phép nhóm tập trung sâu vào nhu cầu đặc thù của khách hàng yêu thích đồng hồ, từ đó xây dựng trải nghiệm mua sắm tối ưu với đầy đủ thông tin chi tiết về sản phẩm, hình ảnh chất lượng cao, đánh giá từ người dùng thực tế, và hệ thống tìm kiếm thông minh.

### Nhu cầu thị trường và tính cấp thiết

Nhu cầu về một nền tảng thương mại điện tử chuyên về đồng hồ xuất phát từ nhiều góc độ khác nhau. Từ phía người tiêu dùng, họ mong muốn có được một kênh mua sắm đáng tin cậy, nơi họ có thể dễ dàng tìm kiếm, so sánh và lựa chọn sản phẩm phù hợp với nhu cầu và ngân sách của mình mà không cần phải di chuyển đến nhiều cửa hàng khác nhau. Đặc biệt, đối với các sản phẩm đồng hồ cao cấp, khách hàng rất quan tâm đến tính xác thực của sản phẩm, chế độ bảo hành, và dịch vụ hậu mãi. Do đó, một nền tảng chuyên nghiệp với đầy đủ thông tin sản phẩm, chứng nhận chính hãng, và chính sách rõ ràng sẽ tạo được lòng tin và thu hút được lượng lớn khách hàng tiềm năng.

Từ phía các nhà kinh doanh đồng hồ, việc mở rộng kênh bán hàng trực tuyến giúp họ tiếp cận được với phạm vi khách hàng rộng hơn mà không bị giới hạn bởi vị trí địa lý. Chi phí vận hành một cửa hàng online thấp hơn đáng kể so với cửa hàng truyền thống, đồng thời dữ liệu về hành vi người dùng từ nền tảng có thể giúp họ hiểu rõ hơn về nhu cầu thị trường và điều chỉnh chiến lược kinh doanh phù hợp. Hơn nữa, trong bối cảnh cạnh tranh ngày càng gay gắt, việc có mặt trên các nền tảng số không chỉ là lựa chọn mà đã trở thành yêu cầu bắt buộc để duy trì và phát triển kinh doanh.

Tính cấp thiết của dự án còn được thể hiện qua góc độ công nghệ và đào tạo. Việc xây dựng một hệ thống thương mại điện tử hoàn chỉnh đòi hỏi sự tích hợp của nhiều kiến thức và kỹ năng khác nhau, từ phân tích yêu cầu, thiết kế cơ sở dữ liệu, xây dựng API RESTful, bảo mật thông tin, xử lý thanh toán trực tuyến, cho đến tối ưu hóa trải nghiệm người dùng. Đây chính là cơ hội để nhóm áp dụng và củng cố các kiến thức đã học, đồng thời phát triển thêm các kỹ năng thực tiễn trong môi trường dự án thực tế với quy mô và độ phức tạp tương đối cao.

## 1.3. Mục tiêu thực hiện

### Mục tiêu về mặt kinh doanh

Về mặt kinh doanh, mục tiêu hàng đầu của dự án Watchify là xây dựng một nền tảng thương mại điện tử có khả năng cạnh tranh, đáp ứng đầy đủ các nhu cầu cơ bản và nâng cao của cả khách hàng lẫn người quản trị. Hệ thống cần đảm bảo cung cấp trải nghiệm mua sắm trực tuyến mượt mà, từ khâu tìm kiếm và lựa chọn sản phẩm, thêm vào giỏ hàng, cho đến thanh toán và theo dõi đơn hàng. Việc tích hợp các tính năng như đánh giá và nhận xét từ người dùng, danh sách yêu thích, lịch sử đơn hàng, và hệ thống khuyến mãi sẽ giúp nâng cao sự gắn kết của khách hàng với nền tảng.

Ngoài ra, hệ thống cần hỗ trợ hiệu quả cho công tác quản trị thông qua bảng điều khiển quản trị viên với đầy đủ chức năng quản lý sản phẩm, đơn hàng, người dùng, đánh giá và thống kê. Khả năng theo dõi và phân tích dữ liệu kinh doanh như doanh thu, sản phẩm bán chạy, tỷ lệ chuyển đổi sẽ hỗ trợ việc ra quyết định kinh doanh một cách khoa học và chính xác. Hệ thống cũng cần đảm bảo khả năng mở rộng trong tương lai khi có nhu cầu thêm tính năng mới hoặc mở rộng quy mô hoạt động.

### Mục tiêu về mặt kỹ thuật

Về mặt kỹ thuật, dự án đặt ra mục tiêu xây dựng một hệ thống với kiến trúc hiện đại, tuân thủ các best practices trong phát triển phần mềm. Cụ thể, Backend được thiết kế theo mô hình Modular Monolithic Architecture kết hợp với các nguyên tắc Domain-Driven Design, giúp hệ thống có cấu trúc rõ ràng, dễ bảo trì và có khả năng chuyển đổi sang Microservices trong tương lai nếu cần thiết. Việc tổ chức code theo các module độc lập như Identity, Catalog, Order, Inventory, Payment và Promotion không chỉ giúp phân tách trách nhiệm rõ ràng mà còn tạo điều kiện cho nhiều developer có thể làm việc song song mà không gây xung đột.

Hệ thống cần đảm bảo tính bảo mật cao thông qua việc áp dụng Spring Security kết hợp với JWT (JSON Web Token) cho việc xác thực và phân quyền người dùng. Mọi dữ liệu nhạy cảm như mật khẩu phải được mã hóa, các API endpoint cần được bảo vệ phù hợp với vai trò của người dùng, và hệ thống phải có khả năng chống lại các cuộc tấn công phổ biến như SQL Injection, XSS, CSRF. Việc tích hợp cổng thanh toán MoMo cũng đòi hỏi phải tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật trong xử lý thông tin thanh toán.

Về hiệu năng, hệ thống cần được tối ưu hóa để đảm bảo thời gian phản hồi nhanh chóng ngay cả khi có nhiều người dùng truy cập đồng thời. Điều này đạt được thông qua việc thiết kế cơ sở dữ liệu hợp lý với các index phù hợp, sử dụng lazy loading cho các quan hệ trong JPA, và áp dụng pagination cho các danh sách dữ liệu lớn. Frontend cần được xây dựng với React và các công nghệ hiện đại như Vite để đảm bảo tốc độ tải trang nhanh và trải nghiệm người dùng mượt mà.

Cuối cùng, dự án cũng đặt mục tiêu về tính khả dụng và khả năng bảo trì. Toàn bộ source code cần được viết theo coding conventions rõ ràng, có đầy đủ comment và documentation để người khác có thể dễ dàng hiểu và tiếp tục phát triển. Việc sử dụng Docker và docker-compose giúp việc triển khai và chạy ứng dụng trở nên đơn giản và nhất quán trên các môi trường khác nhau. API documentation được tạo tự động bằng OpenAPI (Swagger) giúp frontend developer dễ dàng tích hợp mà không cần trao đổi quá nhiều với backend team.

Thông qua việc đạt được các mục tiêu trên, dự án Watchify không chỉ đáp ứng yêu cầu học thuật mà còn có tiềm năng trở thành một sản phẩm thực tế có thể triển khai và vận hành trong môi trường production, góp phần thúc đẩy sự phát triển của ngành thương mại điện tử nói chung và phân khúc đồng hồ cao cấp nói riêng.