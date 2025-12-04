// src/apiservice/apiProduct.js
import { 
  getProductsApi, 
  getProductByIdApi, 
  getProductBySlugApi, 
  searchProductsApi, 
  getFeaturedProductsApi, 
  getNewProductsApi 
} from "../services/api";

// Lấy danh sách sản phẩm
export const getProducts = async (page = 0, size = 12) => {
  const response = await getProductsApi({ page, size });
  return response;
};

// Lấy một sản phẩm theo ID
export const getProduct = async (id) => {
  const response = await getProductByIdApi(id);
  return response;
};

// Lấy sản phẩm theo slug
export const getProductBySlug = async (slug) => {
  const response = await getProductBySlugApi(slug);
  return response;
};

// Tìm kiếm sản phẩm
export const searchProducts = async (keyword) => {
  const response = await searchProductsApi(keyword);
  return response;
};

// Lấy sản phẩm nổi bật
export const getFeaturedProducts = async (limit = 10) => {
  const response = await getFeaturedProductsApi(limit);
  return response;
};

// Lấy sản phẩm mới
export const getNewProducts = async (limit = 10) => {
  const response = await getNewProductsApi(limit);
  return response;
};

// Delete a product
export const deleteProduct = async (id) => {
  const response = await axiosInventory.delete(`/api/v1/products/${id}`);
  return response;
};

// Create a new product
export const createProduct = async (formData) => {
  const response = await axiosInventory.post('/api/v1/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Update an existing product
export const updateProduct = async (id, formData) => {
  const response = await axiosInventory.put(`/api/v1/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};
