package fit.iuh.backend.sharedkernel.util;

import java.util.regex.Pattern;

/**
 * Utility class for common validation operations.
 */
public class ValidationUtils {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^(\\+84|0)[0-9]{9,10}$"
    );
    
    private ValidationUtils() {
        // Utility class, prevent instantiation
    }
    
    /**
     * Validate email format.
     * 
     * @param email the email to validate
     * @return true if valid, false otherwise
     */
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Validate Vietnamese phone number format.
     * 
     * @param phone the phone number to validate
     * @return true if valid, false otherwise
     */
    public static boolean isValidPhoneNumber(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }
    
    /**
     * Check if a string is null or blank.
     * 
     * @param value the string to check
     * @return true if null or blank, false otherwise
     */
    public static boolean isNullOrBlank(String value) {
        return value == null || value.isBlank();
    }
}
