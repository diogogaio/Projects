import {
  IAppStateType,
  TAppReducerAction,
  APP_REDUCER_ACTION_TYPE,
} from "../shared/types";

const appReducer = (
  state: IAppStateType,
  action: TAppReducerAction
): IAppStateType => {
  switch (action.type) {
    case APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF:
      if (state.appLoading) {
        console.log("SET_APP_LOADING_OFF");
        return {
          ...state,
          appLoading: false,
        };
      } else return state;
    case APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON:
      if (!state.appLoading) {
        console.log("SET_APP_LOADING_ON");
        return {
          ...state,
          appLoading: true,
        };
      } else return state;
    case APP_REDUCER_ACTION_TYPE.GOT_MONTH_DATA:
      console.log("GOT_MONTH_DATA:", action.payload);
      return {
        ...state,
        calendarData: action.payload,
      };
    case APP_REDUCER_ACTION_TYPE.GOT_USER_GYM_CHARTS:
      console.log("GOT_USER_GYM_CHARTS:", action?.payload);
      return {
        ...state,
        gymCharts: action?.payload,
      };
    case APP_REDUCER_ACTION_TYPE.CHANGED_DATE:
      console.log("CHANGED_DATE:", action.payload);
      return {
        ...state,
        inputDate: action.payload,
      };
    case APP_REDUCER_ACTION_TYPE.RESET_STATE:
      console.log("RESET_STATE");
      return {
        ...state,
        inputDate: new Date(),
        calendarData: null,
        gymCharts: undefined,
        appLoading: true,
      };

    default:
      console.error("No such option available in appReducer function.");
      return state;
  }
};

export default appReducer;
