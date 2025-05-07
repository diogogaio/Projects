import {
  useState,
  useContext,
  useCallback,
  ReactElement,
  createContext,
  useRef,
} from "react";
import { differenceInMinutes } from "date-fns";

import {
  TCardInfo,
  TDrawerCards,
  IAppContextData,
  TSnackbarOptions,
  IAppProviderProps,
  TUserSavedReadings,
} from "../types";
import { Environment } from "../environment";
import { useServerContext } from "./ServerContext";
import { useLocalBaseContext } from "./LocalBaseContext";
import dbCards, { newReading } from "../../assets/CardsDatabase";

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

  console.log("APP CONTEXT PROVIDER RENDERING...");

  //STATES:
  const [appLoading, setAppLoading] = useState(false);
  const [isSelectingCards, setIsSelectingCards] = useState(false);
  const [selectedCardsId, setSelectedCardsId] = useState<string[] | undefined>(
    undefined
  );
  const [scrollToElementId, setScrollToElementId] = useState<
    string | undefined
  >(undefined);

  const [selectedReading, setSelectedReading] =
    useState<TUserSavedReadings>(newReading);
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

  const lastHandledId = useRef<string | undefined>();

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

    handleUECCards: useCallback(
      async (readingCards: TCardInfo[]): Promise<TCardInfo[] | []> => {
        setServerLoading(true);
        window.scrollTo(0, 0);

        if (!readingCards)
          console.error("HandleUECCards: Reading cards are undefined.");
        const setupCards = await Promise.all(
          (readingCards || []).map((card) => {
            let updatedCardName: string;
            if (card.nome === "Pessoa Intermediária") {
              // Fixing old database card names with updated names
              updatedCardName =
                card.numero === "24"
                  ? "Pessoa Intermediária Homem"
                  : "Pessoa Intermediária Mulher";
            } else updatedCardName = card.nome;

            let isEditedCard = userUEC?.find(
              (editedCard) => editedCard.nome === updatedCardName
            );
            let defaultCard = dbCards.find(
              (dbCard) => dbCard.nome === updatedCardName
            );

            if (isEditedCard) {
              isEditedCard = {
                ...isEditedCard,
                id: card.id,
                comments: card.comments || "",
                invertida: card.invertida || false,
                markedText: card.markedText || "",
                markedColor: card.markedColor || "",
              };
            }

            if (defaultCard) {
              defaultCard = {
                ...defaultCard,
                id: card.id,
                comments: card.comments || "",
                invertida: card.invertida || false,
                markedText: card.markedText || "",
                markedColor: card.markedColor || "",
              };
            }

            return isEditedCard
              ? isEditedCard
              : defaultCard
              ? defaultCard
              : card;
          })
        );

        setServerLoading(false);
        return setupCards;
      },
      []
    ),
  };

  const Reading = {
    async handleSelectedReading(readingId: string | undefined) {
      console.time("TIMER:");
      if (lastHandledId.current === readingId) {
        console.log("⏭ Skipping handleSelectedReading; same ID.");
        return;
      }
      lastHandledId.current = readingId;

      window.scrollTo(0, 0);
      if (readingId === "new-reading") {
        console.log("Reading: Creating new reading...");
        setSelectedReading(newReading);
        return;
      }
      const readingSelected = savedReadings?.find((sr) => sr.id === readingId);

      if (!readingSelected) {
        console.log("Reading not found.");
        return;
      }

      const cards = await ReadingCards.handleUECCards(readingSelected.reading);
      setScrollToElementId(undefined);
      setSelectedReading({ ...readingSelected, reading: cards });
      console.timeEnd("TIMER:");
    },

    async deleteReading(collectionName: string, docId: string = "new-reading") {
      if (
        docId &&
        docId !== "new-reading" &&
        collectionName &&
        !!savedReadings?.length
      ) {
        if (
          window.confirm("Deseja realmente deletar esta leitura para sempre?")
        ) {
          await LocalBase.deleteDocument(collectionName, docId);
          await Firestore.deleteDoc(collectionName, docId);
          await Firestore.fetchDataFromServer();
          setSelectedReading(newReading);
        }
      } else alert("Somente tiragens salvas!");
    },

    removeSelectedCards: useCallback(() => {
      if (window.confirm("Deseja remover todas as cartas selecionadas?")) {
        if (!selectedReading) {
          return alert("Falha ao remover cartas selecionadas.");
        }
        setSelectedReading({
          ...selectedReading,
          reading: selectedReading.reading.filter(
            (card) => !selectedCardsId?.includes(card.id)
          ),
        });

        setSelectedCardsId(undefined);
        setIsSelectingCards(false);
      }
    }, [selectedReading?.reading, selectedCardsId]),

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
        selectedReading,
        selectedCardsId,
        isSelectingCards,
        scrollToElementId,
        openPanoramicView,
        appSnackbarOptions,
        openCardMarkedModal,
        openSaveReadingModal,
        setAppLoading,
        setOpenDrawerMenu,
        setOpenDrawerCards,
        setSelectedCardsId,
        setIsSelectingCards,
        setScrollToElementId,
        setOpenPanoramicView,
        setSelectedReading,
        setAppSnackbarOptions,
        setOpenCardMarkedModal,
        setOpenSaveReadingModal,
        handleCloseAppSnackBarOptions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
