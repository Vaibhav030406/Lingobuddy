import axios from "axios";

const isProduction = import.meta.env.MODE === "production";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

let baseURL;

if (isProduction) {
  if (!backendUrl) {
    console.error("VITE_BACKEND_URL is not defined in production environment.");
    baseURL = "/api"; 
  } else {
    baseURL = `${backendUrl}/api`;
  }
} else {
  baseURL = "http://localhost:5001/api";
}

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // This ensures cookies are sent with requests
});

// 🎯 Add token to requests if it exists (fallback for when cookies don't work)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🎯 Response interceptor to handle auth errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if we get unauthorized
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default instance;