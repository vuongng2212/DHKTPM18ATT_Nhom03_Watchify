package fit.iuh.backend.modules.identity.domain.repository;

import fit.iuh.backend.modules.catalog.domain.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
}
