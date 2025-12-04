import axios from "axios";

const apiUrl =
  process.env.VITE_API_URL ||
  `http://localhost:${process.env.VITE_BACKEND_PORT || 3001}`;

const httpClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  /* istanbul ignore if */
  if (
    process.env.VITE_AUTH0 ||
    process.env.VITE_OKTA ||
    process.env.VITE_AWS_COGNITO ||
    process.env.VITE_GOOGLE
  ) {
    const accessToken = localStorage.getItem(process.env.VITE_AUTH_TOKEN_NAME!);
    // @ts-ignore
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

export { httpClient };
