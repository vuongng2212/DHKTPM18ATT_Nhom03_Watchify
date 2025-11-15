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
export const getProducts = async (params = {}) => {
  const response = await getProductsApi(params);
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

// Note: Backend does not have delete endpoint yet
export const deleteProduct = async (id) => {
  // Placeholder
  throw new Error("Delete not implemented");
};

// Hàm để tạo sản phẩm mới
// Note: Backend does not have create endpoint yet
export const createProduct = async (formData) => {
  // Placeholder
  throw new Error("Create not implemented");
};

// Hàm để cập nhật sản phẩm
// Note: Backend does not have update endpoint yet
export const updateProduct = async (id, formData) => {
  // Placeholder
  throw new Error("Update not implemented");
};
