import axios from "axios";
import { Environment } from "../../../environment";
import { errorInterceptor, responseInterceptor } from "./interceptors";

const Api = axios.create({
  baseURL:
    Environment.ENV === "production"
      ? Environment.PRODUCTION_BASE_URL
      : Environment.DEVELOPMENT_BASE_URL,
  // withCredentials: true, // Include cookies in requests
});

Api.interceptors.response.use(
  (response) => responseInterceptor(response),
  (error) => errorInterceptor(error)
);

export { Api };
