import axios from "axios";

import { Environment } from "../../../environment";
import { errorInterceptor, responseInterceptor } from "./interceptors";

//check if home server is available
//if not available go to render server

// Create the Axios instance
const renderUrl =
  "https://finance-control-api-o5t9.onrender.com/finance-api/v1/";

const Api = axios.create({
  baseURL: renderUrl,
  // withCredentials: true, // Include cookies if needed
});

Api.interceptors.response.use(
  (response) => responseInterceptor(response),
  (error) => errorInterceptor(error)
);

const checkMyServer = async () => {
  const myServerUrl = "https://myserver.fireweb.click:8443/finance-api/v1/";

  if (Environment.ENV === "development") {
    // For development, you might use a local server
    setApiBaseURL("http://127.0.0.1:3000/finance-api/v1/");
    return;
  }

  if (
    Environment.ENV === "production" &&
    Api.defaults.baseURL !== myServerUrl
  ) {
    try {
      await axios.get(`${myServerUrl}ping`, { timeout: 5000 });
      setApiBaseURL(myServerUrl);
    } catch (error) {}
  } else {
    console.log("...at home");
  }
};

const setApiBaseURL = (baseURL: string) => {
  Api.defaults.baseURL = baseURL;
};

export { Api, setApiBaseURL, checkMyServer };
