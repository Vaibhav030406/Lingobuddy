import axios from "axios";

// NOTE: This logic ensures that in a production environment (like Netlify),
// the absolute Vercel URL is always used for API calls.

const isProduction = import.meta.env.MODE === "production";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

let baseURL;

if (isProduction) {
  // Use the full URL set in Netlify Environment variables
  if (!backendUrl) {
    console.error("VITE_BACKEND_URL is not defined in production environment.");
    // Fallback to the Netlify domain itself, which will cause 404s, 
    // but highlights the config failure.
    baseURL = "/api"; 
  } else {
    // Correct absolute path using the Vercel domain
    baseURL = `${backendUrl}/api`;
  }
} else {
  // Development mode fallback
  baseURL = "http://localhost:5001/api";
}

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Include credentials (cookies) with requests
});

export default instance;
