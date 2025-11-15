package fit.iuh.backend.modules.identity.web.controller;

import fit.iuh.backend.modules.identity.application.dto.AddressDto;
import fit.iuh.backend.modules.identity.application.dto.UserDto;
import fit.iuh.backend.modules.identity.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
}
