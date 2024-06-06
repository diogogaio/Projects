import {
  TUserSavedReadings,
  ILocalBaseContextData,
  ILocalBaseProviderProps,
} from "../types";
// @ts-ignore
import Localbase from "localbase";
import { ReactElement, createContext, useContext } from "react";

let db = new Localbase("db");
export const LocalBaseContext = createContext({} as ILocalBaseContextData);

export const LocalBaseProvider = ({
  children,
}: ILocalBaseProviderProps): ReactElement => {
  const LocalBase = {
    async setData(
      collectionName: string,
      docId: string,
      data: TUserSavedReadings
    ) {
      console.log("LocalBase.setData(): Saving data on device...");
      const result = await db.collection(collectionName).doc(docId).set(data);

      if (result.success) {
        console.log(
          `LocalBase.setData(): "${collectionName}" saved on this device. `
        );
      } else console.log("LocalBase.setData(): Failed to save.");
      //localBase will log the error on console
      return result.success;
    },

    async setCollection(collectionName: string, data: TUserSavedReadings[]) {
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
      collection: TUserSavedReadings[]
    ) {
      const setEachDocKey = collection.map((col) => {
        return {
          ...col,
          _key: col.id,
        };
      });

      const result = await db
        .collection(collectionName)
        .set(setEachDocKey, { keys: true });
      if (result.success) {
        console.log(
          "LocalBase.setCollectionWithDocName(): Setting collection with each doc named. "
        );
      } else alert("Erro ao salvar alteração no dispositivo.");
      return result.success;
    },

    async getCollection(
      collectionName: string
    ): Promise<TUserSavedReadings[] | null> {
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

    async deleteDocument(collectionName: string, docId: string) {
      try {
        await db.collection(collectionName).doc(docId).delete();
        console.log("LocalBase.deleteDocument: Doc deleted.");
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
