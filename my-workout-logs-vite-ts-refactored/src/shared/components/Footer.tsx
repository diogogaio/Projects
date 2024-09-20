import {
  Box,
  Link,
  Stack,
  useTheme,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { useThemeContext } from "../contexts";

export const Footer = () => {
  const theme = useTheme();
  const { AppThemes } = useThemeContext();

  return (
    <Box
      component="footer"
      sx={{
        p: 1,
        mt: 2,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: AppThemes.toggleBgTransparency(),
        boxShadow:
          AppThemes.selectedAppTheme === "dark" ? theme.LightShadow : 4,
      }}
    >
      {/* Last deployed version date: (yyyy-mm-dd.hh-min*/}
      <Tooltip
        sx={{ fontSize: "3px" }}
        title="20240920.1111"
        placement="top-end"
      >
        <Typography variant="caption" sx={{ fontStyle: "italic" }}>
          Desenvolvido por Diogo Gaio
        </Typography>
      </Tooltip>
      <Stack component="section" direction="row">
        <Link target="_blank" href="https://www.linkedin.com/in/devdiogogaio/">
          <IconButton aria-label="ícone botão linkedIn">
            <LinkedInIcon />
          </IconButton>
        </Link>
        <Link target="_blank" href="https://github.com/diogogaio">
          <IconButton aria-label="ícone botão github">
            <GitHubIcon />
          </IconButton>
        </Link>
        <Link href="mailto:diogogaio@gmail.com">
          <IconButton aria-label="ícone botão email">
            <MailOutlineIcon />
          </IconButton>
        </Link>
      </Stack>
    </Box>
  );
};
