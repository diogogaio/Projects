import {
  useState,
  useEffect,
  useContext,
  ReactElement,
  createContext,
} from "react";
import {
  doc,
  query,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  QuerySnapshot,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  TCardInfo,
  TUserSavedReadings,
  IServerContextData,
  IServerProviderProps,
  TServerSnackbarOptions,
} from "../types";
import { useLocalBaseContext } from "./LocalBaseContext";
import { exempleReading } from "../../assets/CardsDatabase";

let didInit = false;
let userServerTag: string;
let userServerUECtag: string;
let userEmail: string | null;

export const ServerContext = createContext({} as IServerContextData);

export const ServerProvider = ({
  children,
}: IServerProviderProps): ReactElement => {
  //STATES:
  const [serverLoading, setServerLoading] = useState(false);
  const [savedReadings, setSavedReadings] = useState<TUserSavedReadings[]>([
    exempleReading,
  ]);
  const [serverSnackBarAlert, setServerSnackBarAlert] = useState<
    TServerSnackbarOptions | undefined
  >(undefined);
  const [userUEC, setUserUEC] = useState<TCardInfo[] | undefined>(undefined);

  // UEC : User Edited Cards

  const { LocalBase } = useLocalBaseContext();
  const navigate = useNavigate();

  const beforeExit = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    console.log("beforeExit called");
    return (event.returnValue = "Are you sure you want to exit?");
  };

  useEffect(() => {
    if (!didInit) {
      didInit = true;
      User.isOnline();
    }
  }, [userServerTag]);

  const handleCloseServerSnackBar = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setServerSnackBarAlert(undefined);
  };

  const User = {
    isOnline() {
      if (!serverLoading) setServerLoading(true);
      onAuthStateChanged(auth, (user) => {
        if (user) {
          userEmail = user.email;
          userServerTag = `TarotReadings${user.uid}`;
          userServerUECtag = `UEC-${userServerTag}`;
          console.log("User ONLINE: ", userEmail);
          window.addEventListener("beforeunload", beforeExit);
          User.getUserData();
        } else {
          window.removeEventListener("beforeunload", beforeExit);
          console.log("User is OFFLINE.");
          userEmail = "";
          userServerTag = "";
          userServerUECtag = "";

          setSavedReadings([exempleReading]);

          setServerLoading(false);
          navigate("/readings-table/exemple-reading");
          setServerSnackBarAlert({
            open: true,
            message:
              "Usuário desconhecido: As funcionalidades serão restritas.",
            severity: "warning",
          });
        }
      });
    },

    async signUserOut() {
      window.removeEventListener("beforeunload", beforeExit);
      if (window.confirm("Deseja sair?")) {
        signOut(auth)
          .then(() => {
            console.log("User logged out. Reloading page...");
            window.location.reload();
          })
          .catch((error) => {
            alert("Falha ao desconectar usuário.");
            console.log("Error: ", error);
          });
      }
    },

    async getUserData() {
      console.log("getUserData: Getting user data ...");
      await Firestore.fetchDataFromServer();
      const serverUserUEC = await Firestore.getCollection(userServerUECtag);
      if (serverUserUEC?.length) {
        setUserUEC(serverUserUEC);
      } else {
        console.log("getUserData: No user UEC ON SERVER");
      }
    },
  };

  const Firestore = {
    async fetchDataFromServer() {
      if (userServerTag) {
        if (!serverLoading) setServerLoading(true);

        const localData = await LocalBase.getCollection(userServerTag);

        if (localData?.length) {
          console.log(
            "fetchDataFromServer: Local data WAS FOUND, skipping server and setting savedReadings... "
          );
          setSavedReadings(localData);
          setServerLoading(false);
          navigate("/saved-readings-list/exemple-reading");
          return;
        }

        try {
          console.log("fetchDataFromServer: Fetching data from server...");

          const dataQuery = query(collection(db, userServerTag));
          const querySnapshot = await getDocs(dataQuery);

          const userDataOnServer = querySnapshot.docs.map(
            (doc) => doc.data() as TUserSavedReadings
          );

          if (userDataOnServer.length && Array.isArray(userDataOnServer)) {
            console.log(
              "fetchDataFromServer: Setting user data from server: ",
              userDataOnServer
            );
            await LocalBase.setCollectionWithDocName(
              userServerTag,
              userDataOnServer
            );
            setSavedReadings(userDataOnServer);
            setServerLoading(false);
            navigate("/saved-readings-list/exemple-reading");
          } else {
            console.log(
              "fetchDataFromServer: No user data found ON SERVER. Showing exemple reading..."
            );
            // setSavedReadings([exempleReading]);
            if (serverLoading) setServerLoading(false);
            navigate("/readings-table/exemple-reading");
          }
        } catch (error) {
          setServerLoading(false);
          alert("Erro ao comunicar com o servidor.");
          console.error(error);
        }
      } else {
        console.log("fetchDataFromServer: User is not logged in.");
        setServerLoading(false);
      }
    },

    async getCollection(collectionName: string) {
      if (!serverLoading) setServerLoading(true);

      try {
        console.log(
          `Firestore.getCollection: Looking for "${collectionName}" collection on server...`
        );
        console.log(
          `Firestore.getCollection: Looking for "${collectionName}" collection on server...`
        );
        let collectionData: any[] = [];

        const querySnapshot = (await getDocs(
          collection(db, collectionName)
        )) as QuerySnapshot<TCardInfo>;
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          collectionData.push(doc.data());
        });

        if (collectionData) {
          if (collectionData.length > 0) {
            console.log(
              `Firebase.getCollection: Collection "${collectionName}" WAS FOUND ON SERVER.`
            );
            setServerLoading(false);
            return collectionData;
          } else {
            console.log(
              `Firebase.getCollection: Collection "${collectionName}" NOT FOUND ON SERVER..`
            );
            setServerLoading(false);
            return [];
          }
        }
      } catch (error) {
        setServerLoading(false);
        console.error(error);
        alert(`Erro ao buscar coleção "${collectionName}" no servidor`);
      }
    },

    async setDoc(
      collectionName: string,
      docName: string,
      data: TCardInfo | TUserSavedReadings
    ): Promise<boolean> {
      if (userServerTag && userServerUECtag) {
        setServerLoading(true);
        console.log(
          `Firestore.setDoc: Setting collection: "${collectionName}" with document: "${docName}" on server... `
        );

        try {
          await setDoc(doc(db, collectionName, `${docName}`), data);

          console.log(
            `Firestore.setDoc: Collection "${collectionName}" and document "${docName}" WAS SAVED ON SERVER...`
          );
          setServerLoading(false);
          setServerSnackBarAlert({
            open: true,
            message: "Salvo no servidor",
            severity: "success",
          });
          return true;
        } catch (error) {
          console.error(error);
          setServerLoading(false);
          setServerSnackBarAlert({
            open: true,
            message: "Erro ao salvar servidor.",
            severity: "error",
          });
          alert("Erro ao salvar no servidor.");
          return false;
        }
      } else {
        setServerLoading(false);
        console.log(
          "Firestore.setDoc: User Offline, unable to save on server."
        );
        setServerSnackBarAlert({
          open: true,
          message: "Não foi possível salvar: Usuário não conectado,",
          severity: "warning",
        });
        return false;
      }
    },

    async deleteDoc(
      collectionName: string,
      docName: string,
      deleteMultiple: boolean = false
    ) {
      if (userServerTag && userServerUECtag) {
        if (deleteMultiple) {
          await deleteDoc(doc(db, collectionName, `${docName}`));
        } else {
          if (!serverLoading) setServerLoading(true);
          console.log(
            `Firestore.deleteDoc: Deleting document: "${docName}" from collection: "${collectionName}" on server... `
          );
          try {
            await deleteDoc(doc(db, collectionName, `${docName}`));
            console.log("APAGADO COM SUCESSO DO SERVIDOR: ");
            setServerLoading(false);
            setServerSnackBarAlert({
              open: true,
              message: "Apagado com sucesso do servidor!",
              severity: "success",
            });
          } catch (error) {
            setServerLoading(false);
            setServerSnackBarAlert({
              open: true,
              message: "Erro ao apagar no servidor.",
              severity: "error",
            });
            alert("Erro ao deletar do servidor: " + error);
          }
        }
      }
    },
  };

  return (
    <ServerContext.Provider
      value={{
        User,
        userUEC,
        Firestore,
        userEmail,
        serverLoading,
        savedReadings,
        userServerTag,
        userServerUECtag,
        serverSnackBarAlert,
        setUserUEC,
        setServerLoading,
        setSavedReadings,
        setServerSnackBarAlert,
        handleCloseServerSnackBar,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};

export const useServerContext = () => useContext(ServerContext);
