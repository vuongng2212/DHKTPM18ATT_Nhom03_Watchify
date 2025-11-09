package fit.iuh.backend.modules.identity.application.mapper;

import fit.iuh.backend.modules.identity.application.dto.AddressDto;
import fit.iuh.backend.modules.identity.domain.entity.Address;
import fit.iuh.backend.modules.identity.domain.entity.User;
import org.springframework.stereotype.Component;

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
                .type(address.getType())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .street(address.getStreet())
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
    public Address toEntity(AddressDto dto, User user) {
        if (dto == null) {
            return null;
        }

        return Address.builder()
                .user(user)
                .type(dto.getType())
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .street(dto.getStreet())
                .ward(dto.getWard())
                .district(dto.getDistrict())
                .city(dto.getCity())
                .address(dto.getStreet() + 
                        (dto.getWard() != null && !dto.getWard().isBlank() ? ", " + dto.getWard() : "") +
                        (dto.getDistrict() != null && !dto.getDistrict().isBlank() ? ", " + dto.getDistrict() : "") +
                        ", " + dto.getCity())
                .isDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false)
                .build();
    }

    /**
     * Update Address entity from AddressDto
     */
    public void updateEntityFromDto(AddressDto dto, Address address) {
        address.setType(dto.getType());
        address.setFullName(dto.getFullName());
        address.setPhone(dto.getPhone());
        address.setStreet(dto.getStreet());
        address.setWard(dto.getWard());
        address.setDistrict(dto.getDistrict());
        address.setCity(dto.getCity());
        address.setAddress(dto.getStreet() + 
                (dto.getWard() != null && !dto.getWard().isBlank() ? ", " + dto.getWard() : "") +
                (dto.getDistrict() != null && !dto.getDistrict().isBlank() ? ", " + dto.getDistrict() : "") +
                ", " + dto.getCity());
        if (dto.getIsDefault() != null) {
            address.setIsDefault(dto.getIsDefault());
        }
    }
}
