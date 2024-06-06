import {
  Box,
  Stack,
  Paper,
  Divider,
  useTheme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useLocation } from "react-router-dom";

import { MenuMini } from "./MenuMini";
import { Environment } from "../environment";
import { useThemeContext } from "../contexts";
import { CardsSelector } from "./CardsSelector";
import { CardSelectorMini } from "./CardSelectorMini";

export const Header = () => {
  const { AppThemes } = useThemeContext();

  const theme = useTheme();
  const location = useLocation();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      component="header"
      sx={{
        p: 1,
        top: 0,
        zIndex: 100,
        width: "100%",
        display: "flex",
        position: "sticky",
        boxShadow: AppThemes.themeShadows,
        justifyContent: "space-between",
      }}
      elevation={1}
    >
      <Stack direction="row" spacing={3}>
        <Box
          sx={{
            p: 1,
            display: "flex",
            alignSelf: "center",
          }}
        >
          <Stack alignItems="center" direction="column">
            <Typography
              align="center"
              color={Environment.APP_MAIN_TEXT_COLOR}
              sx={{
                fontSize: "1.5em",
                letterSpacing: "2px",
                fontFamily: "Philosopher, sans-serif",
              }}
            >
              Tarot
            </Typography>
            <Typography
              align="center"
              variant="captionXS"
              color={Environment.APP_MAIN_TEXT_COLOR}
              sx={{ mt: "-5px", fontFamily: "Philosopher, sans-serif" }}
            >
              Ametista
            </Typography>
          </Stack>
        </Box>
        <Divider sx={{ ml: 2 }} orientation="vertical" />
        {mdUp && <CardsSelector direction="row" location={location.pathname} />}
        {!mdUp && !smDown && location.pathname.includes("/readings-table") && (
          <CardSelectorMini />
        )}
      </Stack>

      <MenuMini />
    </Paper>
  );
};
