package fit.iuh.backend.modules.identity.web.controller;

import fit.iuh.backend.modules.identity.application.dto.AddressDto;
import fit.iuh.backend.modules.identity.application.service.AddressService;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Address operations
 */
@RestController
@RequestMapping("/api/v1/user/addresses")
@RequiredArgsConstructor
@Tag(name = "User Addresses", description = "User address management APIs")
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get user addresses", description = "Get all addresses for the authenticated user")
    public ResponseEntity<List<AddressDto>> getUserAddresses(Authentication authentication) {
        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        List<AddressDto> addresses = addressService.getUserAddresses(userId);
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{addressId}")
    @Operation(summary = "Get address by ID", description = "Get a specific address by ID")
    public ResponseEntity<AddressDto> getAddressById(
            @Parameter(description = "Address ID") @PathVariable UUID addressId,
            Authentication authentication) {

        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        AddressDto address = addressService.getAddressById(addressId, userId);
        return ResponseEntity.ok(address);
    }

    @PostMapping
    @Operation(summary = "Create new address", description = "Create a new address for the user")
    public ResponseEntity<AddressDto> createAddress(
            @Valid @RequestBody AddressDto dto,
            Authentication authentication) {

        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        AddressDto address = addressService.createAddress(dto, userId);
        return ResponseEntity.ok(address);
    }

    @PutMapping("/{addressId}")
    @Operation(summary = "Update address", description = "Update an existing address")
    public ResponseEntity<AddressDto> updateAddress(
            @Parameter(description = "Address ID") @PathVariable UUID addressId,
            @Valid @RequestBody AddressDto dto,
            Authentication authentication) {

        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        AddressDto address = addressService.updateAddress(addressId, dto, userId);
        return ResponseEntity.ok(address);
    }

    @DeleteMapping("/{addressId}")
    @Operation(summary = "Delete address", description = "Delete an address")
    public ResponseEntity<Void> deleteAddress(
            @Parameter(description = "Address ID") @PathVariable UUID addressId,
            Authentication authentication) {

        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        addressService.deleteAddress(addressId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/default")
    @Operation(summary = "Get default address", description = "Get the user's default address")
    public ResponseEntity<AddressDto> getDefaultAddress(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        AddressDto address = addressService.getDefaultAddress(userId);
        return address != null ? ResponseEntity.ok(address) : ResponseEntity.notFound().build();
    }
}