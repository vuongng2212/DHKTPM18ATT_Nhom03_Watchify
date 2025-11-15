package fit.iuh.backend.modules.identity.application.service;

import fit.iuh.backend.modules.identity.application.dto.AddressDto;
import fit.iuh.backend.modules.identity.application.mapper.AddressMapper;
import fit.iuh.backend.modules.identity.domain.entity.Address;
import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.identity.domain.repository.AddressRepository;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for Address operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AddressService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;
    private final UserRepository userRepository;

    public List<AddressDto> getUserAddresses(UUID userId) {
        List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
        return addresses.stream()
                .map(addressMapper::toDto)
                .collect(Collectors.toList());
    }

    public AddressDto getAddressById(UUID addressId, UUID userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return addressMapper.toDto(address);
    }

    @Transactional
    public AddressDto createAddress(AddressDto dto, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address = addressMapper.toEntity(dto, user);
        address = addressRepository.save(address);

        log.info("Address created: {}", address.getId());
        return addressMapper.toDto(address);
    }

    @Transactional
    public AddressDto updateAddress(UUID addressId, AddressDto dto, UUID userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        addressMapper.updateEntityFromDto(dto, address);
        address = addressRepository.save(address);

        log.info("Address updated: {}", address.getId());
        return addressMapper.toDto(address);
    }

    @Transactional
    public void deleteAddress(UUID addressId, UUID userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        addressRepository.delete(address);
        log.info("Address deleted: {}", addressId);
    }

    public AddressDto getDefaultAddress(UUID userId) {
        Address address = addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .orElse(null);

        return address != null ? addressMapper.toDto(address) : null;
    }
}