import axios from '../utils/axios';

/**
 * Wishlist API Service
 * Handles all wishlist-related API calls
 */

const BASE_URL = '/api/v1/wishlist';

/**
 * Get current user's wishlist
 * @returns {Promise} List of wishlist items
 */
export const getUserWishlistApi = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Get paginated wishlist
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 * @returns {Promise} Paginated wishlist items
 */
export const getUserWishlistPaginatedApi = async (page = 0, size = 12) => {
  try {
    const response = await axios.get(`${BASE_URL}/paginated`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated wishlist:', error);
    throw error;
  }
};

/**
 * Add a product to wishlist
 * @param {string} productId - Product UUID
 * @returns {Promise} Created wishlist item
 */
export const addToWishlistApi = async (productId) => {
  try {
    const response = await axios.post(`${BASE_URL}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Add a product to wishlist with notification preferences
 * @param {string} productId - Product UUID
 * @param {boolean} notifyOnSale - Notify when product goes on sale
 * @param {boolean} notifyOnStock - Notify when product is back in stock
 * @returns {Promise} Created wishlist item
 */
export const addToWishlistWithPreferencesApi = async (
  productId,
  notifyOnSale = false,
  notifyOnStock = false
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/${productId}/preferences`,
      null,
      {
        params: {
          notifyOnSale,
          notifyOnStock
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist with preferences:', error);
    throw error;
  }
};

/**
 * Remove a product from wishlist
 * @param {string} productId - Product UUID
 * @returns {Promise} No content
 */
export const removeFromWishlistApi = async (productId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Check if a product is in user's wishlist
 * @param {string} productId - Product UUID
 * @returns {Promise<boolean>} True if in wishlist, false otherwise
 */
export const checkInWishlistApi = async (productId) => {
  try {
    const response = await axios.get(`${BASE_URL}/check/${productId}`);
    return response.data.inWishlist;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    throw error;
  }
};

/**
 * Get wishlist count for current user
 * @returns {Promise<number>} Count of wishlist items
 */
export const getWishlistCountApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/count`);
    return response.data.count;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    throw error;
  }
};

/**
 * Clear all items from wishlist
 * @returns {Promise} No content
 */
export const clearWishlistApi = async () => {
  try {
    const response = await axios.delete(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

/**
 * Update wishlist item notification preferences
 * @param {string} productId - Product UUID
 * @param {boolean} notifyOnSale - Notify when product goes on sale
 * @param {boolean} notifyOnStock - Notify when product is back in stock
 * @returns {Promise} Updated wishlist item
 */
export const updateWishlistPreferencesApi = async (
  productId,
  notifyOnSale = null,
  notifyOnStock = null
) => {
  try {
    const params = {};
    if (notifyOnSale !== null) params.notifyOnSale = notifyOnSale;
    if (notifyOnStock !== null) params.notifyOnStock = notifyOnStock;

    const response = await axios.patch(
      `${BASE_URL}/${productId}/preferences`,
      null,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating wishlist preferences:', error);
    throw error;
  }
};

/**
 * Toggle product in wishlist (add if not exists, remove if exists)
 * @param {string} productId - Product UUID
 * @returns {Promise<boolean>} True if added, false if removed
 */
export const toggleWishlistApi = async (productId) => {
  try {
    // First check if product is in wishlist
    const isInWishlist = await checkInWishlistApi(productId);

    if (isInWishlist) {
      // Remove from wishlist
      await removeFromWishlistApi(productId);
      return false;
    } else {
      // Add to wishlist
      await addToWishlistApi(productId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};

export default {
  getUserWishlistApi,
  getUserWishlistPaginatedApi,
  addToWishlistApi,
  addToWishlistWithPreferencesApi,
  removeFromWishlistApi,
  checkInWishlistApi,
  getWishlistCountApi,
  clearWishlistApi,
  updateWishlistPreferencesApi,
  toggleWishlistApi
};