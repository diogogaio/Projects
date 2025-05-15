import {
  Box,
  Link,
  Stack,
  Paper,
  Tooltip,
  Typography,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { useThemeContext } from "../contexts";
import { AppTextSourceModal } from "./AppTextSourceModal";
import ametista from "../../assets/images/background/ametista.jpg";

export const Footer = () => {
  const [openSourceModal, setOpenSourceModal] = useState(false);

  const { AppThemes } = useThemeContext();

  const changeBg = useMediaQuery(AppThemes.theme.breakpoints.down(860));
  const showDevName = useMediaQuery(AppThemes.theme.breakpoints.up(335)); //335

  return (
    <Paper
      component="footer"
      elevation={1}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        backgroundSize: changeBg ? "cover" : "auto",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          AppThemes.selectedAppTheme === "light"
            ? `url(${ametista})`
            : undefined,
        boxShadow: AppThemes.themeShadows,
      }}
    >
      <Box
        sx={{
          p: 1,
          gap: 1,
          width: "100%",
          display: "flex",
          alignItems:
            !showDevName && AppThemes.selectedAppTheme !== "dark"
              ? "start"
              : "center",
          flexDirection: showDevName ? "row" : "column",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="column">
          {/* Tooltip: last deployed version date: (yyyy-mm-dd.hh-min*/}
          {showDevName && (
            <Tooltip
              sx={{ fontSize: "3px" }}
              title="20250509.1320"
              placement="top-end"
            >
              <Typography
                variant="caption"
                color="secondary"
                sx={{ fontStyle: "italic" }}
              >
                Desenvolvido por Diogo Gaio
              </Typography>
            </Tooltip>
          )}
          <Box>
            <Typography
              variant="caption"
              color="secondary"
              sx={{ fontStyle: "italic" }}
            >
              <Link
                color="inherit"
                component="small"
                onClick={() => setOpenSourceModal(true)}
                sx={{ role: "button", cursor: "pointer" }}
              >
                Créditos aos autores
              </Link>
            </Typography>
          </Box>
        </Stack>

        <Stack
          component="section"
          direction="row"
          sx={{
            px: "0.4rem",
            py: "0.2rem",
            borderRadius: 1,
            backgroundColor: changeBg
              ? AppThemes.toggleBgTransparency()
              : undefined,
          }}
        >
          <Link
            target="_blank"
            href="https://www.linkedin.com/in/devdiogogaio/"
          >
            <IconButton aria-label="ícone botão linkedIn">
              <LinkedInIcon color="secondary" />
            </IconButton>
          </Link>
          <Link target="_blank" href="https://github.com/diogogaio">
            <IconButton aria-label="ícone botão github">
              <GitHubIcon color="secondary" />
            </IconButton>
          </Link>
          <Link href="mailto:diogogaio@gmail.com">
            <IconButton aria-label="ícone botão email">
              <MailOutlineIcon color="secondary" />
            </IconButton>
          </Link>
        </Stack>
      </Box>
      <AppTextSourceModal
        openSourceModal={openSourceModal}
        setOpenSourceModal={setOpenSourceModal}
      />
    </Paper>
  );
};
