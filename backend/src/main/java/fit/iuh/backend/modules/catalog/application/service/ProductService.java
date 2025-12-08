package fit.iuh.backend.modules.catalog.application.service;

import fit.iuh.backend.modules.catalog.application.dto.*;
import fit.iuh.backend.modules.catalog.application.mapper.*;
import fit.iuh.backend.modules.catalog.application.specification.ProductSpecification;
import fit.iuh.backend.modules.catalog.domain.entity.*;
import fit.iuh.backend.modules.catalog.domain.repository.*;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Service for Product operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ReviewRepository reviewRepository;
    
    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;
    private final BrandMapper brandMapper;
    private final ProductImageMapper productImageMapper;
    private final ProductDetailMapper productDetailMapper;

    /**
     * Get products with filtering, sorting and pagination
     */
    public ProductListResponse getProducts(ProductFilterRequest filter, int page, int size) {
        // Build specification from filter
        Specification<Product> spec = ProductSpecification.filterBy(filter);
        
        // Build sort
        Sort sort = buildSort(filter.getSortBy(), filter.getSortDirection());
        
        // Build pageable
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Query products
        Page<Product> productPage = productRepository.findAll(spec, pageable);
        
        // Convert to DTOs
        Page<ProductDto> dtoPage = productPage.map(product -> {
            CategoryDto categoryDto = getCategoryDto(product.getCategoryId());
            BrandDto brandDto = getBrandDto(product.getBrandId());
            List<ProductImageDto> images = productImageMapper.toDtoList(
                productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId())
            );
            
            return productMapper.toDtoWithDetails(
                product, categoryDto, brandDto, images, null, null, null
            );
        });
        
        return productMapper.toListResponse(dtoPage);
    }

    /**
     * Get product by ID with full details
     */
    public ProductDto getProductById(UUID productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        // Load related data
        CategoryDto categoryDto = getCategoryDto(product.getCategoryId());
        BrandDto brandDto = getBrandDto(product.getBrandId());
        
        List<ProductImageDto> images = productImageMapper.toDtoList(
            productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId)
        );
        
        ProductDetailDto detailDto = productDetailRepository.findByProductId(productId)
            .map(productDetailMapper::toDto)
            .orElse(null);
        
        Double avgRating = reviewRepository.getAverageRating(productId);
        Long reviewCount = reviewRepository.countByProductIdAndStatus(productId, "APPROVED");
        
        return productMapper.toDtoWithDetails(
            product, categoryDto, brandDto, images, detailDto, avgRating, reviewCount
        );
    }

    /**
     * Get product by slug
     */
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        
        return getProductById(product.getId());
    }

    /**
     * Search products by keyword
     */
    public List<ProductDto> searchProducts(String keyword) {
        List<Product> products = productRepository.searchByKeyword(keyword, ProductStatus.ACTIVE);
        
        return products.stream()
            .map(product -> {
                CategoryDto categoryDto = getCategoryDto(product.getCategoryId());
                BrandDto brandDto = getBrandDto(product.getBrandId());
                List<ProductImageDto> images = productImageMapper.toDtoList(
                    productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId())
                );
                return productMapper.toDtoWithDetails(
                    product, categoryDto, brandDto, images, null, null, null
                );
            })
            .toList();
    }

    /**
     * Get featured products
     */
    public List<ProductDto> getFeaturedProducts(int limit) {
        List<Product> products = productRepository.findByIsFeaturedTrueAndStatus(ProductStatus.ACTIVE);
        
        return products.stream()
            .limit(limit)
            .map(product -> {
                CategoryDto categoryDto = getCategoryDto(product.getCategoryId());
                BrandDto brandDto = getBrandDto(product.getBrandId());
                List<ProductImageDto> images = productImageMapper.toDtoList(
                    productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId())
                );
                return productMapper.toDtoWithDetails(
                    product, categoryDto, brandDto, images, null, null, null
                );
            })
            .toList();
    }

    /**
     * Get new products
     */
    public List<ProductDto> getNewProducts(int limit) {
        List<Product> products = productRepository.findByIsNewTrueAndStatus(ProductStatus.ACTIVE);
        
        return products.stream()
            .limit(limit)
            .map(product -> {
                CategoryDto categoryDto = getCategoryDto(product.getCategoryId());
                BrandDto brandDto = getBrandDto(product.getBrandId());
                List<ProductImageDto> images = productImageMapper.toDtoList(
                    productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId())
                );
                return productMapper.toDtoWithDetails(
                    product, categoryDto, brandDto, images, null, null, null
                );
            })
            .toList();
    }

    /**
     * Get all active products with their catalog metadata
     */
    public List<ProductDto> getAllActiveProducts() {
        List<Product> products = productRepository.findByStatus(ProductStatus.ACTIVE);

        return products.stream()
            .map(product -> {
                CategoryDto categoryDto = getCategoryDto(product.getCategoryId());
                BrandDto brandDto = getBrandDto(product.getBrandId());
                List<ProductImageDto> images = productImageMapper.toDtoList(
                    productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId())
                );
                return productMapper.toDtoWithDetails(
                    product, categoryDto, brandDto, images, null, null, null
                );
            })
            .toList();
    }

    /**
     * Increment view count
     */
    @Transactional
    public void incrementViewCount(UUID productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        product.incrementViewCount();
        productRepository.save(product);

        log.info("Incremented view count for product: {}", productId);
    }

    /**
     * Create a new product
     */
    @Transactional
    public ProductDto createProduct(CreateProductRequest request, MultipartFile[] hinhAnh) {
        // Validate brand exists
        if (request.getBrandId() != null) {
            brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + request.getBrandId()));
        }

        // Validate category exists if provided
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        // Generate slug from name
        String slug = generateSlug(request.getName());

        // Generate SKU
        String sku = generateSku(request.getName());

        // Create product entity
        Product product = Product.builder()
            .name(request.getName())
            .slug(slug)
            .sku(sku)
            .description(request.getDescription())
            .shortDescription(request.getShortDescription())
            .price(request.getPrice())
            .originalPrice(request.getOriginalPrice())
            .discountPercentage(request.getDiscountPercentage())
            .status(ProductStatus.ACTIVE)
            .brandId(request.getBrandId())
            .categoryId(request.getCategoryId())
            .isFeatured(request.getIsFeatured())
            .isNew(request.getIsNew())
            .displayOrder(request.getDisplayOrder())
            .build();

        Product savedProduct = productRepository.save(product);

        // Handle image uploads
        if (hinhAnh != null && hinhAnh.length > 0) {
            saveProductImages(savedProduct.getId(), hinhAnh);
        }

        log.info("Created new product: {}", savedProduct.getId());

        return getProductById(savedProduct.getId());
    }

    /**
     * Update an existing product
     */
    @Transactional
    public ProductDto updateProduct(UUID productId, UpdateProductRequest request, MultipartFile[] hinhAnh) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Validate brand exists
        if (request.getBrandId() != null) {
            brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + request.getBrandId()));
        }

        // Validate category exists if provided
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        // Update slug if name changed
        String newSlug = null;
        if (!product.getName().equals(request.getName())) {
            newSlug = generateSlug(request.getName());
        }

        // Update product fields
        product.setName(request.getName());
        if (newSlug != null) {
            product.setSlug(newSlug);
        }
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDiscountPercentage(request.getDiscountPercentage());
        product.setBrandId(request.getBrandId());
        product.setCategoryId(request.getCategoryId());
        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }
        if (request.getIsNew() != null) {
            product.setIsNew(request.getIsNew());
        }
        product.setDisplayOrder(request.getDisplayOrder());

        Product savedProduct = productRepository.save(product);

        // Handle image uploads (add new images)
        if (hinhAnh != null && hinhAnh.length > 0) {
            saveProductImages(savedProduct.getId(), hinhAnh);
        }

        log.info("Updated product: {}", productId);

        return getProductById(savedProduct.getId());
    }

    /**
     * Delete a product
     */
    @Transactional
    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Delete associated images
        productImageRepository.deleteByProductId(productId);

        // Delete associated details
        productDetailRepository.deleteByProductId(productId);

        // Delete product
        productRepository.delete(product);

        log.info("Deleted product: {}", productId);
    }

    // Helper methods

    private String generateSlug(String name) {
        if (!StringUtils.hasText(name)) {
            return "product-" + UUID.randomUUID().toString().substring(0, 8);
        }

        String slug = name.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .trim();

        if (slug.isEmpty()) {
            return "product-" + UUID.randomUUID().toString().substring(0, 8);
        }

        // Ensure uniqueness
        String baseSlug = slug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    private String generateSku(String name) {
        if (!StringUtils.hasText(name)) {
            return "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        String sku = name.toUpperCase()
            .replaceAll("[^A-Z0-9]", "")
            .substring(0, Math.min(name.length(), 10));

        if (sku.isEmpty()) {
            return "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        // Ensure uniqueness
        String baseSku = sku;
        int counter = 1;
        while (productRepository.existsBySku(sku)) {
            sku = baseSku + counter;
            counter++;
        }

        return sku;
    }

    private void saveProductImages(UUID productId, MultipartFile[] images) {
        // Get current max display order
        Integer maxOrder = productImageRepository.findMaxDisplayOrderByProductId(productId);
        if (maxOrder == null) {
            maxOrder = 0;
        }

        for (int i = 0; i < images.length; i++) {
            MultipartFile image = images[i];
            if (image != null && !image.isEmpty()) {
                try {
                    // Here you would typically save the file to a storage service
                    // For now, we'll store the filename as imageUrl
                    String fileName = image.getOriginalFilename();

                    // Create ProductImage entity
                    ProductImage productImage = ProductImage.builder()
                        .productId(productId)
                        .imageUrl(fileName) // Placeholder - in real implementation, this would be the uploaded file URL
                        .altText("Product image")
                        .displayOrder(maxOrder + i + 1)
                        .isMain(i == 0 && maxOrder == 0) // First image is main if no existing images
                        .build();

                    productImageRepository.save(productImage);

                    log.info("Saved product image: {} for product: {}", fileName, productId);
                } catch (Exception e) {
                    log.error("Failed to save product image: {}", image.getOriginalFilename(), e);
                    // Continue with other images
                }
            }
        }
    }

    // Helper methods
    
    private CategoryDto getCategoryDto(UUID categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
            .map(categoryMapper::toDto)
            .orElse(null);
    }

    private BrandDto getBrandDto(UUID brandId) {
        if (brandId == null) {
            return null;
        }
        return brandRepository.findById(brandId)
            .map(brandMapper::toDto)
            .orElse(null);
    }

    private Sort buildSort(String sortBy, String sortDirection) {
        // Default sort
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        
        // Determine direction
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        
        // Map sort field
        return switch (sortBy.toLowerCase()) {
            case "price" -> Sort.by(direction, "price");
            case "name" -> Sort.by(direction, "name");
            case "viewcount" -> Sort.by(direction, "viewCount");
            default -> Sort.by(direction, "createdAt");
        };
    }
}
