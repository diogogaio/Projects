import {
  Box,
  Link,
  Stack,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { useThemeContext } from "../contexts";
import { AppTextSourceModal } from "./AppTextSourceModal";
import ametista from "../../assets/images/background/ametista.jpg";

export const Footer = () => {
  const [openSourceModal, setOpenSourceModal] = useState(false);

  const { AppThemes } = useThemeContext();
  const iconStyle = {
    mr: "5px",
    fontSize: "1.25rem",
  };

  const alignIcons = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const changeBg = useMediaQuery(AppThemes.theme.breakpoints.down(860));

  return (
    <Paper
      component="footer"
      elevation={1}
      sx={{
        pt: 2,
        width: "100%",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        backgroundSize: "cover",
        justifyContent: "center",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          AppThemes.selectedAppTheme === "light"
            ? `url(${ametista})`
            : undefined,
        boxShadow: AppThemes.themeShadows,
      }}
    >
      <Stack
        spacing={1}
        component="section"
        direction="column"
        alignItems="center"
      >
        <Typography
          sx={{
            px: "0.4rem",
            py: "0.2rem",
            borderRadius: 1,
            backgroundColor: changeBg
              ? AppThemes.toggleBgTransparency()
              : undefined,
          }}
          color="secondary"
          variant="body1"
        >
          Desenvolvido por Diogo Gaio
        </Typography>
        <Typography
          color="secondary"
          component="address"
          variant="caption"
          align="center"
          sx={{
            px: "0.4rem",
            py: "0.2rem",
            borderRadius: 1,
            backgroundColor: changeBg
              ? AppThemes.toggleBgTransparency()
              : undefined,
          }}
        >
          <Stack spacing={1}>
            <Box sx={alignIcons}>
              <GitHubIcon sx={{ ...iconStyle }} />
              <Link
                target="_blank"
                color="inherit"
                href="https://github.com/diogogaio"
              >
                Perfil Github
              </Link>
            </Box>
            <Box sx={alignIcons}>
              <MailOutlineIcon sx={{ ...iconStyle }} />
              <Link
                target="_blank"
                color="inherit"
                href="mailto:diogogaio@gmail.com"
              >
                diogogaio@gmail.com
              </Link>
            </Box>
            <Box>
              <Link
                color="inherit"
                component="small"
                onClick={() => setOpenSourceModal(true)}
                sx={{ role: "button", cursor: "pointer" }}
              >
                Fontes
              </Link>
            </Box>
          </Stack>
        </Typography>
      </Stack>
      <Typography
        sx={{ alignSelf: "start", ml: 1, fontSize: "0.4rem" }}
        color="gray"
      >
        {/* Last deploy date and time (YYYY-MM-DD.HH:MM) */}
        20240806.1630
      </Typography>
      <AppTextSourceModal
        openSourceModal={openSourceModal}
        setOpenSourceModal={setOpenSourceModal}
      />
    </Paper>
  );
};
