import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true, // Include credentials (cookies) with requests
});

export default instance;
