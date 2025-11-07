package fit.iuh.backend.sharedkernel.exception;

import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

/**
 * Exception thrown when validation fails.
 */
@Getter
public class ValidationException extends BusinessException {
    
    private final Map<String, String> errors;
    
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR");
        this.errors = new HashMap<>();
    }
    
    public ValidationException(Map<String, String> errors) {
        super("Validation failed", "VALIDATION_ERROR");
        this.errors = errors;
    }
    
    public ValidationException(String field, String message) {
        super("Validation failed", "VALIDATION_ERROR");
        this.errors = new HashMap<>();
        this.errors.put(field, message);
    }
}
