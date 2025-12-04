package fit.iuh.backend.modules.payment.application.service;

import fit.iuh.backend.modules.payment.domain.entity.Payment;

import java.util.Map;

/**
 * Interface định nghĩa các hành vi chung cho một cổng thanh toán.
 */
public interface PaymentGatewayService {

    /**
     * Tạo URL để chuyển hướng người dùng đến trang thanh toán của bên thứ ba.
     * @param payment Đối tượng thanh toán chứa thông tin cần thiết.
     * @return URL thanh toán.
     */
    String createPaymentUrl(Payment payment);

    /**
     * Xử lý thông báo IPN (Instant Payment Notification) từ cổng thanh toán.
     * @param ipnData Dữ liệu IPN gửi từ cổng thanh toán.
     * @return Map chứa kết quả xử lý IPN (success, paymentId, status, transactionId, notes)
     */
    Map<String, Object> processIpn(Map<String, String> ipnData);
}