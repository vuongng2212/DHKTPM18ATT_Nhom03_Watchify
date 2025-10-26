package fit.iuh.backend.modules.identity.application.mapper;

import fit.iuh.backend.modules.identity.application.dto.AddressDto;
import fit.iuh.backend.modules.identity.domain.entity.Address;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Mapper for converting between Address entity and AddressDto.
 */
@Component
public class AddressMapper {

    /**
     * Convert Address entity to AddressDto
     */
    public AddressDto toDto(Address address) {
        if (address == null) {
            return null;
        }

        return AddressDto.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .address(address.getAddress())
                .ward(address.getWard())
                .district(address.getDistrict())
                .city(address.getCity())
                .isDefault(address.getIsDefault())
                .fullAddress(address.getFullAddress())
                .build();
    }

    /**
     * Convert AddressDto to Address entity
     */
    public Address toEntity(AddressDto dto, UUID userId) {
        if (dto == null) {
            return null;
        }

        return Address.builder()
                .userId(userId)
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .ward(dto.getWard())
                .district(dto.getDistrict())
                .city(dto.getCity())
                .isDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false)
                .build();
    }

    /**
     * Update Address entity from AddressDto
     */
    public void updateEntityFromDto(AddressDto dto, Address address) {
        address.setFullName(dto.getFullName());
        address.setPhone(dto.getPhone());
        address.setAddress(dto.getAddress());
        address.setWard(dto.getWard());
        address.setDistrict(dto.getDistrict());
        address.setCity(dto.getCity());
        if (dto.getIsDefault() != null) {
            address.setIsDefault(dto.getIsDefault());
        }
    }
}
