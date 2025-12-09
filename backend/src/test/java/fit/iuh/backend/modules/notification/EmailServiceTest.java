package fit.iuh.backend.modules.notification;

import fit.iuh.backend.modules.notification.application.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

/**
 * Integration test for EmailService
 * 
 * To run these tests:
 * 1. Set environment variables:
 *    - MAIL_USERNAME=your-email@gmail.com
 *    - MAIL_PASSWORD=your-app-password (16-character code from Google)
 *    - MAIL_FROM=noreply@watchify.com
 *    - FRONTEND_URL=http://localhost:3001
 * 
 * 2. Enable test by removing @Disabled
 * 3. Run: ./gradlew test --tests EmailServiceTest
 * 
 * How to get Gmail App Password:
 * 1. Go to Google Account → Security
 * 2. Enable 2-Step Verification
 * 3. Go to App Passwords → Generate
 * 4. Use the 16-character code as MAIL_PASSWORD
 */
@SpringBootTest
@Slf4j
@Disabled("Manual test - requires SMTP configuration")
class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @Test
    void testSendWelcomeEmail() {
        log.info("Testing welcome email...");
        
        emailService.sendWelcomeEmail(
            "test@example.com",
            "Nguyễn Văn A"
        );
        
        log.info("✅ Welcome email sent successfully");
    }

    @Test
    void testSendOrderConfirmationEmail() {
        log.info("Testing order confirmation email...");
        
        emailService.sendOrderConfirmationEmail(
            "test@example.com",
            "Nguyễn Văn A",
            "ORD12345",
            new BigDecimal("5000000"),
            new BigDecimal("4500000"),
            new BigDecimal("500000")
        );
        
        log.info("✅ Order confirmation email sent successfully");
    }

    @Test
    void testSendPaymentSuccessEmail() {
        log.info("Testing payment success email...");
        
        emailService.sendPaymentSuccessEmail(
            "test@example.com",
            "Nguyễn Văn A",
            "ORD12345",
            new BigDecimal("4500000"),
            "MOMO_TXN123456"
        );
        
        log.info("✅ Payment success email sent successfully");
    }

    @Test
    void testSendOrderStatusUpdateEmail() {
        log.info("Testing order status update email...");
        
        emailService.sendOrderStatusUpdateEmail(
            "test@example.com",
            "Nguyễn Văn A",
            "ORD12345",
            "PROCESSING",
            "Đang xử lý"
        );
        
        log.info("✅ Order status update email sent successfully");
    }

    @Test
    void testSendOrderShippedEmail() {
        log.info("Testing order shipped email...");
        
        emailService.sendOrderShippedEmail(
            "test@example.com",
            "Nguyễn Văn A",
            "ORD12345",
            "VN123456789"
        );
        
        log.info("✅ Order shipped email sent successfully");
    }

    @Test
    void testSendOrderDeliveredEmail() {
        log.info("Testing order delivered email...");
        
        emailService.sendOrderDeliveredEmail(
            "test@example.com",
            "Nguyễn Văn A",
            "ORD12345"
        );
        
        log.info("✅ Order delivered email sent successfully");
    }

    @Test
    void testSendOrderCancelledEmail() {
        log.info("Testing order cancelled email...");
        
        emailService.sendOrderCancelledEmail(
            "test@example.com",
            "Nguyễn Văn A",
            "ORD12345",
            "Khách hàng yêu cầu hủy đơn"
        );
        
        log.info("✅ Order cancelled email sent successfully");
    }

    @Test
    void testAllEmailTemplates() {
        log.info("🚀 Testing all email templates...");
        
        String testEmail = "test@example.com";
        String fullName = "Nguyễn Văn A";
        
        // 1. Welcome
        emailService.sendWelcomeEmail(testEmail, fullName);
        sleep(1000);
        
        // 2. Order Confirmation
        emailService.sendOrderConfirmationEmail(
            testEmail, fullName, "ORD12345",
            new BigDecimal("5000000"), new BigDecimal("4500000"), new BigDecimal("500000")
        );
        sleep(1000);
        
        // 3. Payment Success
        emailService.sendPaymentSuccessEmail(
            testEmail, fullName, "ORD12345",
            new BigDecimal("4500000"), "MOMO_TXN123"
        );
        sleep(1000);
        
        // 4. Status Update
        emailService.sendOrderStatusUpdateEmail(
            testEmail, fullName, "ORD12345", "PROCESSING", "Đang xử lý"
        );
        
        log.info("✅ All email templates tested successfully");
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}