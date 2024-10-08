import "./App.css";
import "./index.css";
import { CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import {
  AppProvider,
  AuthProvider,
  LocalBaseProvider,
  TransactionProvider,
} from "./shared/contexts";
import { AppRoutes } from "./shared/routes";
import { Environment } from "./shared/environment";

function App() {
  const theme = createTheme({
    palette: {
      secondary: {
        main: Environment.APP_MAIN_TEXT_COLOR,
        // light, dark: will be calculated from palette.secondary.main,
        // contrastText: "#47008F",
      },
      warning: {
        main: "#fdd835",
      },
    },
    typography: {
      fontFamily: "Poppins",
      h4: {
        fontFamily: "Lato",
      },
      h5: {
        fontFamily: "Lato",
      },
    },
  });
  return (
    <LocalBaseProvider>
      <AppProvider>
        <BrowserRouter>
          <AuthProvider>
            <TransactionProvider>
              <CssBaseline />
              <ThemeProvider theme={theme}>
                <AppRoutes />
              </ThemeProvider>
            </TransactionProvider>
          </AuthProvider>
        </BrowserRouter>
      </AppProvider>
    </LocalBaseProvider>
  );
}

export default App;
