package fit.iuh.backend.modules.identity.application.service;

import fit.iuh.backend.config.security.JwtTokenProvider;
import fit.iuh.backend.modules.identity.application.dto.LoginRequest;
import fit.iuh.backend.modules.identity.application.dto.LoginResponse;
import fit.iuh.backend.modules.identity.application.dto.RegisterRequest;
import fit.iuh.backend.modules.identity.application.dto.UserDto;
import fit.iuh.backend.modules.identity.application.mapper.UserMapper;
import fit.iuh.backend.modules.identity.domain.entity.Role;
import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.modules.identity.domain.entity.UserStatus;
import fit.iuh.backend.modules.identity.domain.repository.RoleRepository;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.sharedkernel.exception.DuplicateResourceException;
import fit.iuh.backend.sharedkernel.exception.InvalidCredentialsException;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import fit.iuh.backend.sharedkernel.exception.ValidationException;
import fit.iuh.backend.sharedkernel.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling authentication logic: register and login.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    /**
     * Register a new user account
     * 
     * @param request registration details
     * @return created user information
     * @throws DuplicateResourceException if email already exists
     * @throws ValidationException if validation fails
     */
    @Transactional
    public UserDto register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Validate email format
        if (!ValidationUtils.isValidEmail(request.getEmail())) {
            throw new ValidationException("email", "Invalid email format");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Validate phone number if provided
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            if (!ValidationUtils.isValidPhoneNumber(request.getPhone())) {
                throw new ValidationException("phone", "Invalid phone number format");
            }
        }

        // Get default role (CUSTOMER)
        Role customerRole = roleRepository.findByName(Role.CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", Role.CUSTOMER));

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .status(UserStatus.ACTIVE)
                .build();

        user.addRole(customerRole);

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with email: {}", savedUser.getEmail());

        return userMapper.toDto(savedUser);
    }

    /**
     * Authenticate user and generate JWT token
     * 
     * @param request login credentials
     * @return JWT token and user information
     * @throws InvalidCredentialsException if credentials are invalid
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        log.info("User attempting to login with email: {}", request.getEmail());

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String token = jwtTokenProvider.generateToken(authentication);

            // Get user details
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

            UserDto userDto = userMapper.toDto(user);

            log.info("User logged in successfully: {}", request.getEmail());

            return new LoginResponse(token, userDto);

        } catch (BadCredentialsException ex) {
            log.warn("Failed login attempt for email: {}", request.getEmail());
            throw new InvalidCredentialsException();
        }
    }

    /**
     * Get current authenticated user from security context
     * 
     * @return current user information
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new InvalidCredentialsException("No authenticated user found");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return userMapper.toDto(user);
    }
}
