import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      console.error(
        `API Error ${error.response.status}:`,
        error.response.data
      );
    } else if (error.request) {
      console.error("Network Error: No response received");
    } else {
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;