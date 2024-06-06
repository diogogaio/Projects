import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { useCallback, useMemo } from "react";

import {
  useGlobalContext,
  useServerContext,
  useThemeContext,
} from "../contexts";
import arcanosIcons from "../../assets/images/icons/iconsExport";

type TCardsSelectorProps = {
  location: string;
  direction: "row" | "column";
};

export const CardsSelector = ({ location, direction }: TCardsSelectorProps) => {
  const { AppThemes } = useThemeContext();
  const { serverLoading } = useServerContext();
  const { setOpenDrawerCards } = useGlobalContext();
  const createCardsSelector = useCallback(
    () => (
      <Box>
        <List
          component="nav"
          sx={{
            display: "flex",
            flexDirection: direction,
          }}
        >
          {[
            { name: "Paus", image: "paus" },
            { name: "Pentáculos", image: "pentaculos" },
            { name: "Copas", image: "copas" },
            { name: "Espadas", image: "espadas" },
            { name: "Arcanos Maiores", image: "arcanosMaiores" },
            { name: "Padilha", image: "vela" },
          ].map((item) => (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                disabled={
                  serverLoading || !location.includes("/readings-table")
                }
                onClick={() => {
                  setOpenDrawerCards({ open: true, content: item.name });
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: direction === "row" ? "40px" : "56px" }}
                >
                  <img
                    style={{
                      width: "25px",
                      height: "25px",
                      filter:
                        AppThemes.selectedAppTheme === "dark"
                          ? "invert(1) hue-rotate(180deg)"
                          : "",
                    }}
                    src={arcanosIcons[item.image as keyof typeof arcanosIcons]}
                    alt={`Ícone ${item.name}`}
                  />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    whiteSpace: "nowrap",
                  }}
                  primary={item.name}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    ),
    [AppThemes.selectedAppTheme, serverLoading, location]
  );

  const cardsSelector = useMemo(
    () => createCardsSelector(),
    [AppThemes.selectedAppTheme, serverLoading, location]
  );
  return cardsSelector;
};
