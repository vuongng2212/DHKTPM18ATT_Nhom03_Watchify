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

// Export axios instances for use in other services
export { axiosOrder };

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

export const getUsersApi = (page = 1, size = 10, search = "") => {
  return axiosUser.get(
    `/api/users?page=${page - 1}&size=${size}&search=${search}`
  );
};

export const lockUserApi = (userId) => {
  return axiosUser.put(`/api/users/${userId}/lock`);
};

export const unlockUserApi = (userId) => {
  return axiosUser.put(`/api/users/${userId}/unlock`);
};

export const toggleUserLockApi = (userId) => {
  return axiosUser.put(`/api/users/${userId}/toggle-lock`);
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
  return axiosOrder.post("/api/v1/orders", data);
};

export const updateProfileApi = (userId, data) => {
  return axiosUser.put(`/api/v1/users/${userId}`, data);
};

export const changePasswordApi = (data) => {
  return axiosUser.put("/api/v1/users/changePassword", data);
};

export const getOrdersApi = (page = 1, limit = 10) => {
  return axiosOrder.get(`/api/v1/orders?page=${page}&limit=${limit}`);
};

export const getAllOrdersApi = (page = 1, limit = 10) => {
  return axiosOrder.get(`/api/v1/orders/all?page=${page}&limit=${limit}`);
};

export const updateOrderStatusApi = (orderId, trangThaiDonHang) => {
  return axiosOrder.put(`/api/v1/orders/${orderId}/status`, { trangThaiDonHang });
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

export const getPaymentByOrderIdApi = (orderId) => {
  return axiosOrder.get(`/api/v1/payments/order/${orderId}`);
};

// Product CRUD APIs
export const createProductApi = (data, images) => {
  const formData = new FormData();
  
  // Append product data
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  // Append images if provided
  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append('hinhAnh', file);
    });
  }
  
  return axiosInventory.post('/api/v1/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateProductApi = (productId, data, images) => {
  const formData = new FormData();
  
  // Append product data
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  // Append new images if provided
  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append('hinhAnh', file);
    });
  }
  
  return axiosInventory.put(`/api/v1/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteProductApi = (productId) => {
  return axiosInventory.delete(`/api/v1/products/${productId}`);
};

// Brand CRUD APIs
export const getBrandsApi = (params = {}) => {
  return axiosInventory.get('/api/v1/brands', { params });
};

export const getBrandByIdApi = (brandId) => {
  return axiosInventory.get(`/api/v1/brands/${brandId}`);
};

export const createBrandApi = (data) => {
  return axiosInventory.post('/api/v1/brands', data);
};

export const updateBrandApi = (brandId, data) => {
  return axiosInventory.put(`/api/v1/brands/${brandId}`, data);
};

export const deleteBrandApi = (brandId) => {
  return axiosInventory.delete(`/api/v1/brands/${brandId}`);
};

export const toggleBrandVisibilityApi = (brandId) => {
  return axiosInventory.patch(`/api/v1/brands/${brandId}/toggle-visibility`);
};

// Category CRUD APIs
export const getCategoriesApi = (params = {}) => {
  return axiosInventory.get('/api/v1/categories', { params });
};

export const getCategoryByIdApi = (categoryId) => {
  return axiosInventory.get(`/api/v1/categories/${categoryId}`);
};

export const createCategoryApi = (data) => {
  return axiosInventory.post('/api/v1/categories', data);
};

export const updateCategoryApi = (categoryId, data) => {
  return axiosInventory.put(`/api/v1/categories/${categoryId}`, data);
};

export const deleteCategoryApi = (categoryId) => {
  return axiosInventory.delete(`/api/v1/categories/${categoryId}`);
};
