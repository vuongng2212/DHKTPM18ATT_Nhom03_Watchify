package fit.iuh.backend.modules.catalog.application.mapper;

import fit.iuh.backend.modules.catalog.application.dto.ReviewDto;
import fit.iuh.backend.modules.catalog.domain.entity.Review;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for Review entity and DTO
 */
@Component
public class ReviewMapper {

    public ReviewDto toDto(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewDto.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .status(review.getStatus())
                .helpfulCount(review.getHelpfulCount())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public ReviewDto toDtoWithUserName(Review review, String userFullName) {
        ReviewDto dto = toDto(review);
        if (dto != null) {
            dto.setUserFullName(userFullName);
        }
        return dto;
    }

    public List<ReviewDto> toDtoList(List<Review> reviews) {
        if (reviews == null) {
            return null;
        }
        return reviews.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Review toEntity(ReviewDto dto) {
        if (dto == null) {
            return null;
        }

        Review review = Review.builder()
                .productId(dto.getProductId())
                .userId(dto.getUserId())
                .rating(dto.getRating())
                .title(dto.getTitle())
                .content(dto.getContent())
                .status(dto.getStatus())
                .helpfulCount(dto.getHelpfulCount())
                .build();
        
        if (dto.getId() != null) {
            review.setId(dto.getId());
        }
        
        return review;
    }
}
