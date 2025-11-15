package fit.iuh.backend.modules.identity.web.controller;

import fit.iuh.backend.modules.identity.application.dto.LoginRequest;
import fit.iuh.backend.modules.identity.application.dto.LoginResponse;
import fit.iuh.backend.modules.identity.application.dto.RefreshTokenRequest;
import fit.iuh.backend.modules.identity.application.dto.RegisterRequest;
import fit.iuh.backend.modules.identity.application.dto.UserDto;
import fit.iuh.backend.modules.identity.application.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication endpoints.
 * Handles user registration and login.
 */
@Tag(name = "Authentication", description = "Authentication APIs for user registration and login")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account
     * 
     * @param request registration details
     * @return created user information
     */
    @Operation(summary = "Register new user", description = "Create a new user account with CUSTOMER role")
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        UserDto user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * Authenticate user and get JWT token
     * 
     * @param request login credentials
     * @return JWT token and user information
     */
    @Operation(summary = "Login", description = "Authenticate user and receive JWT token")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get current authenticated user information
     * 
     * @return current user details
     */
    @Operation(summary = "Get current user", description = "Get information of the currently authenticated user")
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        UserDto user = authService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    /**
     * Refresh access token using refresh token
     * 
     * @param request containing refresh token
     * @return new access token
     */
    @Operation(summary = "Refresh token", description = "Generate new access token using refresh token")
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        String newAccessToken = authService.refreshAccessToken(request.getRefreshToken());
        
        // Get current user
        UserDto user = authService.getCurrentUser();
        
        return ResponseEntity.ok(LoginResponse.builder()
                .token(newAccessToken)
                .user(user)
                .build());
    }

    /**
     * Logout the current user
     * 
     * @param request containing refresh token
     * @return success response
     */
    @Operation(summary = "Logout", description = "Logout the current user and revoke refresh token")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request) {
        if (request.getRefreshToken() != null) {
            authService.revokeRefreshToken(request.getRefreshToken());
        }
        return ResponseEntity.ok().build();
    }
}
