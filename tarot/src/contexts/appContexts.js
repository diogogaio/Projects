import React, { useContext, useReducer, useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { nanoid } from "nanoid";
import { useServer } from "./ServerContext";
import Card from "../components/Card";
import reducer from "../assets/reducer";
import arcanos from "../assets/arcanos";
import fromUnixTime from "date-fns/fromUnixTime";
import differenceInMinutes from "date-fns/differenceInMinutes";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const {
    saveReadingOnServer,
    deleteSavedReadingOnServer,
    onlineUser,
    userServerTag,
    userData,
    userUEC,
    saveUserEditedCardsOnServer,
    restoreCardMeaningOnServer,
    restoreAllCardMeaningsOnServer,
    exempleReading,
    signUserOut,
    // setExemple,
  } = useServer();

  const defaultState = {
    data: arcanos,
    reading: [],
    readingId: "",
    savedReadings: [],
    savedReadingsList: [],
    filtersMessage: "",
    alerts: "",
    readingTitle: "",
    readingNotes: "",
    readingTimestamp: "",
    message: "",
    markedCardId: "",
    userEditedCards: [],
    newEditedCardMeaning: {},
  };
  const [state, dispatch] = useReducer(reducer, defaultState);

  // Effects Section //

  //Bring the data fetched from server and localStorage and set the local state
  useEffect(() => {
    if (userData.length > 0) {
      dispatch({ type: "SET_USER_SAVED_READINGS", payload: userData });
    }
  }, [userData]);

  //Bring the data fetched from server and localStorage and set the local state
  useEffect(() => {
    if (userUEC.length > 0) {
      dispatch({ type: "SET_USER_SAVED_UEC", payload: userUEC });
    }
  }, [userUEC]);

  //Update localStorage
  useEffect(() => {
    if (onlineUser) {
      localStorage.setItem(userServerTag, JSON.stringify(state.savedReadings));
      console.log("Saving reading on localstorage");
    } else {
      if (!onlineUser) console.log("Can't save data with user offline.");
      else
        console.log(
          "Page just loaded/reloaded set item on server not allowed."
        );
    }
  }, [state.savedReadings]);

  useEffect(() => {
    if (exempleReading.length > 0) {
      console.log("Displaing exemple reading.");
      dispatch({ type: "DISPLAY_EXEMPLE_READING", payload: exempleReading });
    } else console.log("No exemple reading found yet.");
  }, [exempleReading]);

  useEffect(() => {
    console.log("userEditedCards: ", state.userEditedCards);
    if (onlineUser) {
      console.log("Updating userEditedCards on localStorage.");
      //Save user edited cards on localStorage:
      localStorage.setItem(
        `UEC-${userServerTag}`,
        JSON.stringify(state.userEditedCards)
      );
    } else console.log("User offline edited cards not updated.");
  }, [state.userEditedCards]);

  /* ----------- End of useEffect section ---------- */

  const Cards = {
    displayCards() {
      const cards = state.reading.map((card) => {
        return <Card key={card.id} {...card} />;
      });
      return cards;
    },

    addCard(id, name) {
      dispatch({
        type: "FIRE_ALERT",
        payload: { text: "Arcano adicionado!", color: "success" },
      });
      dispatch({ type: "ADD_CARD", payload: { id, name } });
      setTimeout(() => dispatch({ type: "FIRE_ALERT", payload: "" }), 1000);
    },

    upSideDown(id) {
      dispatch({ type: "UP_SIDE_DOWN", payload: id });
    },

    removeCard(id) {
      dispatch({ type: "REMOVE_CARD", payload: id });
    },

    cardComments(e) {
      const { id, value } = e.target;
      dispatch({
        type: "ADD_CARD_COMMENT",
        payload: { id: id, comment: value },
      });
    },

    setMarkedCard(markedCardText, markedCardColor) {
      //invoked from CardMarked modal component, marks card with a text below card title and highlight with selected color.
      dispatch({
        type: "SET_MARKED_CARD_INPUTS",
        payload: {
          text: markedCardText,
          color: markedCardColor,
          id: state.markedCardId,
        },
      });
    },

    setMarkedCardId(id) {
      //Invoked from CardMenu sets the id of the card on state to be found state.reading and get manipulated.
      dispatch({ type: "SET_MARKED_CARD_ID", payload: id });
    },

    markCardOff(id) {
      const isMarked = state.reading.find((card) => {
        if (card.id === id) return card.markedText;
      });
      console.log(isMarked);
      if (isMarked) {
        if (window.confirm("Deseja desmarcar este arcano?"))
          dispatch({ type: "SET_MARKED_CARD_OFF", payload: id });
      } else alert("Este arcano não está marcado!");
    },
  };

  const Readings = {
    newReading() {
      dispatch({ type: "NEW_READING" });
      Readings.clearReadingTitle();
    },

    goToSelectedReading(e) {
      //When user selects a saved reading from savedReadingList component.
      const id = e.target.id;
      if (state.reading.length > 0) {
        if (
          window.confirm("Existe uma tiragem em aberto, deseja continuar? ")
        ) {
          dispatch({ type: "GO_TO_SELECTED_READING", payload: id });
        }
      } else dispatch({ type: "GO_TO_SELECTED_READING", payload: id });
    },

    addReadingTitle(e) {
      const title = e.target.value;
      dispatch({ type: "ADD_READING_TITLE", payload: title });
    },

    clearReadingTitle() {
      //If user hit cancel button on savedReadingModal it clears readingTitle state if it hasn't been saved or it's not exemple.
      dispatch({ type: "CLEAR_READING_TITLE" });
    },

    saveReading(e) {
      e.preventDefault();
      if (onlineUser) {
        const updatedReading = {
          title: state.readingTitle,
          id: state.readingId,
          reading: state.reading,
          notes: state.readingNotes,
          timestamp: state.readingTimestamp,
        };

        if (state.readingId) {
          //If it has a reading Id, it is already saved on server.
          console.log("reading will be overwritten.");
          const overwrite = state.savedReadings.map((savedReading) => {
            return savedReading.id === state.readingId
              ? updatedReading
              : savedReading;
          });
          console.log("overwrite: ", overwrite);
          dispatch({ type: "OVERWRITE_SAVED_READING", payload: overwrite });
          saveReadingOnServer(updatedReading, setShowSaveModal);
        } else {
          console.log("saving new reading...");
          const newReading = {
            ...updatedReading,
            id: nanoid(),
            timestamp: Timestamp.fromDate(new Date()),
          };
          dispatch({ type: "SAVE_NEW_READING", payload: newReading });
          saveReadingOnServer(newReading, setShowSaveModal);
        }
      } else {
        dispatch({
          type: "SET_MESSAGE",
          payload: {
            text: "Erro: Entre ou crie uma conta abaixo para salvar as tiragens na nuvem.",
            color: "danger",
          },
        });
        setTimeout(() => {
          dispatch({ type: "SET_MESSAGE", payload: "" });
        }, 10000);
      }
    },

    deleteSavedReading(id, title) {
      if (
        window.confirm(
          `Esta tiragem será deletada, deseja continuar?: \n\n"${title}"`
        )
      ) {
        deleteSavedReadingOnServer(id);
        dispatch({ type: "DELETE_SAVED_READING", payload: id });
      }
    },

    addReadingNotes(e) {
      const notes = e.target.value;
      dispatch({ type: "ADD_READING_NOTES", payload: notes });
    },

    updateDeviceReadings() {
      //If user sign in from another device with older local storage data:
      function update() {
        localStorage.setItem("readingUpdatedTime", new Date());
        localStorage.removeItem(`${userServerTag}`);
        alert("Lista de tiragens atualizada neste dispositivo!");
        window.location.reload(true);
      }
      const timeInMinutes = Readings.checkLastUpdatedTime();

      if (timeInMinutes >= 10 || timeInMinutes == null) {
        update();
      } else {
        alert(
          "Lista de tiragens já foi atualizada recentemente neste dispositivo. Aguarde um pouco para atualizar novamente..."
        );
      }
    },

    checkLastUpdatedTime() {
      const readingsListUpdatedTime =
        localStorage.getItem("readingUpdatedTime");

      const difference = differenceInMinutes(
        new Date(),
        new Date(readingsListUpdatedTime)
      );

      return readingsListUpdatedTime ? difference : readingsListUpdatedTime;
    },
  };

  const Filters = {
    filterByName(name) {
      if (name.length > 3) {
        const filteredSearch = state.savedReadingsList.filter((reading) => {
          return reading.title.toLowerCase().includes(name.toLowerCase());
        });
        if (filteredSearch.length > 0) {
          dispatch({
            type: "SET_FILTERS_MESSAGE",
            payload: {
              text: `Mostrando resultado${
                filteredSearch.length > 1 ? "s." : "."
              }`,
              color: "success",
            },
          });
          setTimeout(
            () => dispatch({ type: "SET_FILTERS_MESSAGE", payload: "" }),
            2000
          );
          return dispatch({
            type: "SET_USER_SAVED_READINGS_LIST",
            payload: filteredSearch,
          });
        } else {
          dispatch({
            type: "SET_FILTERS_MESSAGE",
            payload: { text: "Tiragem não encontrada.", color: "danger" },
          });
          setTimeout(
            () => dispatch({ type: "SET_FILTERS_MESSAGE", payload: "" }),
            2000
          );
        }
      }
    },

    filterByDate(date1, date2) {
      //setDay(), setHours(), getDate() only works with date objects 'new Date()'
      const fromDate = new Date(new Date(date1).setHours(0, 0, 0, 0));
      const fromDateCorrection = fromDate.setDate(fromDate.getDate() + 1);

      const untilDate = new Date(date2);
      const untilDateCorrection = untilDate.setDate(untilDate.getDate() + 1);

      const convertDateFromUnix = state.savedReadingsList.map((reading) => {
        return {
          ...reading,
          timestamp: fromUnixTime(reading.timestamp.seconds),
        };
      });

      const filteredResults = convertDateFromUnix.filter((reading) => {
        const readingDate = reading.timestamp.setHours(0, 0, 0, 0);
        if (
          readingDate >= fromDateCorrection &&
          readingDate <= untilDateCorrection
        )
          return reading;
      });
      //Timestamp hour was set to 0 early for date filtering purposes and need to be set back
      const setHoursBack = filteredResults.map((reading) => {
        const originalTimestamp = state.savedReadings.filter(
          (item) => reading.title === item.title
        );
        return {
          ...reading,
          timestamp: originalTimestamp[0].timestamp,
        };
      });

      if (setHoursBack.length > 0) {
        dispatch({
          type: "SET_FILTERS_MESSAGE",
          payload: {
            text: `Mostrando resultado${setHoursBack.length > 1 ? "s." : "."}`,
            color: "success",
          },
        });

        setTimeout(
          () => dispatch({ type: "SET_FILTERS_MESSAGE", payload: "" }),
          2000
        );

        return dispatch({
          type: "SET_USER_SAVED_READINGS_LIST",
          payload: setHoursBack,
        });
      } else {
        dispatch({
          type: "SET_FILTERS_MESSAGE",
          payload: { text: "Tiragem não encontrada.", color: "danger" },
        });
        setTimeout(
          () => dispatch({ type: "SET_FILTERS_MESSAGE", payload: "" }),
          2000
        );
      }
    },

    clearSearchResults() {
      dispatch({
        type: "SET_USER_SAVED_READINGS_LIST",
        payload: state.savedReadings,
      });
    },
  };

  const UEC = {
    //USER EDITED CARDS
    setNewEditingCardMeanings(id) {
      //Invked from CardMenu, find and select the card to be edited
      dispatch({ type: "SET_NEW_EDITING_CARD", payload: id });
    },

    editCardMeanings(e) {
      e.preventDefault();
      const name = e.target.id;
      const value = e.target.value;
      dispatch({ type: "EDIT_CARD_MEANINGS", payload: { name, value } });
    },

    setUserEditedCard() {
      saveUserEditedCardsOnServer(state.newEditedCardMeaning);
      dispatch({ type: "SET_USER_EDITED_CARD" });
      dispatch({
        type: "SET_MESSAGE",
        payload: { text: "Alterações salvas!", color: "success" },
      });
      setTimeout(() => {
        dispatch({ type: "SET_MESSAGE", payload: "" });
      }, 2000);
    },

    restoreCardMeanings(name, id) {
      if (
        window.confirm("Deseja restaurar os significados padrões deste arcano?")
      ) {
        restoreCardMeaningOnServer(name);
        dispatch({ type: "RESTORE_CARD_MEANINGS", payload: { name, id } });
      }
    },

    restoreAllEditedCardsMeanings() {
      if (state.userEditedCards.length > 0) {
        if (
          window.confirm(
            "Deseja restaurar todos os arcanos para os significados padrões?"
          )
        )
          restoreAllCardMeaningsOnServer(state.userEditedCards);
        dispatch({ type: "RESTORE_ALL_CARDS_MEANINGS" });
      } else alert("Você não possui nenhum arcano personalizado!");
    },
  };

  const Utils = {
    getCurrentUrl() {
      const urlArray = window.location.href.split("/");
      const location = urlArray.pop();
      return location;
    },
    clearUserData() {
      //When user log out
      dispatch({ type: "CLEAR_ALL_USER_DATA" });
      signUserOut();
    },
  };

  // Modals //
  //I could also have handled these states on defaultState.

  const [showSignin, setShowSignin] = useState(false);
  const handleCloseSignin = () => setShowSignin(false);
  const handleShowSignin = () => setShowSignin(true);
  const [showSignup, setShowSignup] = useState(false);
  const handleCloseSignup = () => setShowSignup(false);
  const handleShowSignup = () => setShowSignup(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showMarkedCardModal, setShowMarkedCardModal] = useState(false);
  const [showEditCardMeaningModal, setShowEditCardMeaningModal] =
    useState(false);

  return (
    <AppContext.Provider
      value={{
        ...state,
        Filters,
        Cards,
        UEC,
        Utils,
        Readings,
        showSignin,
        handleCloseSignin,
        handleShowSignin,
        showSignup,
        handleCloseSignup,
        handleShowSignup,
        showSaveModal,
        setShowSaveModal,
        showMarkedCardModal,
        setShowMarkedCardModal,
        showEditCardMeaningModal,
        setShowEditCardMeaningModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
