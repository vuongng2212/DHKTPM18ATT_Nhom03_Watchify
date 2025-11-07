package fit.iuh.backend.modules.identity.application.service;

import fit.iuh.backend.modules.identity.application.dto.AddressDto;
import fit.iuh.backend.modules.identity.application.dto.UserDto;
import fit.iuh.backend.modules.identity.application.mapper.AddressMapper;
import fit.iuh.backend.modules.identity.application.mapper.UserMapper;
import fit.iuh.backend.modules.identity.domain.entity.Address;
import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.identity.domain.repository.AddressRepository;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for user profile and address management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;

    /**
     * Get user profile by ID
     */
    @Transactional(readOnly = true)
    public UserDto getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return userMapper.toDto(user);
    }

    /**
     * Update user profile
     */
    @Transactional
    public UserDto updateProfile(UUID userId, UserDto userDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        userMapper.updateEntityFromDto(userDto, user);
        User updatedUser = userRepository.save(user);

        log.info("User profile updated: {}", userId);
        return userMapper.toDto(updatedUser);
    }

    /**
     * Get all addresses for a user
     */
    @Transactional(readOnly = true)
    public List<AddressDto> getUserAddresses(UUID userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(addressMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get default address for a user
     */
    @Transactional(readOnly = true)
    public AddressDto getDefaultAddress(UUID userId) {
        Address address = addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Default address not found for user: " + userId));
        return addressMapper.toDto(address);
    }

    /**
     * Add new address for a user
     */
    @Transactional
    public AddressDto addAddress(UUID userId, AddressDto addressDto) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // If this is the first address or marked as default, unset other default addresses
        if (addressDto.getIsDefault() != null && addressDto.getIsDefault()) {
            unsetDefaultAddresses(userId);
        }

        Address address = addressMapper.toEntity(addressDto, userId);
        Address savedAddress = addressRepository.save(address);

        log.info("Address added for user: {}", userId);
        return addressMapper.toDto(savedAddress);
    }

    /**
     * Update an address
     */
    @Transactional
    public AddressDto updateAddress(UUID userId, UUID addressId, AddressDto addressDto) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        // Verify address belongs to user
        if (!address.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Address not found for this user");
        }

        // If setting as default, unset other default addresses
        if (addressDto.getIsDefault() != null && addressDto.getIsDefault()) {
            unsetDefaultAddresses(userId);
        }

        addressMapper.updateEntityFromDto(addressDto, address);
        Address updatedAddress = addressRepository.save(address);

        log.info("Address updated: {}", addressId);
        return addressMapper.toDto(updatedAddress);
    }

    /**
     * Delete an address
     */
    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        // Verify address belongs to user
        if (!address.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Address not found for this user");
        }

        addressRepository.delete(address);
        log.info("Address deleted: {}", addressId);
    }

    /**
     * Unset all default addresses for a user
     */
    private void unsetDefaultAddresses(UUID userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(addr -> addr.setIsDefault(false));
        addressRepository.saveAll(addresses);
    }
}
