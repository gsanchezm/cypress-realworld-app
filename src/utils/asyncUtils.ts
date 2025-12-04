import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 3001}`;

const httpClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  /* istanbul ignore if */
  if (
    import.meta.env.VITE_AUTH0 ||
    import.meta.env.VITE_OKTA ||
    import.meta.env.VITE_AWS_COGNITO ||
    import.meta.env.VITE_GOOGLE
  ) {
    const accessToken = localStorage.getItem(
      import.meta.env.VITE_AUTH_TOKEN_NAME!
    );
    // @ts-ignore
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

export { httpClient };
