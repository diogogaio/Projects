import {
  useState,
  useContext,
  useCallback,
  ReactElement,
  createContext,
} from "react";
import { differenceInMinutes } from "date-fns";

import {
  TCardInfo,
  TDrawerCards,
  IAppContextData,
  TSnackbarOptions,
  IAppProviderProps,
} from "../types";
import { Environment } from "../environment";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useServerContext } from "./ServerContext";
import { useLocalBaseContext } from "./LocalBaseContext";
import { exempleReading } from "../../assets/CardsDatabase";

export const AppContext = createContext({} as IAppContextData);

export const AppProvider = ({ children }: IAppProviderProps): ReactElement => {
  const {
    userUEC,
    Firestore,
    savedReadings,
    userServerTag,
    userServerUECtag,
    setUserUEC,
    setServerLoading,
  } = useServerContext();
  const { LocalBase } = useLocalBaseContext();

  const theme = useTheme();
  const smDOwn = useMediaQuery(theme.breakpoints.down("sm"));

  //STATES:
  const [appLoading, setAppLoading] = useState(false);
  const [isSelectingCards, setIsSelectingCards] = useState(false);
  const [selectedCardsId, setSelectedCardsId] = useState<string[] | undefined>(
    undefined
  );
  const [scrollToElementId, setScrollToElementId] = useState<
    string | undefined
  >(undefined);
  const [readingTableCards, setReadingTableCards] = useState<
    TCardInfo[] | undefined
  >(exempleReading.reading);
  const [readingNotes, setReadingNotes] = useState<string | undefined>(
    undefined
  );
  const [readingTableColumns, setReadingTableColumns] = useState<number>(
    smDOwn ? 1 : 3
  );

  //DRAWERS:
  const [drawerMenu, setOpenDrawerMenu] = useState(false);
  const [drawerCards, setOpenDrawerCards] = useState<TDrawerCards>({
    open: false,
    content: "",
    cardAsideIndex: undefined,
  });

  //MODALS:
  const [openCardMarkedModal, setOpenCardMarkedModal] = useState(false);
  const [openPanoramicView, setOpenPanoramicView] = useState(false);
  const [openSaveReadingModal, setOpenSaveReadingModal] = useState(false);

  //SNACK BAR:
  const [appSnackbarOptions, setAppSnackbarOptions] = useState<
    TSnackbarOptions | undefined
  >(undefined);

  const handleCloseAppSnackBarOptions = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setAppSnackbarOptions(undefined);
  };

  const ReadingCards = {
    clearUEC: useCallback(async () => {
      if (userUEC?.length) {
        if (
          window.confirm(
            "Deseja restaurar todas as cartas para os significados padrões?"
          )
        ) {
          try {
            await Promise.all(
              userUEC.map(async (card) => {
                try {
                  await Firestore.deleteDoc(userServerUECtag, card.nome, true);
                  console.log(
                    "Card restored to default meanings on server:",
                    card.nome
                  );
                } catch (err) {
                  console.error("Error restoring card on server:", err);
                }
              })
            );

            // After all cards have been processed, update userUEC
            setUserUEC(undefined);
            console.log("All cards restored to default meanings.");
            setAppSnackbarOptions({
              open: true,
              message: "Significados das cartas foram restaurados.",
              severity: "success",
            });
          } catch (err) {
            console.error("Error restoring cards:", err);
          }
        }
      } else {
        alert("Você não possui nenhuma carta personalizada!");
      }
    }, [userUEC, userServerUECtag]),
  };

  const Reading = {
    async deleteReading(collectionName: string, docId: string = "new-reading") {
      if (docId && docId !== "new-reading" && collectionName && savedReadings) {
        if (
          window.confirm("Deseja realmente deletar esta leitura para sempre?")
        ) {
          await LocalBase.deleteDocument(collectionName, docId);
          await Firestore.deleteDoc(collectionName, docId);
          await Firestore.fetchDataFromServer();
          setReadingTableCards(undefined);
        }
      } else alert("Somente tiragens salvas!");
    },

    removeSelectedCards: useCallback(() => {
      if (window.confirm("Deseja remover todas as cartas selecionadas?")) {
        setReadingTableCards((prev) =>
          prev?.filter((card) => !selectedCardsId?.includes(card.id))
        );
        setSelectedCardsId(undefined);
        setIsSelectingCards(false);
      }
    }, [readingTableCards, selectedCardsId]),

    updateDeviceReadings: useCallback(async () => {
      if (Environment.ADMIN_USER_TAG === userServerTag) {
        setServerLoading(true);
        await LocalBase.deleteCollection(userServerTag);
        setTimeout(async () => {
          await Firestore.fetchDataFromServer();
          setAppSnackbarOptions({
            open: true,
            message: "Dispositivo Atualizado!",
            severity: "success",
          });
        }, 200);
        return;
      }

      if (
        window.confirm(
          "Deseja atualizar as leituras deste dispositivo com os dados salvos no servidor? Este recurso é limitado, pode demorar alguns minutos, e não pode ser usado frequentemente."
        )
      ) {
        const lastRequestedTime = localStorage.getItem(
          `LAST_SERVER_REQUEST${userServerTag}`
        );
        console.log(
          "updateDeviceReadings: Last requested time: " + lastRequestedTime
        );
        const interval = Environment.SERVER_REQUESTS_INTERVAL;

        if (lastRequestedTime) {
          const difference = differenceInMinutes(
            new Date(),
            new Date(lastRequestedTime)
          );
          console.log(
            "updateDeviceReadings: Time in minutes since last update device request: " +
              difference
          );
          const allowUpdate = difference >= interval ? true : false;

          if (allowUpdate) {
            console.log("updateDeviceReadings: Update device is allowed...");
            localStorage.setItem(
              `LAST_SERVER_REQUEST${userServerTag}`,
              new Date().toISOString()
            );

            await LocalBase.deleteCollection(userServerTag);
            await Firestore.fetchDataFromServer();
            setAppSnackbarOptions({
              open: true,
              message: "Dispositivo Atualizado!",
              severity: "success",
            });
          } else {
            console.log("updateDeviceReadings: Update device NOT allowed...");
            alert(
              "Dispositivo foi atualizado recentemente. Tente novamente mais tarde..."
            );
          }
        } else {
          console.log(
            "User.isServerAllowed(): LAST_REQUEST_TIME is undefined. Update device is allowed..."
          );
          localStorage.setItem(
            `LAST_SERVER_REQUEST${userServerTag}`,
            new Date().toISOString()
          );
          await LocalBase.deleteCollection(userServerTag);
          await Firestore.fetchDataFromServer();
          setAppSnackbarOptions({
            open: true,
            message: "Dispositivo Atualizado!",
            severity: "success",
          });
        }
      }
    }, [userServerTag]),
  };

  const Utils = {
    scrollToAddedCard(id: string | undefined) {
      const element = document.querySelector(`img#${CSS.escape(String(id))}`);

      if (id && element) {
        setTimeout(() => {
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 700);
      } else console.log("Failed to scroll to element.");
    },
  };

  return (
    <AppContext.Provider
      value={{
        Utils,
        Reading,
        drawerMenu,
        appLoading,
        drawerCards,
        ReadingCards,
        readingNotes,
        selectedCardsId,
        isSelectingCards,
        scrollToElementId,
        readingTableCards,
        openPanoramicView,
        appSnackbarOptions,
        openCardMarkedModal,
        readingTableColumns,
        openSaveReadingModal,
        setAppLoading,
        setReadingNotes,
        setOpenDrawerMenu,
        setOpenDrawerCards,
        setSelectedCardsId,
        setIsSelectingCards,
        setReadingTableCards,
        setScrollToElementId,
        setOpenPanoramicView,
        setAppSnackbarOptions,
        setOpenCardMarkedModal,
        setReadingTableColumns,
        setOpenSaveReadingModal,
        handleCloseAppSnackBarOptions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
