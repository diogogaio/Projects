import GitHubIcon from "@mui/icons-material/GitHub";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Box, Typography, Link, Stack, useTheme } from "@mui/material";

import { useThemeContext } from "../contexts";

export const Footer = () => {
  const theme = useTheme();
  const { AppThemes } = useThemeContext();

  const iconStyle = {
    mr: "3px",
    fontSize: "1rem",
  };

  const alignIcons = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        pt: 2,
        width: "100%",
        height: "100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: AppThemes.toggleBgTransparency(),
        boxShadow:
          AppThemes.selectedAppTheme === "dark" ? theme.LightShadow : 4,
      }}
    >
      <Stack component="section" direction="column">
        <Typography>Desenvolvido por Diogo Gaio</Typography>
        <Typography component="address" variant="body1">
          <Box sx={alignIcons}>
            <GitHubIcon sx={{ ...iconStyle, mb: "0px" }} />
            <Link color="inherit" href="https://github.com/diogogaio">
              Perfil Github
            </Link>
          </Box>
          <Box sx={alignIcons}>
            <MailOutlineIcon sx={{ ...iconStyle, mb: "0px" }} />
            <Link color="inherit" href="mailto:diogogaio@gmail.com">
              diogogaio@gmail.com
            </Link>
          </Box>
        </Typography>
        {/* Last deployed version date: (yyyy-mm-dd.hh-min*/}
        <Typography
          sx={{ alignSelf: "end", mr: 1, fontSize: "0.4rem" }}
          color="gray"
        >
          20240604.1105
        </Typography>
      </Stack>
    </Box>
  );
};
