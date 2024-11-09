import axios, { AxiosInstance } from "axios";
import { Environment } from "../../../environment";
import { errorInterceptor, responseInterceptor } from "./interceptors";

//check if home server is available
//if not available go to render server

let Api: AxiosInstance | undefined;
let baseURL: string;

const initializeApi = async () => {
  // Define your endpoints
  const myServerUrl = "https://myserver.fireweb.click:8443/finance-api/v1/";
  const renderUrl =
    "https://finance-control-api-o5t9.onrender.com/finance-api/v1/";

  if (Environment.ENV === "production") {
    try {
      // Attempt to reach server with a timeout
      await axios.get(`${myServerUrl}ping`, { timeout: 3000 });

      // If successful, use your server as the base URL
      baseURL = myServerUrl;
    } catch (error) {
      // If failed, use the Render.com URL
      baseURL = renderUrl;
    }
  } else {
    // For development, you might use a local server
    baseURL = "http://127.0.0.1:3000/finance-api/v1/";
  }

  // Create the Axios instance
  Api = axios.create({
    baseURL,
    // withCredentials: true, // Include cookies if needed
  });

  Api.interceptors.response.use(
    (response) => responseInterceptor(response),
    (error) => errorInterceptor(error)
  );
};

// const Api = axios.create({
//   baseURL:
//     Environment.ENV === "production"
//       ? "https://finance-control-api-o5t9.onrender.com/finance-api/v1/"
//       : "https://myserver.fireweb.click:8443/finance-api/v1/",
//   // "http://127.0.0.1:3000/finance-api/v1/",
//   // withCredentials: true, // Include cookies in requests
// });

const getApiInstance = (): AxiosInstance => {
  if (!Api) {
    throw new Error("API not initialized. Call initializeApi() first.");
  }
  return Api;
};
export { initializeApi, getApiInstance };

// export { Api };
