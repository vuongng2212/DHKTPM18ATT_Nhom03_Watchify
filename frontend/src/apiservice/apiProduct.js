// src/apiservice/apiProduct.js
import axios from "axios";

const API_URL = "http://localhost:5004/api/product";

// Lấy danh sách sản phẩm
export const getProducts = async (page = 1, limit = 10) => {
  const response = await axios.get(API_URL, {
    params: { page, limit },
  });
  return response.data;
};

// Lấy một sản phẩm
export const getProduct = async (id) => {
  const response = await axios.get(`${API_URL}/getone/${id}`);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/delete/${id}`);
  return response.data;
};

// Hàm để tạo sản phẩm mới
export const createProduct = async (formData) => {
  return axios.post("http://localhost:5004/api/product/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Hàm để cập nhật sản phẩm
export const updateProduct = async (id, formData) => {
  const response = await axios.put(`${API_URL}/update/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
