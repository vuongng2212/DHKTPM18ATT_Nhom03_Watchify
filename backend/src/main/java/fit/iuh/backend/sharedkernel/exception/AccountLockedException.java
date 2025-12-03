package fit.iuh.backend.sharedkernel.exception;

/**
 * Exception thrown when a user account is locked/banned.
 */
public class AccountLockedException extends BusinessException {
    
    public AccountLockedException() {
        super("Your account has been locked. Please contact support.", "ACCOUNT_LOCKED");
    }
    
    public AccountLockedException(String message) {
        super(message, "ACCOUNT_LOCKED");
    }
}