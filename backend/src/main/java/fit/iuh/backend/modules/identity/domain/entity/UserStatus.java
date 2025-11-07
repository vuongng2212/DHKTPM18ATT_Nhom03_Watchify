package fit.iuh.backend.modules.identity.domain.entity;

/**
 * Enum representing user account status.
 */
public enum UserStatus {
    ACTIVE,      // User account is active
    INACTIVE,    // User account is temporarily disabled
    BANNED,      // User account is permanently banned
    PENDING      // User account is pending email verification
}
