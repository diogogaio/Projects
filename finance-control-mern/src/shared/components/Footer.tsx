import {
  Box,
  Link,
  Stack,
  Tooltip,
  useTheme,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

export const Footer = () => {
  const theme = useTheme();
  const showDevName = useMediaQuery(theme.breakpoints.up(335)); //335
  return (
    <Box
      component="footer"
      sx={{
        p: 1,
        boxShadow: 20,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: showDevName ? "space-between" : "center",
      }}
    >
      {/* Last deployed version date: (yyyy-mm-dd.hh-min*/}
      {showDevName && (
        <Tooltip
          sx={{ fontSize: "3px" }}
          title="20241112.1416"
          placement="top-end"
        >
          <Typography variant="caption" sx={{ fontStyle: "italic" }}>
            Desenvolvido por Diogo Gaio
          </Typography>
        </Tooltip>
      )}
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
