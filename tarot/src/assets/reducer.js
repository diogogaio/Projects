import { nanoid } from "nanoid";
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_CARD":
      const userEditedCards = state.userEditedCards.find(
        (card) => card.nome === action.payload.name
      );

      const selectedCard = state.data.filter((card) => {
        return card.id === action.payload.id;
      });
      let cardObj = selectedCard[0];
      const checkRepeatedCard = state.reading.find((card) => {
        return card.id === cardObj.id;
      });

      //In case user needs repeated cards and avoid same Id conflicts
      if (checkRepeatedCard) {
        console.log("Found repeated card, changing selectedCard's Id.");
        cardObj = { ...cardObj, id: nanoid() };
      }
      return {
        ...state,
        /* reading: [...state.reading, cardObj], */
        reading: [
          ...state.reading,
          userEditedCards ? userEditedCards : cardObj,
        ],
      };
    case "FIRE_ALERT":
      return {
        ...state,
        alerts: action.payload,
      };
    case "UP_SIDE_DOWN":
      const upSideDown = state.reading.map((card) => {
        return card.id === action.payload
          ? { ...card, invertida: !card.invertida }
          : card;
      });

      return {
        ...state,
        reading: upSideDown,
      };
    case "REMOVE_CARD":
      const removeCard = state.reading.filter(
        (card) => card.id !== action.payload
      );
      console.log("Card removed.");
      return {
        ...state,
        reading: removeCard,
      };
    case "ADD_CARD_COMMENT":
      const { id, comment } = action.payload;
      const cardComment = state.reading.map((card) => {
        return card.id === id ? { ...card, comments: comment } : card;
      });
      return {
        ...state,
        reading: cardComment,
      };
    case "ADD_READING_TITLE":
      return {
        ...state,
        readingTitle: action.payload,
      };
    case "CLEAR_READING_TITLE":
      const isSavedCheck = state.savedReadings.find(
        (savedReading) => savedReading.title === state.readingTitle
      );
      if (!isSavedCheck && state.readingTitle !== "Tiragem de Exemplo")
        return {
          ...state,
          readingTitle: "",
        };
      else return state;
    case "OVERWRITE_SAVED_READING":
      return {
        ...state,
        savedReadings: action.payload,
        savedReadingsList: action.payload,
      };
    case "SAVE_NEW_READING":
      return {
        ...state,
        savedReadings: [...state.savedReadings, action.payload],
        savedReadingsList: [...state.savedReadingsList, action.payload],
        readingId: action.payload.id,
        readingTimestamp: action.payload.timestamp,
      };
    case "NEW_READING":
      return {
        ...state,
        readingTitle: "",
        reading: [],
        readingNotes: "",
        readingId: "",
      };
    case "GO_TO_SELECTED_READING":
      const selectedReading = state.savedReadings.filter(
        (reading) => reading.id === action.payload
      );
      return {
        ...state,
        reading: selectedReading[0].reading,
        readingId: selectedReading[0].id,
        readingTitle: selectedReading[0].title,
        readingNotes: selectedReading[0].notes,
        readingTimestamp: selectedReading[0].timestamp,
      };
    case "DELETE_SAVED_READING":
      const remainingReadings = state.savedReadings.filter(
        (reading) => reading.id !== action.payload
      );
      console.log("Remaining reading list: ", remainingReadings);
      //Check if the current opened reading is the one being deleted, if not lets keep it.
      return state.readingId === action.payload
        ? {
            ...state,
            savedReadings: remainingReadings,
            savedReadingsList: remainingReadings,
            reading: [],
            readingId: "",
            readingTitle: "",
            readingNotes: "",
          }
        : {
            ...state,
            savedReadings: remainingReadings,
            savedReadingsList: remainingReadings,
          };
    case "ADD_READING_NOTES":
      return {
        ...state,
        readingNotes: action.payload,
      };
    case "SET_USER_SAVED_READINGS":
      return {
        ...state,
        savedReadings: action.payload,
        savedReadingsList: action.payload,
      };
    case "SET_USER_SAVED_READINGS_LIST":
      //Created for filtering purposes only (see filters on appContext)
      return {
        ...state,
        savedReadingsList: action.payload,
      };
    case "CLEAR_ALL_USER_DATA":
      console.log("Clearing all user data.");
      return {
        ...state,
        savedReading: [],
        savedReadingsList: [],
        userEditedCards: [],
      };
    case "SET_FILTERS_MESSAGE":
      return {
        ...state,
        filtersMessage: action.payload,
      };
    case "SET_MESSAGE":
      return {
        ...state,
        message: action.payload,
      };
    case "SET_MARKED_CARD_ID":
      return {
        ...state,
        markedCardId: action.payload,
      };
    case "SET_MARKED_CARD_INPUTS":
      const findMarkedCard = state.reading.map((card) => {
        return card.id === action.payload.id
          ? {
              ...card,
              markedText: action.payload.text,
              markedColor: action.payload.color,
            }
          : card;
      });
      return {
        ...state,
        reading: findMarkedCard,
      };
    case "SET_MARKED_CARD_OFF":
      const markOff = state.reading.map((card) => {
        return card.id === action.payload
          ? { ...card, markedText: "", markedColor: "" }
          : card;
      });
      return {
        ...state,
        reading: markOff,
      };
    case "DISPLAY_EXEMPLE_READING":
      let payload = action.payload;
      const exempleReading = payload[0];
      return {
        ...state,
        reading: exempleReading.reading,
        readingId: exempleReading.id,
        readingTitle: exempleReading.title,
        readingNotes: exempleReading.notes,
        readingTimestamp: exempleReading.timestamp,
      };
    case "SET_NEW_EDITING_CARD":
      const findCard = () => {
        const previusEditedCard = state.userEditedCards.find(
          (card) => card.id === action.payload
        );
        const newCard = state.reading.find(
          (card) => card.id === action.payload
        );

        return previusEditedCard ? previusEditedCard : newCard;
      };

      return {
        ...state,
        newEditedCardMeaning: findCard(),
      };
    case "EDIT_CARD_MEANINGS":
      return {
        ...state,
        newEditedCardMeaning: {
          ...state.newEditedCardMeaning,
          [action.payload.name]: action.payload.value,
        },
      };
    case "SET_USER_EDITED_CARD":
      const findRepeatedCard = state.userEditedCards.find(
        (card) => card.nome === state.newEditedCardMeaning.nome
      );
      //If edited card is already saved on user data, replace it:
      const updateSavedReadings = state.savedReadings.map((item) => {
        const findCardInsideReading = item.reading.map((card) => {
          return card.nome === state.newEditedCardMeaning.nome
            ? state.newEditedCardMeaning
            : card;
        });

        return findCardInsideReading.length > 0
          ? { ...item, reading: findCardInsideReading }
          : item;
      });

      console.log("updateSavedReadings ", updateSavedReadings);

      const updateActualReading = state.reading.map((card) =>
        card.nome === state.newEditedCardMeaning.nome
          ? state.newEditedCardMeaning
          : card
      );
      if (findRepeatedCard) {
        const overwriteCard = state.userEditedCards.map((card) =>
          card.nome === state.newEditedCardMeaning.nome
            ? state.newEditedCardMeaning
            : card
        );

        return {
          ...state,
          reading: updateActualReading,
          userEditedCards: overwriteCard,
          savedReadings: updateSavedReadings,
          savedReadingsList: updateSavedReadings,
        };
      } else {
        return {
          ...state,
          reading: updateActualReading,
          userEditedCards: [
            ...state.userEditedCards,
            state.newEditedCardMeaning,
          ],
          savedReadings: updateSavedReadings,
          savedReadingsList: updateSavedReadings,
        };
      }
    case "SET_USER_SAVED_UEC":
      return {
        ...state,
        userEditedCards: action.payload,
      };
    case "RESTORE_CARD_MEANINGS":
      const defaultCardFromDb = state.data.find(
        (card) => card.nome === action.payload.name
      );
      console.log(defaultCardFromDb);
      const restoreCurrentReadingCard = state.reading.map((card) =>
        card.nome === action.payload.name ? defaultCardFromDb : card
      );

      const removeFromUserEditedCards = state.userEditedCards.filter(
        (card) => card.nome !== action.payload.name
      );
      const updateSavedReadingsEditedCards = state.savedReadings.map((item) => {
        const findEditedCardInsideReading = item.reading.map((card) =>
          card.nome === action.payload.name ? defaultCardFromDb : card
        );

        return findEditedCardInsideReading
          ? { ...item, reading: findEditedCardInsideReading }
          : item;
      });

      return {
        ...state,
        reading: restoreCurrentReadingCard,
        savedReadings: updateSavedReadingsEditedCards,
        savedReadingsList: updateSavedReadingsEditedCards,
        userEditedCards: removeFromUserEditedCards,
      };
    case "RESTORE_ALL_CARDS_MEANINGS":
      const defaultEditedCards = state.userEditedCards.map((card) => {
        return state.data.find((defaultCard) => defaultCard.nome === card.nome);
      });

      const checkSavedReadingsForEditedCards = state.savedReadings.find(
        (savedReading) =>
          savedReading.reading.find((card) =>
            state.userEditedCards.find(
              (editedCard) => editedCard.nome === card.nome
            )
          )
      );

      const updateReadingEditedCards = state.reading.map((card) => {
        const findEditedCardInReading = defaultEditedCards.find(
          (defaultCard) => defaultCard.nome === card.nome
        );
        return findEditedCardInReading ? findEditedCardInReading : card;
      });

      if (checkSavedReadingsForEditedCards) {
        const restoreEditedCards = state.savedReadings.map((savedReading) => {
          const findEditedCard = savedReading.reading.map((card) => {
            const defaultCard = defaultEditedCards.find(
              (defaultCard) => defaultCard.nome === card.nome
            );
            return defaultCard ? defaultCard : card;
          });

          return {
            ...savedReading,
            reading: findEditedCard,
          };
        });

        return {
          ...state,
          reading: updateReadingEditedCards,
          userEditedCards: [],
          savedReadings: restoreEditedCards,
          savedReadingsList: restoreEditedCards,
        };
      } else
        return {
          ...state,
          reading: updateReadingEditedCards,
          userEditedCards: [],
        };

    default:
      console.error("No such reducer option found!");
      return state;
  }
};

export default reducer;
