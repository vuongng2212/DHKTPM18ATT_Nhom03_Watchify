package fit.iuh.backend.sharedkernel.event;

import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Abstract base class for domain events.
 * Provides common event metadata.
 */
@Getter
public abstract class BaseDomainEvent implements DomainEvent {
    
    private final UUID eventId;
    private final LocalDateTime occurredOn;
    private final String eventType;
    
    protected BaseDomainEvent(String eventType) {
        this.eventId = UUID.randomUUID();
        this.occurredOn = LocalDateTime.now();
        this.eventType = eventType;
    }
}
