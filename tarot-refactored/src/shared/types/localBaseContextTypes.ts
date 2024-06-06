import { TUserSavedReadings } from "./serverContextTypes";

export interface ILocalBaseProviderProps {
  children: React.ReactNode;
}

//localbase has no typescript module as of today

type TLocalBase = {
  getCollection: (
    collectionName: string
  ) => Promise<TUserSavedReadings[] | null>;
  setCollectionWithDocName: (
    collectionName: string,
    collection: TUserSavedReadings[]
  ) => Promise<TUserSavedReadings[]>;
  setData: (
    collectionName: string,
    docId: string,
    data: TUserSavedReadings
  ) => Promise<boolean>;
  setCollection: (
    collectionName: string,
    data: TUserSavedReadings[]
  ) => Promise<any>;
  deleteDocument: (collectionName: string, docId: string) => Promise<void>;
  deleteCollection: (collectionName: string) => Promise<void>;
};

export interface ILocalBaseContextData {
  LocalBase: TLocalBase;
}
