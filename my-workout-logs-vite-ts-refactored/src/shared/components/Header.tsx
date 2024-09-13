import PersonIcon from "@mui/icons-material/Person";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import PersonOffIcon from "@mui/icons-material/PersonOff";

import { useGlobalContext, useThemeContext } from "../contexts";
import { useNavigate } from "react-router-dom";

export function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { AppThemes } = useThemeContext();
  const { User, userEmail } = useGlobalContext();
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
        <Box
          onClick={() =>
            userEmail !== "unknown user"
              ? User.signUserOut()
              : navigate("/Login")
          }
          sx={{ alignSelf: "flex-end", mr: 1, cursor: "pointer" }}
        >
          <Tooltip title={userEmail === "unknown user" ? "Entrar" : userEmail}>
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
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
