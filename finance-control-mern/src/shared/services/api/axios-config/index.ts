import axios from "axios";
import { Environment } from "../../../environment";
import { errorInterceptor, responseInterceptor } from "./interceptors";

const Api = axios.create({
  baseURL:
    Environment.ENV === "production"
      ? "https://finance-control-api-o5t9.onrender.com"
      : "http://127.0.0.1:3000",
  // withCredentials: true, // Include cookies in requests
});

Api.interceptors.response.use(
  (response) => responseInterceptor(response),
  (error) => errorInterceptor(error)
);

export { Api };
