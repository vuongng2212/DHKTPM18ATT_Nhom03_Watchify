import axios from 'axios';

// Base URL for the BrandService API
const BASE_URL = 'http://localhost:8888/api/v1/brands';

// Function to create a new brand
export const createBrand = async (brandData) => {
  try {
    const response = await axios.post(`${BASE_URL}/add`, brandData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error creating brand' };
  }
};

// Function to get all brands with optional query parameters
export const getBrands = async (queryParams = {}) => {
  try {
    let url = BASE_URL;
    if (queryParams.isVisible) {
      url += '/active';
      delete queryParams.isVisible;
    }
    const response = await axios.get(url, { params: queryParams });
    return { brands: response.data };
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
    const response = await axios.delete(`${BASE_URL}/delete/${brandId}`);
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