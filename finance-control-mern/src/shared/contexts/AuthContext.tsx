// import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { ReactElement, useState } from "react";
import { createContext, useContext } from "react";

import { TSignUp } from "../../pages";
import { timer } from "../utils/timer";
import { useAppContext } from "./AppContext";
import { Api } from "../services/api/axios-config";
import { TChangePwdForm } from "../components/modals";
import { useLocalBaseContext } from "./LocalBaseContext";
import { TResetPwdData } from "../../pages/ResetPassword";
import { AuthService, ILoginForm, IUser } from "../services/auth/AuthService";

interface IAuthMethods {
  userEmail: string;
  user: IUser | undefined;
  openWelcomeDialog: boolean;
  openForgotPwdModal: boolean;
  openChangePasswordModal: boolean;
  logout: () => Promise<void>;
  appInit: () => Promise<void>;
  deleteUser: () => Promise<void>;
  deleteTag: (tag: string) => Promise<void>;
  createTag: (newTag: string) => Promise<void>;
  login: (form: ILoginForm) => Promise<Error | void>;
  createNewUser: (form: TSignUp) => Promise<IUser | Error>;
  resetPassword: (data: TResetPwdData) => Promise<void | Error>;
  handleSignInWithGoogle: (GoogleToken: string) => Promise<void>;
  changePassword: (data: TChangePwdForm) => Promise<void | Error>;
  setOpenWelcomeDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenForgotPwdModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenChangePasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IAuthContextData {
  Auth: IAuthMethods;
}

interface IAuthProviderProps {
  children: React.ReactNode;
}

// interface IDecodedJwt {
//   iat: number;
//   exp: number;
//   id: string;
//   userEmail: string;
// }

// let userTags: string[] = [];

export const AuthContext = createContext<IAuthContextData>(
  {} as IAuthContextData
);

export const AuthProvider = ({
  children,
}: IAuthProviderProps): ReactElement => {
  //Hooks
  const { LocalBase } = useLocalBaseContext();
  const [userEmail, setUserEmail] = useState<string>("");
  const [user, setUser] = useState<IUser | undefined>(undefined);

  const [openForgotPwdModal, setOpenForgotPwdModal] = useState(false);
  const [openWelcomeDialog, setOpenWelcomeDialog] = useState(false);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);

  const appName = "Finance App";

  const navigate = useNavigate();

  const { App } = useAppContext();

  const setAuthToken = (token: string) => {
    if (token) {
      Api.defaults.headers.common["Authorization"] = `bearer ${token}`;
    } else {
      delete Api.defaults.headers.common["Authorization"];
    }
  };

  const appInit = async () => {
    //Oly checks if user has a token and redirects to the transactions page if it exists
    const token = await LocalBase.getData(appName, "credentials");

    if (!token) {
      return;
    }

    // try {
    //   const decodedToken = await jwtDecode<IDecodedJwt>(token.token);
    //   //   console.log("DECODED TOKEN INIT: ", decodedToken);
    //   // setUserEmail(decodedToken.userEmail);
    // } catch (error) {
    //   console.error("Error decoding token: ", error);
    // }
    setAuthToken(token.token);
    getUser();
  };

  const createNewUser = async (form: TSignUp) => {
    timer.startRequestTimer();
    const response = await AuthService.signup(form);

    if (response instanceof Error) {
      timer.cancelRequestTimer();
      return response;
    }

    timer.cancelRequestTimer();
    const userData = response;
    const { user, token } = userData;
    await LocalBase.setData(appName, "credentials", { token: token });
    setUser(user);
    setAuthToken(token);
    setUserEmail(user.email);
    navigate("/transactions");
    setOpenWelcomeDialog(true);

    return user;
  };

  const login = async (form: ILoginForm) => {
    timer.startRequestTimer();
    const response = await AuthService.login(form);
    if (response instanceof Error) {
      timer.cancelRequestTimer();
      return response;
    }

    const { user, token } = response;

    timer.cancelRequestTimer();
    if (response.status === "success") {
      setUser(user);
      setAuthToken(token);
      setUserEmail(user.email);
      navigate("/transactions");

      await LocalBase.setData(appName, "credentials", { token: token });
    }
  };

  const handleSignInWithGoogle = async (GoogleToken: string) => {
    //Server will login user or create a new one with a random password, no token is stored in client' browser in THIS case.
    timer.startRequestTimer();
    const response = await AuthService.handleSignInWithGoogle(GoogleToken);

    if (response instanceof Error) {
      timer.cancelRequestTimer();
      alert(
        `Falha ao realizar login pelo Google:"${response.message}". Favor usar login e senha ou se cadastrar.`
      );
      console.log("Erro:", response);
      return;
    }
    const { user, token } = response;

    timer.cancelRequestTimer();
    if (response.status === "success") {
      setUser(user);
      setAuthToken(token);
      setUserEmail(user.email);
      navigate("/transactions");
      if (response.newUser) setOpenWelcomeDialog(true);
    } else App.setLoading(false);
  };

  const getUser = async () => {
    timer.startRequestTimer();
    if (!App.loading) App.setLoading(true);

    const response = await AuthService.getUser();

    if (response instanceof Error) {
      timer.cancelRequestTimer();
      App.setLoading(false);
      return;
    }

    const { user, status } = response;
    timer.cancelRequestTimer();
    if (status === "success") {
      setUser(user);
      setUserEmail(user.email);
      navigate("/transactions");
    } else {
      alert("Falha ao buscar usuário.");
      App.setLoading(false);
    }
  };

  const changePassword = async (data: TChangePwdForm) => {
    const response = await AuthService.changePassword(data);

    if (response instanceof Error) {
      return response;
    }
    const { status, token } = response;
    if (status === "success") {
      setOpenChangePasswordModal(false);
      setAuthToken(token);
      App.setAppAlert({
        message: "Senha atualizada com sucesso.",
        severity: "success",
      });
    }
  };

  const resetPassword = async (data: TResetPwdData) => {
    const response = await AuthService.resetPassword(data);

    if (response instanceof Error) {
      return response;
    }

    const { user, token } = response;

    if (response.status === "success") {
      setUser(user);
      setAuthToken(token);
      setUserEmail(user.email);
      navigate("/");

      await LocalBase.setData(appName, "credentials", { token: token });
    }
  };

  const createTag = async (tag: string): Promise<void> => {
    const newTag = tag.toLowerCase();

    if (user?.transactionTags) {
      const updatedTransactionTags = [...(user.transactionTags || []), newTag];

      if (user?.transactionTags.find((tgs) => tgs === newTag)) {
        alert("Setor já existe.");
        return;
      }

      const response = await AuthService.updateUser(
        "transactionTags",
        updatedTransactionTags
      );

      if (response instanceof Error) {
        alert(`Erro ao atualizar informações: ${response.message}.`);
        return;
      }

      if (response.status === "success") {
        setUser({
          ...user,
          transactionTags: [...user.transactionTags, newTag],
        });
        return;
      }
    }
  };

  const deleteTag = async (tag: string): Promise<void> => {
    const deletedTag = tag.toLowerCase();

    if (!user?.transactionTags)
      return alert("Lista de setores deste usuário não encontrada.");

    let remainingTags = [...user?.transactionTags];

    if (!remainingTags.find((tgs) => tgs === deletedTag))
      return alert("Setor não encontrado.");

    remainingTags = remainingTags.filter((tgs) => tgs !== deletedTag);

    const response = await AuthService.updateUser(
      "transactionTags",
      remainingTags
    );

    if (response instanceof Error) {
      alert(`Erro ao atualizar informações: ${response.message}.`);
      return;
    }

    if (response.status === "success")
      setUser({
        ...user,
        transactionTags: remainingTags,
      });

    return;
  };

  const deleteUser = async () => {
    if (
      window.confirm(
        "Deseja realmente deletar este usuário e todos os seus dados no servidor?"
      )
    ) {
      App.setLoading(true);

      const response = await AuthService.deleteUser();

      if (response instanceof Error) {
        App.setLoading(false);
        alert("Erro ao excluir usuário");
        return;
      }
      await LocalBase.deleteDocument(appName, "credentials");
      App.setLoading(false);
      App.setAppAlert({ message: "Usuário deletado!", severity: "success" });
      window.location.reload();
    }
  };

  const logout = async () => {
    if (window.confirm("Deseja realmente sair?")) {
      //Delete user credentials:
      await LocalBase.deleteDocument(appName, "credentials");

      navigate("/");
      window.location.reload();
    }
  };

  const Auth = {
    user,
    userEmail,
    openWelcomeDialog,
    openForgotPwdModal,
    openChangePasswordModal,
    login,
    logout,
    appInit,
    deleteTag,
    createTag,
    deleteUser,
    createNewUser,
    resetPassword,
    changePassword,
    setOpenWelcomeDialog,
    setOpenForgotPwdModal,
    handleSignInWithGoogle,
    setOpenChangePasswordModal,
  };

  return (
    <AuthContext.Provider value={{ Auth }}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
