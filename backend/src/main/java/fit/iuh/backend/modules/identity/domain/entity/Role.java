package fit.iuh.backend.modules.identity.domain.entity;

import fit.iuh.backend.sharedkernel.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a user role in the system.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Column(name = "name", unique = true, nullable = false, length = 50)
    private String name;  // ROLE_CUSTOMER, ROLE_ADMIN

    @Column(name = "description")
    private String description;

    // Convenience methods for role names
    public static final String CUSTOMER = "ROLE_CUSTOMER";
    public static final String ADMIN = "ROLE_ADMIN";
}
