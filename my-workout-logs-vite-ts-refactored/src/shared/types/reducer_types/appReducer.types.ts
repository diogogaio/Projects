import { IMonthData, TChart } from "../context_types/GlobalContext.types";

export type TCalendarData = {
  nextMonth: IMonthData | null;
  previousMonth: IMonthData | null;
  selectedMonth: IMonthData | null;
};

export type TCalendarDataKeys = keyof TCalendarData;

export interface IAppStateType {
  inputDate: number | Date;
  gymCharts: TChart[] | undefined;
  appLoading: boolean | undefined;
  calendarData: TCalendarData | null;
}

export const enum APP_REDUCER_ACTION_TYPE {
  RESET_STATE,
  CHANGED_DATE,
  GOT_MONTH_DATA,
  SET_APP_LOADING_ON,
  SET_APP_LOADING_OFF,
  GOT_USER_GYM_CHARTS,
}

export type TAppReducerAction =
  | {
      type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF;
    }
  | {
      type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON;
    }
  | {
      type: APP_REDUCER_ACTION_TYPE.GOT_MONTH_DATA;
      payload: TCalendarData;
    }
  | {
      type: APP_REDUCER_ACTION_TYPE.GOT_USER_GYM_CHARTS;
      payload: TChart[];
    }
  | {
      type: APP_REDUCER_ACTION_TYPE.CHANGED_DATE;
      payload: number;
    }
  | {
      type: APP_REDUCER_ACTION_TYPE.RESET_STATE;
    };
