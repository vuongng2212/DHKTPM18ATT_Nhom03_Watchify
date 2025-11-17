import { Button, Result, Spin } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is a return from MoMo payment
    const status = searchParams.get("status");
    const resultCode = searchParams.get("resultCode");
    const message = searchParams.get("message");

    if (status === "success" || resultCode === "0") {
      // Payment successful
      setPaymentStatus({
        success: true,
        title: "Thanh toán thành công!",
        subTitle: "Đơn hàng của bạn đã được thanh toán thành công.",
        status: "success"
      });
    } else if (status === "failed" || (resultCode && resultCode !== "0")) {
      // Payment failed
      setPaymentStatus({
        success: false,
        title: "Thanh toán thất bại!",
        subTitle: `Thanh toán thất bại: ${message || "Có lỗi xảy ra trong quá trình thanh toán."}`,
        status: "error"
      });
    } else if (status === "error") {
      // System error
      setPaymentStatus({
        success: false,
        title: "Có lỗi xảy ra!",
        subTitle: "Có lỗi xảy ra trong quá trình xử lý thanh toán.",
        status: "error"
      });
    } else {
      // This is a regular order success (COD)
      setPaymentStatus({
        success: true,
        title: "Đặt hàng thành công!",
        subTitle: "Hệ thống đã ghi nhận thông tin đơn hàng của bạn.",
        status: "success"
      });
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spin size="large" />
        <p className="mt-4">Đang xử lý kết quả thanh toán...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div
          className="flex flex-col items-center justify-center"
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            minHeight: "calc(100vh - 300px)",
          }}
        >
          <Result
            status={paymentStatus.status}
            title={paymentStatus.title}
            subTitle={paymentStatus.subTitle}
            extra={[
              <Link to={"/"}>
                <Button key="home">Trang chủ</Button>
              </Link>,
              <Link to={"/history"}>
                <Button key="history">Lịch sử đơn hàng</Button>
              </Link>,
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default PaymentResult;
