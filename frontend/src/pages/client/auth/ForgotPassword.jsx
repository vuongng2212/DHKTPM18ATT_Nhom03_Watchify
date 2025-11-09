import { useState } from "react";
import { Button, Divider, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordApi, verifyOtpApi } from "../../../services/api";
import { useCurrentApp } from "../../../context/app.context";
import "./ForgotPassword.css";

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const { messageApi } = useCurrentApp();

  // Xử lý gửi mã OTP
  const handleSendCode = async () => {
    try {
      // Validate email trước
      await form.validateFields(["email"]);
      const email = form.getFieldValue("email");

      setSendingEmail(true);
      const response = await forgotPasswordApi({ email });

      if (response?.status) {
        messageApi.open({
          type: "success",
          content: "Mã OTP đã được gửi đến email của bạn!",
        });
        setOtpSent(true);
      } else {
        messageApi.open({
          type: "error",
          content: response?.message || "Đã xảy ra lỗi khi gửi mã OTP!",
        });
      }
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      messageApi.open({
        type: "error",
        content: "Đã xảy ra lỗi khi gửi mã OTP!",
      });
      console.error("Send OTP Error:", error);
    } finally {
      setSendingEmail(false);
    }
  };

  // Xử lý xác minh OTP và chuyển sang trang cập nhật mật khẩu mới
  const handleVerifyOtp = async () => {
    try {
      // Validate OTP trước
      await form.validateFields(["otp"]);
      const email = form.getFieldValue("email");
      const otp = form.getFieldValue("otp");

      setVerifyingOtp(true);
      const response = await verifyOtpApi({ email, otp });

      if (response?.status) {
        messageApi.open({
          type: "success",
          content: response.message || "Xác minh mã OTP thành công!",
        });

        navigate("/update-new-password", {
          state: {
            email: email,
            verified: true,
          },
        });
      } else {
        messageApi.open({
          type: "error",
          content: response?.message || "Mã OTP không hợp lệ!",
        });
      }
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      messageApi.error("Đã xảy ra lỗi khi xác minh mã OTP!");
      console.error("Verify OTP Error:", error);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <>
      <div className="forgot-page">
        <div className="container">
          <div className="forgot-form">
            <h2 className="text-center font-semibold text-xl select-none">
              QUÊN MẬT KHẨU
            </h2>
            <Divider />
            <Form form={form} layout="vertical">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                  {
                    pattern:
                      /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})+$/,
                    message: "Email không được chứa ký tự đặc biệt hoặc dấu!",
                  },
                ]}
              >
                <Input placeholder="Nhập email của bạn" disabled={otpSent} />
              </Form.Item>

              <div className="flex justify-end items-center">
                <Button
                  style={{ width: "90px", backgroundColor: "#9F1D25" }}
                  type="primary"
                  onClick={handleSendCode}
                  loading={sendingEmail}
                >
                  {otpSent ? "Gửi lại" : "Gửi mã"}
                </Button>
              </div>

              <Form.Item
                label="Nhập mã OTP"
                name="otp"
                rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
              >
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nhập mã OTP từ email"
                    disabled={!otpSent}
                    className="flex-1"
                  />
                  {otpSent && (
                    <Button
                      onClick={handleVerifyOtp}
                      loading={verifyingOtp}
                      type="primary"
                      style={{ backgroundColor: "#9F1D25" }}
                    >
                      Xác minh
                    </Button>
                  )}
                </div>
              </Form.Item>
            </Form>

            <Divider>Or</Divider>
            <Link className="text-link text-center" to={"/login"}>
              <span className="block text-[#9F1D25] text-center">Quay lại</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
