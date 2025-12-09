package fit.iuh.backend.sharedkernel.exception;

/**
 * Exception thrown when authentication credentials are invalid.
 */
public class InvalidCredentialsException extends BusinessException {
    
    public InvalidCredentialsException() {
        super("Invalid email or password", "INVALID_CREDENTIALS");
    }
    
    public InvalidCredentialsException(String message) {
        super(message, "INVALID_CREDENTIALS");
    }
}
