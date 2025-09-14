import axios from "axios";

const BASE_URL = import.meta.env.MODE ==="development"? "http://localhost:5001/api": "/api";
const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include credentials (cookies) with requests
});

export default instance;
