import { memo, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Icon, IconButton, Stack, Tooltip, useMediaQuery } from "@mui/material";

import {
  useThemeContext,
  useGlobalContext,
  useServerContext,
} from "../contexts";
import { newReading } from "../../assets/CardsDatabase";

type TMiniOptions = {
  text: string;
  icon: string;
  hide: boolean;
  disabled: boolean;
  color?: "success" | "inherit";
  onClick: (() => void) | (() => Promise<void>);
};

export const MenuMini = memo(() => {
  const {
    Reading,
    selectedCardsId,
    isSelectingCards,
    selectedReading,
    setOpenDrawerMenu,
    setSelectedCardsId,
    setIsSelectingCards,
    setSelectedReading,
    setOpenPanoramicView,
    setAppSnackbarOptions,
    setOpenCardMarkedModal,
    setOpenSaveReadingModal,
  } = useGlobalContext();

  const { AppThemes } = useThemeContext();
  const { User, userServerTag, userUEC, userEmail, serverLoading } =
    useServerContext();

  const navigate = useNavigate();
  const location = useLocation();
  const { readingId } = useParams();
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

  const readingTableCards = selectedReading.reading;
  const btwSizes = useMediaQuery(
    AppThemes.theme.breakpoints.between("md", 1500)
  );
  const mdDown = useMediaQuery(AppThemes.theme.breakpoints.down("lg"));

  const options: TMiniOptions[] = useMemo(() => {
    return [
      {
        text: "Salvar Tiragem",
        icon: "cloud_upload_two_tone",
        hide: mdDown,
        onClick: () => setOpenSaveReadingModal(true),
        disabled: disabledConditions || !readingTableCards?.length,
      },
      {
        text: "Tiragens Salvas",
        icon: "list",
        hide: mdDown || btwSizes,
        onClick: () => navigate(`/saved-readings-list/${readingId}`),
        disabled: disabledConditions || !userServerTag,
      },
      {
        text: "Nova Tiragem",
        icon: "refresh",
        hide: mdDown || btwSizes,
        onClick: () => {
          if (window.confirm("Existem cartas na mesa, deseja continuar?")) {
            setSelectedReading(newReading);

            navigate("/readings-table/new-reading");
          }
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
        hide: mdDown || btwSizes,
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
        hide: mdDown || btwSizes,
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
        hide: mdDown || btwSizes,
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
        hide: mdDown || btwSizes,
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
        hide: mdDown || btwSizes,
        onClick: () =>
          Reading.deleteReading(userServerTag, readingId || "new-reading"),
        disabled:
          !readingId || !readingTableCards?.length || disabledConditions,
      },
      {
        text: userEmail || "Usuário desconectado",
        icon: "person_rounded",
        color: userEmail ? "success" : "inherit",
        hide: false,
        onClick: () =>
          userServerTag ? User.signUserOut() : navigate("/login"),
        disabled: serverLoading || location.pathname === "/login",
      },
      {
        text: "Menu Principal",
        icon: "menu_rounded",
        hide: false,
        onClick: () => setOpenDrawerMenu(true),
        disabled: serverLoading,
      },
    ];
  }, [
    mdDown,
    userUEC,
    btwSizes,
    location,
    readingId,
    serverLoading,
    userServerTag,
    selectedCardsId,
    isSelectingCards,
    readingTableCards,
    disabledConditions,
  ]);

  const buttonIcons = useMemo(
    () =>
      options
        .filter((item) => !item.hide)
        .map((item) => (
          <IconButton
            key={item.text}
            onClick={item.onClick}
            disabled={item.disabled}
          >
            <Tooltip title={item.text}>
              <Icon color={item.color}>{item.icon}</Icon>
            </Tooltip>
          </IconButton>
        )),
    [options]
  );

  return (
    <Stack direction="row" aria-label="mini-menu">
      {buttonIcons}
    </Stack>
  );
});
