import { ReactNode } from "react";
import { Box, useTheme } from "@mui/material";

import { useThemeContext } from "../contexts";

interface AppCenterLayout {
  children: ReactNode;
}

export const AppCenterLayout = ({ children }: AppCenterLayout) => {
  const { AppThemes } = useThemeContext();
  const theme = useTheme();
  return (
    <Box
      component="main"
      id="MAIN COMPONENTS"
      sx={{
        mt: 4,
        width: {
          xs: "98%",
          sm: "98%",
          md: "95%",
          lg: "95%",
          xl: "70%",
          xxl: "100%",
        },
        display: "flex",
        padding: "15px 0px",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: AppThemes.toggleBgTransparency(),
        boxShadow:
          AppThemes.selectedAppTheme === "dark" ? theme.LightShadow : 4,
      }}
    >
      {children}
    </Box>
  );
};
