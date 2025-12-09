import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Divider, Form, Input, Select } from "antd";
import { useCurrentApp } from "../../../context/app.context";
import { registerApi, loginApi } from "../../../services/api";
import "./Register.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const { messageApi, setUser, setIsAuthenticated } = useCurrentApp();

  const fullNameInputRef = useRef(null);

  const onFinish = async (values) => {
    setIsSubmit(true);
    const { fullName, email, password, phone } = values;
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const registerRes = await registerApi({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      // Check if registration failed (backend error response)
      if (registerRes.status >= 400 || registerRes.errorCode) {
        messageApi.open({
          type: "error",
          content: registerRes.message || "Đăng ký thất bại.",
        });
        setIsSubmit(false);
        return;
      }

      // Registration successful, proceed with auto login
      const loginRes = await loginApi({ email, password });
      if (loginRes?.token) {
        localStorage.setItem("accessToken", loginRes.token);
        setUser(loginRes.user);
        setIsAuthenticated(true);
        messageApi.open({
          type: "success",
          content: "Đăng ký thành công!",
        });
        navigate("/");
      } else {
        messageApi.open({
          type: "error",
          content: "Đăng ký thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập lại.",
        });
        navigate("/login");
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error?.response?.data?.message || "Đăng ký thất bại.",
      });
    } finally {
      setIsSubmit(false);
    }
  };

  useEffect(() => {
    fullNameInputRef?.current?.focus();
  }, []);

  return (
    <>
      <div className="register-page">
        <div className="container">
          <div className="register-form">
            <h2 className="font-semibold text-xl text-center select-none">
              ĐĂNG KÝ
            </h2>
            <Divider />
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Họ tên"
                name="fullName"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên!" },
                  {
                    whitespace: true,
                    message: "Họ tên không được chỉ chứa khoảng trắng!",
                  },
                  { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
                  {
                    pattern: /^[^\d]*$/,
                    message: "Họ tên không được chứa số!",
                  },
                ]}
              >
                <Input
                  ref={fullNameInputRef}
                  onKeyDown={(e) => {
                    if (e.key === " " && !e.target.value.trim()) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                  {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message:
                      "Email không được chứa ký tự đặc biệt và không được có dấu!",
                  },
                ]}
              >
                <Input
                  onKeyDown={(e) => {
                    if (e.key === " " && !e.target.value.trim()) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ in hoa, 1 số và 1 ký tự đặc biệt!",
                  },
                ]}
              >
                <Input.Password
                  autoComplete=""
                  onKeyDown={(e) => {
                    if (e.key === " " && !e.target.value.trim()) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Nhập lại mật khẩu"
                name="prePassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu nhập lại không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  autoComplete=""
                  onKeyDown={(e) => {
                    if (e.key === " " && !e.target.value.trim()) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^0[0-9]{9}$/,
                    message:
                      "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0!",
                  },
                ]}
              >
                <Input
                  onKeyDown={(e) => {
                    if (e.key === " " && !e.target.value.trim()) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                label={null}
              >
                <Button
                  style={{
                    width: "140px",
                    backgroundColor: "#A51717",
                    color: "#fff",
                  }}
                  type="default"
                  htmlType="submit"
                  loading={isSubmit}
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>

            <Divider>Or</Divider>
            <p className="question select-none">
              Đã có tài khoản ? &nbsp;
              <span>
                <Link className="text-link" to={"/login"}>
                  <span className="text-[#A51717]">Đăng Nhập</span>
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
