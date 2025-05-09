import { TCardInfo, TUserSavedReadings } from "./serverContextTypes";

export interface IAppProviderProps {
  children: React.ReactNode;
}

export type TDrawerCards = {
  open: boolean;
  content: string;
  cardAsideIndex?: number;
};

export type TSnackbarOptions = {
  open: boolean;
  message: string;
  severity: "error" | "warning" | "success" | "info";
};

type TUtils = {
  scrollToAddedCard: (id: string | undefined) => void;
};

type TReading = {
  deleteReading: (collectionName: string, docId: string) => Promise<void>;
  removeSelectedCards: () => void;
  updateDeviceReadings: () => Promise<void>;
  handleSelectedReading: (readingId: string | undefined) => void;
};

type TReadingCards = {
  clearUEC: () => Promise<void>;
  handleUECCards: (readingCards: TCardInfo[]) => Promise<TCardInfo[] | []>;
};

export interface IAppContextData {
  Utils: TUtils;
  Reading: TReading;
  selectedReading: TUserSavedReadings;
  appLoading: boolean;
  drawerMenu: boolean;
  drawerCards: TDrawerCards;
  isSelectingCards: boolean;
  scrollToElementId?: string;
  selectedCardsId?: string[];
  openPanoramicView: boolean;
  ReadingCards: TReadingCards;
  openCardMarkedModal: boolean;
  openSaveReadingModal: boolean;
  appSnackbarOptions?: TSnackbarOptions;

  handleCloseAppSnackBarOptions: (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => void;
  setSelectedCardsId: React.Dispatch<
    React.SetStateAction<string[] | undefined>
  >;
  setScrollToElementId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setSelectedReading: React.Dispatch<React.SetStateAction<TUserSavedReadings>>;
  setAppSnackbarOptions: React.Dispatch<
    React.SetStateAction<TSnackbarOptions | undefined>
  >;
  setAppLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenDrawerMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSelectingCards: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenPanoramicView: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenCardMarkedModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenSaveReadingModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenDrawerCards: React.Dispatch<React.SetStateAction<TDrawerCards>>;
}
