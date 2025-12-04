import axios from "axios";

const isProd = import.meta.env.PROD;

const apiUrl = isProd ? "" : `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 3001}`;

const LOCAL_BACKEND_REGEX = /^https?:\/\/localhost:\d+/;

console.log("API URL =>", apiUrl || "(same origin)");

const httpClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  if (config.url && LOCAL_BACKEND_REGEX.test(config.url)) {
    const url = new URL(config.url);
    config.url = url.pathname + url.search;
    console.log("Rewriting localhost URL to relative:", config.url);
  }
  return config;
});

export { httpClient };
