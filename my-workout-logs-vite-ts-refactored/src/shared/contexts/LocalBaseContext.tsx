import { ReactElement, createContext, useContext } from "react";
import { ILocalBaseProviderProps, IMonthData, TChart } from "../types";
// @ts-ignore
import Localbase from "localbase";

let db = new Localbase("db");
export const LocalBaseContext = createContext({});

export const LocalBaseProvider = ({
  children,
}: ILocalBaseProviderProps): ReactElement => {
  const LocalBase = {
    async setData(collectionName: string, docName: string, data: TChart) {
      console.log("LocalBase.setData(): Saving data on device...");
      const result = await db.collection(collectionName).doc(docName).set(data);

      if (result.success) {
        console.log(
          `LocalBase.setData(): "${collectionName}" saved on this device. `
        );
      } else console.log("LocalBase.setData(): Failed to save.");
      //localBase will log the error on console
      return result.success;
    },

    async setCollection(collectionName: string, data: TChart[]) {
      const result = await db.collection(collectionName).set(data);
      if (result.success) {
        console.log(
          `LocalBase.setCollection: "${collectionName}" - Data: "${data}" - WAS SET on device.`
        );
      } else
        alert(
          "LocalBase.setCollection(): Erro ao salvar alteração no dispositivo."
        );

      return result.success;
    },

    async setCollectionWithDocName(
      collectionName: string,
      userCollection: string
    ) {
      const result = await db
        .collection(collectionName)
        .set(userCollection, { keys: true });
      if (result.success) {
        console.log(
          "LocalBase.setCollectionWithDocName(): Setting collection with each doc named. "
        );
      } else alert("Erro ao salvar alteração no dispositivo.");
      return result.success;
    },

    async getCollection(
      collectionName: string
    ): Promise<IMonthData[] | TChart[] | null> {
      try {
        const localData = await db.collection(collectionName).get();
        console.log(
          "LocalBase.getCollection(): Getting collection on device: ",
          localData
        );

        return localData;
      } catch (err) {
        console.error(err);
        alert(
          " LocalBase.getCollection(): Erro ao localizar dados no dispositivo."
        );
        return null;
      }
    },

    async getData(collectionName: string, docName: string) {
      try {
        console.log("LocalBase.getData(): " + collectionName);
        const localData = await db
          .collection(collectionName)
          .doc(docName)
          .get();
        return localData;
      } catch (err) {
        console.error(err);
        alert("Erro ao localizar dados no dispositivo.");
        return null;
      }
    },

    async deleteDocument(collectionName: string, docName: string) {
      try {
        await db.collection(collectionName).doc(docName).delete();
        console.log("LocalBase.deleteDocument(): Doc deleted.");
      } catch (err) {
        alert("Erro ao apagar do dispositivo.");
        console.error(err);
      }
    },

    async deleteCollection(collectionName: string) {
      try {
        console.log(
          "LocalBase.deleteCollection(): Deleting collection: " + collectionName
        );
        await db.collection(collectionName).delete();
      } catch (err) {
        alert("LocalBase.deleteCollection(): Erro ao apagar do dispositivo.");
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
