package fit.iuh.backend.modules.identity.domain.entity;

import fit.iuh.backend.sharedkernel.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a user's delivery address.
 */
@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private AddressType type;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "street", nullable = false, length = 255)
    private String street;  // Street address

    @Column(name = "ward", length = 100)
    private String ward;  // Phường/Xã

    @Column(name = "district", length = 100)
    private String district;  // Quận/Huyện

    @Column(name = "city", nullable = false, length = 100)
    private String city;  // Tỉnh/Thành phố

    @Column(name = "address", nullable = false, length = 500)
    private String address;  // Full address string

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    /**
     * Get full address as a single string
     */
    public String getFullAddress() {
        if (address != null && !address.isBlank()) {
            return address;
        }
        StringBuilder sb = new StringBuilder();
        sb.append(street);
        if (ward != null && !ward.isBlank()) {
            sb.append(", ").append(ward);
        }
        if (district != null && !district.isBlank()) {
            sb.append(", ").append(district);
        }
        sb.append(", ").append(city);
        return sb.toString();
    }
}
