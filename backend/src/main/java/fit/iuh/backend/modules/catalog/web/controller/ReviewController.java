package fit.iuh.backend.modules.catalog.web.controller;

import fit.iuh.backend.modules.catalog.application.dto.ReviewDto;
import fit.iuh.backend.modules.catalog.application.dto.ReviewFilterRequest;
import fit.iuh.backend.modules.catalog.application.dto.ReviewListResponse;
import fit.iuh.backend.modules.catalog.application.service.ReviewService;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Review operations
 */
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Product review management APIs")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @GetMapping("/products/{productId}")
    @Operation(summary = "Get product reviews", description = "Get all approved reviews for a product")
    public ResponseEntity<List<ReviewDto>> getProductReviews(
            @Parameter(description = "Product ID") @PathVariable UUID productId
    ) {
        List<ReviewDto> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/products/{productId}/rating")
    @Operation(summary = "Get product rating", description = "Get average rating for a product")
    public ResponseEntity<Double> getProductRating(
            @Parameter(description = "Product ID") @PathVariable UUID productId
    ) {
        Double rating = reviewService.getAverageRating(productId);
        return ResponseEntity.ok(rating != null ? rating : 0.0);
    }

    @GetMapping("/me")
    @Operation(summary = "Get my reviews", description = "Get all reviews by current user")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<ReviewDto>> getMyReviews(Authentication authentication) {
        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        List<ReviewDto> reviews = reviewService.getUserReviews(userId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    @Operation(summary = "Create review", description = "Create a new product review")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ReviewDto> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        ReviewDto review = reviewService.createReview(
            request.getProductId(),
            userId,
            request.getRating(),
            request.getTitle(),
            request.getContent()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @PostMapping("/{reviewId}/helpful")
    @Operation(summary = "Mark review as helpful", description = "Increment helpful count for a review")
    public ResponseEntity<Void> markAsHelpful(
            @Parameter(description = "Review ID") @PathVariable UUID reviewId
    ) {
        reviewService.markAsHelpful(reviewId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    @Operation(summary = "Get all reviews", description = "Get paginated and filtered reviews for admin management")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewListResponse> getAllReviews(
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword,
            @Parameter(description = "Product ID") @RequestParam(required = false) UUID productId,
            @Parameter(description = "User ID") @RequestParam(required = false) UUID userId,
            @Parameter(description = "Review status") @RequestParam(required = false) String status,
            @Parameter(description = "Rating (1-5)") @RequestParam(required = false) Integer rating,
            @Parameter(description = "Sort by field") @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc, desc)") @RequestParam(required = false, defaultValue = "desc") String sortDirection,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "10") int size
    ) {
        ReviewFilterRequest filter = ReviewFilterRequest.builder()
                .keyword(keyword)
                .productId(productId)
                .userId(userId)
                .status(status)
                .rating(rating)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();
        
        ReviewListResponse reviews = reviewService.getAllReviewsWithFilter(filter, page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending reviews", description = "Get all pending reviews for admin approval")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReviewDto>> getPendingReviews() {
        List<ReviewDto> reviews = reviewService.getPendingReviews();
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{reviewId}/approve")
    @Operation(summary = "Approve review", description = "Approve a pending review (admin only)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveReview(
            @Parameter(description = "Review ID") @PathVariable UUID reviewId
    ) {
        reviewService.approveReview(reviewId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{reviewId}/reject")
    @Operation(summary = "Reject review", description = "Reject a pending review (admin only)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectReview(
            @Parameter(description = "Review ID") @PathVariable UUID reviewId
    ) {
        reviewService.rejectReview(reviewId);
        return ResponseEntity.ok().build();
    }

    /**
     * Request DTO for creating a review
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReviewRequest {
        @NotNull(message = "Product ID is required")
        private UUID productId;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        private Integer rating;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Content is required")
        private String content;
    }
}
