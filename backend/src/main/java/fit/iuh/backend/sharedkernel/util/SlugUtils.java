package fit.iuh.backend.sharedkernel.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility class for generating URL-friendly slugs from strings.
 */
public class SlugUtils {
    
    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGES_DASHES = Pattern.compile("(^-|-$)");
    
    private SlugUtils() {
        // Utility class, prevent instantiation
    }
    
    /**
     * Generate a URL-friendly slug from the input string.
     * 
     * @param input the input string
     * @return slug string
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        
        // Normalize to NFD to separate base characters and diacritics
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        
        // Remove diacritics (combining marks)
        normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        
        // Replace Vietnamese specific characters
        normalized = normalized.replace("Đ", "D").replace("đ", "d");
        
        // Replace whitespace with dashes
        String noWhitespace = WHITESPACE.matcher(normalized).replaceAll("-");
        
        // Remove non-word characters except dashes
        String slug = NON_LATIN.matcher(noWhitespace).replaceAll("");
        
        // Remove leading/trailing dashes
        slug = EDGES_DASHES.matcher(slug).replaceAll("");
        
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
