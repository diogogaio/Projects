import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { Box, Button, Stack, Typography } from "@mui/material";

import { useThemeContext, useGlobalContext } from "../contexts";

export const UserStatus = () => {
  const navigate = useNavigate();
  const { AppThemes } = useThemeContext();
  const { User, userEmail } = useGlobalContext();

  return (
    <>
      {userEmail !== "unknown user" ? (
        <Stack
          spacing={1}
          direction="row"
          justifyContent="center"
          sx={{
            padding: "5px",
            borderRadius: "5px",
            backgroundColor: AppThemes.toggleBgTransparency(),
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", maxWidth: "250px" }}
          >
            <PersonIcon
              sx={{ fontSize: "1.1rem", mr: "5px", color: "green" }}
            />
            <Typography noWrap variant="body2">
              {userEmail}
            </Typography>
          </Box>
          <Box>
            <Button size="small" color="error" onClick={User.signUserOut}>
              Sair
            </Button>
          </Box>
        </Stack>
      ) : (
        <Stack
          spacing={1}
          direction="row"
          justifyContent="center"
          sx={{
            padding: "5px",
            borderRadius: 4,
            backgroundColor: AppThemes.toggleBgTransparency(),
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", maxWidth: "250px" }}
          >
            <PersonOffIcon
              color="error"
              sx={{ fontSize: "1.1rem", mr: "5px" }}
            />
            <Typography noWrap variant="body2">
              Usuário desconhecido
            </Typography>
          </Box>
          <Box>
            <Button
              size="small"
              color="success"
              onClick={() => navigate("/Login")}
            >
              Entrar
            </Button>
          </Box>
        </Stack>
      )}
    </>
  );
};
