import PersonIcon from "@mui/icons-material/Person";
import { Box, Typography, useTheme } from "@mui/material";
import PersonOffIcon from "@mui/icons-material/PersonOff";

import { useGlobalContext, useThemeContext } from "../contexts";

export function Header() {
  const theme = useTheme();
  const { AppThemes } = useThemeContext();
  const { userEmail } = useGlobalContext();
  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        backgroundColor: AppThemes.toggleBgTransparency(),
        boxShadow:
          AppThemes.selectedAppTheme === "dark" ? theme.LightShadow : 4,
      }}
    >
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Agenda Fitness
        </Typography>
        <Box sx={{ alignSelf: "flex-end", mr: 1 }}>
          {userEmail !== "unknown user" ? (
            <PersonIcon
              sx={{ fontSize: "1.1rem", mr: "5px", color: "green" }}
            />
          ) : (
            <PersonOffIcon
              color="error"
              sx={{ fontSize: "1.1rem", mr: "5px" }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
