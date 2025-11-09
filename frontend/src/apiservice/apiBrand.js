import axios from 'axios';

// Base URL for the BrandService API
const BASE_URL = 'http://localhost:5005/api/brand';

// Function to create a new brand
export const createBrand = async (brandData) => {
  try {
    const response = await axios.post("http://localhost:5005/api/brand/add", brandData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error creating brand' };
  }
};

// Function to get all brands with optional query parameters
export const getBrands = async (queryParams = {}) => {
  try {
    const response = await axios.get(BASE_URL, { params: queryParams });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error fetching brands' };
  }
};

// Function to get a single brand by ID
export const getBrand = async (brandId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${brandId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error fetching brand' };
  }
};

// Function to update a brand by ID
export const updateBrand = async (brandId, brandData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${brandId}`, brandData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error updating brand' };
  }
};

// Function to delete a brand by ID
export const deleteBrand = async (brandId) => {
  try {
    const response = await axios.delete(`http://localhost:5005/api/brand/delete/${brandId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error deleting brand' };
  }
};

export const toggleBrandVisibility = async (brandId) => {
  try {
    const response = await axios.patch(`${BASE_URL}/${brandId}/toggle-visibility`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Lỗi khi chuyển đổi trạng thái ẩn/hiện' };
  }
};