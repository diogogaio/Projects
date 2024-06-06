export interface IServerProviderProps {
  children: React.ReactNode;
}
export type TServerSnackbarOptions = {
  open: boolean;
  message: string;
  severity: "error" | "warning" | "success" | "info";
};

export type TTimestamp = {
  readonly seconds: number;
  readonly nanoseconds: number;
};

export type TCardInfo = {
  id: string;
  url: string;
  nome: string;
  naipe: string;
  numero?: string;
  infoUrl: string;
  simOuNao?: string;
  comments?: string;
  invertida?: boolean;
  markedText?: string;
  markedColor?: string;
  textoInicial: string;
  palavrasChave: string;
  textoSecondario: string;
  dinheiroTrabalho?: string;
  amorRelacionamento?: string;
  saudeEspiritualidade?: string;
  significadoInvertido?: string;
  palavrasChaveInvertidas?: string;
  invertidoDinheiroTrabalho?: string;
  invertidoAmorRelacionamento?: string;
  invertidoSaudeEspiritualidade?: string;
  [key: string]: string | boolean | undefined;
};

export type TUserSavedReadings = {
  id: string;
  title: string;
  notes?: string;
  reading: TCardInfo[];
  timestamp: TTimestamp;
  readingColumns?: number;
};

type TUser = {
  isOnline: () => void;
  signUserOut: () => Promise<void>;
};

type TFirestore = {
  setDoc: (
    docName: string,
    collectionName: string,
    data: TCardInfo | TUserSavedReadings
  ) => Promise<boolean>;
  deleteDoc: (
    docName: string,
    collectionName: string,
    deleteMultiple?: boolean
  ) => Promise<void>;
  fetchDataFromServer: () => Promise<void>;
  getCollection: (collectionName: string) => Promise<any[] | undefined>;
};

export interface IServerContextData {
  User: TUser;
  userUEC?: TCardInfo[];
  Firestore: TFirestore;
  userServerTag: string;
  serverLoading: boolean;
  userServerUECtag: string;
  userEmail: string | null;
  savedReadings?: TUserSavedReadings[];
  serverSnackBarAlert?: TServerSnackbarOptions;

  handleCloseServerSnackBar: (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => void;
  setSavedReadings: React.Dispatch<
    React.SetStateAction<TUserSavedReadings[] | undefined>
  >;
  setServerSnackBarAlert: React.Dispatch<
    React.SetStateAction<TServerSnackbarOptions | undefined>
  >;
  setServerLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUserUEC: React.Dispatch<React.SetStateAction<TCardInfo[] | undefined>>;
}
