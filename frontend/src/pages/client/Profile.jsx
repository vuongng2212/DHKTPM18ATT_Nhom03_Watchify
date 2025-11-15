import { useEffect, useRef, useState } from "react";
import { Form, Input, Button, Upload, Select } from "antd";
import {
  UserOutlined,
  LockOutlined,
  CameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useCurrentApp } from "../../context/app.context";
import {
  changePasswordApi,
  updateProfileApi,
  uploadAvatarApi,
} from "../../services/api";

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState("info");
  const { user, setUser, messageApi, notificationApi } = useCurrentApp();
  const [fileList, setFileList] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarSelected, setAvatarSelected] = useState(null);

  const inputPasswordRef = useRef(null);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        id: user._id,
        tenNguoiDung: user.tenNguoiDung,
        email: user.email,
        sdt: user.sdt,
        gioiTinh: user.gioiTinh,
        avatar: user.avatar,
      });
      if (user.avatar) {
        setFileList([
          {
            uid: "-1",
            name: "avatar",
            status: "done",
            url: user.avatar,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [user, form, selectedSection]);

  useEffect(() => {
    if (selectedSection === "password") {
      inputPasswordRef.current?.focus();
    }
  }, [selectedSection]);

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const res = await updateProfileApi(values);

      if (res.status && res.data) {
        setUser(res.data.user);
        setAvatarSelected(null);
        messageApi.open({
          type: "success",
          content: "Cập nhật thông tin thành công!",
        });
      } else {
        messageApi.open({
          type: "error",
          content: res.message,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      notificationApi.error({
        message: "Lỗi khi cập nhật thông tin",
        description:
          "Đã xảy ra lỗi khi cập nhật thông tin cá nhân. Vui lòng thử lại sau.",
      });
      setLoading(false);
    }
  };

  const handleChangeAvatar = async ({ file, fileList: newFileList }) => {
    console.log("file", file);
    setFileList(newFileList.slice(-1));
  };

  const beforeUpload = (file) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    if (!isJpgOrPng) {
      messageApi.open({
        type: "error",
        content: "Ảnh phải là định dạng JPG/JPEG/PNG!",
      });
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.open({
        type: "error",
        content: "Ảnh phải nhỏ hơn 2MB!",
      });
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    setAvatarLoading(true);
    try {
      const res = await uploadAvatarApi(file);
      if (res.data && res.status && res.data?.url) {
        setAvatarSelected(res.data.url);
        form.setFieldsValue({ avatar: res.data.url });
        setFileList([
          {
            uid: "-1",
            name: file.name,
            status: "done",
            url: res.data.url,
          },
        ]);
        messageApi.open({
          type: "success",
          content: "Tải ảnh đại diện lên thành công!",
        });
        onSuccess("ok");
      } else {
        messageApi.open({
          type: "error",
          content: res.message,
        });
        onError();
      }
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      messageApi.open({
        type: "error",
        content: "Lỗi khi upload ảnh!",
      });
      onError();
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      const res = await changePasswordApi(values);

      if (res.status) {
        messageApi.open({
          type: "success",
          content: "Đổi mật khẩu thành công!",
        });
        passwordForm.resetFields();
      } else {
        messageApi.open({
          type: "error",
          content: res.message,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      notificationApi.error({
        message: "Lỗi khi đổi mật khẩu",
        description: "Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-10 px-6 min-h-[65vh]">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4 bg-white rounded-lg shadow-md p-6 h-fit">
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-[110px] h-[110px]">
                <img
                  src={avatarSelected || user?.avatar}
                  alt="avatar"
                  className="w-[110px] h-[110px] rounded-full object-cover block"
                />
                {avatarLoading && (
                  <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-full z-20">
                    <LoadingOutlined
                      style={{ color: "#993333" }}
                      className="text-3xl animate-spin"
                    />
                  </div>
                )}
                <Upload
                  name="avatar"
                  showUploadList={false}
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  customRequest={customRequest}
                  onChange={handleChangeAvatar}
                  maxCount={1}
                  disabled={avatarLoading}
                >
                  <Button
                    shape="circle"
                    icon={<CameraOutlined />}
                    size="small"
                    className="bg-white shadow-md flex items-center !absolute right-1 bottom-1 z-30"
                    style={{
                      pointerEvents: avatarLoading ? "none" : "auto",
                      border: "none",
                      boxShadow: "0 2px 8px #0000001a",
                    }}
                  />
                </Upload>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {user?.tenNguoiDung}
            </h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>

          <div className="mt-6 border-t pt-4">
            <div
              className={`py-2 px-3 rounded-md cursor-pointer mb-2 ${
                selectedSection === "info"
                  ? "bg-red-50 text-red-600"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedSection("info")}
            >
              <UserOutlined className="mr-2" />
              Thông tin cá nhân
            </div>
            <div
              className={`py-2 px-3 rounded-md cursor-pointer mb-2 ${
                selectedSection === "password"
                  ? "bg-red-50 text-red-600"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedSection("password")}
            >
              <LockOutlined className="mr-2" />
              Đổi mật khẩu
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4 bg-white rounded-lg shadow-md p-6">
          {selectedSection === "info" && (
            <>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 select-none">
                Thông tin cá nhân
              </h2>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    hidden
                    labelCol={{ span: 24 }}
                    label="id"
                    name="id"
                  >
                    <Input disabled hidden />
                  </Form.Item>

                  <Form.Item
                    label="Họ tên"
                    name="tenNguoiDung"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên!" },
                      { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
                      {
                        pattern: /^[^\d]*$/,
                        message: "Họ tên không được chứa số!",
                      },
                    ]}
                  >
                    <Input className="rounded-md" />
                  </Form.Item>
                  <Form.Item
                    label="Số điện thoại"
                    name="sdt"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại!",
                      },
                      {
                        pattern: /^0[0-9]{9}$/,
                        message:
                          "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0!",
                      },
                    ]}
                  >
                    <Input className="rounded-md" />
                  </Form.Item>
                </div>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input className="rounded-md" disabled />
                </Form.Item>

                <Form.Item label="Giới tính" name="gioiTinh">
                  <Select className="rounded-md" placeholder="Chọn giới tính">
                    <Select.Option value="Nam">Nam</Select.Option>
                    <Select.Option value="Nữ">Nữ</Select.Option>
                    <Select.Option value="Khác">Khác</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="avatar" hidden>
                  <Input />
                </Form.Item>

                <Form.Item className="mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="text-white px-8"
                    style={{ backgroundColor: "#993333" }}
                    size="large"
                  >
                    Cập nhật thông tin
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
          {selectedSection === "password" && (
            <>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 select-none">
                Đổi mật khẩu
              </h2>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
              >
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="oldPassword"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu hiện tại!",
                    },
                  ]}
                >
                  <Input.Password
                    ref={inputPasswordRef}
                    className="rounded-md"
                  />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                    {
                      pattern:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ in hoa, 1 số và 1 ký tự đặc biệt!",
                    },
                  ]}
                >
                  <Input.Password className="rounded-md" />
                </Form.Item>

                <Form.Item
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng xác nhận mật khẩu mới!",
                    },
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
                  <Input.Password className="rounded-md" />
                </Form.Item>

                <Form.Item className="mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="bg-[#993333] text-white px-8"
                    style={{ backgroundColor: "#993333" }}
                    size="large"
                  >
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
