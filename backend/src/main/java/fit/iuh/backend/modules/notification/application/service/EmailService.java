package fit.iuh.backend.modules.notification.application.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Service for sending emails using JavaMailSender and Thymeleaf templates
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.name}")
    private String fromName;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.email.support}")
    private String supportEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getInstance(new Locale("vi", "VN"));

    /**
     * Send email with HTML template
     */
    @Async
    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            log.info("📧 Preparing to send email to: {}", to);
            log.info("📨 Subject: {}", subject);
            log.info("📄 Template: {}", templateName);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Set email properties
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);

            // Add common variables
            variables.put("frontendUrl", frontendUrl);
            variables.put("supportEmail", supportEmail);
            variables.put("currentYear", String.valueOf(LocalDateTime.now().getYear()));

            // Process template
            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process("email/" + templateName, context);

            helper.setText(htmlContent, true);

            // Send email
            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("❌ Failed to send email to: {}. Error: {}", to, e.getMessage(), e);
            // Don't throw exception to prevent blocking the main flow
        }
    }

    /**
     * Send welcome email after registration
     */
    public void sendWelcomeEmail(String to, String fullName) {
        log.info("🎉 Sending welcome email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("loginUrl", frontendUrl + "/login");

        sendEmail(to, "Chào mừng đến với Watchify!", "welcome-email", variables);
    }

    /**
     * Send order confirmation email
     */
    public void sendOrderConfirmationEmail(String to, String fullName, String orderCode,
                                          BigDecimal totalAmount, BigDecimal finalAmount,
                                          BigDecimal discountAmount) {
        log.info("📦 Sending order confirmation email for order: {}", orderCode);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("orderCode", orderCode);
        variables.put("totalAmount", formatCurrency(totalAmount));
        variables.put("discountAmount", formatCurrency(discountAmount != null ? discountAmount : BigDecimal.ZERO));
        variables.put("finalAmount", formatCurrency(finalAmount));
        variables.put("orderDate", formatDateTime(LocalDateTime.now()));
        variables.put("orderDetailUrl", frontendUrl + "/history");

        sendEmail(to, "Xác nhận đơn hàng #" + orderCode, "order-confirmation", variables);
    }

    /**
     * Send payment success email
     */
    public void sendPaymentSuccessEmail(String to, String fullName, String orderCode,
                                       BigDecimal amount, String transactionId) {
        log.info("💳 Sending payment success email for order: {}", orderCode);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("orderCode", orderCode);
        variables.put("amount", formatCurrency(amount));
        variables.put("transactionId", transactionId != null ? transactionId : "N/A");
        variables.put("paymentDate", formatDateTime(LocalDateTime.now()));
        variables.put("orderDetailUrl", frontendUrl + "/history");

        sendEmail(to, "Thanh toán thành công #" + orderCode, "payment-success", variables);
    }

    /**
     * Send order status update email
     */
    public void sendOrderStatusUpdateEmail(String to, String fullName, String orderCode,
                                          String status, String statusText) {
        log.info("🔄 Sending order status update email for order: {}", orderCode);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("orderCode", orderCode);
        variables.put("status", status);
        variables.put("statusText", statusText);
        variables.put("updateDate", formatDateTime(LocalDateTime.now()));
        variables.put("orderDetailUrl", frontendUrl + "/history");

        sendEmail(to, "Cập nhật đơn hàng #" + orderCode, "order-status-update", variables);
    }

    /**
     * Send order shipped email
     */
    public void sendOrderShippedEmail(String to, String fullName, String orderCode,
                                     String trackingNumber) {
        log.info("🚚 Sending order shipped email for order: {}", orderCode);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("orderCode", orderCode);
        variables.put("trackingNumber", trackingNumber != null ? trackingNumber : "Đang cập nhật");
        variables.put("shippedDate", formatDateTime(LocalDateTime.now()));
        variables.put("orderDetailUrl", frontendUrl + "/history");

        sendEmail(to, "Đơn hàng #" + orderCode + " đang được giao", "order-shipped", variables);
    }

    /**
     * Send order delivered email
     */
    public void sendOrderDeliveredEmail(String to, String fullName, String orderCode) {
        log.info("✅ Sending order delivered email for order: {}", orderCode);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("orderCode", orderCode);
        variables.put("deliveredDate", formatDateTime(LocalDateTime.now()));
        variables.put("orderDetailUrl", frontendUrl + "/history");
        variables.put("reviewUrl", frontendUrl + "/history"); // Can be customized

        sendEmail(to, "Đơn hàng #" + orderCode + " đã giao thành công", "order-delivered", variables);
    }

    /**
     * Send order cancelled email
     */
    public void sendOrderCancelledEmail(String to, String fullName, String orderCode,
                                       String cancelReason) {
        log.info("❌ Sending order cancelled email for order: {}", orderCode);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("orderCode", orderCode);
        variables.put("cancelReason", cancelReason != null ? cancelReason : "Theo yêu cầu của khách hàng");
        variables.put("cancelDate", formatDateTime(LocalDateTime.now()));
        variables.put("supportEmail", supportEmail);

        sendEmail(to, "Đơn hàng #" + orderCode + " đã bị hủy", "order-cancelled", variables);
    }

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String to, String fullName, String resetToken) {
        log.info("🔐 Sending password reset email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("resetLink", frontendUrl + "/reset-password?token=" + resetToken);
        variables.put("expiryTime", "24 giờ");

        sendEmail(to, "Đặt lại mật khẩu Watchify", "password-reset", variables);
    }

    /**
     * Send email verification email
     */
    public void sendEmailVerificationEmail(String to, String fullName, String verificationToken) {
        log.info("✉️ Sending email verification to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("verificationLink", frontendUrl + "/verify-email?token=" + verificationToken);
        variables.put("expiryTime", "24 giờ");

        sendEmail(to, "Xác nhận địa chỉ email - Watchify", "email-verification", variables);
    }

    /**
     * Send promotional email
     */
    public void sendPromotionalEmail(String to, String fullName, String promoTitle,
                                    String promoDescription, String promoCode,
                                    String expiryDate) {
        log.info("🎁 Sending promotional email to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("promoTitle", promoTitle);
        variables.put("promoDescription", promoDescription);
        variables.put("promoCode", promoCode);
        variables.put("expiryDate", expiryDate);
        variables.put("shopUrl", frontendUrl);

        sendEmail(to, promoTitle, "promotional-email", variables);
    }

    /**
     * Send product back in stock notification
     */
    public void sendBackInStockEmail(String to, String fullName, String productName,
                                    String productUrl, BigDecimal price) {
        log.info("📦 Sending back in stock notification to: {}", to);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("productName", productName);
        variables.put("productUrl", frontendUrl + productUrl);
        variables.put("price", formatCurrency(price));

        sendEmail(to, productName + " đã có hàng trở lại!", "back-in-stock", variables);
    }

    /**
     * Send price drop notification
     */
    public void sendPriceDropEmail(String to, String fullName, String productName,
                                  String productUrl, BigDecimal oldPrice, BigDecimal newPrice) {
        log.info("💰 Sending price drop notification to: {}", to);

        BigDecimal discount = oldPrice.subtract(newPrice);
        BigDecimal discountPercent = discount.multiply(BigDecimal.valueOf(100)).divide(oldPrice, 0, BigDecimal.ROUND_HALF_UP);

        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", fullName);
        variables.put("productName", productName);
        variables.put("productUrl", frontendUrl + productUrl);
        variables.put("oldPrice", formatCurrency(oldPrice));
        variables.put("newPrice", formatCurrency(newPrice));
        variables.put("discount", formatCurrency(discount));
        variables.put("discountPercent", discountPercent.toString());

        sendEmail(to, productName + " đang giảm giá!", "price-drop", variables);
    }

    // Helper methods

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0";
        return CURRENCY_FORMATTER.format(amount) + " ₫";
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DATE_FORMATTER);
    }
}