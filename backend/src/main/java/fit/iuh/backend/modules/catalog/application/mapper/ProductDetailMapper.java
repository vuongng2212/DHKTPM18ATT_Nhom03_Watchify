package fit.iuh.backend.modules.catalog.application.mapper;

import fit.iuh.backend.modules.catalog.application.dto.ProductDetailDto;
import fit.iuh.backend.modules.catalog.domain.entity.ProductDetail;
import org.springframework.stereotype.Component;

/**
 * Mapper for ProductDetail entity and DTO
 */
@Component
public class ProductDetailMapper {

    public ProductDetailDto toDto(ProductDetail detail) {
        if (detail == null) {
            return null;
        }

        return ProductDetailDto.builder()
                .id(detail.getId())
                .movement(detail.getMovement())
                .caseMaterial(detail.getCaseMaterial())
                .caseDiameter(detail.getCaseDiameter())
                .caseThickness(detail.getCaseThickness())
                .dialColor(detail.getDialColor())
                .strapMaterial(detail.getStrapMaterial())
                .strapColor(detail.getStrapColor())
                .waterResistance(detail.getWaterResistance())
                .crystal(detail.getCrystal())
                .weight(detail.getWeight())
                .powerReserve(detail.getPowerReserve())
                .warranty(detail.getWarranty())
                .origin(detail.getOrigin())
                .gender(detail.getGender())
                .additionalFeatures(detail.getAdditionalFeatures())
                .build();
    }

    public ProductDetail toEntity(ProductDetailDto dto) {
        if (dto == null) {
            return null;
        }

        ProductDetail detail = ProductDetail.builder()
                .movement(dto.getMovement())
                .caseMaterial(dto.getCaseMaterial())
                .caseDiameter(dto.getCaseDiameter())
                .caseThickness(dto.getCaseThickness())
                .dialColor(dto.getDialColor())
                .strapMaterial(dto.getStrapMaterial())
                .strapColor(dto.getStrapColor())
                .waterResistance(dto.getWaterResistance())
                .crystal(dto.getCrystal())
                .weight(dto.getWeight())
                .powerReserve(dto.getPowerReserve())
                .warranty(dto.getWarranty())
                .origin(dto.getOrigin())
                .gender(dto.getGender())
                .additionalFeatures(dto.getAdditionalFeatures())
                .build();
        
        if (dto.getId() != null) {
            detail.setId(dto.getId());
        }
        
        return detail;
    }
}
