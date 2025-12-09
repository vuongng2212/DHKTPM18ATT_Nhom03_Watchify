package fit.iuh.backend.modules.catalog.application.service;

import fit.iuh.backend.modules.catalog.application.dto.BrandDto;
import fit.iuh.backend.modules.catalog.application.dto.CreateBrandRequest;
import fit.iuh.backend.modules.catalog.application.dto.UpdateBrandRequest;
import fit.iuh.backend.modules.catalog.application.mapper.BrandMapper;
import fit.iuh.backend.modules.catalog.domain.entity.Brand;
import fit.iuh.backend.modules.catalog.domain.repository.BrandRepository;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

/**
 * Service for Brand operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    /**
     * Get all brands
     */
    public List<BrandDto> getAllBrands() {
        return brandRepository.findAllByOrderByDisplayOrderAsc()
            .stream()
            .map(brandMapper::toDto)
            .toList();
    }

    /**
     * Get all active brands
     */
    public List<BrandDto> getActiveBrands() {
        return brandRepository.findByIsActiveTrue()
            .stream()
            .map(brandMapper::toDto)
            .toList();
    }

    /**
     * Get brand by ID
     */
    public BrandDto getBrandById(UUID brandId) {
        Brand brand = brandRepository.findById(brandId)
            .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));
        
        return brandMapper.toDto(brand);
    }

    /**
     * Get brand by slug
     */
    public BrandDto getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Brand not found with slug: " + slug));

        return brandMapper.toDto(brand);
    }

    /**
     * Create a new brand
     */
    @Transactional
    public BrandDto createBrand(CreateBrandRequest request) {
        // Generate slug from name
        String slug = generateSlug(request.getName());

        // Create brand entity
        Brand brand = Brand.builder()
            .name(request.getName())
            .slug(slug)
            .description(request.getDescription())
            .logoUrl(request.getLogoUrl())
            .websiteUrl(request.getWebsiteUrl())
            .isActive(true)
            .displayOrder(request.getDisplayOrder())
            .build();

        Brand savedBrand = brandRepository.save(brand);

        log.info("Created new brand: {}", savedBrand.getId());

        return brandMapper.toDto(savedBrand);
    }

    /**
     * Update an existing brand
     */
    @Transactional
    public BrandDto updateBrand(UUID brandId, UpdateBrandRequest request) {
        Brand brand = brandRepository.findById(brandId)
            .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));

        // Update slug if name changed
        String newSlug = null;
        if (!brand.getName().equals(request.getName())) {
            newSlug = generateSlug(request.getName());
        }

        // Update brand fields
        brand.setName(request.getName());
        if (newSlug != null) {
            brand.setSlug(newSlug);
        }
        brand.setDescription(request.getDescription());
        brand.setLogoUrl(request.getLogoUrl());
        brand.setWebsiteUrl(request.getWebsiteUrl());
        brand.setDisplayOrder(request.getDisplayOrder());

        Brand savedBrand = brandRepository.save(brand);

        log.info("Updated brand: {}", brandId);

        return brandMapper.toDto(savedBrand);
    }

    /**
     * Delete a brand
     */
    @Transactional
    public void deleteBrand(UUID brandId) {
        Brand brand = brandRepository.findById(brandId)
            .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));

        brandRepository.delete(brand);

        log.info("Deleted brand: {}", brandId);
    }

    /**
     * Toggle brand visibility
     */
    @Transactional
    public BrandDto toggleVisibility(UUID brandId) {
        Brand brand = brandRepository.findById(brandId)
            .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));

        brand.setIsActive(!brand.getIsActive());

        Brand savedBrand = brandRepository.save(brand);

        log.info("Toggled visibility for brand: {} to {}", brandId, savedBrand.getIsActive());

        return brandMapper.toDto(savedBrand);
    }

    // Helper methods

    private String generateSlug(String name) {
        if (!StringUtils.hasText(name)) {
            return "brand-" + UUID.randomUUID().toString().substring(0, 8);
        }

        String slug = name.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .trim();

        if (slug.isEmpty()) {
            return "brand-" + UUID.randomUUID().toString().substring(0, 8);
        }

        // Ensure uniqueness
        String baseSlug = slug;
        int counter = 1;
        while (brandRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }
}
