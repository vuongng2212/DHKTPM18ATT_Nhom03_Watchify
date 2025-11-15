// src/apiservice/apiProduct.js
import createInstanceAxios from "../services/axios.customize";

const axiosCatalog = createInstanceAxios(import.meta.env.VITE_BACKEND_CATALOG_URL);

const API_URL = "/api/v1/products";

// Lấy danh sách sản phẩm
export const getProducts = async (params = {}) => {
  const response = await axiosCatalog.get(API_URL, { params });
  return response.data;
};

// Lấy một sản phẩm
export const getProduct = async (id) => {
  const response = await axiosCatalog.get(`${API_URL}/${id}`);
  return response.data;
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
