import { createContext, useContext, useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { message, notification, Spin } from "antd";
import { fetchAccountApi } from "../services/api";
import {
  getUserWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  getWishlistCountApi
} from "../services/wishlistApi";
import * as cartService from "../services/cart/cartService";

const CurrentAppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [carts, setCarts] = useState([]);
  const [favorite, setFavorite] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [dataViewDetail, setDataViewDetail] = useState({});
  const [messageApi, contextHolder] = message.useMessage();
  const [notificationApi, contextNotifiHolder] = notification.useNotification();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          setIsAppLoading(false);
          return;
        }

        const res = await fetchAccountApi();

        if (res) {
          setUser(res);
          setIsAuthenticated(true);
          // Load wishlist for authenticated user
          loadWishlist();
          loadWishlistCount();
        } else {
          localStorage.removeItem("accessToken");
        }
      } catch (error) {
        console.log("error: ", error);
        localStorage.removeItem("accessToken");
      }
      setIsAppLoading(false);
    };

    fetchAccount();
  }, []);

  // Load cart based on authentication state
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cart = await cartService.getCart(isAuthenticated);
        setCarts(cart);
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };

    if (!isAppLoading) {
      loadCart();
    }
  }, [isAuthenticated, isAppLoading]);

  const addToCart = async (product, quantity) => {
    try {
      const updatedCart = await cartService.addToCart(isAuthenticated, product, quantity);
      setCarts(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error("Error adding to cart:", error);
      messageApi.error("Không thể thêm sản phẩm vào giỏ hàng");
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const updatedCart = await cartService.removeFromCart(isAuthenticated, productId);
      setCarts(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error("Error removing from cart:", error);
      messageApi.error("Không thể xóa sản phẩm khỏi giỏ hàng");
      throw error;
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const updatedCart = await cartService.updateCartItemQuantity(isAuthenticated, productId, quantity);
      setCarts(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      messageApi.error("Không thể cập nhật số lượng");
      throw error;
    }
  };

  const clearCartItems = async () => {
    try {
      const emptyCart = await cartService.clearCart(isAuthenticated);
      setCarts(emptyCart);
      return emptyCart;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  };

  // Merge guest cart with backend cart on  login
  const mergeCart = async (guestCart) => {
    try {
      const mergedCart = await cartService.mergeGuestCart(guestCart);
      setCarts(mergedCart);
      messageApi.success("Giỏ hàng đã được đồng bộ");
      return mergedCart;
    } catch (error) {
      console.error("Error merging cart:", error);
      messageApi.warning("Không thể đồng bộ giỏ hàng");
      return guestCart;
    }
  };

  const toggleFavorite = (product) => {
    setFavorite((prev) => {
      const isFavorite = prev.some((item) => item.id === product.id);
      if (isFavorite) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const removeFromFavorite = (productId) => {
    setFavorite((prev) => prev.filter((item) => item.id !== productId));
  };

  // Wishlist functions
  const loadWishlist = async () => {
    if (!isAuthenticated) return;

    try {
      const data = await getUserWishlistApi();
      setWishlist(data || []);
      setWishlistCount(data?.length || 0);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  };

  const loadWishlistCount = async () => {
    if (!isAuthenticated) return;

    try {
      const count = await getWishlistCountApi();
      setWishlistCount(count || 0);
    } catch (error) {
      console.error("Error loading wishlist count:", error);
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      messageApi.warning("Please login to add items to wishlist");
      return false;
    }

    try {
      await addToWishlistApi(productId);
      await loadWishlist(); // Refresh wishlist
      await loadWishlistCount(); // Update count
      messageApi.success("Added to wishlist");
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      messageApi.error(error?.response?.data?.message || "Failed to add to wishlist");
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await removeFromWishlistApi(productId);
      await loadWishlist(); // Refresh wishlist
      await loadWishlistCount(); // Update count
      messageApi.success("Removed from wishlist");
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      messageApi.error("Failed to remove from wishlist");
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product?.id === productId);
  };

  const toggleWishlistItem = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  return (
    <>
      {contextHolder}
      {contextNotifiHolder}

      {isAppLoading ? (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: "#A51717" }}
                spin
              />
            }
          />
        </div>
      ) : null}

      <CurrentAppContext.Provider
        value={{
          isAppLoading,
          setIsAppLoading,
          carts,
          setCarts,
          addToCart,
          removeFromCart,
          updateCartItemQuantity,
          clearCartItems,
          mergeCart,
          dataViewDetail,
          setDataViewDetail,
          favorite,
          setFavorite,
          toggleFavorite,
          removeFromFavorite,
          wishlist,
          setWishlist,
          wishlistCount,
          setWishlistCount,
          addToWishlist,
          removeFromWishlist,
          isInWishlist,
          toggleWishlistItem,
          loadWishlist,
          loadWishlistCount,
          user,
          setUser,
          isAuthenticated,
          setIsAuthenticated,
          messageApi,
          notificationApi,
        }}
      >
        {!isAppLoading && children}
      </CurrentAppContext.Provider>
    </>
  );
};

export const useCurrentApp = () => {
  const currentAppContext = useContext(CurrentAppContext);

  if (!currentAppContext) {
    throw new Error(
      "useCurrentApp must be used within <CurrentAppContext.Provider>"
    );
  }

  return currentAppContext;
};
