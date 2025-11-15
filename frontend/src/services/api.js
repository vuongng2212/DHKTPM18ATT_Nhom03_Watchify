import createInstanceAxios from "./axios.customize";

const axiosUser = createInstanceAxios(import.meta.env.VITE_BACKEND_USER_URL);
const axiosOrder = createInstanceAxios(import.meta.env.VITE_BACKEND_ORDER_URL);
const axiosReview = createInstanceAxios(
  import.meta.env.VITE_BACKEND_REVIEW_URL
);
const axiosChatbot = createInstanceAxios(
  import.meta.env.VITE_BACKEND_CHATBOT_URL
);

export const registerApi = (data) => {
  return axiosUser.post("/api/v1/auth/register", data);
};

export const loginApi = (data) => {
  return axiosUser.post("/api/v1/auth/login", data);
};

export const logoutApi = () => {
  return axiosUser.post("/api/v1/auth/logout");
};

export const refreshTokenApi = () => {
  return axiosUser.post("/api/auth/refreshToken");
};

export const fetchAccountApi = () => {
  return axiosUser.get("/api/v1/auth/me");
};

export const forgotPasswordApi = (email) => {
  return axiosUser.post("/api/auth/forgotPassword", email);
};

export const verifyOtpApi = ({ email, otp }) => {
  return axiosUser.post("/api/auth/verifyOtp", { email, otp });
};

export const resetPasswordApi = ({ email, matKhau }) => {
  return axiosUser.post("/api/auth/resetPassword", { email, matKhau });
};

export const getUsersApi = (page = 1, limit = 5, search = "") => {
  return axiosUser.get(
    `/api/users?page=${page}&limit=${limit}&search=${search}`
  );
};

export const createOrderApi = (data) => {
  return axiosOrder.post("/api/orders", data);
};

export const updateProfileApi = (data) => {
  return axiosUser.put("/api/users", data);
};

export const changePasswordApi = (data) => {
  return axiosUser.put("/api/users/changePassword", data);
};

export const getOrdersApi = (page = 1, limit = 10) => {
  return axiosOrder.get(`/api/orders?page=${page}&limit=${limit}`);
};

export const getAllOrdersApi = (page = 1, limit = 10) => {
  return axiosOrder.get(`/api/orders/all?page=${page}&limit=${limit}`);
};

export const updateOrderStatusApi = (orderId, trangThaiDonHang) => {
  return axiosOrder.put(`/api/orders/${orderId}/status`, { trangThaiDonHang });
};

export const fetchReviewsByProduct = (productId) => {
  return axiosReview.get(`/api/reviews/product/${productId}`);
};

export const addReviewApi = (data) => {
  return axiosReview.post("/api/reviews/add", data);
};

export const chatbotApi = (data) => {
  return axiosChatbot.post("/api/chatbot", data);
};

export const getRolesApi = () => {
  return axiosUser.get("/api/roles");
};

export const uploadAvatarApi = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return axiosUser.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
};

export const addAccessHistoryApi = (productId) => {
  return axiosUser.post("/api/users/addAccessHistory", { productId });
};

export const getUserAnalyticsApi = () => {
  return axiosUser.get("/api/users/analytics");
};
