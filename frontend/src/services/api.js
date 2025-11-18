import createInstanceAxios from "./axios.customize";

const axiosUser = createInstanceAxios(import.meta.env.VITE_BACKEND_USER_URL);
const axiosOrder = createInstanceAxios(import.meta.env.VITE_BACKEND_ORDER_URL);
const axiosReview = createInstanceAxios(
  import.meta.env.VITE_BACKEND_REVIEW_URL
);
const axiosChatbot = createInstanceAxios(
  import.meta.env.VITE_BACKEND_CHATBOT_URL
);
const axiosInventory = createInstanceAxios(import.meta.env.VITE_BACKEND_CATALOG_URL);

export const registerApi = (data) => {
  return axiosUser.post("/api/v1/auth/register", data);
};

export const loginApi = (data) => {
  return axiosUser.post("/api/v1/auth/login", data);
};

export const refreshTokenApi = (refreshToken) => {
  return axiosUser.post("/api/v1/auth/refresh", { refreshToken });
};

export const logoutApi = (refreshToken) => {
  return axiosUser.post("/api/v1/auth/logout", { refreshToken });
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

export const getUserAddressesApi = () => {
  return axiosUser.get("/api/v1/user/addresses");
};

export const createAddressApi = (data) => {
  return axiosUser.post("/api/v1/user/addresses", data);
};

export const updateAddressApi = (addressId, data) => {
  return axiosUser.put(`/api/v1/user/addresses/${addressId}`, data);
};

export const deleteAddressApi = (addressId) => {
  return axiosUser.delete(`/api/v1/user/addresses/${addressId}`);
};

export const getDefaultAddressApi = () => {
  return axiosUser.get("/api/v1/user/addresses/default");
};

export const createOrderApi = (data) => {
  return axiosOrder.post("/api/orders", data);
};

export const updateProfileApi = (userId, data) => {
  return axiosUser.put(`/api/v1/users/${userId}`, data);
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

export const getInventoryByProductIdApi = (productId) => {
  return axiosInventory.get(`/api/v1/inventory/product/${productId}`);
};

export const getAvailableQuantityApi = (productId) => {
  return axiosInventory.get(`/api/v1/inventory/product/${productId}/available`);
};

// Product APIs
export const getProductsApi = (params = {}) => {
  return axiosInventory.get("/api/v1/products", { params });
};

export const getProductByIdApi = (productId) => {
  return axiosInventory.get(`/api/v1/products/${productId}`);
};

export const getProductBySlugApi = (slug) => {
  return axiosInventory.get(`/api/v1/products/slug/${slug}`);
};

export const searchProductsApi = (keyword) => {
  return axiosInventory.get(`/api/v1/products/search`, { params: { keyword } });
};

export const getFeaturedProductsApi = (limit = 10) => {
  return axiosInventory.get(`/api/v1/products/featured`, { params: { limit } });
};

export const getNewProductsApi = (limit = 10) => {
  return axiosInventory.get(`/api/v1/products/new`, { params: { limit } });
};

// Cart APIs
export const getCartApi = () => {
  return axiosUser.get("/cart");
};

export const addItemToCartApi = (productId, quantity) => {
  return axiosUser.post("/cart/items", {
    productId: productId,
    quantity
  });
};

export const updateCartItemApi = (productId, quantity) => {
  return axiosUser.put(`/cart/items/${productId}`, { quantity });
};

export const removeCartItemApi = (productId) => {
  return axiosUser.delete(`/cart/items/${productId}`);
};

export const clearCartApi = () => {
  return axiosUser.delete("/cart");
};
