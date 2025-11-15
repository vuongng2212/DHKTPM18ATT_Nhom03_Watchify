package fit.iuh.backend.config;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import fit.iuh.backend.modules.catalog.domain.entity.Brand;
import fit.iuh.backend.modules.catalog.domain.entity.Category;
import fit.iuh.backend.modules.catalog.domain.entity.Product;
import fit.iuh.backend.modules.catalog.domain.entity.ProductDetail;
import fit.iuh.backend.modules.catalog.domain.entity.ProductImage;
import fit.iuh.backend.modules.catalog.domain.entity.ProductStatus;
import fit.iuh.backend.modules.catalog.domain.repository.BrandRepository;
import fit.iuh.backend.modules.catalog.domain.repository.CategoryRepository;
import fit.iuh.backend.modules.catalog.domain.repository.ProductDetailRepository;
import fit.iuh.backend.modules.catalog.domain.repository.ProductImageRepository;
import fit.iuh.backend.modules.catalog.domain.repository.ProductRepository;
import fit.iuh.backend.modules.identity.domain.entity.Address;
import fit.iuh.backend.modules.identity.domain.entity.AddressType;
import fit.iuh.backend.modules.identity.domain.entity.Role;
import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.identity.domain.entity.UserStatus;
import fit.iuh.backend.modules.identity.domain.repository.AddressRepository;
import fit.iuh.backend.modules.identity.domain.repository.RoleRepository;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.modules.inventory.domain.entity.Inventory;
import fit.iuh.backend.modules.inventory.domain.repository.InventoryRepository;
import fit.iuh.backend.sharedkernel.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Data seeder for development environment
 */
@Configuration
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductDetailRepository productDetailRepository;
    private final InventoryRepository inventoryRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            log.info("Starting data seeding...");

            // 1. Seed Roles
            seedRoles();

            // 2. Seed Users
            seedUsers();

            // 3. Seed Categories
            seedCategories();

            // 4. Seed Brands
            seedBrands();

            // 5. Seed Products
            seedProducts();

            // 6. Seed Inventory
            seedInventories();
            seedAddresses();

            log.info("Data seeding completed!");
        };
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            Role adminRole = Role.builder()
                    .name("ROLE_ADMIN")
                    .description("Administrator role with full access")
                    .build();

            Role customerRole = Role.builder()
                    .name("ROLE_CUSTOMER")
                    .description("Customer role for regular users")
                    .build();

            roleRepository.saveAll(List.of(adminRole, customerRole));
            log.info("Seeded 2 roles: ADMIN, CUSTOMER");
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
            Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

            // Admin user
            User admin = User.builder()
                    .email("admin@watchify.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .phone("0123456789")
                    .status(UserStatus.ACTIVE)
                    .build();
            admin.getRoles().add(adminRole);

            // Customer user
            User customer = User.builder()
                    .email("customer@example.com")
                    .password(passwordEncoder.encode("customer123"))
                    .firstName("John")
                    .lastName("Doe")
                    .phone("0987654321")
                    .status(UserStatus.ACTIVE)
                    .build();
            customer.getRoles().add(customerRole);

            userRepository.saveAll(List.of(admin, customer));
            log.info("Seeded 2 users: admin@watchify.com, customer@example.com");
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> categories = new ArrayList<>();

            // Root categories
            Category men = createCategory("Đồng hồ Nam", null, 1);
            Category women = createCategory("Đồng hồ Nữ", null, 2);
            Category unisex = createCategory("Đồng hồ Unisex", null, 3);
            Category luxury = createCategory("Đồng hồ Cao Cấp", null, 4);

            categories.addAll(List.of(men, women, unisex, luxury));
            categoryRepository.saveAll(categories);

            // Child categories for Men
            List<Category> menSubs = List.of(
                    createCategory("Cơ học", men.getId(), 1),
                    createCategory("Điện tử", men.getId(), 2),
                    createCategory("Thể thao", men.getId(), 3)
            );
            categoryRepository.saveAll(menSubs);

            log.info("Seeded {} categories", 4 + menSubs.size());
        }
    }

    private Category createCategory(String name, UUID parentId, int displayOrder) {
        return Category.builder()
                .name(name)
                .slug(SlugUtils.toSlug(name))
                .description("Danh mục " + name)
                .parentId(parentId)
                .displayOrder(displayOrder)
                .isActive(true)
                .build();
    }

    private void seedBrands() {
        if (brandRepository.count() == 0) {
            List<Brand> brands = List.of(
                    createBrand("Rolex", "Thương hiệu đồng hồ xa xỉ hàng đầu thế giới", 1),
                    createBrand("Omega", "Đồng hồ Thụy Sĩ cao cấp", 2),
                    createBrand("Seiko", "Đồng hồ Nhật Bản uy tín", 3),
                    createBrand("Casio", "Đồng hồ điện tử chất lượng từ Nhật Bản", 4),
                    createBrand("Citizen", "Đồng hồ Eco-Drive tiên phong", 5),
                    createBrand("Tissot", "Đồng hồ Thụy Sĩ giá cả phải chăng", 6),
                    createBrand("Orient", "Đồng hồ Nhật Bản với công nghệ tiên tiến", 7),
                    createBrand("Hamilton", "Đồng hồ Mỹ với thiết kế cổ điển", 8),
                    createBrand("IWC", "Đồng hồ Thụy Sĩ cao cấp", 9),
                    createBrand("Tag Heuer", "Đồng hồ thể thao và sang trọng", 10)
            );

            brandRepository.saveAll(brands);
            log.info("Seeded {} brands", brands.size());
        }
    }

    private Brand createBrand(String name, String description, int displayOrder) {
        String logoUrl;
        switch (name.toLowerCase()) {
            case "rolex":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/11/Rolex-Logo.png";
                break;
            case "omega":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/11/Omega-Logo.png";
                break;
            case "seiko":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/12/Seiko-Logo.png";
                break;
            case "casio":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/12/Casio-Logo.png";
                break;
            case "citizen":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/12/Citizen-Logo.png";
                break;
            case "tissot":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/12/Tissot-Logo.png";
                break;
            case "orient":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/12/Orient-Logo.png";
                break;
            case "hamilton":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/12/Hamilton-Logo.png";
                break;
            case "iwc":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/12/IWC-Logo.png";
                break;
            case "tag heuer":
                logoUrl = "https://logos-world.net/wp-content/uploads/2020/12/Tag-Heuer-Logo.png";
                break;
            default:
                logoUrl = "https://via.placeholder.com/200x100?text=" + name;
        }

        return Brand.builder()
                .name(name)
                .slug(SlugUtils.toSlug(name))
                .description(description)
                .logoUrl(logoUrl)
                .websiteUrl("https://" + name.toLowerCase().replace(" ", "") + ".com")
                .isActive(true)
                .displayOrder(displayOrder)
                .build();
    }

    private void seedProducts() {
        if (productRepository.count() == 0) {
            Category menCategory = categoryRepository.findBySlug(SlugUtils.toSlug("Đồng hồ Nam"))
                    .orElseThrow();
            Category womenCategory = categoryRepository.findBySlug(SlugUtils.toSlug("Đồng hồ Nữ"))
                    .orElseThrow();
            Category unisexCategory = categoryRepository.findBySlug(SlugUtils.toSlug("Đồng hồ Unisex"))
                    .orElseThrow();
            Category luxuryCategory = categoryRepository.findBySlug(SlugUtils.toSlug("Đồng hồ Cao Cấp"))
                    .orElseThrow();

            Brand rolex = brandRepository.findBySlug("rolex").orElseThrow();
            Brand omega = brandRepository.findBySlug("omega").orElseThrow();
            Brand seiko = brandRepository.findBySlug("seiko").orElseThrow();
            Brand casio = brandRepository.findBySlug("casio").orElseThrow();
            Brand citizen = brandRepository.findBySlug("citizen").orElseThrow();
            Brand tissot = brandRepository.findBySlug("tissot").orElseThrow();
            Brand orient = brandRepository.findBySlug("orient").orElseThrow();
            Brand hamilton = brandRepository.findBySlug("hamilton").orElseThrow();
            Brand iwc = brandRepository.findBySlug("iwc").orElseThrow();
            Brand tagHeuer = brandRepository.findBySlug("tag-heuer").orElseThrow();

            List<Product> products = new ArrayList<>();

            // Men's watches
            products.addAll(List.of(
                createProduct("Rolex Submariner Date", "ROLEX-SUB-001", "Đồng hồ lặn huyền thoại với thiết kế iconic", "Submariner Date - biểu tượng của đồng hồ lặn cao cấp", new BigDecimal("250000000"), new BigDecimal("280000000"), rolex.getId(), menCategory.getId(), true, false),
                createProduct("Omega Speedmaster", "OMEGA-SPD-001", "Đồng hồ chronograph huyền thoại", "Speedmaster - 'Moonwatch' của NASA", new BigDecimal("180000000"), new BigDecimal("200000000"), omega.getId(), menCategory.getId(), true, false),
                createProduct("Seiko Presage Automatic", "SEIKO-PRE-001", "Đồng hồ automatic Nhật Bản tinh tế", "Presage - sự kết hợp hoàn hảo giữa truyền thống và hiện đại", new BigDecimal("15000000"), new BigDecimal("18000000"), seiko.getId(), menCategory.getId(), false, true),
                createProduct("Casio G-Shock GA-2100", "CASIO-GA2100-001", "G-Shock thế hệ mới với thiết kế mỏng nhẹ", "GA-2100 - CasiOak siêu phẩm từ G-Shock", new BigDecimal("3500000"), new BigDecimal("4000000"), casio.getId(), menCategory.getId(), true, true),
                createProduct("Casio Edifice EFR-556", "CASIO-EFR556-001", "Đồng hồ Edifice phong cách thể thao thanh lịch", "EFR-556 - Edifice cho phong cách hiện đại", new BigDecimal("4200000"), new BigDecimal("5000000"), casio.getId(), menCategory.getId(), false, true),
                createProduct("Tissot Le Locle", "TISSOT-LEL-001", "Đồng hồ automatic Thụy Sĩ giá tốt", "Le Locle - phong cách cổ điển với chất lượng Thụy Sĩ", new BigDecimal("25000000"), new BigDecimal("30000000"), tissot.getId(), menCategory.getId(), false, false),
                createProduct("Orient Bambino", "ORIENT-BAM-001", "Đồng hồ automatic Nhật Bản với giá hợp lý", "Bambino - sự lựa chọn hoàn hảo cho người mới bắt đầu", new BigDecimal("8000000"), new BigDecimal("10000000"), orient.getId(), menCategory.getId(), false, true),
                createProduct("Hamilton Khaki Field", "HAMILTON-KHA-001", "Đồng hồ quân đội với thiết kế rugged", "Khaki Field - đồng hồ phiêu lưu", new BigDecimal("12000000"), new BigDecimal("15000000"), hamilton.getId(), menCategory.getId(), false, false)
            ));

            // Women's watches
            products.addAll(List.of(
                createProduct("Rolex Lady-Datejust", "ROLEX-LDJ-001", "Đồng hồ nữ thanh lịch từ Rolex", "Lady-Datejust - sự tinh tế và đẳng cấp", new BigDecimal("220000000"), new BigDecimal("250000000"), rolex.getId(), womenCategory.getId(), true, false),
                createProduct("Omega Constellation", "OMEGA-CON-001", "Đồng hồ nữ với thiết kế tinh tế", "Constellation - biểu tượng của sự sang trọng", new BigDecimal("150000000"), new BigDecimal("170000000"), omega.getId(), womenCategory.getId(), true, false),
                createProduct("Seiko Presage Women's", "SEIKO-PRE-W-001", "Đồng hồ nữ automatic Nhật Bản", "Presage - dành cho phái đẹp", new BigDecimal("12000000"), new BigDecimal("15000000"), seiko.getId(), womenCategory.getId(), false, true),
                createProduct("Citizen Eco-Drive Women's", "CITIZEN-ECO-W-001", "Đồng hồ nữ chạy bằng năng lượng mặt trời", "Eco-Drive - công nghệ xanh cho phái đẹp", new BigDecimal("8000000"), new BigDecimal("10000000"), citizen.getId(), womenCategory.getId(), false, true),
                createProduct("Tissot T-Touch Expert Solar", "TISSOT-TTE-001", "Đồng hồ nữ với tính năng cảm ứng", "T-Touch - công nghệ tiên tiến", new BigDecimal("20000000"), new BigDecimal("25000000"), tissot.getId(), womenCategory.getId(), false, false)
            ));

            // Unisex watches
            products.addAll(List.of(
                createProduct("Bộ Đồng Hồ Couple Rolex", "ROLEX-CPL-001", "Bộ đồng hồ cặp đôi Rolex", "Couple Rolex - dành cho những cặp đôi đẳng cấp", new BigDecimal("500000000"), new BigDecimal("550000000"), rolex.getId(), unisexCategory.getId(), true, false),
                createProduct("Bộ Đồng Hồ Couple Omega", "OMEGA-CPL-001", "Bộ đồng hồ cặp đôi Omega", "Couple Omega - sự kết hợp hoàn hảo", new BigDecimal("300000000"), new BigDecimal("330000000"), omega.getId(), unisexCategory.getId(), true, false),
                createProduct("Bộ Đồng Hồ Couple Seiko", "SEIKO-CPL-001", "Bộ đồng hồ cặp đôi Seiko", "Couple Seiko - lãng mạn và tinh tế", new BigDecimal("30000000"), new BigDecimal("35000000"), seiko.getId(), unisexCategory.getId(), false, true),
                createProduct("IWC Pilot's Watch", "IWC-PIL-001", "Đồng hồ phi công với thiết kế cổ điển", "Pilot's Watch - cho những người yêu phiêu lưu", new BigDecimal("200000000"), new BigDecimal("220000000"), iwc.getId(), unisexCategory.getId(), true, false),
                createProduct("Tag Heuer Carrera", "TAG-CAR-001", "Đồng hồ thể thao sang trọng", "Carrera - biểu tượng của tốc độ", new BigDecimal("80000000"), new BigDecimal("90000000"), tagHeuer.getId(), unisexCategory.getId(), true, false)
            ));

            // Luxury watches
            products.addAll(List.of(
                createProduct("Rolex Daytona", "ROLEX-DAY-001", "Đồng hồ chronograph huyền thoại", "Daytona - dành cho những tay đua", new BigDecimal("350000000"), new BigDecimal("380000000"), rolex.getId(), luxuryCategory.getId(), true, false),
                createProduct("Omega Seamaster", "OMEGA-SEA-001", "Đồng hồ lặn cao cấp", "Seamaster - chinh phục đại dương", new BigDecimal("250000000"), new BigDecimal("280000000"), omega.getId(), luxuryCategory.getId(), true, false),
                createProduct("IWC Portugieser", "IWC-POR-001", "Đồng hồ automatic với thiết kế tinh xảo", "Portugieser - sự tinh tế của Thụy Sĩ", new BigDecimal("180000000"), new BigDecimal("200000000"), iwc.getId(), luxuryCategory.getId(), true, false),
                createProduct("Tag Heuer Monaco", "TAG-MON-001", "Đồng hồ square với lịch sử", "Monaco - chiếc đồng hồ vuông đầu tiên", new BigDecimal("150000000"), new BigDecimal("170000000"), tagHeuer.getId(), luxuryCategory.getId(), true, false)
            ));

            productRepository.saveAll(products);

            // Add product images
            for (Product product : products) {
                seedProductImages(product.getId(), product.getName());
            }

            // Add product details
            for (Product product : products) {
                String movement = product.getName().contains("Automatic") || product.getName().contains("Rolex") || product.getName().contains("Omega") ? "Automatic" : "Quartz";
                String caseMaterial = product.getName().contains("Rolex") || product.getName().contains("Omega") ? "Oystersteel" : "Stainless Steel";
                String caseDiameter = product.getName().contains("GA-2100") ? "45mm" : "41mm";
                seedProductDetail(product.getId(), movement, caseMaterial, caseDiameter);
            }

            log.info("Seeded {} products with images and details", products.size());
        }
    }

    private Product createProduct(String name, String sku, String description, String shortDescription,
                                   BigDecimal price, BigDecimal originalPrice, UUID brandId, UUID categoryId,
                                   boolean isFeatured, boolean isNew) {
        int discountPercent = originalPrice.compareTo(price) > 0
                ? originalPrice.subtract(price).multiply(new BigDecimal("100"))
                .divide(originalPrice, 0, java.math.RoundingMode.HALF_UP).intValue()
                : 0;

        return Product.builder()
                .name(name)
                .slug(SlugUtils.toSlug(name))
                .sku(sku)
                .description(description)
                .shortDescription(shortDescription)
                .price(price)
                .originalPrice(originalPrice)
                .discountPercentage(discountPercent)
                .status(ProductStatus.ACTIVE)
                .brandId(brandId)
                .categoryId(categoryId)
                .viewCount(Long.valueOf(0))
                .isFeatured(isFeatured)
                .isNew(isNew)
                .displayOrder(1)
                .build();
    }

    private void seedProductImages(UUID productId, String productName) {
        // Use real watch images from Unsplash
        String baseImageUrl = "https://images.unsplash.com/photo-";
        List<String> imageOptions = List.of(
            "1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Luxury watch
            "1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Watch closeup
            "1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Watch on wrist
            "1547996160-81dfa63595aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Rolex style
            "1587839624739-7b5c4b5b5b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Modern watch
            "1600000000000-000000000000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"  // Fallback
        );

        // Select image based on product name hash for consistency
        int imageIndex = Math.abs(productName.hashCode()) % imageOptions.size();
        String imageUrl = baseImageUrl + imageOptions.get(imageIndex);

        List<ProductImage> images = List.of(
                ProductImage.builder()
                        .productId(productId)
                        .imageUrl(imageUrl)
                        .altText(productName + " main image")
                        .displayOrder(1)
                        .isMain(true)
                        .build(),
                ProductImage.builder()
                        .productId(productId)
                        .imageUrl(baseImageUrl + imageOptions.get((imageIndex + 1) % imageOptions.size()))
                        .altText(productName + " image 2")
                        .displayOrder(2)
                        .isMain(false)
                        .build(),
                ProductImage.builder()
                        .productId(productId)
                        .imageUrl(baseImageUrl + imageOptions.get((imageIndex + 2) % imageOptions.size()))
                        .altText(productName + " image 3")
                        .displayOrder(3)
                        .isMain(false)
                        .build()
        );

        productImageRepository.saveAll(images);
    }

    private void seedInventories() {
        if (inventoryRepository.count() == 0) {
            List<Product> products = productRepository.findAll();

            for (Product product : products) {
                // Random quantity between 10-100
                int quantity = 10 + (int) (Math.random() * 90);

                Inventory inventory = Inventory.builder()
                        .product(product)
                        .quantity(quantity)
                        .reservedQuantity(0)
                        .location("Warehouse A")
                        .build();

                inventoryRepository.save(inventory);
            }

            log.info("Seeded inventory for {} products", products.size());
        }
    }

    private void seedProductDetail(UUID productId, String movement, String caseMaterial, String caseDiameter) {
        ProductDetail detail = ProductDetail.builder()
                .productId(productId)
                .movement(movement)
                .caseMaterial(caseMaterial)
                .caseDiameter(caseDiameter)
                .caseThickness("12mm")
                .dialColor("Black")
                .strapMaterial(caseMaterial)
                .strapColor("Black")
                .waterResistance("100m")
                .crystal("Sapphire")
                .weight("150g")
                .powerReserve(movement.equals("Automatic") ? "48 hours" : "5 years battery")
                .warranty("2 năm")
                .origin("Japan")
                .gender("Men")
                .additionalFeatures("Date display, Luminous hands")
                .build();

        productDetailRepository.save(detail);
    }

    private void seedAddresses() {
        if (addressRepository.count() == 0) {
            User customer = userRepository.findByEmail("customer@example.com").orElseThrow();

            List<Address> addresses = List.of(
                    Address.builder()
                            .user(customer)
                            .type(AddressType.SHIPPING)
                            .fullName("John Doe")
                            .phone("0987654321")
                            .street("123 Nguyen Trai Street")
                            .ward("Ward 1")
                            .district("District 1")
                            .city("Ho Chi Minh City")
                            .address("123 Nguyen Trai Street, Ward 1, District 1, Ho Chi Minh City")
                            .isDefault(true)
                            .build(),
                    Address.builder()
                            .user(customer)
                            .type(AddressType.BILLING)
                            .fullName("John Doe")
                            .phone("0987654321")
                            .street("456 Le Loi Street")
                            .ward("Ward 2")
                            .district("District 2")
                            .city("Ho Chi Minh City")
                            .address("456 Le Loi Street, Ward 2, District 2, Ho Chi Minh City")
                            .isDefault(false)
                            .build()
            );

            addressRepository.saveAll(addresses);
            log.info("Seeded {} addresses for customer", addresses.size());
        }
    }
}
