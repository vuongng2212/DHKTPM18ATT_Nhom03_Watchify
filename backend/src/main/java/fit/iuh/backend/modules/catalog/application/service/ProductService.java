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
