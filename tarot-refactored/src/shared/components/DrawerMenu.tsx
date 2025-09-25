import {
  Box,
  Icon,
  List,
  Drawer,
  Select,
  Divider,
  MenuItem,
  ListItem,
  InputLabel,
  FormControl,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  ListItemButton,
  SelectChangeEvent,
} from "@mui/material";
import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  useThemeContext,
  useGlobalContext,
  useServerContext,
} from "../contexts";
import { CardsSelector } from "./CardsSelector";
import { newReading, exempleReading } from "../../assets/CardsDatabase";

type TDrawerOption = {
  text: string;
  icon: string;
  color?:
    | "info"
    | "error"
    | "action"
    | "inherit"
    | "primary"
    | "warning"
    | "success"
    | "disabled"
    | "secondary";

  onClick: () => void;
  disabled: boolean;
};

export const DrawerMenu = () => {
  const {
    Reading,
    drawerMenu,
    ReadingCards,
    selectedCardsId,
    selectedReading,
    isSelectingCards,
    setOpenDrawerMenu,
    setSelectedCardsId,
    setIsSelectingCards,
    setSelectedReading,
    setOpenPanoramicView,
    setAppSnackbarOptions,
    setOpenCardMarkedModal,
    setOpenSaveReadingModal,
  } = useGlobalContext();

  const { User, userUEC, userServerTag, setSavedReadings } = useServerContext();

  const navigate = useNavigate();
  const location = useLocation();
  const { readingId } = useParams();
  const { AppThemes } = useThemeContext();
  const smDown = useMediaQuery(AppThemes.theme.breakpoints.down("sm"));
  const readingTableCards = selectedReading.reading;
  const readingTableColumns =
    selectedReading?.readingColumns || (smDown ? 1 : 3);

  const handleColumnsChange = (event: SelectChangeEvent) => {
    setSelectedReading((prev) => ({
      ...prev,
      readingColumns: Number(event.target.value),
    }));
  };
  const disabledConditions = useMemo(
    () =>
      !userServerTag ||
      isSelectingCards ||
      location.pathname.includes("/login") ||
      location.pathname.includes("/sign-up") ||
      location.pathname.includes("/edit-card") ||
      location.pathname.includes("/saved-readings-list"),
    [userServerTag, isSelectingCards, location]
  );
  const { searchParams } = location.state || {};

  const drawerOptions: TDrawerOption[] = useMemo(
    () => [
      {
        text: "Salvar Tiragem",
        icon: "cloud_upload_two_tone",
        onClick: () => setOpenSaveReadingModal(true),
        disabled: disabledConditions || !readingTableCards?.length,
      },
      {
        text: "Tiragens Salvas",
        icon: "list",
        onClick: () => {
          navigate(`/saved-readings-list/${readingId}`, {
            state: {
              searchParams,
            },
          });
        },
        disabled: disabledConditions || !userServerTag,
      },
      {
        text: "Nova Tiragem",
        icon: "refresh",
        onClick: () => {
          if (window.confirm("Existem cartas na mesa, deseja continuar?")) {
            if (readingTableCards) setSelectedReading(newReading);
            navigate("/readings-table/new-reading");
          }
          // if (readingNotes) setReadingNotes(undefined);
        },
        disabled:
          isSelectingCards ||
          !readingTableCards?.length ||
          location.pathname.includes("/login") ||
          location.pathname.includes("/sign-up") ||
          location.pathname.includes("/edit-card"),
      },
      {
        text: "Visão Panorâmica",
        icon: "visibility_outlined",
        onClick: () => {
          setAppSnackbarOptions({
            open: true,
            message: "Dica: Clique na carta para abrir visão panorâmica.",
            severity: "info",
          });
          if (readingTableCards?.length) setOpenPanoramicView(true);
          else alert("Mesa de leituras está vazia!");
        },
        disabled:
          !readingTableCards?.length ||
          location.pathname.includes("/login") ||
          location.pathname.includes("/sign-up") ||
          location.pathname.includes("/edit-card") ||
          location.pathname.includes("/saved-readings-list"),
      },
      {
        text: isSelectingCards ? "Cancelar Seleção" : "Selecionar Cartas",
        icon: isSelectingCards ? "cancel_outlined" : " check_circle ",
        onClick: () => {
          if (readingTableCards && readingTableCards?.length >= 2) {
            setSelectedCardsId(undefined);
            setIsSelectingCards((prev: boolean) => !prev);
            if (!isSelectingCards)
              setAppSnackbarOptions({
                open: true,
                message:
                  "Após selecionar as cartas, retorne ao menu para escolher as ações.",
                severity: "info",
              });
          } else alert("Quantidade insuficiente de cartas.");
        },
        disabled:
          location.pathname.includes("/login") ||
          location.pathname.includes("/sign-up") ||
          location.pathname.includes("/edit-card") ||
          location.pathname.includes("/saved-readings-list"),
      },
      {
        text: "Marcar Selecionadas",
        icon: "local_offer_outlined",
        onClick: () => {
          if (isSelectingCards && readingTableCards?.length)
            setOpenCardMarkedModal(true);
        },
        disabled:
          !isSelectingCards ||
          !selectedCardsId?.length ||
          location.pathname.includes("/saved-readings-list") ||
          location.pathname.includes("/login") ||
          location.pathname.includes("/sign-up") ||
          location.pathname.includes("/edit-card"),
      },
      {
        text: "Remover Selecionadas",
        icon: "remove_circle",
        onClick: () => Reading.removeSelectedCards(),
        disabled:
          !isSelectingCards ||
          !selectedCardsId?.length ||
          location.pathname.includes("/saved-readings-list") ||
          location.pathname.includes("/login") ||
          location.pathname.includes("/sign-up") ||
          location.pathname.includes("/edit-card"),
      },
      {
        text: "Deletar Tiragem",
        icon: "delete_outlined",
        onClick: () =>
          Reading.deleteReading(userServerTag, readingId || "new-reading"),
        disabled:
          !readingId || !readingTableCards?.length || disabledConditions,
      },
      {
        text: "Restaurar Significados Gerais",
        icon: "restore",
        onClick: () => ReadingCards.clearUEC(),
        disabled: disabledConditions,
      },
      {
        text: "Atualizar Dispositivo",
        icon: "sync",
        onClick: () => Reading.updateDeviceReadings(),
        disabled:
          !location.pathname.includes("/saved-readings-list") || !userServerTag,
      },
    ],
    [
      userUEC,
      location,
      readingId,
      // readingNotes,
      userServerTag,
      selectedCardsId,
      isSelectingCards,
      readingTableCards,
      disabledConditions,
    ]
  );

  const mainOptions = useMemo(
    () =>
      drawerOptions.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton onClick={item.onClick} disabled={item.disabled}>
            <ListItemIcon>
              <Icon color={item.color}>{item.icon}</Icon>
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      )),
    [drawerOptions]
  );

  const tableColumns = useMemo(
    () => (
      <ListItem disablePadding>
        <ListItemText>
          <FormControl sx={{ m: 1, width: "95%" }} size="small">
            <InputLabel id="tableColumns-select-small-label">
              Colunas de cartas
            </InputLabel>
            <Select
              label="Add carta ao lado"
              id="tableColumns-select-small"
              onChange={handleColumnsChange}
              value={String(readingTableColumns)}
              labelId="tableColumns-select-small-label"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((columns) => (
                <MenuItem
                  key={columns}
                  value={Number(columns)}
                  selected={readingTableColumns === columns}
                >
                  {columns}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItemText>
      </ListItem>
    ),
    [readingTableColumns]
  );

  const bottomOptions = useMemo(
    () => (
      <Box>
        <List component="nav">
          <ListItem
            disablePadding
            onClick={() =>
              AppThemes.toggleTheme(
                AppThemes.selectedAppTheme === "dark" ? "light" : "dark"
              )
            }
          >
            <ListItemButton>
              <ListItemIcon>
                <Icon>
                  {AppThemes.selectedAppTheme === "dark"
                    ? "light_mode"
                    : "dark_mode"}
                </Icon>
              </ListItemIcon>
              <ListItemText
                primary={
                  AppThemes.selectedAppTheme === "dark"
                    ? "Tema Claro"
                    : "Tema Escuro"
                }
              />
            </ListItemButton>
          </ListItem>

          <ListItem
            disablePadding
            onClick={async () => {
              if (userServerTag) {
                await User.signUserOut();
                setSavedReadings([exempleReading]);
              } else {
                navigate("/login");
              }
            }}
          >
            <ListItemButton
              disabled={
                location.pathname.includes("/login") ||
                location.pathname.includes("/sign-up") ||
                location.pathname.includes("/edit-card")
              }
            >
              <ListItemIcon>
                <Icon>{userServerTag ? "logout" : "login"}</Icon>
              </ListItemIcon>
              <ListItemText primary={userServerTag ? "Sair" : "Entrar"} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    ),
    [AppThemes.selectedAppTheme, userServerTag, location]
  );

  return (
    <div>
      <Drawer
        anchor="right"
        open={drawerMenu}
        role="presentation"
        onClose={() => setOpenDrawerMenu(false)}
        transitionDuration={{ enter: 200, exit: 200 }}
      >
        <Box
          sx={{
            width: 250,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          role="navigation"
          onClick={() => setOpenDrawerMenu(false)}
        >
          <Box width="97%" flex={1}>
            {/* {options} */}
            <List component="nav">
              {smDown && (
                <CardsSelector
                  direction="column"
                  location={location.pathname}
                />
              )}
              <Divider />
              {mainOptions}

              {tableColumns}
            </List>
            {/*  */}
          </Box>
          <Divider />
          {bottomOptions}
        </Box>
      </Drawer>
    </div>
  );
};
