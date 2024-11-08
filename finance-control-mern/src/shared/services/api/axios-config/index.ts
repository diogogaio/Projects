import axios from "axios";
import { Environment } from "../../../environment";
import { errorInterceptor, responseInterceptor } from "./interceptors";

//check if home server is available
//if not available go to render server

const Api = axios.create({
  baseURL:
    Environment.ENV === "production"
      ? "https://finance-control-api-o5t9.onrender.com/finance-api/v1/"
      : "https://myserver.fireweb.click:8443/finance-api/v1/",
  // "http://127.0.0.1:3000/finance-api/v1/",
  // withCredentials: true, // Include cookies in requests
});

Api.interceptors.response.use(
  (response) => responseInterceptor(response),
  (error) => errorInterceptor(error)
);

export { Api };
