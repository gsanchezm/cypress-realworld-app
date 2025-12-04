import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 3001}`;

console.log("API URL =>", apiUrl);

const LOCAL_BACKEND_REGEX = /^https?:\/\/localhost:\d+/;

const httpClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  if (config.url && LOCAL_BACKEND_REGEX.test(config.url)) {
    try {
      const url = new URL(config.url);
      config.url = url.pathname + url.search;
      console.log("Rewriting localhost URL to relative:", config.url);
    } catch {
    }
  }

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
