import { Paper, Stack, Typography, useMediaQuery } from "@mui/material";

import { Environment } from "../environment";
import { useThemeContext } from "../contexts";

type TAppMainContainer = {
  children: React.ReactNode;
  page: string;
  subheading?: string;
};

export const AppMainContainer = ({
  children,
  page,
  subheading,
}: TAppMainContainer) => {
  const { AppThemes } = useThemeContext();
  const smDown = useMediaQuery(AppThemes.theme.breakpoints.down("sm"));
  return (
    <Paper
      elevation={1}
      component="main"
      id="MAIN COMPONENTS"
      sx={{
        p: 1,
        mt: 4,
        flex: 1,
        width: {
          xs: "96%",
          sm: "98%",
          md: "95%",
        },
        display: "flex",
        borderRadius: "5px",
        alignItems: "center",
        flexDirection: "column",
        boxShadow: AppThemes.themeShadows,
      }}
    >
      <Stack direction="column" width="100%" alignItems="center">
        <Typography
          noWrap
          width="100%"
          textAlign="center"
          component="h6"
          variant={smDown ? "h6" : "h5"}
          color={Environment.APP_MAIN_TEXT_COLOR}
          sx={{
            textShadow:
              AppThemes.selectedAppTheme === "light" ? "1px 1px lightgray" : "",
          }}
        >
          {page}
        </Typography>
        <Typography
          sx={{
            mt: 1,
            opacity: "0.8",
            textAlign: "center",
            fontStyle: "oblique",
            letterSpacing: "0.5px",
          }}
          component="p"
          variant={smDown ? "body1" : "h6"}
        >
          {subheading}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
};
