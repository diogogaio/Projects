import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  QuerySnapshot,
} from "firebase/firestore";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import { addMonths, subMonths } from "date-fns";
import { differenceInMinutes, getDaysInMonth } from "date-fns";
import { useState, useRef, ReactElement, useCallback } from "react";
import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { createContext, useContext, useReducer, useEffect } from "react";

import {
  TChart,
  TUserInfo,
  IMonthData,
  TDayTrainings,
  IAppStateType,
  TCalendarDataKeys,
  IAppProviderProps,
  IGlobalContextData,
  APP_REDUCER_ACTION_TYPE,
} from "../types";
import { db, auth } from "../../firebase";
import { Environment } from "../environment";
import { useThemeContext } from "./ThemeContext";
import appReducer from "../../reducers/appReducer";
import { useLocalBaseContext } from "./LocalBaseContext";

let didInit = false;
let userEmail: string = "unknown user";

const appStates: IAppStateType = {
  appLoading: true,
  calendarData: null,
  gymCharts: undefined,
  inputDate: new Date(),
};
export const AppContext = createContext({} as IGlobalContextData);
export const AppProvider = ({ children }: IAppProviderProps): ReactElement => {
  const [state, dispatch] = useReducer(appReducer, appStates);
  const navigate = useNavigate();

  //Contexts:
  // @ts-ignore
  const { LocalBase } = useLocalBaseContext();
  const { AppThemes } = useThemeContext();

  //Modals
  const [logTrainingModal, setOpenLogTrainingModal] = useState(false);
  const [loggedTrainingInfoMd, setLoggedTrainingInfoMd] = useState(false);
  const [openNewGymChartModal, setOpenNewGymChartModal] = useState(false);
  const [gymChartsModal, setGymChartsModal] = useState(false);

  //Keep the current date before re-rendering
  let inputDateRef = useRef(state.inputDate);

  useEffect(() => {
    if (!didInit) {
      didInit = true;

      User.isOnline();
    }
    // If you apply this cleanup function, LocalBase.setCollection will save gym charts duplicated after updating device with User.updateDevice (at least on production)
    // return () => (didInit = false);
  }, []);

  useEffect(() => {
    const actualDate = Utils.formatDate(state.inputDate, false);
    const previousDate = Utils.formatDate(inputDateRef.current, false);

    //Check if the new selected date is from another month and year before refreshing month data
    if (
      (previousDate.year === actualDate.year &&
        previousDate.month !== actualDate.month) ||
      (previousDate.year !== actualDate.year &&
        previousDate.month === actualDate.month) ||
      (previousDate.year !== actualDate.year &&
        previousDate.month !== actualDate.month)
    ) {
      inputDateRef.current = state.inputDate;
      App.getSelectedMonthData();
    }
  }, [state.inputDate]);

  const User = {
    isOnline() {
      onAuthStateChanged(auth, (user) => {
        console.log("Checking if user is online...");
        if (user) {
          console.log("user Online: " + user.email);
          userEmail = user.email || "unknown user";

          //Update data from server if user is on different device and no data was found there
          Firestore.serverLogic();
          navigate("/Calendar");
        } else {
          console.log("User Offline");
          userEmail = "unknown user";
          navigate("/Login");
        }
      });
    },

    signUserOut() {
      if (window.confirm("Deseja sair?")) {
        dispatch({ type: APP_REDUCER_ACTION_TYPE.RESET_STATE });
        signOut(auth)
          .then(() => {
            // Sign-out successful.
            console.log("Sign-out successful.");
          })
          .catch((error) => {
            console.log("Sign-out error :", error);
            alert("Erro ao sair...");
          });
      }
    },

    async clearUserData(deleteOnServer: boolean = true) {
      console.log("User.clearUserData: Clearing user data...");
      if (deleteOnServer && state.gymCharts) {
        console.log("User.clearUserData(): will delete chart data on server.");

        for (const item of state?.gymCharts) {
          console.log("User.clearUserData: Deleting on server: ", item.tittle);
          await Firestore.deleteDoc(`My Gym Charts - ${userEmail}`, item.id);
        }
      }
      await LocalBase.deleteCollection(`My Gym Charts - ${userEmail}`);
      const userWorkoutData = await LocalBase.getCollection(
        `My Workout Data - ${userEmail}`
      );
      if (userWorkoutData.length > 0) {
        if (deleteOnServer) {
          console.log(
            "User.clearUserData(): will delete workout data on server."
          );
          for (const item of userWorkoutData) {
            const monthData = `${item.year} ${item.month}`;
            console.log("User.clearUserData(): Deleting on server: ", item);
            await Firestore.deleteDoc(
              `My Workout Data - ${userEmail}`,
              monthData
            );
          }
          localStorage.removeItem("selectedAppTheme");
        }
        await LocalBase.deleteCollection(`My Workout Data - ${userEmail}`);
      }
      console.log("User.clearUserData(): User data was cleared!");
    },

    async deleteAccount() {
      if (
        window.confirm(
          "Seu cadastro e todas as informações armazenadas serão desfeitas, deseja continuar?"
        )
      ) {
        dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON });
        await User.clearUserData();
        const user = auth.currentUser;

        if (user) {
          deleteUser(user)
            .then(() => {
              console.log("User.deleteAccount(): User was deleted.");
              dispatch({ type: APP_REDUCER_ACTION_TYPE.RESET_STATE });
              alert("Usuário excluído com sucesso!");
            })
            .catch((error) => {
              dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
              const errorCode = error.code;
              // An error ocurred
              if (errorCode === "auth/requires-recent-login") {
                alert(
                  "É necessário ter logado recentemente para deletar este usuário. Por favor, refaça o login e tente novamente"
                );
                User.signUserOut();
              } else
                alert(
                  `Erro ao descadastrar: Favor informe este erro ao desenvolvedor: "${error}".`
                );
            });
        }
      }
    },

    async updateDevice() {
      //If user log in from another device with older local IDB data:
      //See initial useEffect comment on this file about updating device.
      console.log("Utils.isServerAllowed(): Running update logic...");
      if (Utils.isServerAllowed("UPDATE_DEVICE")) {
        try {
          console.log("Utils.isServerAllowed(): Updating user device...");
          await User.clearUserData(false); //When user login again server logic will fetch user data on server.
          window.location.reload();
        } catch (e) {
          alert("Erro: Não foi possível salvar informações localmente. ");
        }
      }
    },
  };

  const App = {
    async init() {
      console.log("App.init(): Initiated application...");
      await App.getUserGymCharts();
      await App.getSelectedMonthData();
      dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
    },

    changeDate(date: string | number) {
      const formattedDate = Utils.formatDate(date, true).selectedDate;
      dispatch({
        type: APP_REDUCER_ACTION_TYPE.CHANGED_DATE,
        payload: formattedDate,
      });
    },

    async logTraining(
      date: IAppStateType["inputDate"],
      gymCharts: IAppStateType["gymCharts"] | TChart, //It may come from appStates or DefaultCharts
      id: string,
      data: IMonthData | null,
      comment: string = ""
    ) {
      dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON });
      //Adds a selected gymChart to the array that contains the completed charts on the selected day
      const dateObj = Utils.formatDate(date, false);

      //If gymCharts property is a to do, its is an object not an array:

      const selectedChart = Array.isArray(gymCharts)
        ? gymCharts.filter((c) => c.id === id).at(0)
        : gymCharts;

      //Check if user has any training logged on selected date:
      const dayData = App.getDayData(dateObj.day, "selectedMonth");
      let monthData = data;
      let changedSelectedChartId: TChart;
      let updatedCompletedChartComment: TDayTrainings["completedCharts"];

      if (selectedChart) {
        if (monthData) {
          console.log(
            "App.logTraining(): Checking if user has any training logged on selected date... ",
            dayData
          );

          if (dayData) {
            console.log(
              "App.logTraining(): User HAS training logged on selected date."
            );

            //Check if the selected chart is repeated on that day:
            const isRepeated = dayData.completedCharts.find(
              (cc) => cc.id === id
            );
            //Adds the appropriate chart with changed ID (if needed) and user comments to the completed charts array on that day
            if (isRepeated) {
              console.log(
                "App.logTraining(): Repeated Chart was found, changing id..."
              );
              changedSelectedChartId = {
                ...selectedChart,
                id: nanoid(),
              };
              updatedCompletedChartComment = [
                ...dayData.completedCharts,
                {
                  ...changedSelectedChartId,
                  comment,
                },
              ];
            } else {
              updatedCompletedChartComment = [
                ...dayData.completedCharts,
                {
                  ...selectedChart,
                  comment,
                },
              ];
            }

            //Maps over the days that have training data, finds the user selected day and adds the updated completed charts(trainings) for that day
            const updatedTrainingDataArray = monthData.trainingData.map((t) => {
              if (t.day === dayData.day) {
                return {
                  ...t,
                  completedCharts: updatedCompletedChartComment,
                };
              } else return t;
            });

            monthData = {
              id: nanoid(),
              year: dateObj.year,
              month: dateObj.month,
              trainingData: updatedTrainingDataArray,
            };
          } else {
            console.log(
              "App.logTraining(): user HAS NO logged training on selected day, adding new training...:"
            );

            monthData = {
              id: nanoid(),
              year: dateObj.year,
              month: dateObj.month,
              trainingData: [
                ...monthData.trainingData,
                {
                  id: nanoid(),
                  day: Number(Utils.formatDate(date, false).day),
                  completedCharts: [{ ...selectedChart, comment }],
                },
              ],
            };
          }
        } else {
          monthData = {
            id: nanoid(),
            year: dateObj.year,
            month: dateObj.month,
            trainingData: [
              {
                id: nanoid(),
                day: Number(Utils.formatDate(date, false).day),
                completedCharts: [{ ...selectedChart, comment }],
              },
            ],
          };
        }
      }

      if (monthData) {
        //SET DATA :
        await Firestore.setDoc(
          `My Workout Data - ${userEmail}`,
          selectedMonthDocName,
          monthData
        );
        await LocalBase.setData(
          `My Workout Data - ${userEmail}`,
          selectedMonthDocName,
          monthData
        );

        await App.getSelectedMonthData();
        dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
      }
    },

    async getSelectedMonthData() {
      console.log(
        "App.getSelectedMonthData(): Getting selected and adjacent month data..."
      );
      dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON });

      const previousMonth = await LocalBase.getData(
        `My Workout Data - ${userEmail}`,
        previousMonthDocName
      );
      const selectedMonth = await LocalBase.getData(
        `My Workout Data - ${userEmail}`,
        selectedMonthDocName
      );
      const nextMonth = await LocalBase.getData(
        `My Workout Data - ${userEmail}`,
        nextMonthDocName
      );

      dispatch({
        type: APP_REDUCER_ACTION_TYPE.GOT_MONTH_DATA,
        payload: { previousMonth, selectedMonth, nextMonth },
      });
      dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
    },

    getDayData: useCallback(
      (selectedDay: number, month: TCalendarDataKeys) => {
        let trainingData: TDayTrainings[] | undefined = [];

        switch (month) {
          case "previousMonth":
            trainingData = state.calendarData?.previousMonth?.trainingData;
            break;
          case "selectedMonth":
            trainingData = state.calendarData?.selectedMonth?.trainingData;
            break;
          case "nextMonth":
            trainingData = state.calendarData?.nextMonth?.trainingData;
            break;
        }

        if (trainingData && selectedDay) {
          const dayData = trainingData?.filter((t) => t.day === selectedDay);

          return dayData?.at(0);
        } else return undefined;
      },
      [state.calendarData, state.inputDate]
    ),

    async getUserGymCharts() {
      const gymCharts = await LocalBase.getCollection(
        `My Gym Charts - ${userEmail}`
      );
      if (gymCharts?.length > 0) {
        console.log("App.getUserGymCharts(): Setting gymCharts state.");
        dispatch({
          type: APP_REDUCER_ACTION_TYPE.GOT_USER_GYM_CHARTS,
          payload: gymCharts,
        });
      } else {
        console.log(
          "App.getUserGymCharts(): No user gym chart found on this device, setting default charts..."
        );
        dispatch({
          type: APP_REDUCER_ACTION_TYPE.GOT_USER_GYM_CHARTS,
          payload: defaultGymCharts,
        });
      }
    },

    async deleteSpecificLog(
      logId: string,
      dayId: string,
      tittle: string,
      hasMoreCharts: boolean
    ) {
      if (window.confirm(`Deseja deletar "${tittle} "?`)) {
        console.log(
          `App.deleteLog(): Deleting log "${tittle}" on date: `,
          date.date
        );
        let updatedTrainingData: IMonthData["trainingData"];
        if (state.calendarData?.selectedMonth) {
          dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON });

          if (hasMoreCharts) {
            updatedTrainingData =
              state.calendarData.selectedMonth?.trainingData.map((td) => {
                if (td.id === dayId) {
                  const updatedCompletedCharts = td.completedCharts.filter(
                    (completedChart) => completedChart.id !== logId
                  );
                  return { ...td, completedCharts: updatedCompletedCharts };
                } else return td;
              });
          } else {
            updatedTrainingData =
              state.calendarData.selectedMonth?.trainingData.filter(
                (td) => td.id !== dayId
              );
          }

          const updatedMonthData = {
            ...state.calendarData.selectedMonth,
            trainingData: updatedTrainingData,
          };

          await LocalBase.setData(
            `My Workout Data - ${userEmail}`,
            selectedMonthDocName,
            updatedMonthData
          );
          await Firestore.setDoc(
            `My Workout Data - ${userEmail}`,
            selectedMonthDocName,
            updatedMonthData
          );
          await App.getSelectedMonthData();
          dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
        }
      }
    },

    async deleteAllDayLogs(id: string) {
      if (window.confirm("Deseja realmente deletar todos os dados do dia?")) {
        if (state.calendarData?.selectedMonth) {
          dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON });

          setLoggedTrainingInfoMd(false);
          const remainingMonthTrainingData =
            state.calendarData.selectedMonth?.trainingData.filter(
              (day) => day.id !== id
            );

          const remainingMonthData = {
            ...state.calendarData.selectedMonth,
            trainingData: remainingMonthTrainingData,
          };

          await LocalBase.setData(
            `My Workout Data - ${userEmail}`,
            selectedMonthDocName,
            remainingMonthData
          );
          console.log(
            "App.deleteTraining(): Deleted all training on selected day."
          );
          await Firestore.setDoc(
            `My Workout Data - ${userEmail}`,
            selectedMonthDocName,
            remainingMonthData
          );
        }
        await App.getSelectedMonthData();
        dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
      }
    },

    async deleteMonthData() {
      if (state.calendarData) {
        if (window.confirm("Deseja apagar todos registros deste mês?")) {
          dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON });
          await LocalBase.deleteDocument(
            `My Workout Data - ${userEmail}`,
            selectedMonthDocName
          );
          await Firestore.deleteDoc(
            `My Workout Data - ${userEmail}`,
            selectedMonthDocName
          );
          await App.getSelectedMonthData();
          dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
        }
      } else {
        alert("Você não possui nenhum registro neste mês.");
      }
    },

    async deleteGymChart(id: string, chartTittle: string) {
      const hasSavedGymCharts = await Utils.hasSavedGymCharts();
      if (hasSavedGymCharts) {
        if (window.confirm(`Deseja deletar esta ficha: "${chartTittle}"?`)) {
          dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON });

          const remainingGymCharts = state.gymCharts?.filter(
            (g) => g.id !== id
          );
          await LocalBase.setCollection(
            `My Gym Charts - ${userEmail}`,
            remainingGymCharts
          );
          await Firestore.deleteDoc(`My Gym Charts - ${userEmail}`, id);
          await App.getUserGymCharts();
          dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
        }
      } else alert("Fichas padrões não podem ser deletadas.");
    },

    async deleteAllGymCharts() {
      if (await Utils.hasSavedGymCharts()) {
        if (
          window.confirm(
            "Deseja deletar todas as fichas? Fichas padrões serão criadas automaticamente."
          )
        ) {
          dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_ON });
          state.gymCharts?.forEach((g, index) => {
            setTimeout(() => {
              console.log(
                "App.deleteAllGymCharts(): Deleting chart on server: ",
                g.tittle
              );
              Firestore.deleteDoc(`My Gym Charts - ${userEmail}`, g.id);
            }, index * 500);
          });
          await LocalBase.deleteCollection(`My Gym Charts - ${userEmail}`);
          await App.getUserGymCharts();
          dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
        }
      } else alert("Você não possui fichas de treino personalizadas.");
    },
  };

  const Firestore = {
    async serverLogic() {
      console.log("Firestore.serverLogic(): Executing server logic...");
      if (Utils.isServerAllowed("CHECK_REQUESTS")) {
        const trainingLogsOnServer = await Firestore.getCollection(
          `My Workout Data - ${userEmail}`
        );
        if (trainingLogsOnServer && Array.isArray(trainingLogsOnServer)) {
          if (trainingLogsOnServer.length > 0) {
            await Firestore.getUserGymCharts();
            await Firestore.getUserWorkouts(trainingLogsOnServer);
            console.log(
              "Firestore.serverLogic(): User server data was successfully retrieved."
            );
            // setTimeout(() => {
            //   //LocalBase limitation of simultaneous operations
            // }, 200);
          } else {
            console.log(
              "Firestore.serverLogic(): User workouts WERE NOT FOUND in server, initializing APP..."
            );
            App.init();
          }
        }
      } else App.init();
    },

    //If more server restrictions are needed, use this logic along with the User.updateDevice().
    //Sync with server option commented out at CalendarMenu
    // async serverLogic() {
    //   console.log("Firestore.serverLogic(): Executing server logic...");

    //   const hasDataOnThisDevice = await LocalBase.getCollection(
    //     `My Workout Data - ${userEmail}`
    //   );

    //   if (hasDataOnThisDevice.length) {
    //     console.log(
    //       "Firestore.serverLogic(): Loading local data from LocalBase..."
    //     );
    //     App.init();
    //   } else {
    //     console.log(
    //       "Firestore.serverLogic():Local data NOT FOUND, looking on server..."
    //     );
    //     if (Utils.isServerAllowed("CHECK_REQUESTS")) {
    //       const trainingLogsOnServer = await Firestore.getCollection(
    //         `My Workout Data - ${userEmail}`
    //       );
    //       if (trainingLogsOnServer && Array.isArray(trainingLogsOnServer)) {
    //         if (trainingLogsOnServer.length > 0) {
    //           await Firestore.getUserGymCharts();
    //           await Firestore.getUserWorkouts(trainingLogsOnServer);
    //           alert(
    //             "Este dispositivo foi sincronizado com os dados do servidor."
    //           );
    //           // setTimeout(() => {
    //           //   //LocalBase limitation of simultaneous operations
    //           // }, 200);
    //         } else {
    //           console.log(
    //             "Firestore.serverLogic(): User workouts WERE NOT FOUND in server, initializing APP..."
    //           );
    //           App.init();
    //         }
    //       }
    //     } else App.init();
    //   }
    // },

    async getUserWorkouts(userCollectionOnServer: IMonthData[]) {
      console.log(
        "Firestore.getUserWorkouts(): Updating device with workout data...",
        userCollectionOnServer
      );

      const userCollectionWithDocName = userCollectionOnServer.map((uc) => {
        return {
          ...uc,
          _key: `${uc.year} ${uc.month}`,
        };
      });

      await LocalBase.setCollectionWithDocName(
        `My Workout Data - ${userEmail}`,
        userCollectionWithDocName
      );
      console.log("Firestore.getUserWorkouts(): Finished updating device.");
      await App.getSelectedMonthData();
      dispatch({ type: APP_REDUCER_ACTION_TYPE.SET_APP_LOADING_OFF });
    },

    async getUserGymCharts() {
      console.log(
        "Firestore.getUserGymCharts(): Looking for user charts on SERVER..."
      );
      const data = await Firestore.getCollection(
        `My Gym Charts - ${userEmail}`
      );
      if (data ? data.length > 0 : false) {
        console.log(
          "Firestore.getUserGymCharts(): Gym chart data WAS FOUND ON SERVER, setting it on device..."
        );
        await LocalBase.setCollection(`My Gym Charts - ${userEmail}`, data);
        await App.getUserGymCharts();
      } else {
        console.log(
          "Firestore.getUserGymCharts(): Gym chart data WAS NOT FOUND ON SERVER."
        );
        await App.getUserGymCharts();
      }
    },

    async setDoc(
      collectionName: string,
      docName: string,
      data: TChart | IMonthData | TUserInfo
    ) {
      if (Utils.isServerAllowed("CHECK_REQUESTS")) {
        if (userEmail !== "unknown user") {
          console.log(
            `Firestore.setDoc(): Setting collection: "${collectionName}" with document: "${docName}" and on server... `
          );
          try {
            await setDoc(doc(db, collectionName, `${docName}`), data);

            console.log(
              `Firestore.setDoc(): Collection "${collectionName}" and document "${docName}" WAS SAVED ON SERVER...`
            );
          } catch (error) {
            console.error(error);
            alert("Erro ao salvar no servidor.");
          }
        } else
          console.log(
            "Firestore.setDoc(): User Offline, unable to save on server."
          );
      }
    },

    async getDoc(collectionName: string, docName: string) {
      if (Utils.isServerAllowed("CHECK_REQUESTS")) {
        console.log(
          `Firestore.getDoc(): Looking for "${collectionName}" on server...`
        );
        try {
          const docRef = doc(db, collectionName, docName);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            console.log(
              `"${collectionName}" WAS FOUND on server: `,
              docSnap.data()
            );
            return docSnap.data();
          } else {
            // docSnap.data() will be undefined in this case
            console.log(
              `Firestore.getDoc(): "${collectionName}" WAS NOT FOUND on server, `
            );
          }
        } catch (error) {
          if (error instanceof Error) console.error(error.message);
          alert("Erro ao buscar documento no servidor.");
        }
      }
    },

    async getCollection(collectionName: string) {
      if (Utils.isServerAllowed("CHECK_REQUESTS")) {
        try {
          console.log(
            `Firestore.getCollection(): Looking for "${collectionName}" collection on server...`
          );
          console.log(
            `Firestore.getCollection(): Looking for "${collectionName}" collection on server...`
          );
          let collectionData: any[] = [];

          const querySnapshot = (await getDocs(
            collection(db, collectionName)
          )) as QuerySnapshot<IMonthData | TChart>;
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            collectionData.push(doc.data());
          });

          if (collectionData) {
            if (collectionData.length > 0) {
              console.log(
                `Firebase.getCollection(): Collection "${collectionName}" WAS FOUND ON SERVER.`
              );

              return collectionData;
            } else {
              console.log(
                `Firebase.getCollection(): Collection "${collectionName}" NOT FOUND ON SERVER..`
              );
              return [];
            }
          }
        } catch (error) {
          console.error(error);
          alert(`Erro ao buscar coleção "${collectionName}" no servidor`);
        }
      }
    },

    async deleteDoc(collectionName: string, docName: string) {
      if (Utils.isServerAllowed("CHECK_REQUESTS")) {
        if (userEmail !== "unknown user") {
          try {
            await deleteDoc(doc(db, collectionName, docName));
            console.log(
              `Firestore.deleteDoc(): Document "${docName}" in collection "${collectionName}" deleted ON SERVER.`
            );
          } catch (error) {
            console.error(error);
            alert("Erro ao salvar alteração no servidor");
          }
        } else {
          console.log(
            "Firestore.deleteDoc(): User Offline, unable to reach server."
          );
        }
      }
    },
  };

  const Utils = {
    formatDate(dateToFormat: string | number | Date, correction: boolean) {
      const addOneDay = correction;
      let date = new Date(dateToFormat);
      if (addOneDay) date = new Date(date.setDate(date.getDate() + 1));
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = Number(String(date.getDate()).padStart(2, "0"));
      const daysInMonth = Number(
        getDaysInMonth(new Date(year, date.getMonth()))
      );
      const firstDay = Number(new Date(year, date.getMonth(), 1).getDay());
      const selectedDate = date.getTime();
      return {
        day,
        firstDay,
        month,
        daysInMonth,
        year,
        selectedDate,
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
          2,
          "0"
        )}`,
        brazilianDate: `${String(day).padStart(2, "0")}/${String(
          month
        ).padStart(2, "0")}/${year}`,
      };
    },

    async hasSavedGymCharts() {
      const gymCharts = await LocalBase.getCollection(
        `My Gym Charts - ${userEmail}`
      );
      const hasCharts = gymCharts.length > 0;
      console.log(
        `Utils.hasSavedGymCharts(): ${
          hasCharts ? "FOUND" : "NOT FOUND"
        } gym charts saved in this device...`
      );
      return hasCharts;
    },

    isDefaultChart() {
      const keyToFind = "defaultChart";
      const isDefault = state.gymCharts?.find(
        (obj) => obj[keyToFind] !== undefined
      );
      return isDefault;
    },

    handleCharacters(textLength: number, maxChars: number) {
      const remainingChars = maxChars - textLength;
      const helperText = `Caracteres restantes: ${remainingChars}`;

      return {
        helperText,
        maxChars,
        remainingChars,
        color:
          remainingChars < 0
            ? AppThemes.theme.palette.error.main
            : AppThemes.theme.palette.warning.light,
      };
    },

    isServerAllowed(operation: "UPDATE_DEVICE" | "CHECK_REQUESTS") {
      console.log("Firestore.isServerAllowed(): Getting user information...");

      const newUserInfo: TUserInfo = {
        SERVER_REQUESTS: 1,
        LAST_REQUEST_DATE: today.date,
        LAST_REQUEST_TIME:
          operation === "UPDATE_DEVICE" ? new Date().toISOString() : undefined,
      };
      const userInfo = localStorage.getItem(USER_INFO_COLLECTION);
      if (userInfo) {
        console.log(
          "Utils.getUserServerInfo(): User information retrieved successfully!"
        );
        const userInfoTyped: TUserInfo = JSON.parse(userInfo);
        const serverCount = userInfoTyped.SERVER_REQUESTS;
        const requestDate = userInfoTyped.LAST_REQUEST_DATE;

        switch (operation) {
          case "CHECK_REQUESTS":
            if (
              serverCount > Environment.MAX_SERVER_REQUESTS_PER_DAY &&
              requestDate === today.date
            ) {
              console.log(
                "Utils.getUserServerInfo(): User has exceeded the maximum server requests. Count: ",
                serverCount
              );
              alert(
                "Número máximo de requisições diárias ao servidor foi excedido, alterações serão salvas apenas no dispositivo e consultas ao servidor serão interrompidas até o dia seguinte."
              );
              return false;
            } else if (
              serverCount > Environment.MAX_SERVER_REQUESTS_PER_DAY &&
              requestDate !== today.date
            ) {
              console.log(
                "Utils.isServerAllowed(): Re-allowing user and resetting count..."
              );

              localStorage.setItem(
                USER_INFO_COLLECTION,
                JSON.stringify({
                  ...userInfoTyped,
                  LAST_REQUEST_DATE: today.date,
                  SERVER_REQUESTS: 1,
                })
              );

              return true;
            } else {
              localStorage.setItem(
                USER_INFO_COLLECTION,
                JSON.stringify({
                  ...userInfoTyped,
                  LAST_REQUEST_DATE: today.date,
                  SERVER_REQUESTS:
                    serverCount > Environment.MAX_SERVER_REQUESTS_PER_DAY
                      ? 1
                      : serverCount + 1,
                })
              );
              console.log(
                "User.isServerAllowed(): User server requests are allowed. "
              );
              return true;
            }

          case "UPDATE_DEVICE":
            const interval = Environment.SERVER_REQUESTS_INTERVAL;

            if (userInfoTyped.LAST_REQUEST_TIME) {
              const difference = differenceInMinutes(
                new Date(),
                new Date(userInfoTyped.LAST_REQUEST_TIME)
              );
              const allowUpdate = difference >= interval ? true : false;

              if (allowUpdate) {
                console.log(
                  "User.isServerAllowed(): Update device is allowed..."
                );
                localStorage.setItem(
                  USER_INFO_COLLECTION,
                  JSON.stringify({
                    ...userInfoTyped,
                    LAST_REQUEST_TIME: new Date().toISOString(),
                  })
                );
                return true;
              } else {
                console.log(
                  "User.isServerAllowed(): Update device NOT allowed..."
                );
                alert(
                  "Dispositivo foi atualizado recentemente. Tente novamente mais tarde..."
                );
                return false;
              }
            } else {
              console.log(
                "User.isServerAllowed(): LAST_REQUEST_TIME is undefined. Update device is allowed..."
              );
              localStorage.setItem(
                USER_INFO_COLLECTION,
                JSON.stringify({
                  ...userInfoTyped,
                  LAST_REQUEST_TIME: new Date().toISOString(),
                })
              );

              return true;
            }
        }
      } else {
        console.log(
          "User.isServerAllowed(): User information NOT FOUND! Allowing server requests and setting first request..."
        );
        if (userEmail === Environment.ADMIN) {
          console.log("Utils.isServerAllowed(): User is ADMIN.");
          return true;
        } else {
          localStorage.setItem(
            USER_INFO_COLLECTION,
            JSON.stringify(newUserInfo)
          );
        }
        return true;
      }
    },
  };
  const defaultGymCharts = [
    {
      id: nanoid(),
      tittle: "A",
      dateCreated: Utils.formatDate(new Date(), true).brazilianDate,
      description: "FICHA PADRÃO",
      color: "#22F51B",
      exercises: "",
      defaultChart: true,
      isTodo: false,
    },
    {
      id: nanoid(),
      tittle: "B",
      dateCreated: Utils.formatDate(new Date(), true).brazilianDate,
      description: "FICHA PADRÃO",
      color: "#27C255",
      exercises: "",
      defaultChart: true,
      isTodo: false,
    },
    {
      id: nanoid(),
      tittle: "C",
      dateCreated: Utils.formatDate(new Date(), true).brazilianDate,
      description: "FICHA PADRÃO",
      color: "#3BB256",
      exercises: "",
      defaultChart: true,
      isTodo: false,
    },
  ];

  //Global Variables
  const previousMonthDate = subMonths(state.inputDate, 1);
  const prevDate = Utils.formatDate(previousMonthDate, false);
  const previousMonthDocName = `${prevDate.year} ${prevDate.month}`;

  const date = Utils.formatDate(state.inputDate, false);
  const today = Utils.formatDate(new Date(), false);
  const selectedMonthDocName = `${date.year} ${date.month}`;

  const nextMonthDate = addMonths(state.inputDate, 1);
  const nextDate = Utils.formatDate(nextMonthDate, false);
  const nextMonthDocName = `${nextDate.year} ${nextDate.month}`;

  const USER_INFO_COLLECTION = `User info - ${userEmail}`;

  return (
    <AppContext.Provider
      value={{
        ...state,
        App,
        User,
        Utils,
        Firestore,
        userEmail,
        gymChartsModal,
        defaultGymCharts,
        logTrainingModal,
        selectedMonthDocName,
        loggedTrainingInfoMd,
        openNewGymChartModal,
        setGymChartsModal,
        setOpenLogTrainingModal,
        setLoggedTrainingInfoMd,
        setOpenNewGymChartModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => useContext(AppContext);
