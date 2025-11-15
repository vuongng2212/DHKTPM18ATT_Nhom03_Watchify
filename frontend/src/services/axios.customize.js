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
      console.log("Axios Request:", config.url, config.params);
      const token = localStorage.getItem("accessToken");
      const auth = token ? `Bearer ${token}` : "";
      config.headers["Authorization"] = auth;

      return config;
    },
    function (error) {
      console.log("Axios Request Error:", error);
      // Do something with request error
      return Promise.reject(error);
    }
  );

  // Add a response interceptor
  instance.interceptors.response.use(
    function (response) {
      console.log("Axios Response:", response.config.url, response.status, response.data);
      if (response && response.data) return response.data;
      return response;
    },
    async function (error) {
      console.log("Axios Response Error:", error.config?.url, error.response?.status, error.message);
      // Skip refresh for logout endpoint
      if (error.config?.url?.includes('/logout')) {
        if (error && error.response && error.response.data)
          return error.response.data;
        return Promise.reject(error);
      }
      if (error.config && error.response && +error.response.status === 401) {
        const access_token = await handleRefreshToken();
        if (access_token) {
          error.config.headers["Authorization"] = `Bearer ${access_token}`;
          localStorage.setItem("accessToken", access_token);
          return instance.request(error.config);
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
