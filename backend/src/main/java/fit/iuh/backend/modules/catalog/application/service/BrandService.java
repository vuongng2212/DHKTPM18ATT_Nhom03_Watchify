package fit.iuh.backend.modules.catalog.application.service;

import fit.iuh.backend.modules.catalog.application.dto.BrandDto;
import fit.iuh.backend.modules.catalog.application.mapper.BrandMapper;
import fit.iuh.backend.modules.catalog.domain.entity.Brand;
import fit.iuh.backend.modules.catalog.domain.repository.BrandRepository;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
