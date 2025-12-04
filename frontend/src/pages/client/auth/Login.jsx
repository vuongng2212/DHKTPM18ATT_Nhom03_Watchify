import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Divider, Form, Input } from "antd";
import { useCurrentApp } from "../../../context/app.context";
import { loginApi } from "../../../services/api";
import "./Login.css";

// Cookie helper functions
const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const { setIsAuthenticated, setUser, messageApi, mergeCart } = useCurrentApp();

  const emailInputRef = useRef(null);

  const onFinish = async (values) => {
    setIsSubmit(true);
    const { email, password } = values;
    try {
      const res = await loginApi({
        email,
        password,
      });

      if (res?.token) {
        localStorage.setItem("accessToken", res.token);
        if (res.refreshToken) {
          setCookie("refreshToken", res.refreshToken, 7); // 7 days
        }
        
        setIsAuthenticated(true);
        setUser(res.user);
        
        // Merge guest cart with user cart after login
        const guestCart = localStorage.getItem("carts");
        if (guestCart) {
          try {
            const guestCartItems = JSON.parse(guestCart);
            if (guestCartItems.length > 0) {
              console.log("Merging guest cart with user cart:", guestCartItems);
              await mergeCart(guestCartItems);
            }
          } catch (error) {
            console.error("Error merging cart:", error);
            // Continue login even if cart merge fails
          }
        }
        
        messageApi.open({
          type: "success",
          content: "Đăng nhập thành công!",
        });
        navigate("/");
      } else {
        messageApi.open({
          type: "error",
          content:
            res.message && Array.isArray(res.message)
              ? res.message[0]
              : res.message,
        });
      }
    } catch (error) {
      console.error('=== Login Error ===');
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = "Đăng nhập thất bại.";
      
      // Special handling for different status codes
      if (error.response?.status === 403) {
        // Account is locked/banned
        errorMessage = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
        console.log('403 Forbidden - Account locked');
      } else if (error.response?.status === 401) {
        // Wrong credentials
        errorMessage = "Email hoặc mật khẩu không chính xác.";
        console.log('401 Unauthorized - Wrong credentials');
      } else if (error.response?.data) {
        // Try to extract message from response
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      console.log('Displaying error message:', errorMessage);
      
      // Display error message
      messageApi.open({
        type: "error",
        content: errorMessage,
        duration: 5,
      });
    } finally {
      setIsSubmit(false);
    }
  };

  useEffect(() => {
    emailInputRef?.current?.focus();
  }, []);

  return (
    <>
      <div className="login-page">
        <div className="container">
          <div className="login-form">
            <h2 className="font-semibold uppercase text-center text-xl select-none">
              Đăng Nhập
            </h2>
            <Divider />
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  ref={emailInputRef}
                  onKeyDown={(e) => {
                    if (e.key === " " && !e.target.value.trim()) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
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

              <div className="flex justify-between items-center">
                <Form.Item label={null}>
                  <Button
                    className="login-button"
                    style={{
                      backgroundColor: "#A51717",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    type="default"
                    htmlType="submit"
                    loading={isSubmit}
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>

                <span className="cursor-pointer">
                  <Link to="/forgot-password">
                    <span className="text-black hover:underline">
                      Quên mật khẩu?
                    </span>
                  </Link>
                </span>
              </div>
            </Form>

            <Divider>Or</Divider>
            <p className="question select-none">
              Chưa có tài khoản ? &nbsp;
              <span>
                <Link className="text-link" to={"/register"}>
                  <span className="text-[#A51717]">Đăng Ký</span>
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
