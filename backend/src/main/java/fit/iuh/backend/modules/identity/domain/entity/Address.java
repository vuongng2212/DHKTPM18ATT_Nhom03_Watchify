package fit.iuh.backend.modules.identity.domain.entity;

import fit.iuh.backend.sharedkernel.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

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

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "address", nullable = false, length = 255)
    private String address;  // Street address

    @Column(name = "ward", length = 100)
    private String ward;  // Phường/Xã

    @Column(name = "district", length = 100)
    private String district;  // Quận/Huyện

    @Column(name = "city", nullable = false, length = 100)
    private String city;  // Tỉnh/Thành phố

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    /**
     * Get full address as a single string
     */
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(address);
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
