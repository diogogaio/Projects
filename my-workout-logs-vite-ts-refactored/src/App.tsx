import "./App.css";
import AppRoutes from "./routes/routes";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./shared/contexts/GlobalContext";
import { ThemeContextProvider, LocalBaseProvider } from "./shared/contexts";

function App() {
  return (
    <ThemeContextProvider>
      <LocalBaseProvider>
        <BrowserRouter>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </BrowserRouter>
      </LocalBaseProvider>
    </ThemeContextProvider>
  );
}

export default App;
