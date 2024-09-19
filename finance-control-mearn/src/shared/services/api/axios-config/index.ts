import axios from "axios";
import { errorInterceptor, responseInterceptor } from "./interceptors";

const Api = axios.create({
  //   baseURL: Enviroment.URL_BASE,
  baseURL: "http://127.0.0.1:3000",
  // withCredentials: true, // Include cookies in requests
});

Api.interceptors.response.use(
  (response) => responseInterceptor(response),
  (error) => errorInterceptor(error)
);

export { Api };