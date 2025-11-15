package fit.iuh.backend.modules.catalog.domain.entity;

import fit.iuh.backend.sharedkernel.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity representing product reviews from customers.
 */
@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "rating", nullable = false)
    private Integer rating;  // 1-5 stars

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING";  // PENDING, APPROVED, REJECTED

    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;

    /**
     * Check if review is approved
     */
    public boolean isApproved() {
        return "APPROVED".equals(status);
    }

    /**
     * Approve the review
     */
    public void approve() {
        this.status = "APPROVED";
    }

    /**
     * Reject the review
     */
    public void reject() {
        this.status = "REJECTED";
    }

    /**
     * Increment helpful count
     */
    public void incrementHelpfulCount() {
        this.helpfulCount++;
    }
}
