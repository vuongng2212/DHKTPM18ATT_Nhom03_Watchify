import {
  getCartApi,
  addItemToCartApi,
  updateCartItemApi,
  deleteCartItemApi,
  clearCartApi,
  mergeGuestCartApi,
} from "./cartApi";

/**
 * Cart Service - Abstracts localStorage vs Backend cart operations
 * Switches between localStorage (guest) and backend API (authenticated users)
 */

const CART_STORAGE_KEY = "carts";

/**
 * Get cart based on authentication state
 * @param {boolean} isAuthenticated - User authentication status
 * @returns {Promise<Array>} Cart items
 */
export const getCart = async (isAuthenticated) => {
  if (isAuthenticated) {
    try {
      const response = await getCartApi();
      // Backend returns CartDto with items array
      return response.items || [];
    } catch (error) {
      console.error("Error fetching cart from backend:", error);
      return [];
    }
  } else {
    // Guest - use localStorage
    const carts = localStorage.getItem(CART_STORAGE_KEY);
    return carts ? JSON.parse(carts) : [];
  }
};

/**
 * Add item to cart
 * @param {boolean} isAuthenticated - User authentication status
 * @param {Object} product - Product to add
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Array>} Updated cart items
 */
export const addToCart = async (isAuthenticated, product, quantity) => {
  if (isAuthenticated) {
    try {
      const productId = product.id || product._id;
      const response = await addItemToCartApi(productId, quantity);
      return response.items || [];
    } catch (error) {
      console.error("Error adding to cart (backend):", error);
      throw error;
    }
  } else {
    // Guest - use localStorage
    const currentCart = await getCart(false);
    const productId = product.id || product._id;
    const existingItem = currentCart.find(
      (item) => (item.id || item._id) === productId
    );

    let newCart;
    if (existingItem) {
      // Update quantity if item exists
      newCart = currentCart.map((item) =>
        (item.id || item._id) === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Add new item
      const cartItem = {
        ...product,
        _id: productId,
        id: productId,
        quantity,
      };
      newCart = [...currentCart, cartItem];
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    return newCart;
  }
};

/**
 * Update cart item quantity
 * @param {boolean} isAuthenticated - User authentication status
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Array>} Updated cart items
 */
export const updateCartItemQuantity = async (
  isAuthenticated,
  productId,
  quantity
) => {
  if (isAuthenticated) {
    try {
      const response = await updateCartItemApi(productId, quantity);
      return response.items || [];
    } catch (error) {
      console.error("Error updating cart item (backend):", error);
      throw error;
    }
  } else {
    // Guest - use localStorage
    const currentCart = await getCart(false);
    const newCart = currentCart.map((item) =>
      (item.id || item._id) === productId ? { ...item, quantity } : item
    );
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    return newCart;
  }
};

/**
 * Remove item from cart
 * @param {boolean} isAuthenticated - User authentication status
 * @param {string} productId - Product ID to remove
 * @returns {Promise<Array>} Updated cart items
 */
export const removeFromCart = async (isAuthenticated, productId) => {
  if (isAuthenticated) {
    try {
      const response = await deleteCartItemApi(productId);
      return response.items || [];
    } catch (error) {
      console.error("Error removing from cart (backend):", error);
      throw error;
    }
  } else {
    // Guest - use localStorage
    const currentCart = await getCart(false);
    const newCart = currentCart.filter(
      (item) => (item.id || item._id) !== productId
    );
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    return newCart;
  }
};

/**
 * Clear entire cart
 * @param {boolean} isAuthenticated - User authentication status
 * @returns {Promise<Array>} Empty array
 */
export const clearCart = async (isAuthenticated) => {
  if (isAuthenticated) {
    try {
      await clearCartApi();
      return [];
    } catch (error) {
      console.error("Error clearing cart (backend):", error);
      throw error;
    }
  } else {
    // Guest - use localStorage
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
};

/**
 * Merge guest cart with backend cart on login
 * Called after successful login
 * @param {Array} guestCart - Cart items from localStorage
 * @returns {Promise<Array>} Merged cart items from backend
 */
export const mergeGuestCart = async (guestCart) => {
  if (!guestCart || guestCart.length === 0) {
    // No guest cart to merge
    return await getCart(true);
  }

  try {
    // Transform guest cart items to backend format
    const guestCartItems = guestCart.map((item) => ({
      productId: item.id || item._id,
      quantity: item.quantity,
    }));

    // Call merge API
    const response = await mergeGuestCartApi(guestCartItems);

    // Clear localStorage after successful merge
    localStorage.removeItem(CART_STORAGE_KEY);

    return response.items || [];
  } catch (error) {
    console.error("Error merging guest cart:", error);
    // If merge fails, keep guest cart
    return guestCart;
  }
};

/**
 * Sync cart from backend when user logs in
 * @returns {Promise<Array>} Cart items from backend
 */
export const syncCartFromBackend = async () => {
  try {
    const response = await getCartApi();
    return response.items || [];
  } catch (error) {
    console.error("Error syncing cart from backend:", error);
    return [];
  }
};

/**
 * Get cart count
 * @param {Array} cart - Current cart items
 * @returns {number} Total item count
 */
export const getCartCount = (cart) => {
  if (!cart || !Array.isArray(cart)) return 0;
  return cart.reduce((total, item) => total + (item.quantity || 0), 0);
};

export default {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  mergeGuestCart,
  syncCartFromBackend,
  getCartCount,
};