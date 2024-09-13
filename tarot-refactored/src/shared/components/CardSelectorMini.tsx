import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Box, IconButton, Stack } from "@mui/material";

import {
  useThemeContext,
  useGlobalContext,
  useServerContext,
} from "../contexts";
import arcanosIcons from "../../assets/images/icons/iconsExport";

export const CardSelectorMini = () => {
  const location = useLocation();
  const { AppThemes } = useThemeContext();
  const { serverLoading } = useServerContext();
  const { setOpenDrawerCards } = useGlobalContext();

  const buttons = useMemo(() => {
    return [
      { name: "Paus", image: "paus" },
      { name: "Pentáculos", image: "pentaculos" },
      { name: "Copas", image: "copas" },
      { name: "Espadas", image: "espadas" },
      { name: "Arcanos Maiores", image: "arcanosMaiores" },
      { name: "Padilha", image: "vela" },
    ].map((item) => {
      return (
        <IconButton
          key={item.name}
          disabled={serverLoading || location.pathname === "/login"}
          onClick={() => {
            setOpenDrawerCards({ open: true, content: item.name });
          }}
        >
          <img
            style={{
              width: "30px",
              filter:
                AppThemes.selectedAppTheme === "dark"
                  ? "invert(1) hue-rotate(180deg)"
                  : "",
            }}
            src={arcanosIcons[item.image as keyof typeof arcanosIcons]}
            alt={`Ícone ${item.name}`}
          />
        </IconButton>
      );
    });
  }, [AppThemes.selectedAppTheme]);

  return (
    <Box>
      <Stack spacing={2} direction="row" aria-label="mini-card-selector">
        {buttons}
      </Stack>
    </Box>
  );
};
