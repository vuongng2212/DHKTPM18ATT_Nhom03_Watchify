package fit.iuh.backend.sharedkernel.config;

import fit.iuh.backend.modules.catalog.domain.entity.*;
import fit.iuh.backend.modules.catalog.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Data seeder to populate initial data for development
 */
@ConditionalOnProperty(value = "app.seeder.enabled", havingValue = "true", matchIfMissing = false)
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            seedCategories();
            log.info("Seeded categories");
        }

        if (brandRepository.count() == 0) {
            seedBrands();
            log.info("Seeded brands");
        }

        if (productRepository.count() == 0) {
            seedProducts();
            log.info("Seeded products");
        }
    }

    private void seedCategories() {
        List<Category> categories = Arrays.asList(
            Category.builder()
                .name("Nam")
                .slug("nam")
                .description("Đồng hồ dành cho nam")
                .displayOrder(1)
                .isActive(true)
                .build(),
            Category.builder()
                .name("Nữ")
                .slug("nu")
                .description("Đồng hồ dành cho nữ")
                .displayOrder(2)
                .isActive(true)
                .build(),
            Category.builder()
                .name("Couple")
                .slug("couple")
                .description("Đồng hồ dành cho cặp đôi")
                .displayOrder(3)
                .isActive(true)
                .build()
        );
        categoryRepository.saveAll(categories);
    }

    private void seedBrands() {
        List<Brand> brands = Arrays.asList(
            Brand.builder()
                .name("Rolex")
                .slug("rolex")
                .description("Thương hiệu đồng hồ cao cấp")
                .logoUrl("https://example.com/rolex-logo.png")
                .websiteUrl("https://www.rolex.com")
                .displayOrder(1)
                .isActive(true)
                .build(),
            Brand.builder()
                .name("Omega")
                .slug("omega")
                .description("Thương hiệu đồng hồ Thụy Sĩ")
                .logoUrl("https://example.com/omega-logo.png")
                .websiteUrl("https://www.omegawatches.com")
                .displayOrder(2)
                .isActive(true)
                .build(),
            Brand.builder()
                .name("Seiko")
                .slug("seiko")
                .description("Thương hiệu đồng hồ Nhật Bản")
                .logoUrl("https://example.com/seiko-logo.png")
                .websiteUrl("https://www.seiko.com")
                .displayOrder(3)
                .isActive(true)
                .build(),
            Brand.builder()
                .name("Casio")
                .slug("casio")
                .description("Thương hiệu đồng hồ điện tử")
                .logoUrl("https://example.com/casio-logo.png")
                .websiteUrl("https://www.casio.com")
                .displayOrder(4)
                .isActive(true)
                .build()
        );
        brandRepository.saveAll(brands);
    }

    private void seedProducts() {
        Category namCategory = categoryRepository.findBySlug("nam").orElseThrow();
        Category nuCategory = categoryRepository.findBySlug("nu").orElseThrow();
        Category coupleCategory = categoryRepository.findBySlug("couple").orElseThrow();

        Brand rolexBrand = brandRepository.findBySlug("rolex").orElseThrow();
        Brand omegaBrand = brandRepository.findBySlug("omega").orElseThrow();
        Brand seikoBrand = brandRepository.findBySlug("seiko").orElseThrow();
        Brand casioBrand = brandRepository.findBySlug("casio").orElseThrow();

        List<Product> products = Arrays.asList(
            // Nam products
            Product.builder()
                .name("Đồng Hồ Rolex Submariner")
                .slug("dong-ho-rolex-submariner")
                .sku("RLX-SUB-001")
                .description("Đồng hồ lặn cao cấp từ Rolex")
                .price(new BigDecimal("150000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(namCategory.getId())
                .brandId(rolexBrand.getId())
                .isFeatured(true)
                .isNew(true)
                .build(),
            Product.builder()
                .name("Đồng Hồ Omega Speedmaster")
                .slug("dong-ho-omega-speedmaster")
                .sku("OMG-SPD-001")
                .description("Đồng hồ chronograph huyền thoại")
                .price(new BigDecimal("120000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(namCategory.getId())
                .brandId(omegaBrand.getId())
                .isFeatured(true)
                .build(),
            Product.builder()
                .name("Đồng Hồ Seiko Presage")
                .slug("dong-ho-seiko-presage")
                .sku("SEI-PRE-001")
                .description("Đồng hồ automatic Nhật Bản")
                .price(new BigDecimal("25000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(namCategory.getId())
                .brandId(seikoBrand.getId())
                .isNew(true)
                .build(),

            // Nữ products
            Product.builder()
                .name("Đồng Hồ Rolex Lady-Datejust")
                .slug("dong-ho-rolex-lady-datejust")
                .sku("RLX-LDJ-001")
                .description("Đồng hồ nữ thanh lịch từ Rolex")
                .price(new BigDecimal("180000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(nuCategory.getId())
                .brandId(rolexBrand.getId())
                .isFeatured(true)
                .build(),
            Product.builder()
                .name("Đồng Hồ Omega Constellation")
                .slug("dong-ho-omega-constellation")
                .sku("OMG-CON-001")
                .description("Đồng hồ nữ với thiết kế tinh tế")
                .price(new BigDecimal("90000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(nuCategory.getId())
                .brandId(omegaBrand.getId())
                .isFeatured(true)
                .build(),
            Product.builder()
                .name("Đồng Hồ Seiko Presage Nữ")
                .slug("dong-ho-seiko-presage-nu")
                .sku("SEI-PRE-NU-001")
                .description("Đồng hồ nữ automatic Nhật Bản")
                .price(new BigDecimal("20000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(nuCategory.getId())
                .brandId(seikoBrand.getId())
                .build(),

            // Couple products
            Product.builder()
                .name("Bộ Đồng Hồ Couple Rolex")
                .slug("bo-dong-ho-couple-rolex")
                .sku("RLX-CPL-001")
                .description("Bộ đồng hồ cặp đôi cao cấp")
                .price(new BigDecimal("300000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(coupleCategory.getId())
                .brandId(rolexBrand.getId())
                .isFeatured(true)
                .build(),
            Product.builder()
                .name("Bộ Đồng Hồ Couple Omega")
                .slug("bo-dong-ho-couple-omega")
                .sku("OMG-CPL-001")
                .description("Bộ đồng hồ cặp đôi Thụy Sĩ")
                .price(new BigDecimal("200000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(coupleCategory.getId())
                .brandId(omegaBrand.getId())
                .build(),
            Product.builder()
                .name("Bộ Đồng Hồ Couple Seiko")
                .slug("bo-dong-ho-couple-seiko")
                .sku("SEI-CPL-001")
                .description("Bộ đồng hồ cặp đôi Nhật Bản")
                .price(new BigDecimal("40000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(coupleCategory.getId())
                .brandId(seikoBrand.getId())
                .build(),

            // More products
            Product.builder()
                .name("Đồng Hồ Casio G-Shock")
                .slug("dong-ho-casio-g-shock")
                .sku("CAS-GSH-001")
                .description("Đồng hồ chống shock nổi tiếng")
                .price(new BigDecimal("5000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(namCategory.getId())
                .brandId(casioBrand.getId())
                .build(),
            Product.builder()
                .name("Đồng Hồ Casio Edifice")
                .slug("dong-ho-casio-edifice")
                .sku("CAS-EDF-001")
                .description("Đồng hồ thể thao Nhật Bản")
                .price(new BigDecimal("8000000"))
                .status(ProductStatus.ACTIVE)
                .categoryId(namCategory.getId())
                .brandId(casioBrand.getId())
                .build()
        );

        List<Product> savedProducts = productRepository.saveAll(products);

        // Seed images for products
        for (Product product : savedProducts) {
            ProductImage image = ProductImage.builder()
                .productId(product.getId())
                .imageUrl("https://example.com/watch-" + product.getSlug() + ".jpg")
                .isMain(true)
                .displayOrder(1)
                .build();
            productImageRepository.save(image);
        }
    }
}