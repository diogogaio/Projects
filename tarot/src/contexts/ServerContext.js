import React, { useContext, useReducer } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  deleteDoc,
  setDoc,
  collection,
  getDocs,
  getDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useEffect } from "react";
import reducer from "../assets/serverReducer";

export function useServer() {
  return useContext(ServerContext);
}

const ServerContext = React.createContext();

const defaultState = {
  onlineUser: "",
  userServerTag: "",
  userData: [],
  userUEC: [], //User edited Cards
  serverMessage: "" /* { text: "Some test", color: "succsses" } */,
  loading: false,
  exempleReading: [],
};

export const ServerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  //Firebase methods //

  //Check if user is signed in:
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("user online: ", user.email);
        dispatch({ type: "SET_USER", payload: user });
        dispatch({ type: "SET_USER_SERVER_TAG" });
        dispatch({ type: "SET_LOADING_OFF" });
      } else {
        console.log("user is not signed.");
        //Get exemple reading from localStorage, if there's no data, fill it with exemple from server:
        const localStorageExempleReading = JSON.parse(
          localStorage.getItem("exempleReading")
        );
        if (localStorageExempleReading) {
          console.log(
            "Setting exemple reading from localStorage.",
            localStorageExempleReading
          );
          dispatch({
            type: "SET_EXEMPLE_READING",
            payload: localStorageExempleReading,
          });
          dispatch({ type: "SET_LOADING_OFF" }); //Set loading OFF
        } else {
          console.log("Setting exemple reading from server on localStorage.");
          //Get exemple form Firestore server:
          (async function getExempleDataOnServer() {
            const docRef = doc(db, "TarotExempleReading", "Tiragem Exemplo");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const serverExempleReading = docSnap.data();
              dispatch({
                type: "SET_EXEMPLE_READING",
                payload: serverExempleReading,
              });
              localStorage.setItem(
                "exempleReading",
                JSON.stringify(serverExempleReading)
              );
            } else {
              console.log("No exemple reading data found on server!");
            }
          })();
          dispatch({ type: "SET_LOADING_OFF" }); //Set loading OFF
        }
      }
    });
  }, []);

  //Get user personal data when uid is available:
  useEffect(() => {
    if (state.userServerTag) {
      getUserEditedCards();
      getUserData();
    } else console.log("No user server tag available.");
  }, [state.userServerTag]);

  //---------------------------------------------------------------------//

  // USER //

  const signin = (email, password) => {
    dispatch({ type: "SET_LOADING_ON" });
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("User sign in success :", user.email);
        /* const urlArray = window.location.href.split("/");
        const location = urlArray.pop();
        if (location === "readingsList") {
          console.log("Reloading page.");
          window.location.reload(true);
        } */
        dispatch({
          type: "SET_SERVER_MESSAGE",
          payload: { text: "Usuário logado com sucesso!", color: "success" },
        });
        setTimeout(
          () => dispatch({ type: "SET_SERVER_MESSAGE", payload: "" }),
          2000
        );
      })
      .catch((error) => {
        console.error(error.message);
        const errorCode = error.code;
        if (errorCode === "auth/user-not-found") {
          dispatch({
            type: "SET_SERVER_MESSAGE",
            payload: { text: "Email usuário não encontrado!", color: "danger" },
          });
          dispatch({ type: "SET_LOADING_OFF" });
        } else if (errorCode === "auth/wrong-password") {
          dispatch({
            type: "SET_SERVER_MESSAGE",
            payload: {
              text: "Senha incorreta, verifique e tente novamente.",
              color: "danger",
            },
          });
          dispatch({ type: "SET_LOADING_OFF" });
        } else {
          dispatch({
            type: "SET_SERVER_MESSAGE",
            payload: {
              text: "Erro: Verifique seus dados e tente novamente.",
              color: "danger",
            },
          });
          dispatch({ type: "SET_LOADING_OFF" });
        }
      });

    setTimeout(() => {
      dispatch({
        type: "SET_SERVER_MESSAGE",
        payload: "",
      });
    }, 3000);
  };

  const signUserOut = () => {
    dispatch({ type: "CLEAR_USER" });
    signOut(auth)
      .then(() => {
        console.log("user logged out.");
        console.log("Reloading page!");
        window.location.reload();
      })
      .catch((error) => {
        alert("Falha ao deslogar usuário.");
        console.log("Error: ", error);
      });
  };
  const createNewUser = (email, password, emailConfirm, pwordConfirm) => {
    if (email === emailConfirm && password === pwordConfirm) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);
          dispatch({
            type: "SET_SERVER_MESSAGE",
            payload: { text: "Conta criada com sucesso!", color: "success" },
          });
          setTimeout(() => {
            dispatch({ type: "SET_SERVER_MESSAGE", payload: "" });
          }, 4000);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          //Error alerts:
          switch (errorCode) {
            case "auth/weak-password":
              dispatch({
                type: "SET_SERVER_MESSAGE",
                payload: {
                  text: "ERRO: Senha precisa ter mais de seis caracteres!",
                  color: "danger",
                },
              });
              break;
            case "auth/email-already-in-use":
              dispatch({
                type: "SET_SERVER_MESSAGE",
                payload: {
                  text: "ERRO: Email digitado já existe.",
                  color: "danger",
                },
              });
              break;
            case "auth/invalid-email":
              dispatch({
                type: "SET_SERVER_MESSAGE",
                payload: {
                  text: "ERRO: Email inválido, verifique e tente novamente.",
                  color: "danger",
                },
              });
              break;
            default:
              dispatch({
                type: "SET_SERVER_MESSAGE",
                payload: {
                  text: "ERRO: Não foi possível criar a conta, altere os dados e tente novamente.",
                  color: "danger",
                },
              });
          }
          console.error(
            "Error code: ",
            errorCode,
            "Error message: ",
            errorMessage
          );

          setTimeout(() => {
            dispatch({ type: "SET_SERVER_MESSAGE", payload: "" });
          }, 3000);
        });
    } else {
      if (email !== emailConfirm)
        dispatch({
          type: "SET_SERVER_MESSAGE",
          payload: {
            text: "Erro: Email digitado não confere!",
            color: "warning",
          },
        });
      else
        dispatch({
          type: "SET_SERVER_MESSAGE",
          payload: { text: "Erro: Senhas não conferem!", color: "warning" },
        });

      setTimeout(() => {
        dispatch({ type: "SET_SERVER_MESSAGE", payload: "" });
      }, 3000);
    }
  };

  // DATA ON SERVER //

  const saveReadingOnServer = (data, setShowSaveModal) => {
    //Invoked from appContexts useEffect[savedReadings] and onClick navbar options dropdown:
    console.log("saveReadingOnServer data: ", data);
    dispatch({ type: "SET_LOADING_ON" });
    if (state.onlineUser) {
      const mySavingPromise = () => {
        return new Promise((res) => {
          (async function () {
            try {
              await setDoc(doc(db, state.userServerTag, `${data.id}`), data);
              console.log("Saving reading on server.");
              res();
            } catch (e) {
              alert(
                "Erro ao tentar salvar no servidor, salvo apenas neste dispositivo."
              );
              dispatch({ type: "SET_LOADING_OFF" });
              setTimeout(() => {
                dispatch({ type: "SET_SERVER_MESSAGE", payload: "" });
                setShowSaveModal(false);
              }, 500);
              console.error(e.message);
            }
          })();
        });
      };
      const savedConfirmation = () => {
        dispatch({ type: "SET_LOADING_OFF" });
        dispatch({
          type: "SET_SERVER_MESSAGE",
          payload: {
            text: "Servidor: Salvo com sucesso!",
            color: "success",
          },
        });
        setTimeout(() => {
          dispatch({ type: "SET_SERVER_MESSAGE", payload: "" });
          setShowSaveModal(false);
        }, 1000);
      };
      (async function () {
        await mySavingPromise();
        savedConfirmation();
      })();
    } else {
      console.log("Data was not saved on localStorage neither server.");
      alert("Crie uma conta para poder salvar as tiragens no servidor.");
    }
  };

  const deleteSavedReadingOnServer = async (id) => {
    //Invoked from deleteSavedReading on appContexts:
    dispatch({ type: "SET_LOADING_ON" });
    const deletePromise = () => {
      return new Promise((res) => {
        (async function () {
          try {
            await deleteDoc(doc(db, `${state.userServerTag}`, id));
            console.log("Deleted on server.");
            res();
          } catch (e) {
            dispatch({ type: "SET_LOADING_OFF" });
            alert(
              "Não foi possível deletar no servidor, deletado somente neste dispositivo."
            );
            console.error(e);
          }
        })();
      });
    };
    (async function () {
      await deletePromise();
      dispatch({ type: "SET_LOADING_OFF" });
      console.log("Reading deleted on server.");
      dispatch({
        type: "SET_SERVER_MESSAGE",
        payload: { text: "Deletado com sucesso.", color: "success" },
      });
      setTimeout(() => {
        dispatch({ type: "SET_SERVER_MESSAGE", payload: "" });
      }, 3000);
    })();
  };

  function getUserData() {
    console.log("Getting user data...");
    //First try to use data from the localStorage, if there's none we update it with data  from server (in case user's access from other devices)
    const localStorageData = JSON.parse(
      localStorage.getItem(`${state.userServerTag}`)
    );
    console.log("user data on localStorage: ", localStorageData);

    if (localStorageData) {
      //Check if localStorage is null
      localStorageData.length > 0
        ? //LocalStorage isn't null, check if it has data or is an [empty array].
          dispatch({
            type: "SET_LOCAL_STORAGE_DATA",
            payload: localStorageData,
          })
        : getUserDataOnServer();
    } else getUserDataOnServer();

    async function getUserDataOnServer() {
      try {
        //order readings by timestamp:
        /* const q = query(
          collection(db, state.userServerTag),
          orderBy("timestamp", "asc"), limit(10)
        );
        const querySnapshot = await getDocs(q); */
        //console.log("query: ", querySnapshot);

        // don't order by timestamp:
        const querySnapshot = await getDocs(
          collection(db, state.userServerTag)
        );
        const userDataOnServer = querySnapshot.docs.map((doc) => doc.data());
        console.log("user data on server: ", userDataOnServer);

        if (userDataOnServer.length > 0) {
          return dispatch({
            type: "SET_SERVER_DATA",
            payload: userDataOnServer,
          });
        } else {
          console.log("no data available on server");
        }
      } catch (err) {
        console.error("Error", err.message);
      }
    }
  }

  // UEC  //

  const saveUserEditedCardsOnServer = async (data) => {
    try {
      await setDoc(doc(db, `UEC-${state.userServerTag}`, `${data.nome}`), data);
    } catch (err) {
      alert("Erro: Alterações não foram gravados no servidor!");
      console.error(err);
    }
  };

  const restoreCardMeaningOnServer = async (cardName) => {
    try {
      await deleteDoc(doc(db, `UEC-${state.userServerTag}`, cardName));
      console.log("Card restored to default meanings on server.");
    } catch (err) {
      console.error(err);
    }
  };

  const restoreAllCardMeaningsOnServer = (userEditedCards) => {
    for (let card of userEditedCards) {
      console.log(card.nome);
      restoreCardMeaningOnServer(card.nome);
    }
  };

  function getUserEditedCards() {
    const localStorageData = JSON.parse(
      localStorage.getItem(`UEC-${state.userServerTag}`)
    );
    console.log("User edited cards on localStorage: ", localStorageData);

    if (localStorageData) {
      //Check if localStorage is null
      localStorageData.length > 0
        ? //LocalStorage isn't null, check if it has data or is an [empty array].
          dispatch({
            type: "SET_LOCAL_STORAGE_UEC", //UEC - user edited cards
            payload: localStorageData,
          })
        : getUserDataOnServer();
    } else getUserDataOnServer();

    async function getUserDataOnServer() {
      try {
        const querySnapshot = await getDocs(
          collection(db, `UEC-${state.userServerTag}`)
        );
        const userDataOnServer = querySnapshot.docs.map((doc) => doc.data());
        console.log("user UEC on server: ", userDataOnServer);

        if (userDataOnServer.length > 0) {
          return dispatch({
            type: "SET_SERVER_UEC",
            payload: userDataOnServer,
          });
        } else {
          console.log("No UEC available on server");
        }
      } catch (err) {
        console.error("Error", err.message);
      }
    }
  }

  //-----------------------------------------------------------------//

  /* async function setExemple(item) {
    await setDoc(doc(db, "TarotExempleReading", "Tiragem Exemplo"), {
      exemplo: item,
    });
  } */

  const value = {
    ...state,
    signin,
    signUserOut,
    createNewUser,
    saveReadingOnServer,
    deleteSavedReadingOnServer,
    saveUserEditedCardsOnServer,
    restoreCardMeaningOnServer,
    restoreAllCardMeaningsOnServer,
    //setExemple,
  };

  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
};
