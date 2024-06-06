import { CssBaseline, Theme } from "@mui/material";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import { ReactNode, createContext, useContext, useMemo, useState } from "react";

interface IAppThemes {
  theme: Theme;
  customTheme: any;
  selectedAppTheme: string;
  toggleBgTransparency: () => string;
  toggleTheme: (isChecked: boolean) => void;
}

interface IThemeContext {
  AppThemes: IAppThemes;
}

interface ThemeContextProviderProps {
  children: ReactNode;
}

//changed compiler options on ts config: "lib": ["es6", "dom"] as required in MUI Typescript requirements
export const ThemeContext = createContext({} as IThemeContext);

export const ThemeContextProvider = ({
  children,
}: ThemeContextProviderProps) => {
  const [selectedAppTheme, setSelectedAppTheme] = useState(
    (localStorage.getItem("selectedAppTheme") as "light" | "dark") || "dark"
  );
  const theme = useTheme();
  const CustomTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: selectedAppTheme,
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
        LightShadow: "1px 2px 32px -10px rgba(247,247,247,0.5)",
      }),
    [selectedAppTheme]
  );

  const AppThemes = {
    toggleTheme(isChecked: boolean) {
      console.log("Dark mode is: ", isChecked);
      const selectedTheme = isChecked ? "dark" : "light";
      localStorage.setItem("selectedAppTheme", selectedTheme);
      setSelectedAppTheme(selectedTheme);
    },

    toggleBgTransparency() {
      const transparency =
        selectedAppTheme === "dark"
          ? "#00000099"
          : "rgba(254, 254, 254, 0.431)";

      return transparency;
    },

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
