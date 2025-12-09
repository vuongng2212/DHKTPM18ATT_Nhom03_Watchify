import createInstanceAxios from './axios.customize';

const axiosInventory = createInstanceAxios(import.meta.env.VITE_BACKEND_CATALOG_URL);

const inventoryApi = {
  /**
   * Get all inventories
   */
  getAllInventories: async () => {
    try {
      const response = await axiosInventory.get('/api/v1/inventory/all');
      return response;
    } catch (error) {
      console.error('Error fetching all inventories:', error);
      throw error;
    }
  },

  /**
   * Get inventory by product ID
   */
  getInventoryByProductId: async (productId) => {
    try {
      const response = await axiosInventory.get(`/api/v1/inventory/product/${productId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching inventory for product ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Get available quantity for a product
   */
  getAvailableQuantity: async (productId) => {
    try {
      const response = await axiosInventory.get(`/api/v1/inventory/product/${productId}/available`);
      return response;
    } catch (error) {
      console.error(`Error fetching available quantity for product ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Check if product is in stock
   */
  isInStock: async (productId) => {
    try {
      const response = await axiosInventory.get(`/api/v1/inventory/product/${productId}/in-stock`);
      return response;
    } catch (error) {
      console.error(`Error checking stock for product ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Create or update inventory for a product (Admin only)
   */
  createOrUpdateInventory: async (productId, quantity, location = null) => {
    try {
      const params = { quantity };
      if (location) {
        params.location = location;
      }
      const response = await axiosInventory.post(`/api/v1/inventory/product/${productId}`, null, { params });
      return response;
    } catch (error) {
      console.error(`Error creating/updating inventory for product ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Add quantity to inventory (Admin only)
   */
  addQuantity: async (productId, quantity) => {
    try {
      const response = await axiosInventory.post(
        `/api/v1/inventory/product/${productId}/add`,
        null,
        { params: { quantity } }
      );
      return response;
    } catch (error) {
      console.error(`Error adding quantity to product ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Reduce quantity from inventory (Admin only)
   */
  reduceQuantity: async (productId, quantity) => {
    try {
      const response = await axiosInventory.post(
        `/api/v1/inventory/product/${productId}/reduce`,
        null,
        { params: { quantity } }
      );
      return response;
    } catch (error) {
      console.error(`Error reducing quantity for product ${productId}:`, error);
      throw error;
    }
  },
};

export default inventoryApi;