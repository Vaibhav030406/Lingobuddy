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
  withCredentials: true,
});

// 🎯 NEW: Add token to requests if it exists
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

export default instance;