import { CssBaseline, Theme } from "@mui/material";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import { ReactNode, createContext, useContext, useMemo, useState } from "react";

interface IAppThemes {
  toggleTheme: (selectedAppTheme: "light" | "dark") => void;
  toggleBgTransparency: () => string;
  themeShadows: string | number;
  selectedAppTheme: string;
  theme: Theme;
  customTheme: any;
}

interface IThemeContext {
  AppThemes: IAppThemes;
}

interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContext = createContext({} as IThemeContext);

export const ThemeContextProvider = ({
  children,
}: ThemeContextProviderProps) => {
  const [selectedAppTheme, setSelectedAppTheme] = useState(
    (localStorage.getItem("selectedAppTheme") as "light" | "dark") || "light"
  );
  const theme = useTheme();
  const CustomTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: selectedAppTheme,
        },
        breakpoints: {
          values: {
            xs: 0,
            sm: 650,
            md: 1100,
            lg: 1200,
            xl: 1536,
          },
        },
        typography: {
          captionXS: {
            ...theme.typography.caption,
            fontSize: "0.6rem",
          },
          captionSMI: {
            ...theme.typography.caption,
            fontStyle: "italic",
            fontSize: "0.7rem",
          },
          buttonSM: {
            ...theme.typography.button,
            fontSize: "0.6rem",
          },
        },
        LightShadow:
          "0px 3px 5px -1px rgba(255, 255, 255, 0.2), 0px 5px 8px 0px rgba(255, 255, 255, 0.14), 0px 1px 14px 0px rgba(255, 255, 255, 0.12)",
      }),
    [selectedAppTheme]
  );

  const AppThemes = {
    toggleTheme(selectedTheme: "light" | "dark") {
      localStorage.setItem("selectedAppTheme", selectedTheme);
      setSelectedAppTheme(selectedTheme);
    },

    toggleBgTransparency() {
      const transparency =
        selectedAppTheme === "dark"
          ? "#00000000"
          : "rgba(254, 254, 254, 0.600)";

      return transparency;
    },

    themeShadows: selectedAppTheme === "dark" ? CustomTheme.LightShadow : 4,

    selectedAppTheme: selectedAppTheme,

    theme: theme,

    customTheme: CustomTheme,
  };

  return (
    <ThemeContext.Provider value={{ AppThemes }}>
      <ThemeProvider theme={CustomTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
