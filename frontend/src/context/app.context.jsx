import { createContext, useContext, useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { message, notification, Spin } from "antd";
import { fetchAccountApi } from "../services/api";
import { 
  getUserWishlistApi, 
  addToWishlistApi, 
  removeFromWishlistApi,
  checkInWishlistApi 
} from "../services/wishlistApi";

const CurrentAppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [carts, setCarts] = useState([]);
  const [favorite, setFavorite] = useState([]);
  const [wishlist, setWishlist] = useState([]);
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

  useEffect(() => {
    const carts = localStorage.getItem("carts");
    if (carts) setCarts(JSON.parse(carts));
  }, []);

  const addToCart = (product, quantity) => {
    setCarts((prevCarts) => {
      const productId = product._id || product.id; // Support both _id (legacy) and id (backend)
      const existingItem = prevCarts.find((item) => (item._id || item.id) === productId);

      if (existingItem) {
        const newCarts = prevCarts.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        localStorage.setItem("carts", JSON.stringify(newCarts));
        return newCarts;
      } else {
        const cartItem = { 
          ...product, 
          _id: productId, // Ensure _id is set for compatibility
          quantity 
        };
        localStorage.setItem(
          "carts",
          JSON.stringify([...prevCarts, cartItem])
        );
        return [...prevCarts, cartItem];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCarts((prevCarts) => {
      const newCarts = prevCarts.filter((item) => (item._id || item.id) !== productId);
      localStorage.setItem("carts", JSON.stringify(newCarts));
      return newCarts;
    });
  };

  const updateCartItemQuantity = (productId, quantity) => {
    setCarts((prevCarts) => {
      const newCarts = prevCarts.map((item) =>
        (item._id || item.id) === productId ? { ...item, quantity } : item
      );
      localStorage.setItem("carts", JSON.stringify(newCarts));
      return newCarts;
    });
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
    } catch (error) {
      console.error("Error loading wishlist:", error);
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
          dataViewDetail,
          setDataViewDetail,
          favorite,
          setFavorite,
          toggleFavorite,
          removeFromFavorite,
          wishlist,
          setWishlist,
          addToWishlist,
          removeFromWishlist,
          isInWishlist,
          toggleWishlistItem,
          loadWishlist,
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
