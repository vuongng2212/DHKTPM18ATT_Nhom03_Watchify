import axios from "axios";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

const createInstanceAxios = (baseURL) => {
  const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
  });

  const handleRefreshToken = async () => {
    return await mutex.runExclusive(async () => {
      const res = await instance.post("/api/auth/refreshToken");
      if (res && res.data) return res.data.accessToken;
      else return null;
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
