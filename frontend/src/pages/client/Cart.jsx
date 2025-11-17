import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Col, Row, Empty, Form, Input, Radio, Button, Select } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useCurrentApp } from "../../context/app.context";
import { createOrderApi, getPaymentByOrderIdApi } from "../../services/api";
import { getUserAddressesApi } from "../../services/api";
import info from "../../assets/info.png";
import discount from "../../assets/discount.png";
import location from "../../assets/location.png";
import creditcard from "../../assets/creditcard.png";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    user,
    carts,
    setCarts,
    updateCartItemQuantity,
    removeFromCart,
    messageApi,
    notificationApi,
  } = useCurrentApp();
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        tenNguoiDung: user.tenNguoiDung,
        sdt: user.sdt,
        email: user.email,
        phuongThucThanhToan: "COD",
      });

      // Fetch user addresses
      const fetchAddresses = async () => {
        try {
          const res = await getUserAddressesApi();
          setAddresses(res || []);
        } catch (error) {
          console.error("Error fetching addresses:", error);
        }
      };
      fetchAddresses();
    }
  }, [user, form]);

  const handleIncreaseQuantity = (itemId) => {
    const item = carts.find((item) => item._id === itemId);
    if (item) {
      updateCartItemQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    const item = carts.find((item) => item._id === itemId);
    if (item && item.quantity > 1) {
      updateCartItemQuantity(itemId, item.quantity - 1);
    } else {
      messageApi.open({
        type: "error",
        content: "Số lượng không thể nhỏ hơn 1!",
      });
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    messageApi.open({
      type: "success",
      content: "Xóa sản phẩm khỏi giỏ hàng thành công!",
    });
  };

  const calculateTotal = () => {
    return carts.reduce((total, item) => {
      // Xử lý giá từ backend (BigDecimal) hoặc từ frontend
      let priceValue = item.price;
      if (typeof item.price === 'object' && item.price !== null) {
        // Nếu là BigDecimal từ backend, chuyển sang số
        priceValue = parseFloat(item.price);
      } else if (typeof item.price === 'string') {
        priceValue = parseFloat(item.price.replace(/[^\d.]/g, ""));
      } else if (item.giaBan) {
        priceValue = typeof item.giaBan === 'object' ? parseFloat(item.giaBan) : item.giaBan;
      }

      return total + (priceValue || 0) * item.quantity;
    }, 0);
  };

  const handleSubmit = async (values) => {
    setIsSubmit(true);

    const items = carts.map((cart) => ({
      productId: cart.id || cart._id,
      quantity: cart.quantity,
    }));

    const order = {
      paymentMethod: values.phuongThucThanhToan === "COD" ? "CASH_ON_DELIVERY" : "BANK_TRANSFER",
      shippingAddress: values.diaChi,
      billingAddress: values.diaChi,
      notes: values.ghiChu ?? "",
      items,
    };

    console.log("Order data to send:", order);

    try {
      const res = await createOrderApi(order);

      if (res) {
        localStorage.removeItem("carts");
        setCarts([]);
        if (values.phuongThucThanhToan === "COD") {
          messageApi.open({
            type: "success",
            content: "Đặt hàng thành công!",
          });
          navigate("/payment-result");
        } else {
          // For MoMo payment, get payment URL and redirect
          try {
            const paymentRes = await getPaymentByOrderIdApi(res.id);
            if (paymentRes && paymentRes.notes && paymentRes.notes.includes("Payment URL:")) {
              const payUrl = paymentRes.notes.replace("Payment URL: ", "");
              messageApi.open({
                type: "info",
                content: "Đang chuyển hướng đến trang thanh toán MoMo...",
              });
              // Redirect to MoMo payment page
              window.location.href = payUrl;
            } else {
              messageApi.open({
                type: "error",
                content: "Không thể lấy URL thanh toán. Vui lòng thử lại.",
              });
            }
          } catch (paymentError) {
            console.error("Error fetching payment info:", paymentError);
            messageApi.open({
              type: "error",
              content: "Không thể lấy thông tin thanh toán. Vui lòng thử lại.",
            });
          }
        }
      } else {
        notificationApi.error({
          message: "Có lỗi xảy ra",
          description: "Không nhận được phản hồi từ server",
          duration: 5,
        });
      }
    } catch (error) {
      console.error("Order creation error:", error);
      notificationApi.error({
        message: "Có lỗi xảy ra",
        description: error.response?.data?.message || error.message || "Lỗi không xác định",
        duration: 5,
      });
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-14">
      <div className="flex flex-col space-y-6">
        {carts.length > 0 ? (
          <div className="flex flex-col space-y-6 border px-6 py-4 border-gray-300 rounded-xl shadow-2xl">
            <div className="space-y-2">
              {carts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-6 border-b border-[#EEEEEE]"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.images?.[0] || (item.hinhAnh && Array.isArray(item.hinhAnh) && item.hinhAnh[0]?.duLieuAnh) || "https://via.placeholder.com/160x160?text=No+Image"}
                      alt={item.name}
                      className="w-40 h-40 object-cover"
                    />
                    <div className="flex flex-col justify-between">
                      <span className="font-semibold text-2xl">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-4 mt-6">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleDecreaseQuantity(item._id)}
                            className="flex items-center justify-center cursor-pointer text-xl w-6 h-6 border border-gray-500 rounded-sm px-2 py-2 transition duration-200 ease-in-out transform hover:scale-105"
                          >
                            -
                          </button>
                          <span className="text-xl">{item.quantity}</span>
                          <button
                            onClick={() => handleIncreaseQuantity(item._id)}
                            className="flex items-center justify-center cursor-pointer text-xl w-6 h-6 border border-gray-500 rounded-sm px-2 py-2 transition duration-200 ease-in-out transform hover:scale-105"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-black font-semibold text-xl ml-3">
                          {typeof item.price === 'object' ? item.price : item.price}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 mt-8">
                        <div
                          onClick={() => handleRemoveItem(item._id)}
                          className="flex items-center justify-center border border-gray-500 w-6 h-6 rounded-full text-sm cursor-pointer"
                        >
                          <DeleteOutlined />
                        </div>
                        <span
                          className="cursor-pointer transition-all duration-300 hover:text-red-400"
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          Xóa
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {carts.length > 0 && (
              <>
                <div className="flex items-center py-2 cursor-pointer text-black m-0 gap-3">
                  <div className="flex items-center space-x-2">
                    <img className="w-6 h-6" src={discount} alt="image" />
                    <span className="font-semibold text-[#676971] text-2xl">
                      Phiếu ưu đãi
                    </span>
                  </div>
                  <span className="text-3xl">&gt;</span>
                </div>

                <div className="flex items-center justify-between text-sm font-semibold border-b border-gray-300 py-4 m-0">
                  <span className="text-lg text-[#676775]">Tạm tính:</span>
                  <span className="text-lg text-[#676775]">
                    {calculateTotal().toLocaleString("vi-VN")} đ
                  </span>
                </div>

                <div className="flex items-center justify-between text-lg font-semibold border-b border-gray-300 py-4">
                  <span className="text-xl text-[#676775]">Tổng:</span>
                  <span className="text-xl">
                    {calculateTotal().toLocaleString("vi-VN")} đ
                  </span>
                </div>

                <Form
                  form={form}
                  onFinish={handleSubmit}
                  layout="vertical"
                  className="space-y-4"
                >
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 mb-4 mt-4">
                      <img className="w-6 h-6" src={info} alt="image" />
                      <span className="font-semibold text-lg text-[#676971]">
                        Thông tin khách hàng
                      </span>
                    </div>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Form.Item
                          name="tenNguoiDung"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên khách hàng!",
                            },
                            {
                              pattern: /^[^\d]+$/,
                              message: "Tên không được chứa số!",
                            },
                          ]}
                        >
                          <Input
                            className="w-full border border-black rounded-md text-[#676971] text-sm text-center"
                            placeholder="Tên khách hàng"
                            style={{ padding: 8 }}
                            onKeyDown={(e) => {
                              if (
                                e.target.value.length === 0 &&
                                e.key === " "
                              ) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="sdt"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số điện thoại!",
                            },
                            {
                              pattern: /^0\d{9}$/,
                              message:
                                "Số điện thoại phải bắt đầu từ số 0 và có 10 chữ số!",
                            },
                          ]}
                        >
                          <Input
                            className="w-full p-2 border border-black rounded-md text-[#676971] text-sm text-center"
                            placeholder="Số điện thoại"
                            style={{ padding: 8 }}
                            onKeyDown={(e) => {
                              if (
                                e.target.value.length === 0 &&
                                e.key === " "
                              ) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row className="mt-1">
                      <Col span={24}>
                        <Form.Item
                          name="email"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập email!",
                            },
                            {
                              type: "email",
                              message: "Email không hợp lệ!",
                            },
                            {
                              pattern:
                                /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})+$/,
                              message:
                                "Email không được chứa ký tự đặc biệt hoặc dấu!",
                            },
                          ]}
                        >
                          <Input
                            className="w-full border border-black rounded-md text-[#676971] text-sm text-center"
                            placeholder="Email"
                            style={{ padding: 8 }}
                            onKeyDown={(e) => {
                              if (
                                e.target.value.length === 0 &&
                                e.key === " "
                              ) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* Thông tin nhận hàng */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 mt-4">
                      <img className="w-6 h-6" src={location} alt="image" />
                      <span className="font-semibold text-lg text-[#676971]">
                        Thông tin nhận hàng
                      </span>
                    </div>
                    <span className="text-sm text-black mb-4 font-semibold">
                      Quốc gia: Việt Nam
                    </span>

                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-red-500">*</span>
                      <span className="text-sm text-black mb-1">Địa chỉ</span>
                    </div>
                    <Form.Item
                      name="diaChi"
                      rules={[
                        { required: true, message: "Vui lòng nhập địa chỉ!" },
                      ]}
                    >
                      {addresses.length > 0 ? (
                        <Select
                          className="w-full border border-black rounded-md text-[#676971] text-sm"
                          placeholder="Chọn địa chỉ giao hàng"
                          style={{ padding: 8 }}
                        >
                          {addresses.map((addr) => (
                            <Select.Option key={addr.id} value={addr.fullAddress}>
                              {addr.fullAddress}
                            </Select.Option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          className="w-full p-2 border border-black rounded-md text-[#676971] text-sm text-center"
                          placeholder="Số nhà - Tên đường - Thôn/Xã"
                          style={{ padding: 8 }}
                          onKeyDown={(e) => {
                            if (e.target.value.length === 0 && e.key === " ") {
                              e.preventDefault();
                            }
                          }}
                        />
                      )}
                    </Form.Item>
                  </div>

                  {/* Thông tin bổ sung */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="font-semibold text-lg text-[#676971]">
                        THÔNG TIN BỔ SUNG
                      </span>
                    </div>
                    <span className="text-sm text-black mb-1 font-semibold">
                      Yêu cầu khác
                    </span>
                    <Form.Item name="ghiChu" noStyle>
                      <Input
                        className="w-full p-2 border border-black rounded-md text-[#676971] text-sm text-center"
                        placeholder="Nhập yêu cầu (Không bắt buộc)"
                        style={{ padding: 8, marginTop: 8 }}
                        onKeyDown={(e) => {
                          if (e.target.value.length === 0 && e.key === " ") {
                            e.preventDefault();
                          }
                        }}
                      />
                    </Form.Item>
                  </div>

                  {/* Phương thức thanh toán */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 mb-4 mt-4">
                      <img className="w-6 h-6" src={creditcard} alt="image" />
                      <span className="font-semibold text-lg text-[#676971]">
                        Phương thức thanh toán
                      </span>
                    </div>
                    <Form.Item
                      name="phuongThucThanhToan"
                      initialValue="COD"
                      noStyle
                    >
                      <Radio.Group className="w-full block">
                        <label className="block w-full mb-3 cursor-pointer">
                          <div className="flex items-center w-full">
                            <Radio value="COD" className="mr-2" />
                            <div className="bg-[#F6F6F6] text-black font-semibold rounded-md border border-[#E0E0E0] text-sm flex items-center p-3 cursor-pointer w-full">
                              <span>Thanh Toán Khi Nhận Hàng</span>
                            </div>
                          </div>
                        </label>
                        <label className="block w-full mb-5 cursor-pointer">
                          <div className="flex items-center w-full">
                            <Radio value="MOMO" className="mr-2" />
                            <div className="bg-[#F6F6F6] text-black font-semibold rounded-md border border-[#E0E0E0] text-sm flex items-center p-3 cursor-pointer w-full">
                              <span>Thanh Toán Qua MoMo</span>
                            </div>
                          </div>
                        </label>
                      </Radio.Group>
                    </Form.Item>
                  </div>

                  {/* Nút Đặt Hàng */}
                  <Form.Item noStyle>
                    <Button
                      htmlType="submit"
                      color="danger"
                      variant="solid"
                      style={{
                        padding: "20px 0",
                        borderRadius: 20,
                        backgroundColor: "#A51717",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                      className="bg-[#A51717] text-white w-full py-3 rounded-full text-sm font-semibold mb-5 cursor-pointer hover:bg-red-600 transition duration-300"
                      loading={isSubmit}
                    >
                      Đặt Hàng
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}
          </div>
        ) : (
          <Empty
            description={
              <span className="text-gray-500 text-xl select-none">
                Giỏ hàng của bạn đang trống
              </span>
            }
            imageStyle={{
              height: 140,
              width: 140,
            }}
            className="flex flex-col items-center justify-center min-h-[450px]"
          >
            <Link to="/">
              <button className="bg-[#A51717] text-white py-3 px-6 rounded-lg text-lg font-semibold cursor-pointer hover:bg-red-600 transition duration-300 mt-2">
                Tiếp tục mua sắm
              </button>
            </Link>
          </Empty>
        )}
      </div>
    </div>
  );
};

export default CartPage;
