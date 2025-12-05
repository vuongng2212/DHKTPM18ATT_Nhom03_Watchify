package fit.iuh.backend.modules.identity.application.service;

import fit.iuh.backend.modules.identity.application.dto.AddressDto;
import fit.iuh.backend.modules.identity.application.dto.ChangePasswordRequest;
import fit.iuh.backend.modules.identity.application.dto.UserDto;
import fit.iuh.backend.modules.identity.application.dto.UserListResponse;
import fit.iuh.backend.modules.identity.application.mapper.AddressMapper;
import fit.iuh.backend.modules.identity.application.mapper.UserMapper;
import fit.iuh.backend.modules.identity.domain.entity.Address;
import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.identity.domain.entity.UserStatus;
import fit.iuh.backend.modules.identity.domain.repository.AddressRepository;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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
    private final PasswordEncoder passwordEncoder;

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
     * Get user by email
     */
    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // If this is the first address or marked as default, unset other default addresses
        if (addressDto.getIsDefault() != null && addressDto.getIsDefault()) {
            unsetDefaultAddresses(userId);
        }

        Address address = addressMapper.toEntity(addressDto, user);
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
        if (!address.getUser().getId().equals(userId)) {
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
        if (!address.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Address not found for this user");
        }

        addressRepository.delete(address);
        log.info("Address deleted: {}", addressId);
    }

    /**
     * Get all users with pagination and search
     */
    @Transactional(readOnly = true)
    public UserListResponse getAllUsers(int page, int size, String search, String role) {
        Pageable pageable = PageRequest.of(page, size);

        Page<User> userPage;
        if (StringUtils.hasText(search) || StringUtils.hasText(role)) {
            userPage = userRepository.searchByKeywordAndRole(search, role, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserDto> userDtos = userPage.map(userMapper::toDto).getContent();

        return UserListResponse.builder()
                .users(userDtos)
                .totalElements(userPage.getTotalElements())
                .pagination(UserListResponse.Pagination.builder()
                        .currentPage(page)
                        .totalPages(userPage.getTotalPages())
                        .totalUsers(userPage.getTotalElements())
                        .hasNext(userPage.hasNext())
                        .hasPrevious(userPage.hasPrevious())
                        .build())
                .build();
    }

    /**
     * Lock a user account (Admin only)
     */
    @Transactional
    public void lockUser(UUID userId) {
        log.info("Locking user with id: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Prevent locking admin users
        if (user.hasRole("ROLE_ADMIN")) {
            throw new IllegalStateException("Cannot lock admin user");
        }
        
        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);
        
        log.info("User {} has been locked successfully", userId);
    }

    /**
     * Unlock a user account (Admin only)
     */
    @Transactional
    public void unlockUser(UUID userId) {
        log.info("Unlocking user with id: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        
        log.info("User {} has been unlocked successfully", userId);
    }

    /**
     * Toggle user lock status (Admin only)
     */
    @Transactional
    public UserDto toggleUserLock(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Prevent locking admin users
        if (user.hasRole("ROLE_ADMIN") && user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalStateException("Cannot lock admin user");
        }
        
        if (user.getStatus() == UserStatus.BANNED) {
            user.setStatus(UserStatus.ACTIVE);
        } else {
            user.setStatus(UserStatus.BANNED);
        }
        
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", userId);
        
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation password do not match");
        }
        
        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        
        // Ensure new password is different from old password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from old password");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", userId);
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
