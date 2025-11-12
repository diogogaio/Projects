// import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { createContext, useContext } from "react";
import { ReactElement, useCallback, useMemo, useState } from "react";

import { Api /* checkMyServer */ } from "../services/api/axios-config";
import { TSignUp } from "../../pages";
import { useAppContext } from "./AppContext";
import { TChangePwdForm } from "../components/modals";
import { useLocalBaseContext } from "./LocalBaseContext";
import { TResetPwdData } from "../../pages/ResetPassword";
import { AuthService, ILoginForm, IUser } from "../services/auth/AuthService";

interface IAuthMethods {
  baseUrl: string;
  isNewUser: boolean;
  userEmail: string;
  user: IUser | undefined;
  openWelcomeDialog: boolean;
  openPatienceDialog: boolean;
  openForgotPwdModal: boolean;
  openChangePasswordModal: boolean;
  logout: () => Promise<void>;
  appInit: () => Promise<void>;
  deleteUser: () => Promise<void>;
  deleteTag: (tag: string) => Promise<void>;
  createTag: (newTag: string) => Promise<void>;
  login: (form: ILoginForm) => Promise<Error | void>;
  setBaseUrl: React.Dispatch<React.SetStateAction<string>>;
  createNewUser: (form: TSignUp) => Promise<IUser | Error>;
  setIsNewUser: React.Dispatch<React.SetStateAction<boolean>>;
  resetPassword: (data: TResetPwdData) => Promise<void | Error>;
  handleSignInWithGoogle: (GoogleToken: string) => Promise<void>;
  changePassword: (data: TChangePwdForm) => Promise<void | Error>;
  setOpenWelcomeDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenPatienceDialog: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [isNewUser, setIsNewUser] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [baseUrl, setBaseUrl] = useState(
    "https://finance-control-api-o5t9.onrender.com/finance-api/v1/"
  );
  const [user, setUser] = useState<IUser | undefined>(undefined);

  const [openWelcomeDialog, setOpenWelcomeDialog] = useState(false);
  const [openPatienceDialog, setOpenPatienceDialog] = useState(false);
  const [openForgotPwdModal, setOpenForgotPwdModal] = useState(false);
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
    // await checkMyServer();

    //Oly checks if user has a token and redirects to the transactions page if it exists

    const token = await LocalBase.getData(appName, "credentials");

    if (!token) {
      navigate("/login");
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
    await getUser();
  };

  const createNewUser = useCallback(async (form: TSignUp) => {
    // await checkMyServer();
    const response = await AuthService.signup(form);

    if (response instanceof Error) {
      return response;
    }

    const userData = response;
    const { user, token } = userData;

    if (response.status === "success" && user && token) {
      setUser(user);
      setIsNewUser(true);
      setAuthToken(token);
      setUserEmail(user.email);
      navigate("/transactions");
      setOpenWelcomeDialog(true);
      await LocalBase.setData(appName, "credentials", { token: token });
    } else App.setLoading(false);

    return user;
  }, []);

  const login = useCallback(async (form: ILoginForm) => {
    // await checkMyServer();
    const response = await AuthService.login(form);

    if (response instanceof Error) {
      return response;
    }

    const { user, token } = response;

    if (response.status === "success" && user && token) {
      setUser(user);
      setAuthToken(token);
      setUserEmail(user.email);
      navigate("/transactions");

      await LocalBase.setData(appName, "credentials", { token: token });
    } else App.setLoading(false);
  }, []);

  const handleSignInWithGoogle = useCallback(async (GoogleToken: string) => {
    //Server will login user or create a new one with a random password, no token is stored on client side in THIS case.
    // await checkMyServer();
    const response = await AuthService.handleSignInWithGoogle(GoogleToken);

    if (response instanceof Error) {
      App.setLoading(false);

      alert(
        `Falha ao realizar login pelo Google:"${response.message}". Favor usar login e senha ou se cadastrar.`
      );
      console.log("Erro:", response);
      return;
    }

    const { user, token, newUser } = response;

    if (response.status === "success" && user && token) {
      setUserEmail(user.email);
      setUser(user);
      setAuthToken(token);
      navigate("/transactions");
      if (newUser) {
        setIsNewUser(newUser);
        setOpenWelcomeDialog(true);
      }
    } else App.setLoading(false);
  }, []);

  const getUser = useCallback(async () => {
    if (!App.loading) App.setLoading(true);

    const response = await AuthService.getUser();

    if (response instanceof Error) {
      App.setLoading(false);
      navigate("/login");
      return;
    }

    const { user, status } = response;

    if (status === "success" && user) {
      setUser(user);
      setUserEmail(user.email);
      App.setLoading(false);
      navigate("/transactions");
    } else {
      alert("Falha ao buscar usuário.");
      App.setLoading(false);
    }
  }, [App.loading]);

  const changePassword = useCallback(async (data: TChangePwdForm) => {
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
  }, []);

  const resetPassword = useCallback(async (data: TResetPwdData) => {
    const response = await AuthService.resetPassword(data);

    if (response instanceof Error) {
      return response;
    }

    const { user, token } = response;

    if (response.status === "success") {
      setUser(user);
      setAuthToken(token);
      setUserEmail(user.email);
      navigate("/transactions");

      await LocalBase.setData(appName, "credentials", { token: token });
    }
  }, []);

  const createTag = useCallback(
    async (tag: string): Promise<void> => {
      const newTag = tag.toLowerCase();

      if (user?.transactionTags) {
        const updatedTransactionTags = [
          ...(user.transactionTags || []),
          newTag,
        ];

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
    },
    [user]
  );

  const deleteTag = useCallback(
    async (tag: string): Promise<void> => {
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
    },
    [user]
  );

  const deleteUser = useCallback(async () => {
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
  }, []);

  const logout = useCallback(async () => {
    if (window.confirm("Deseja realmente sair?")) {
      //Delete user credentials:
      await LocalBase.deleteDocument(appName, "credentials");

      window.location.reload();
    }
  }, []);

  const Auth = useMemo(
    () => ({
      user,
      baseUrl,
      userEmail,
      isNewUser,
      openWelcomeDialog,
      openPatienceDialog,
      openForgotPwdModal,
      openChangePasswordModal,
      login,
      logout,
      appInit,
      deleteTag,
      createTag,
      deleteUser,
      setBaseUrl,
      setIsNewUser,
      createNewUser,
      resetPassword,
      changePassword,
      setOpenWelcomeDialog,
      setOpenPatienceDialog,
      setOpenForgotPwdModal,
      handleSignInWithGoogle,
      setOpenChangePasswordModal,
    }),
    [
      user,
      baseUrl,
      userEmail,
      isNewUser,
      openWelcomeDialog,
      openForgotPwdModal,
      openChangePasswordModal,
      login,
      logout,
      appInit,
      deleteTag,
      createTag,
      deleteUser,
      setBaseUrl,
      setIsNewUser,
      createNewUser,
      resetPassword,
      changePassword,
      setOpenWelcomeDialog,
      setOpenForgotPwdModal,
      handleSignInWithGoogle,
      setOpenChangePasswordModal,
    ]
  );

  return (
    <AuthContext.Provider value={{ Auth }}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
