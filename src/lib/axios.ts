import config from "@/config";
import axios, { type AxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: config.baseUrl,
  withCredentials: true,
});

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    console.log("Axios", config);
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

let isRefreshing = false;

let pendingQueue: {
  resolve: (value: unknown) => void;
  reject: (value: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  pendingQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(null);
    }
  });

  pendingQueue = [];
};

// Add a response interceptor
axiosInstance.interceptors.response.use(
  // when no error happens
  // this is what we don't need here
  (response) => {
    return response;
  },
  // we need this here because when the error causes what we will return from here
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry: boolean;
    };
    // doing this i am capturing the token is expired
    if (
      error.response.status === 500 &&
      error.response.data.message === "jwt expired" &&
      !originalRequest._retry
    ) {
      console.log("Your token is expired");

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((error) => Promise.reject(error));
      }
    }

    isRefreshing = true;

    // we will add try here
    try {
      const res = await axiosInstance.post("/auth/refresh-token");
      console.log("New token arrived", res);
      processQueue(null);

      return axiosInstance(originalRequest);
    } catch (error) {
      processQueue(error);

      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }

    // for everything
    return Promise.reject(error);
  },
);
