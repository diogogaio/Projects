import {
  IAppStateType,
  TCalendarDataKeys,
} from "../reducer_types/appReducer.types";
import { DocumentData } from "firebase/firestore";

//User:
export type TUserInfo = {
  SERVER_REQUESTS: number;
  LAST_REQUEST_DATE: string;
  LAST_REQUEST_TIME: string | undefined;
};

// Data:
export type TChart = {
  id: string;
  color: string;
  tittle: string;
  isTodo: boolean;
  exercises: string;
  dateCreated: string;
  description: string;
  defaultChart?: boolean;
  comment?: string | undefined;
};
export type TDayTrainings = {
  id: string;
  day: number;
  completedCharts: TChart[];
};

export interface IMonthData {
  id: string;
  year: number;
  month: string;
  trainingData: TDayTrainings[];
}

//Functions:

export type TUser = {
  isOnline: () => void;
  signUserOut: () => void;
  updateDevice: () => void;
  deleteAccount: () => void;
  clearUserData: (deleteOnServer: boolean) => Promise<void>;
};

export type TApp = {
  init: () => Promise<void>;
  changeDate: (date: string | number) => void;
  logTraining: (
    date: IAppStateType["inputDate"],
    gymCharts: IAppStateType["gymCharts"] | TChart,
    id: string,
    data: IMonthData | null,
    comment?: string
  ) => Promise<void>;
  getSelectedMonthData: () => Promise<void>;
  getDayData: (
    selectedDay: number,
    month: TCalendarDataKeys
  ) => TDayTrainings | undefined;
  getUserGymCharts: () => Promise<void>;
  deleteSpecificLog: (
    logId: string,
    dayId: string,
    tittle: string,
    hasMoreCharts: boolean
  ) => Promise<void>;
  deleteMonthData: () => Promise<void>;
  deleteAllGymCharts: () => Promise<void>;
  deleteAllDayLogs: (id: string) => Promise<void>;
  deleteGymChart: (id: string, chartTittle: string) => Promise<void>;
};

type TFirestore = {
  setDoc(
    collectionName: string,
    docName: string,
    data: TChart | IMonthData
  ): Promise<void>;
  serverLogic: () => Promise<void>;
  getUserGymCharts: () => Promise<void>;
  getDoc(
    collectionName: string,
    docName: string
  ): Promise<DocumentData | undefined>;
  getCollection(collectionName: string): Promise<any[] | undefined>;
  deleteDoc(collectionName: string, docName: string): Promise<void>;
  getUserWorkouts: (userCollectionOnServer: IMonthData[]) => Promise<void>;
};

export type TUtils = {
  formatDate(
    dateToFormat: string | number | Date,
    correction: boolean
  ): {
    day: number;
    firstDay: number;
    month: string;
    daysInMonth: number;
    year: number;
    selectedDate: IAppStateType["inputDate"];
    date: string;
    brazilianDate: string;
  };
  isDefaultChart(): TChart | undefined;
  hasSavedGymCharts(): Promise<boolean>;
  handleCharacters(
    textLength: number,
    maxChars: number
  ): {
    helperText: string;
    maxChars: number;
    remainingChars: number;
    color: string;
  };
  isServerAllowed(operation: "UPDATE_DEVICE" | "CHECK_REQUESTS"): boolean;
};

export interface IAppProviderProps {
  children: React.ReactNode;
}

export interface IGlobalContextData {
  App: TApp;
  User: TUser;
  Utils: TUtils;
  userEmail: string;
  Firestore: TFirestore;
  gymChartsModal: boolean;
  logTrainingModal: boolean;
  defaultGymCharts: TChart[];
  selectedMonthDocName: string;
  loggedTrainingInfoMd: boolean;
  openNewGymChartModal: boolean;
  inputDate: IAppStateType["inputDate"];
  gymCharts: IAppStateType["gymCharts"];
  appLoading: IAppStateType["appLoading"];
  calendarData: IAppStateType["calendarData"];
  setGymChartsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenLogTrainingModal: React.Dispatch<React.SetStateAction<boolean>>;
  setLoggedTrainingInfoMd: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenNewGymChartModal: React.Dispatch<React.SetStateAction<boolean>>;
}
