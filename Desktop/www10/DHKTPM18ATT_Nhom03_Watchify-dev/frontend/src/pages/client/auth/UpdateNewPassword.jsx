import { useState, useEffect } from "react";
import { Button, Divider, Form, Input } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resetPasswordApi } from "../../../services/api";
import { useCurrentApp } from "../../../context/app.context";
import "./UpdateNewPassword.css";

const UpdateNewPasswordPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { messageApi } = useCurrentApp();

  const { email, verified } = location.state || {};

  useEffect(() => {
    if (!email || !verified) {
      messageApi.open({
        type: "error",
        content: "Vui lòng xác minh email trước khi đặt lại mật khẩu!",
      });
      navigate("/forgot-password");
      return;
    }

    form.setFieldsValue({ email });
  }, [email, verified, navigate, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const response = await resetPasswordApi({
        email: email,
        matKhau: values.newPassword,
      });

      if (response?.status) {
        messageApi.success("Cập nhật mật khẩu thành công!");
        navigate("/login");
      } else {
        messageApi.error(response?.message || "Cập nhật mật khẩu thất bại!");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      messageApi.error("Đã xảy ra lỗi khi cập nhật mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="update-page">
        <div className="container">
          <div className="update-form">
            <h2 className="text-center font-semibold text-xl">
              CẬP NHẬT MẬT KHẨU
            </h2>
            <Divider />
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item label="Email" name="email" hidden>
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
                    message:
                      "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ in hoa, 1 số và 1 ký tự đặc biệt!",
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="off"
                />
              </Form.Item>

              <Form.Item
                style={{ display: "flex", justifyContent: "center" }}
                label={null}
              >
                <Button
                  className="hover:bg-[#C40D2E] hover:text-white"
                  style={{ width: "124px", backgroundColor: "#9F1D25" }}
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  Xác nhận
                </Button>
              </Form.Item>
            </Form>

            <Divider>Or</Divider>
            <Link className="text-link text-center" to={"/login"}>
              <span className="block text-[#9F1D25] text-center">
                Quay lại đăng nhập
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateNewPasswordPage;
