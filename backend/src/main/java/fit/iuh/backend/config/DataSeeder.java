package fit.iuh.backend.config;

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
import fit.iuh.backend.modules.identity.domain.repository.RoleRepository;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.modules.identity.domain.repository.AddressRepository;
import fit.iuh.backend.modules.inventory.domain.entity.Inventory;
import fit.iuh.backend.modules.inventory.domain.repository.InventoryRepository;
import fit.iuh.backend.sharedkernel.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
                    createBrand("Casio", "Đồng hồ điện tử chất lượng từ Nhật Bản", 2),
                    createBrand("Omega", "Đồng hồ Thụy Sĩ cao cấp", 3),
                    createBrand("Seiko", "Đồng hồ Nhật Bản uy tín", 4),
                    createBrand("Citizen", "Đồng hồ Eco-Drive tiên phong", 5)
            );

            brandRepository.saveAll(brands);
            log.info("Seeded {} brands", brands.size());
        }
    }

    private Brand createBrand(String name, String description, int displayOrder) {
        return Brand.builder()
                .name(name)
                .slug(SlugUtils.toSlug(name))
                .description(description)
                .logoUrl("https://via.placeholder.com/200x100?text=" + name)
                .websiteUrl("https://" + name.toLowerCase() + ".com")
                .isActive(true)
                .displayOrder(displayOrder)
                .build();
    }

    private void seedProducts() {
        if (productRepository.count() == 0) {
            Category menCategory = categoryRepository.findBySlug(SlugUtils.toSlug("Đồng hồ Nam"))
                    .orElseThrow();
            Brand rolex = brandRepository.findBySlug("rolex").orElseThrow();
            Brand casio = brandRepository.findBySlug("casio").orElseThrow();

            List<Product> products = new ArrayList<>();

            // Product 1: Rolex Submariner
            Product rolex1 = createProduct(
                    "Rolex Submariner Date",
                    "ROLEX-SUB-001",
                    "Đồng hồ lặn huyền thoại với thiết kế iconic",
                    "Submariner Date - biểu tượng của đồng hồ lặn cao cấp",
                    new BigDecimal("250000000"),
                    new BigDecimal("280000000"),
                    rolex.getId(),
                    menCategory.getId(),
                    true,
                    false
            );

            Product casio1 = createProduct(
                    "Casio G-Shock GA-2100",
                    "CASIO-GA2100-001",
                    "G-Shock thế hệ mới với thiết kế mỏng nhẹ",
                    "GA-2100 - CasiOak siêu phẩm từ G-Shock",
                    new BigDecimal("3500000"),
                    new BigDecimal("4000000"),
                    casio.getId(),
                    menCategory.getId(),
                    true,
                    true
            );

            Product casio2 = createProduct(
                    "Casio Edifice EFR-556",
                    "CASIO-EFR556-001",
                    "Đồng hồ Edifice phong cách thể thao thanh lịch",
                    "EFR-556 - Edifice cho phong cách hiện đại",
                    new BigDecimal("4200000"),
                    new BigDecimal("5000000"),
                    casio.getId(),
                    menCategory.getId(),
                    false,
                    true
            );

            products.addAll(List.of(rolex1, casio1, casio2));
            productRepository.saveAll(products);

            // Add product images
            seedProductImages(rolex1.getId(), "Rolex Submariner");
            seedProductImages(casio1.getId(), "Casio G-Shock");
            seedProductImages(casio2.getId(), "Casio Edifice");

            // Add product details
            seedProductDetail(rolex1.getId(), "Automatic", "Oystersteel", "41mm");
            seedProductDetail(casio1.getId(), "Quartz", "Resin", "45mm");
            seedProductDetail(casio2.getId(), "Quartz", "Stainless Steel", "43mm");

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
        List<ProductImage> images = List.of(
                ProductImage.builder()
                        .productId(productId)
                        .imageUrl("https://via.placeholder.com/800x800?text=" + productName + "+Main")
                        .altText(productName + " main image")
                        .displayOrder(1)
                        .isMain(true)
                        .build(),
                ProductImage.builder()
                        .productId(productId)
                        .imageUrl("https://via.placeholder.com/800x800?text=" + productName + "+2")
                        .altText(productName + " image 2")
                        .displayOrder(2)
                        .isMain(false)
                        .build(),
                ProductImage.builder()
                        .productId(productId)
                        .imageUrl("https://via.placeholder.com/800x800?text=" + productName + "+3")
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
