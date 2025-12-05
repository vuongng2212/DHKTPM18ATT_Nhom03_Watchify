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

export const getUsersApi = (page = 1, size = 10, search = "", role = null) => {
  console.log(`📥 [API] Fetching users - page: ${page}, size: ${size}, search: "${search}", role: "${role}"`);
  
  const params = new URLSearchParams();
  params.append('page', page - 1);
  params.append('size', size);
  if (search) params.append('search', search);
  if (role) params.append('role', role);
  
  return axiosUser.get(`/api/v1/users?${params.toString()}`)
    .then(response => {
      console.log(`✅ [API] Users fetched successfully:`, response);
      console.log(`📊 [API] Number of users: ${response.users?.length || 0}`);
      return response;
    })
    .catch(error => {
      console.error(`❌ [API] Failed to fetch users:`, error);
      console.error(`📍 [API] Error response:`, error.response);
      throw error;
    });
};

export const lockUserApi = (userId) => {
  console.log(`📤 [API] Locking user ${userId}`);
  return axiosUser.put(`/api/v1/users/${userId}/lock`)
    .then(response => {
      console.log(`✅ [API] User locked successfully`);
      return response;
    })
    .catch(error => {
      console.error(`❌ [API] Failed to lock user:`, error);
      throw error;
    });
};

export const unlockUserApi = (userId) => {
  console.log(`📤 [API] Unlocking user ${userId}`);
  return axiosUser.put(`/api/v1/users/${userId}/unlock`)
    .then(response => {
      console.log(`✅ [API] User unlocked successfully`);
      return response;
    })
    .catch(error => {
      console.error(`❌ [API] Failed to unlock user:`, error);
      throw error;
    });
};

export const toggleUserLockApi = (userId) => {
  console.log(`📤 [API] Toggling lock for user ${userId}`);
  return axiosUser.put(`/api/v1/users/${userId}/toggle-lock`)
    .then(response => {
      console.log(`✅ [API] User lock toggled successfully:`, response);
      return response;
    })
    .catch(error => {
      console.error(`❌ [API] Failed to toggle user lock:`, error);
      throw error;
    });
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

export const updateUserApi = (data) => {
  const { id, ...updateData } = data;
  console.log(`📤 [API] Updating user ${id}:`, updateData);
  return axiosUser.put(`/api/v1/users/${id}`, updateData)
    .then(response => {
      console.log(`✅ [API] User updated successfully:`, response);
      return response;
    })
    .catch(error => {
      console.error(`❌ [API] Failed to update user:`, error);
      throw error;
    });
};

export const changePasswordApi = (data) => {
  return axiosUser.put("/api/v1/users/changePassword", data);
};

export const getOrdersApi = (page = 1, limit = 10) => {
  return axiosOrder.get(`/api/v1/orders?page=${page}&limit=${limit}`);
};

/**
 * Get all orders with filtering and pagination (Admin)
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (0-based for backend)
 * @param {number} params.size - Page size
 * @param {string} [params.keyword] - Search keyword
 * @param {string} [params.status] - Order status filter
 * @param {string} [params.paymentMethod] - Payment method filter
 * @param {string} [params.fromDate] - From date (yyyy-MM-dd)
 * @param {string} [params.toDate] - To date (yyyy-MM-dd)
 * @param {string} [params.sortBy] - Sort field
 * @param {string} [params.sortDirection] - Sort direction (asc/desc)
 * @returns {Promise} Order list response
 */
export const getAllOrdersApi = (params = {}) => {
  console.log('📥 [API] Fetching orders with params:', params);
  
  // Build query string
  const queryParams = new URLSearchParams();
  
  // Pagination (required)
  queryParams.append('page', params.page ?? 0);
  queryParams.append('size', params.size ?? 10);
  
  // Optional filters
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.status) queryParams.append('status', params.status);
  if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
  
  const url = `/api/v1/orders/all?${queryParams.toString()}`;
  console.log('📍 [API] Request URL:', url);
  
  return axiosOrder.get(url)
    .then(response => {
      console.log('✅ [API] Orders fetched successfully:', response);
      console.log('📊 [API] Total orders:', response.totalElements);
      return response;
    })
    .catch(error => {
      console.error('❌ [API] Failed to fetch orders:', error);
      throw error;
    });
};

export const updateOrderStatusApi = (orderId, trangThaiDonHang) => {
  return axiosOrder.put(`/api/v1/orders/${orderId}/status`, { trangThaiDonHang });
};

export const fetchReviewsByProduct = (productId) => {
  console.log(`📥 [API] Fetching reviews for product ID: ${productId}`);
  console.log(`📍 [API] Endpoint: /api/v1/reviews/products/${productId}`);
  return axiosReview.get(`/api/v1/reviews/products/${productId}`)
    .then(response => {
      console.log(`✅ [API] Fetched reviews successfully:`, response);
      console.log(`📊 [API] Number of reviews: ${response?.length || 0}`);
      console.log(`📋 [API] Reviews data:`, response);
      return response;
    })
    .catch(error => {
      console.error(`❌ [API] Failed to fetch reviews:`, error);
      console.error(`📍 [API] Error response:`, error.response);
      console.error(`📍 [API] Error message:`, error.message);
      throw error;
    });
};

export const getProductRatingApi = (productId) => {
  return axiosReview.get(`/api/v1/reviews/products/${productId}/rating`);
};

export const addReviewApi = (data) => {
  console.log(`📤 [API] Submitting review`);
  console.log(`📍 [API] Endpoint: POST /api/v1/reviews`);
  console.log(`📦 [API] Review data:`, data);
  return axiosReview.post("/api/v1/reviews", data)
    .then(response => {
      console.log(`✅ [API] Review submitted successfully:`, response);
      console.log(`📊 [API] Response data:`, response);
      return response;
    })
    .catch(error => {
      console.error(`❌ [API] Failed to submit review:`, error);
      console.error(`📍 [API] Error response:`, error.response);
      console.error(`📍 [API] Error data:`, error.response?.data);
      console.error(`📍 [API] Error message:`, error.message);
      throw error;
    });
};

export const getMyReviewsApi = () => {
  return axiosReview.get("/api/v1/reviews/me");
};

export const markReviewHelpfulApi = (reviewId) => {
  return axiosReview.post(`/api/v1/reviews/${reviewId}/helpful`);
};

// Admin review APIs
export const getAllReviewsApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.status) queryParams.append('status', params.status);
  if (params.rating) queryParams.append('rating', params.rating);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
  
  const queryString = queryParams.toString();
  return axiosReview.get(`/api/v1/reviews/all${queryString ? '?' + queryString : ''}`);
};

export const getPendingReviewsApi = () => {
  return axiosReview.get("/api/v1/reviews/pending");
};

export const approveReviewApi = (reviewId) => {
  return axiosReview.put(`/api/v1/reviews/${reviewId}/approve`);
};

export const rejectReviewApi = (reviewId) => {
  return axiosReview.put(`/api/v1/reviews/${reviewId}/reject`);
};

export const chatbotApi = (data) => {
  return axiosChatbot.post("/api/chatbot", data);
};

export const getRolesApi = () => {
  console.log(`📥 [API] Fetching roles`);
  return axiosUser.get("/api/v1/roles")
    .then(response => {
      console.log(`✅ [API] Roles fetched:`, response);
      return response;
    })
    .catch(error => {
      console.error(`❌ [API] Failed to fetch roles:`, error);
      throw error;
    });
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
