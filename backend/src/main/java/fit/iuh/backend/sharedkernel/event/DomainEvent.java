package fit.iuh.backend.sharedkernel.event;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base interface for all domain events in the system.
 * Events are used for asynchronous communication between modules.
 */
public interface DomainEvent {
    
    /**
     * Unique identifier for the event
     */
    UUID getEventId();
    
    /**
     * Timestamp when the event occurred
     */
    LocalDateTime getOccurredOn();
    
    /**
     * Type of the event (e.g., "OrderCreated", "PaymentSuccess")
     */
    String getEventType();
}
