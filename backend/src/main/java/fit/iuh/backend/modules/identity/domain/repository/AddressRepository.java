package fit.iuh.backend.modules.identity.domain.repository;

import fit.iuh.backend.modules.identity.domain.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Address entity.
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {

    /**
     * Find all addresses for a user
     */
    List<Address> findByUserId(UUID userId);

    /**
     * Find default address for a user
     */
    Optional<Address> findByUserIdAndIsDefaultTrue(UUID userId);
}
