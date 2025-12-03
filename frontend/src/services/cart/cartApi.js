import { axiosOrder } from "../api";

/**
 * Cart API service
 * All backend cart API calls for authenticated users
 */

// Get current user's cart
export const getCartApi = () => {
  return axiosOrder.get("/api/v1/cart");
};

// Add item to cart
export const addItemToCartApi = (productId, quantity) => {
  return axiosOrder.post("/api/v1/cart/items", {
    productId,
    quantity,
  });
};

// Update cart item quantity
export const updateCartItemApi = (productId, quantity) => {
  return axiosOrder.put(`/api/v1/cart/items/${productId}`, {
    quantity,
  });
};

// Remove item from cart
export const deleteCartItemApi = (productId) => {
  return axiosOrder.delete(`/api/v1/cart/items/${productId}`);
};

// Clear entire cart
export const clearCartApi = () => {
  return axiosOrder.delete("/api/v1/cart");
};

// Get cart item count
export const getCartCountApi = () => {
  return axiosOrder.get("/api/v1/cart/count");
};

// Merge guest cart with user cart on login
export const mergeGuestCartApi = (guestCartItems) => {
  return axiosOrder.post("/api/v1/cart/merge", guestCartItems);
};

// Create guest order (no authentication required)
export const createGuestOrderApi = (orderData) => {
  return axiosOrder.post("/api/v1/orders/guest", orderData);
};