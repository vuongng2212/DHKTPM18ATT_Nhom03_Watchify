package fit.iuh.backend.modules.payment.web.controller;

import fit.iuh.backend.modules.payment.application.dto.PaymentDto;
import fit.iuh.backend.modules.payment.application.service.PaymentGatewayFactory;
import fit.iuh.backend.modules.payment.application.service.PaymentGatewayService;
import fit.iuh.backend.modules.payment.application.service.PaymentService;
import fit.iuh.backend.modules.payment.application.service.MomoPaymentGatewayService;
import fit.iuh.backend.modules.order.domain.entity.PaymentMethod;
import fit.iuh.backend.modules.payment.domain.entity.PaymentStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST controller for Payment operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management APIs")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentGatewayFactory paymentGatewayFactory;

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payment by order ID", description = "Get payment information for a specific order")
    public ResponseEntity<PaymentDto> getPaymentByOrderId(
            @Parameter(description = "Order ID") @PathVariable UUID orderId) {

        PaymentDto payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(payment);
    }

    @Operation(summary = "Handle payment return from gateway", description = "Redirect endpoint after payment completion")
    @GetMapping("/return")
    public ResponseEntity<String> handlePaymentReturn(@RequestParam Map<String, String> params) {
        log.info("Payment return received: {}", params);

        try {
            String requestId = params.get("requestId");
            String resultCode = params.get("resultCode");
            String transId = params.get("transId");

            if (requestId == null || resultCode == null) {
                log.error("Missing required parameters in payment return");
                return ResponseEntity.status(302)
                        .header("Location", "http://localhost:3001/payment-result?status=error&message=Missing parameters")
                        .build();
            }

            // Parse payment ID from requestId
            UUID paymentId = UUID.fromString(requestId);
            boolean isSuccessful = "0".equals(resultCode);
            PaymentStatus status = isSuccessful ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
            String notes = isSuccessful ? "MoMo payment successful via return URL" : "MoMo payment failed via return URL: " + resultCode;

            // Update payment status
            paymentService.updatePaymentStatus(paymentId, status, transId, notes);

            log.info("Payment return processed successfully for requestId: {}", requestId);

            // Redirect to frontend success/failure page
            String redirectUrl = "http://localhost:3001/payment-result?status=" +
                    (isSuccessful ? "success" : "failed") + "&resultCode=" + resultCode;
            return ResponseEntity.status(302).header("Location", redirectUrl).build();

        } catch (Exception e) {
            log.error("Error processing payment return", e);
            return ResponseEntity.status(302)
                    .header("Location", "http://localhost:3001/payment-result?status=error&message=" + e.getMessage())
                    .build();
        }
    }

    @Operation(summary = "Handle Instant Payment Notification (IPN) from payment gateways", description = "Receives and processes IPN callbacks from payment gateways.")
    @PostMapping("/ipn/{gateway}")
    public ResponseEntity<Map<String, String>> processIpn(
            @PathVariable String gateway,
            @RequestParam Map<String, String> ipnData) {
        log.info("IPN received from {}: {}", gateway, ipnData);

        try {
            PaymentGatewayService gatewayService = null;
            if ("momo".equalsIgnoreCase(gateway)) {
                gatewayService = paymentGatewayFactory.getGatewayService(PaymentMethod.BANK_TRANSFER);
            }

            if (gatewayService != null) {
                Map<String, Object> result = gatewayService.processIpn(ipnData);
                if ((Boolean) result.get("success")) {
                    // Update payment status
                    UUID paymentId = (UUID) result.get("paymentId");
                    PaymentStatus status = (PaymentStatus) result.get("status");
                    String transactionId = (String) result.get("transactionId");
                    String notes = (String) result.get("notes");

                    paymentService.updatePaymentStatus(paymentId, status, transactionId, notes);
                    return ResponseEntity.ok(Map.of("message", "IPN processed successfully"));
                } else {
                    String error = (String) result.get("error");
                    return ResponseEntity.badRequest().body(Map.of("error", error));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported gateway"));
            }
        } catch (Exception e) {
            log.error("Error processing IPN", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "IPN processing failed"));
        }
    }

    // Mock endpoint to simulate payment success
    @PostMapping("/mock-success/{orderId}")
    @Operation(summary = "Mock payment success", description = "Simulate payment success for testing")
    public ResponseEntity<String> mockPaymentSuccess(@PathVariable UUID orderId) {
        // This would trigger the event in real implementation
        return ResponseEntity.ok("Mock payment success simulated for order: " + orderId);
    }
}