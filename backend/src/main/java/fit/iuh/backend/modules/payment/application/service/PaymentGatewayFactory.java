package fit.iuh.backend.modules.payment.application.service;

import fit.iuh.backend.modules.order.domain.entity.PaymentMethod;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class PaymentGatewayFactory {

    private final Map<PaymentMethod, PaymentGatewayService> gatewayServiceMap;

    public PaymentGatewayFactory(Map<String, PaymentGatewayService> services) {
        this.gatewayServiceMap = services.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> {
                            if (entry.getKey().toLowerCase().contains("momo")) {
                                return PaymentMethod.BANK_TRANSFER; // Map MoMo to BANK_TRANSFER
                            } else {
                                return PaymentMethod.CASH_ON_DELIVERY; // Default
                            }
                        },
                        Map.Entry::getValue
                ));
    }

    public PaymentGatewayService getGatewayService(PaymentMethod type) {
        if (type == PaymentMethod.BANK_TRANSFER) {
            return Optional.ofNullable(gatewayServiceMap.get(type))
                    .orElseThrow(() -> new IllegalArgumentException("Unsupported payment method type: " + type));
        }
        return null; // For COD, no gateway needed
    }
}