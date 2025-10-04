import axios from "axios";

// Dynamically sets the BASE_URL to localhost in development,
// and to your Vercel URL in production, using the VITE_BACKEND_URL variable.
const BASE_URL = 
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : `${import.meta.env.VITE_BACKEND_URL}/api`;

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include credentials (cookies) with requests
});

export default instance;