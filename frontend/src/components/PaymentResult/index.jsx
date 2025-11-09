import { Button, Result } from "antd";
import { Link } from "react-router-dom";

const PaymentResult = () => {
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
            status="success"
            title="Đặt hàng thành công!"
            subTitle="Hệ thống đã ghi nhận thông tin đơn hàng của bạn."
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
