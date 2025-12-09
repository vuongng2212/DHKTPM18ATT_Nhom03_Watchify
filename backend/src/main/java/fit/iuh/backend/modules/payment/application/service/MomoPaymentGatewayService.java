package fit.iuh.backend.modules.payment.application.service;

import fit.iuh.backend.modules.payment.application.dto.momo.MomoPaymentRequest;
import fit.iuh.backend.modules.payment.application.dto.momo.MomoPaymentResponse;
import fit.iuh.backend.modules.payment.domain.entity.Payment;
import fit.iuh.backend.modules.payment.domain.entity.PaymentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service("momoPaymentGatewayService")
public class MomoPaymentGatewayService implements PaymentGatewayService {

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.api-endpoint}")
    private String apiEndpoint;

    @Value("${momo.return-url}")
    private String returnUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String MOMO_REQUEST_TYPE = "captureWallet";

    @Override
    public String createPaymentUrl(Payment payment) {
        try {
            String orderInfo = "Thanh toan don hang " + payment.getOrder().getId();

            log.info("=== CREATING MOMO PAYMENT URL ===");
            log.info("Payment ID: {}", payment.getId());
            log.info("Order ID: {}", payment.getOrder().getId());
            log.info("Amount: {}", payment.getAmount());

            // Create request
            MomoPaymentRequest momoRequest = MomoPaymentRequest.builder()
                    .partnerCode(partnerCode)
                    .partnerName("Watchify")
                    .storeId("WatchifyStore")
                    .requestId(payment.getId().toString())
                    .amount(payment.getAmount().longValue())
                    .orderId(payment.getId().toString())
                    .orderInfo(orderInfo)
                    .redirectUrl(returnUrl)
                    .ipnUrl(ipnUrl)
                    .lang("vi")
                    .requestType(MOMO_REQUEST_TYPE)
                    .extraData("")
                    .build();

            // Build raw data for signature
            String rawData = buildRawData(momoRequest);
            log.info("Raw data for signature: {}", rawData);
            
            String signature = generateSignature(rawData, secretKey);
            log.info("Generated signature: {}", signature);

            momoRequest.setSignature(signature);

            log.info("MoMo Request: {}", momoRequest);
            log.info("API Endpoint: {}", apiEndpoint);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<MomoPaymentRequest> requestEntity = new HttpEntity<>(momoRequest, headers);

            log.info("Sending request to MoMo...");
            MomoPaymentResponse momoResponse = restTemplate.postForObject(apiEndpoint, requestEntity, MomoPaymentResponse.class);

            log.info("MoMo Response: {}", momoResponse);
            log.info("Result Code: {}", momoResponse != null ? momoResponse.getResultCode() : "null");
            log.info("Message: {}", momoResponse != null ? momoResponse.getMessage() : "null");

            if (momoResponse != null && "0".equals(momoResponse.getResultCode())) {
                log.info("✅ MoMo payment URL created successfully: {}", momoResponse.getPayUrl());
                return momoResponse.getPayUrl();
            } else {
                log.error("❌ Failed to create Momo payment URL. Response: {}", momoResponse);
                if (momoResponse != null) {
                    log.error("Error Code: {}", momoResponse.getResultCode());
                    log.error("Error Message: {}", momoResponse.getMessage());
                }
                throw new RuntimeException("Failed to create Momo payment URL");
            }

        } catch (Exception e) {
            log.error("❌ Error creating Momo payment URL", e);
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());
            throw new RuntimeException("Error creating Momo payment URL: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> processIpn(Map<String, String> ipnData) {
        try {
            String requestId = ipnData.get("requestId");
            String resultCode = ipnData.get("resultCode");
            String transId = ipnData.get("transId");
            String amount = ipnData.get("amount");
            String signature = ipnData.get("signature");

            log.info("Processing MoMo IPN for requestId: {}", requestId);
            log.info("MoMo result code: {}", resultCode);

            // Verify signature
            Map<String, String> signatureParams = new HashMap<>(ipnData);
            signatureParams.remove("signature");
            signatureParams.put("accessKey", accessKey);

            String generatedSignature = generateSignatureFromMap(signatureParams, secretKey);

            if (!generatedSignature.equals(signature)) {
                log.error("Invalid MoMo IPN signature for requestId: {}", requestId);
                return Map.of(
                    "success", false,
                    "error", "Invalid signature",
                    "requestId", requestId
                );
            }

            // Parse payment ID from requestId
            UUID paymentId = UUID.fromString(requestId);

            boolean isSuccessful = "0".equals(resultCode);
            PaymentStatus status = isSuccessful ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
            String notes = isSuccessful ? "MoMo payment successful" : "MoMo payment failed: " + resultCode;

            log.info("MoMo IPN processed successfully for requestId: {}", requestId);

            return Map.of(
                "success", true,
                "paymentId", paymentId,
                "status", status,
                "transactionId", transId,
                "notes", notes
            );

        } catch (Exception e) {
            log.error("Error processing MoMo IPN", e);
            return Map.of(
                "success", false,
                "error", e.getMessage()
            );
        }
    }

    private String buildRawData(MomoPaymentRequest request) {
        // Order: accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType
        StringBuilder data = new StringBuilder();
        data.append("accessKey=").append(accessKey);
        data.append("&amount=").append(request.getAmount());
        data.append("&extraData=").append(request.getExtraData());
        data.append("&ipnUrl=").append(request.getIpnUrl());
        data.append("&orderId=").append(request.getOrderId());
        data.append("&orderInfo=").append(request.getOrderInfo());
        data.append("&partnerCode=").append(request.getPartnerCode());
        data.append("&redirectUrl=").append(request.getRedirectUrl());
        data.append("&requestId=").append(request.getRequestId());
        data.append("&requestType=").append(request.getRequestType());
        
        String result = data.toString();
        log.debug("Built raw data: {}", result);
        return result;
    }

    private String generateSignature(String data, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature", e);
        }
    }

    private String generateSignatureFromMap(Map<String, String> params, String secretKey) {
        try {
            StringBuilder data = new StringBuilder();
            params.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .forEach(entry -> {
                        if (!entry.getKey().equals("signature") && entry.getValue() != null && !entry.getValue().isEmpty()) {
                            data.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
                        }
                    });
            if (data.length() > 0) {
                data.deleteCharAt(data.length() - 1);
            }

            return generateSignature(data.toString(), secretKey);
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature from map", e);
        }
    }
}