import { ReactElement, createContext, useContext } from "react";
// @ts-ignore
import Localbase from "localbase";
let db = new Localbase("db");
db.config.debug = false;

interface ILocalBaseMethods {
  setData: (
    collectionName: string,
    docName: string,
    data: IUserCredentials
  ) => Promise<void>;
  getData: (
    collectionName: string,
    docName: string
  ) => Promise<IUserCredentials | null>;
  deleteDocument: (collectionName: string, docName: string) => Promise<void>;
}

interface ILocalBaseProviderProps {
  children: React.ReactNode;
}

interface ILocalBaseContextData {
  LocalBase: ILocalBaseMethods;
}

interface IUserCredentials {
  token: string;
}

export const LocalBaseContext = createContext({} as ILocalBaseContextData);

export const LocalBaseProvider = ({
  children,
}: ILocalBaseProviderProps): ReactElement => {
  const LocalBase = {
    async setData(
      collectionName: string,
      docName: string,
      data: IUserCredentials
    ) {
      const result = await db.collection(collectionName).doc(docName).set(data);

      if (result.success) {
        console.log(
          `LocalBase.setData(): "${collectionName}" saved on this device. `
        );
      } else console.log("LocalBase.setData(): Failed to save.");
      //localBase will log the error on console
    },

    async getData(
      collectionName: string,
      docName: string
    ): Promise<IUserCredentials | null> {
      try {
        const data = await db.collection(collectionName).doc(docName).get();
        return data;
      } catch (err) {
        console.log("Erro ao localizar dados no dispositivo.");
        console.error(err);
        return null;
      }
    },

    async deleteDocument(collectionName: string, docName: string) {
      try {
        await db.collection(collectionName).doc(docName).delete();
      } catch (err) {
        console.log("Erro ao apagar do dispositivo.");
        console.error(err);
      }
    },
  };

  return (
    <LocalBaseContext.Provider value={{ LocalBase }}>
      {children}
    </LocalBaseContext.Provider>
  );
};

export const useLocalBaseContext = () => useContext(LocalBaseContext);
