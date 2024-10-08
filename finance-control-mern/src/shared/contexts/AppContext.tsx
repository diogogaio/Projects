import { useState, useContext, ReactElement, createContext } from "react";

import { IAppAlert } from "../components";

interface IAppMethods {
  loading: boolean;
  appAlert: IAppAlert | null;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setAppAlert: React.Dispatch<React.SetStateAction<IAppAlert | null>>;
  closeAppAlert: (_: React.SyntheticEvent | Event, reason?: string) => void;
}

interface IAppContextData {
  App: IAppMethods;
}

interface IAppProviderProps {
  children: React.ReactNode;
}

export const AppContext = createContext({} as IAppContextData);

export const AppProvider = ({ children }: IAppProviderProps): ReactElement => {
  const [loading, setLoading] = useState(false);
  const [appAlert, setAppAlert] = useState<IAppAlert | null>(null);

  const closeAppAlert = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setAppAlert(null);
  };

  const App = {
    loading,
    appAlert,
    setLoading,
    setAppAlert,
    closeAppAlert,
  };

  return <AppContext.Provider value={{ App }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
