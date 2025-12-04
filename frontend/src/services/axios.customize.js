import axios from "axios";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

// Cookie helper functions
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const createInstanceAxios = (baseURL) => {
  const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
  });

  const handleRefreshToken = async () => {
    return await mutex.runExclusive(async () => {
      try {
        const refreshToken = getCookie("refreshToken");
        if (!refreshToken) return null;

        const res = await instance.post("/api/v1/auth/refresh", { refreshToken });
        if (res && res.token) {
          localStorage.setItem("accessToken", res.token);
          return res.token;
        }
      } catch (error) {
        console.error("Refresh token failed:", error);
        // Clear tokens on refresh failure
        localStorage.removeItem("accessToken");
        deleteCookie("refreshToken");
      }
      return null;
    });
  };

  // Add a request interceptor
  instance.interceptors.request.use(
    function (config) {
      console.log("=== AXIOS REQUEST ===");
      console.log("🔗 URL:", config.baseURL + config.url);
      console.log("📍 Method:", config.method?.toUpperCase());
      console.log("📦 Data:", config.data);
      console.log("🔍 Params:", config.params);
      
      const token = localStorage.getItem("accessToken");
      console.log("🔑 Access Token:", token ? `${token.substring(0, 20)}...` : "No token");
      
      const auth = token ? `Bearer ${token}` : "";
      config.headers["Authorization"] = auth;
      console.log("📋 Headers:", config.headers);
      console.log("=====================");

      return config;
    },
    function (error) {
      console.error("❌ AXIOS REQUEST ERROR:", error);
      // Do something with request error
      return Promise.reject(error);
    }
  );

  // Add a response interceptor
  instance.interceptors.response.use(
    function (response) {
      console.log("=== AXIOS RESPONSE ===");
      console.log("✅ URL:", response.config.url);
      console.log("📊 Status:", response.status);
      console.log("📦 Data:", response.data);
      console.log("======================");
      if (response && response.data) return response.data;
      return response;
    },
    async function (error) {
      console.log("=== AXIOS RESPONSE ERROR ===");
      console.log("❌ URL:", error.config?.url);
      console.log("📍 Status:", error.response?.status);
      console.log("💬 Message:", error.message);
      console.log("📦 Response Data:", error.response?.data);
      console.log("============================");
      
      // Skip refresh for logout endpoint
      if (error.config?.url?.includes('/logout')) {
        if (error && error.response && error.response.data)
          return error.response.data;
        return Promise.reject(error);
      }
      if (error.config && error.response && +error.response.status === 401) {
        console.log("🔄 Token expired, attempting refresh...");
        const access_token = await handleRefreshToken();
        if (access_token) {
          console.log("✅ Token refreshed successfully");
          error.config.headers["Authorization"] = `Bearer ${access_token}`;
          localStorage.setItem("accessToken", access_token);
          return instance.request(error.config);
        } else {
          console.log("❌ Token refresh failed");
        }
      }

      if (error && error.response && error.response.data)
        return error.response.data;
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createInstanceAxios;
