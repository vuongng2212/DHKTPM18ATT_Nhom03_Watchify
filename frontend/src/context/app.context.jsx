import { createContext, useContext, useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { message, notification, Spin } from "antd";
import { fetchAccountApi } from "../services/api";

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
          setUser(res.user);
          setIsAuthenticated(true);
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
      const existingItem = prevCarts.find((item) => item._id === product._id);

      if (existingItem) {
        const newCarts = prevCarts.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        localStorage.setItem("carts", JSON.stringify(newCarts));
        return newCarts;
      } else {
        localStorage.setItem(
          "carts",
          JSON.stringify([...prevCarts, { ...product, quantity }])
        );
        return [...prevCarts, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCarts((prevCarts) => {
      const newCarts = prevCarts.filter((item) => item._id !== productId);
      localStorage.setItem("carts", JSON.stringify(newCarts));
      return newCarts;
    });
  };

  const updateCartItemQuantity = (productId, quantity) => {
    setCarts((prevCarts) => {
      const newCarts = prevCarts.map((item) =>
        item._id === productId ? { ...item, quantity } : item
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
