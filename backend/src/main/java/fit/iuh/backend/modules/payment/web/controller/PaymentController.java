package fit.iuh.backend.modules.payment.web.controller;

import fit.iuh.backend.modules.payment.application.dto.PaymentDto;
import fit.iuh.backend.modules.payment.application.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for Payment operations (Mock)
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management APIs (Mock)")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment by order ID", description = "Get payment information for a specific order")
    public ResponseEntity<PaymentDto> getPaymentByOrderId(
            @Parameter(description = "Order ID") @PathVariable UUID orderId) {

        PaymentDto payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(payment);
    }

    // Mock endpoint to simulate payment success
    @PostMapping("/mock-success/{orderId}")
    @Operation(summary = "Mock payment success", description = "Simulate payment success for testing")
    public ResponseEntity<String> mockPaymentSuccess(@PathVariable UUID orderId) {
        // This would trigger the event in real implementation
        return ResponseEntity.ok("Mock payment success simulated for order: " + orderId);
    }
}