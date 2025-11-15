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
        
        String noWhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(normalized).replaceAll("");
        slug = EDGES_DASHES.matcher(slug).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
