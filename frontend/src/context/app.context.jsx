import { createContext, useContext, useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { message, notification, Spin } from "antd";
import {
  fetchAccountApi,
  getCartApi,
  addItemToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi
} from "../services/api";

const CurrentAppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [carts, setCarts] = useState([]);
  const [favorite, setFavorite] = useState([]);
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
          // Sync cart from database when user logs in
          await syncCartFromDatabase();
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
    // Load cart from localStorage for guest users
    const storedCarts = localStorage.getItem("carts");
    if (storedCarts) {
      try {
        setCarts(JSON.parse(storedCarts));
      } catch (error) {
        console.error("Error parsing carts from localStorage:", error);
        localStorage.removeItem("carts");
      }
    }
  }, []);

  // Sync cart from database
  const syncCartFromDatabase = async () => {
    try {
      const res = await getCartApi();

      // Check if backend API is working
      if (!res || res.status === 500 || res.error || res.errorCode) {
        // Backend not available, keep using localStorage
        return;
      }

      if (res && res.items) {
        // Map backend cart items to frontend format
        const dbCarts = res.items.map(item => ({
          id: item.product.id,
          _id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
          quantity: item.quantity
        }));

        // Merge with localStorage cart (for guest items before login)
        const localCarts = localStorage.getItem("carts");
        if (localCarts) {
          const parsedLocalCarts = JSON.parse(localCarts);
          // Upload local cart items to database
          for (const localItem of parsedLocalCarts) {
            const existsInDb = dbCarts.find(dbItem =>
              (dbItem.id || dbItem._id) === (localItem.id || localItem._id)
            );
            if (!existsInDb) {
              try {
                await addItemToCartApi(localItem.id || localItem._id, localItem.quantity);
              } catch (err) {
                console.warn("Failed to sync item to database:", err);
              }
            }
          }
          // Refresh cart from database after uploading local items
          const updatedRes = await getCartApi();
          if (updatedRes && updatedRes.items && !updatedRes.error) {
            const updatedCarts = updatedRes.items.map(item => ({
              id: item.product.id,
              _id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              images: item.product.images,
              quantity: item.quantity
            }));
            setCarts(updatedCarts);
            localStorage.setItem("carts", JSON.stringify(updatedCarts));
          } else {
            // If refresh fails, keep localStorage
            console.warn("Failed to refresh cart, keeping localStorage");
          }
        } else {
          setCarts(dbCarts);
          localStorage.setItem("carts", JSON.stringify(dbCarts));
        }
      }
    } catch (error) {
      console.error("Error syncing cart from database:", error);
      console.warn("Will continue using localStorage");
      // Don't crash, just continue with localStorage
    }
  };

  // Sync cart to database
  const syncCartToDatabase = async (updatedCarts) => {
    if (!isAuthenticated) return;

    try {
      // This will be called after each cart operation
      // The backend will handle the cart update
    } catch (error) {
      console.error("Error syncing cart to database:", error);
    }
  };

  const addToCart = async (product, quantity) => {
    const productId = product._id || product.id;

    // If user is authenticated, try to add to database
    if (isAuthenticated) {
      try {
        console.log("Adding to cart - productId:", productId, "quantity:", quantity);
        const res = await addItemToCartApi(productId, quantity);
        console.log("Cart response:", res);

        // Check if response is an error
        if (res && (res.status === 500 || res.error || res.errorCode)) {
          // Fallback to localStorage if backend fails (silently)
          addToCartLocalStorage(product, productId, quantity);
          return;
        }

        // Handle different response formats
        let cartData = res;
        if (res?.data) {
          cartData = res.data;
        }

        if (cartData && cartData.items && Array.isArray(cartData.items)) {
          const dbCarts = cartData.items.map(item => ({
            id: item.product.id,
            _id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            images: item.product.images,
            quantity: item.quantity
          }));
          setCarts(dbCarts);
          localStorage.setItem("carts", JSON.stringify(dbCarts));
          return;
        } else {
          // Try to refresh cart from database
          const cartRes = await getCartApi();
          if (cartRes && cartRes.items && !cartRes.error) {
            const dbCarts = cartRes.items.map(item => ({
              id: item.product.id,
              _id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              images: item.product.images,
              quantity: item.quantity
            }));
            setCarts(dbCarts);
            localStorage.setItem("carts", JSON.stringify(dbCarts));
            return;
          } else {
            // If still fails, fallback to localStorage
            addToCartLocalStorage(product, productId, quantity);
            return;
          }
        }
      } catch (error) {
        // Fallback to localStorage on error (silently)
        addToCartLocalStorage(product, productId, quantity);
        return;
      }
    }

    // Guest user - use localStorage only
    addToCartLocalStorage(product, productId, quantity);
  };

  // Helper function for localStorage cart operations
  const addToCartLocalStorage = (product, productId, quantity) => {
    setCarts((prevCarts) => {
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
          id: productId,
          _id: productId,
          quantity
        };
        const newCarts = [...prevCarts, cartItem];
        localStorage.setItem("carts", JSON.stringify(newCarts));
        return newCarts;
      }
    });
  };

  const removeFromCart = async (productId) => {
    // If user is authenticated, remove from database
    if (isAuthenticated) {
      try {
        await removeCartItemApi(productId);
        const res = await getCartApi();

        // Check if response is an error
        if (res && (res.status === 500 || res.error || res.errorCode)) {
          removeFromCartLocalStorage(productId);
          return;
        }

        if (res && res.items) {
          const dbCarts = res.items.map(item => ({
            id: item.product.id,
            _id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            images: item.product.images,
            quantity: item.quantity
          }));
          setCarts(dbCarts);
          localStorage.setItem("carts", JSON.stringify(dbCarts));
        } else {
          setCarts([]);
          localStorage.setItem("carts", JSON.stringify([]));
        }
        return;
      } catch (error) {
        // Fallback to localStorage on error
        removeFromCartLocalStorage(productId);
        return;
      }
    }

    // Guest user - use localStorage only
    removeFromCartLocalStorage(productId);
  };

  const removeFromCartLocalStorage = (productId) => {
    setCarts((prevCarts) => {
      const newCarts = prevCarts.filter((item) => (item._id || item.id) !== productId);
      localStorage.setItem("carts", JSON.stringify(newCarts));
      return newCarts;
    });
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    // If user is authenticated, update in database
    if (isAuthenticated) {
      try {
        await updateCartItemApi(productId, quantity);
        const res = await getCartApi();

        // Check if response is an error
        if (res && (res.status === 500 || res.error || res.errorCode)) {
          updateCartItemQuantityLocalStorage(productId, quantity);
          return;
        }

        if (res && res.items) {
          const dbCarts = res.items.map(item => ({
            id: item.product.id,
            _id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            images: item.product.images,
            quantity: item.quantity
          }));
          setCarts(dbCarts);
          localStorage.setItem("carts", JSON.stringify(dbCarts));
        }
        return;
      } catch (error) {
        // Fallback to localStorage on error
        updateCartItemQuantityLocalStorage(productId, quantity);
        return;
      }
    }

    // Guest user - use localStorage only
    updateCartItemQuantityLocalStorage(productId, quantity);
  };

  const updateCartItemQuantityLocalStorage = (productId, quantity) => {
    setCarts((prevCarts) => {
      const newCarts = prevCarts.map((item) =>
        (item._id || item.id) === productId ? { ...item, quantity } : item
      );
      localStorage.setItem("carts", JSON.stringify(newCarts));
      return newCarts;
    });
  };

  const clearCart = async () => {
    // If user is authenticated, clear from database
    if (isAuthenticated) {
      try {
        await clearCartApi();
      } catch (error) {
        console.error("Error clearing cart from database:", error);
      }
    }

    // Clear localStorage
    setCarts([]);
    localStorage.removeItem("carts");
  };

  const convertCartToGuest = () => {
    // Khi logout, giữ giỏ hàng hiện tại và chuyển sang chế độ guest (localStorage)
    // Không xóa giỏ hàng, chỉ chuyển từ database sang localStorage
    const currentCarts = carts;
    if (currentCarts && currentCarts.length > 0) {
      localStorage.setItem("carts", JSON.stringify(currentCarts));
    }
    // Giữ nguyên state, không cần setCarts vì đã có trong state
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
          clearCart,
          convertCartToGuest,
          syncCartFromDatabase,
          dataViewDetail,
          setDataViewDetail,
          favorite,
          setFavorite,
          toggleFavorite,
          removeFromFavorite,
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
