package fit.iuh.backend.modules.catalog.domain.entity;

import fit.iuh.backend.modules.identity.domain.entity.User;
import fit.iuh.backend.sharedkernel.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a user's wishlist item.
 * A wishlist is a many-to-many relationship between users and products
 * that they want to save for later or purchase in the future.
 */
@Entity
@Table(
    name = "wishlists",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_wishlist_user_product",
            columnNames = {"user_id", "product_id"}
        )
    },
    indexes = {
        @Index(name = "idx_wishlist_user_id", columnList = "user_id"),
        @Index(name = "idx_wishlist_product_id", columnList = "product_id"),
        @Index(name = "idx_wishlist_created_at", columnList = "created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist extends BaseEntity {

    /**
     * Reference to the user who owns this wishlist item
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_wishlist_user"))
    private User user;

    /**
     * Reference to the product that is saved in the wishlist
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_wishlist_product"))
    private Product product;

    /**
     * Optional notes from the user about this wishlist item
     */
    @Column(name = "notes", length = 500)
    private String notes;

    /**
     * Priority level (1-5, where 1 is highest priority)
     * This can help users organize their wishlist
     */
    @Column(name = "priority")
    private Integer priority;

    /**
     * Whether the user wants to be notified when this product goes on sale
     */
    @Column(name = "notify_on_sale")
    @Builder.Default
    private Boolean notifyOnSale = false;

    /**
     * Whether the user wants to be notified when this product is back in stock
     */
    @Column(name = "notify_on_stock")
    @Builder.Default
    private Boolean notifyOnStock = false;

    /**
     * Convenience constructor for creating a basic wishlist item
     */
    public Wishlist(User user, Product product) {
        this.user = user;
        this.product = product;
        this.notifyOnSale = false;
        this.notifyOnStock = false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Wishlist)) return false;
        if (!super.equals(o)) return false;

        Wishlist wishlist = (Wishlist) o;

        if (user != null && wishlist.user != null) {
            if (!user.getId().equals(wishlist.user.getId())) return false;
        }
        if (product != null && wishlist.product != null) {
            return product.getId().equals(wishlist.product.getId());
        }
        return false;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (user != null && user.getId() != null ? user.getId().hashCode() : 0);
        result = 31 * result + (product != null && product.getId() != null ? product.getId().hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Wishlist{" +
                "id=" + getId() +
                ", userId=" + (user != null ? user.getId() : null) +
                ", productId=" + (product != null ? product.getId() : null) +
                ", priority=" + priority +
                ", createdAt=" + getCreatedAt() +
                '}';
    }
}