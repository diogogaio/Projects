const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        onlineUser: action.payload,
      };
    case "CLEAR_USER":
      console.log("Clearing user serverReducer");
      return {
        ...state,
        onlineUser: null,
      };
    case "SET_USER_SERVER_TAG":
      return {
        ...state,
        userServerTag: `TarotReadings${state.onlineUser.uid}`,
      };
    case "SET_LOCAL_STORAGE_DATA":
      console.log("Setting local storage data on user side");
      return {
        ...state,
        userData: action.payload,
      };
    case "SET_SERVER_DATA":
      console.log("setting server data on user side.");
      return {
        ...state,
        userData: action.payload,
      };
    case "SET_LOCAL_STORAGE_UEC":
      console.log("Setting UEC from localStorage on user side");
      return {
        ...state,
        userUEC: action.payload,
      };
    case "SET_SERVER_UEC":
      console.log("Setting UEC from server on user side");
      return {
        ...state,
        userUEC: action.payload,
      };
    case "SET_SERVER_MESSAGE":
      return {
        ...state,
        serverMessage: action.payload,
      };
    case "SET_LOADING_ON":
      console.log("Setting loading on");
      return {
        ...state,
        loading: true,
      };
    case "SET_LOADING_OFF":
      console.log("Setting loading off");
      return {
        ...state,
        loading: false,
      };
    case "SET_EXEMPLE_READING":
      // Exemple data structure on server: {exemplo:[{...card},{...card},{...card}]}
      return {
        ...state,
        exempleReading: action.payload.exemplo,
      };
    default:
      console.error("No serverReducer option found!");
      return state;
  }
};

export default reducer;
