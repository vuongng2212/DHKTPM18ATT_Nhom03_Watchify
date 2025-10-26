package fit.iuh.backend.modules.catalog.application.service;

import fit.iuh.backend.modules.catalog.application.dto.ReviewDto;
import fit.iuh.backend.modules.catalog.application.mapper.ReviewMapper;
import fit.iuh.backend.modules.catalog.domain.entity.Review;
import fit.iuh.backend.modules.catalog.domain.repository.ReviewRepository;
import fit.iuh.backend.modules.identity.domain.repository.UserRepository;
import fit.iuh.backend.sharedkernel.exception.ResourceNotFoundException;
import fit.iuh.backend.sharedkernel.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for Review operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    /**
     * Get approved reviews for a product
     */
    public List<ReviewDto> getProductReviews(UUID productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndStatus(productId, "APPROVED");
        
        return reviews.stream()
            .map(review -> {
                String userFullName = userRepository.findById(review.getUserId())
                    .map(user -> user.getFirstName() + " " + user.getLastName())
                    .orElse("Unknown User");
                return reviewMapper.toDtoWithUserName(review, userFullName);
            })
            .toList();
    }

    /**
     * Get reviews by user
     */
    public List<ReviewDto> getUserReviews(UUID userId) {
        return reviewRepository.findByUserId(userId)
            .stream()
            .map(reviewMapper::toDto)
            .toList();
    }

    /**
     * Create a new review
     */
    @Transactional
    public ReviewDto createReview(UUID productId, UUID userId, Integer rating, String title, String content) {
        // Validate rating
        if (rating == null || rating < 1 || rating > 5) {
            throw new ValidationException("Rating must be between 1 and 5");
        }
        
        // Check if user already reviewed this product
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new ValidationException("You have already reviewed this product");
        }
        
        // Create review
        Review review = Review.builder()
            .productId(productId)
            .userId(userId)
            .rating(rating)
            .title(title)
            .content(content)
            .status("PENDING")
            .helpfulCount(0)
            .build();
        
        review = reviewRepository.save(review);
        log.info("Created review: {} for product: {} by user: {}", review.getId(), productId, userId);
        
        return reviewMapper.toDto(review);
    }

    /**
     * Approve a review (admin only)
     */
    @Transactional
    public void approveReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        
        review.approve();
        reviewRepository.save(review);
        
        log.info("Approved review: {}", reviewId);
    }

    /**
     * Reject a review (admin only)
     */
    @Transactional
    public void rejectReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        
        review.reject();
        reviewRepository.save(review);
        
        log.info("Rejected review: {}", reviewId);
    }

    /**
     * Mark review as helpful
     */
    @Transactional
    public void markAsHelpful(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        
        review.incrementHelpfulCount();
        reviewRepository.save(review);
    }

    /**
     * Get average rating for a product
     */
    public Double getAverageRating(UUID productId) {
        return reviewRepository.getAverageRating(productId);
    }

    /**
     * Get pending reviews (admin only)
     */
    public List<ReviewDto> getPendingReviews() {
        return reviewRepository.findByStatus("PENDING")
            .stream()
            .map(review -> {
                String userFullName = userRepository.findById(review.getUserId())
                    .map(user -> user.getFirstName() + " " + user.getLastName())
                    .orElse("Unknown User");
                return reviewMapper.toDtoWithUserName(review, userFullName);
            })
            .toList();
    }
}
