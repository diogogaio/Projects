import "./App.css";
import { BrowserRouter } from "react-router-dom";

import { AppRoutes } from "./routes";
import {
  AppProvider,
  ServerProvider,
  LocalBaseProvider,
  ThemeContextProvider,
} from "./shared/contexts";

function App() {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <LocalBaseProvider>
          <ServerProvider>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </ServerProvider>
        </LocalBaseProvider>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

export default App;
