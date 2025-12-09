package fit.iuh.backend.modules.identity.web.controller;

import fit.iuh.backend.modules.identity.application.dto.AddressDto;
import fit.iuh.backend.modules.identity.application.dto.ChangePasswordRequest;
import fit.iuh.backend.modules.identity.application.dto.UserDto;
import fit.iuh.backend.modules.identity.application.dto.UserListResponse;
import fit.iuh.backend.modules.identity.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for user profile and address management.
 */
@Tag(name = "User Profile", description = "APIs for managing user profile and addresses")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    /**
     * Get user profile by ID
     */
    @Operation(summary = "Get user profile", description = "Get user profile information")
    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getUserProfile(@PathVariable UUID userId) {
        UserDto user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    /**
     * Update user profile
     */
    @Operation(summary = "Update profile", description = "Update user profile information")
    @PutMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> updateProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody UserDto userDto) {
        UserDto updatedUser = userService.updateProfile(userId, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Get all addresses for current user
     */
    @Operation(summary = "Get user addresses", description = "Get all delivery addresses for a user")
    @GetMapping("/{userId}/addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AddressDto>> getUserAddresses(@PathVariable UUID userId) {
        List<AddressDto> addresses = userService.getUserAddresses(userId);
        return ResponseEntity.ok(addresses);
    }

    /**
     * Get default address for user
     */
    @Operation(summary = "Get default address", description = "Get the default delivery address")
    @GetMapping("/{userId}/addresses/default")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressDto> getDefaultAddress(@PathVariable UUID userId) {
        AddressDto address = userService.getDefaultAddress(userId);
        return ResponseEntity.ok(address);
    }

    /**
     * Add new address
     */
    @Operation(summary = "Add address", description = "Add a new delivery address")
    @PostMapping("/{userId}/addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressDto> addAddress(
            @PathVariable UUID userId,
            @Valid @RequestBody AddressDto addressDto) {
        AddressDto address = userService.addAddress(userId, addressDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(address);
    }

    /**
     * Update an address
     */
    @Operation(summary = "Update address", description = "Update an existing delivery address")
    @PutMapping("/{userId}/addresses/{addressId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressDto> updateAddress(
            @PathVariable UUID userId,
            @PathVariable UUID addressId,
            @Valid @RequestBody AddressDto addressDto) {
        AddressDto address = userService.updateAddress(userId, addressId, addressDto);
        return ResponseEntity.ok(address);
    }

    /**
     * Delete an address
     */
    @Operation(summary = "Delete address", description = "Delete a delivery address")
    @DeleteMapping("/{userId}/addresses/{addressId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable UUID userId,
            @PathVariable UUID addressId) {
        userService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all users (Admin only)
     */
    @Operation(summary = "Get all users", description = "Get paginated list of all users for admin")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserListResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        log.info("UserController: getAllUsers called with page={}, size={}, search={}", page, size, search);
        UserListResponse users = userService.getAllUsers(page, size, search);
        log.info("UserController: getAllUsers returning {} users for page {}", users.getUsers().size(), page);
        return ResponseEntity.ok(users);
    }

    /**
     * Lock a user account (Admin only)
     */
    @Operation(summary = "Lock user account", description = "Lock a user account to prevent login")
    @PutMapping("/{userId}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> lockUser(@PathVariable UUID userId) {
        log.info("Lock user request for userId: {}", userId);
        userService.lockUser(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Unlock a user account (Admin only)
     */
    @Operation(summary = "Unlock user account", description = "Unlock a user account to allow login")
    @PutMapping("/{userId}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unlockUser(@PathVariable UUID userId) {
        log.info("Unlock user request for userId: {}", userId);
        userService.unlockUser(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Toggle user lock status (Admin only)
     */
    @Operation(summary = "Toggle user lock status", description = "Toggle between locked and unlocked state")
    @PutMapping("/{userId}/toggle-lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> toggleUserLock(@PathVariable UUID userId) {
        log.info("Toggle lock request for userId: {}", userId);
        UserDto userDto = userService.toggleUserLock(userId);
        return ResponseEntity.ok(userDto);
    }

    /**
     * Change user password
     */
    @Operation(summary = "Change password", description = "Change user password")
    @PutMapping("/changePassword")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authHeader) {
        // Extract user ID from token or SecurityContext
        // For now, we'll need to get it from the authenticated user
        log.info("Change password request received");
        
        // Get current user ID from security context
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        // Find user by email to get userId
        UUID userId = userService.getUserByEmail(email).getId();
        
        userService.changePassword(userId, request);
        return ResponseEntity.ok().build();
    }
}
