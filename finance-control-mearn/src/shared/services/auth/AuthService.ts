import {
  TSignUp,
  TResetPwdData,
  TChangePwdForm,
} from "../../components/modals";
import { Api } from "../api/axios-config";

export interface IUser {
  _id: string;
  email: string;
  signedUpByGoogle?: boolean;
  transactionTags: string[];
}

export interface ILoginForm {
  email: string;
  password: string;
}

interface IUserData {
  status: "success";
  token: string;
  user: IUser;
}

interface IGetUserResponse {
  status: "success";
  user: IUser;
}

const signup = async (form: TSignUp): Promise<IUserData | Error> => {
  try {
    const { data } = await Api.post<IUserData>("/api/v1/user/signup", form);
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const login = async (form: ILoginForm): Promise<IUserData | Error> => {
  try {
    const { data } = await Api.post<IUserData>("/api/v1/user/login", form);
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const handleSignInWithGoogle = async (token: string) => {
  try {
    const { data } = await Api.post<IUserData>(
      "/api/v1/user/signinWithGoogle",
      token
    );
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const getUser = async (): Promise<IGetUserResponse | Error> => {
  try {
    const { data } = await Api.get<IGetUserResponse>("/api/v1/user/");
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const updateUser = async (
  fieldName: "email" | "password" | "transactionTags",
  fieldValue: string[]
): Promise<IGetUserResponse | Error> => {
  try {
    if (!fieldName || !fieldValue) alert("Favor confirmar campos enviados.");

    const updatedField = { [fieldName]: fieldValue };
    const { data } = await Api.patch<IGetUserResponse>(
      "/api/v1/user",
      updatedField
    );
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const changePassword = async (
  form: TChangePwdForm
): Promise<IUserData | Error> => {
  try {
    const { data } = await Api.patch<IUserData>("/api/v1/user/changePassword", {
      ...form,
    });
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const forgotPassword = async (email: string) => {
  try {
    const response = await Api.post("/api/v1/user/forgotPassword", { email });
    return response;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const resetPassword = async (
  form: TResetPwdData
): Promise<IUserData | Error> => {
  try {
    const { data } = await Api.patch<IUserData>(
      `/api/v1/user/resetPassword/${form.id}/${form.token}`,
      form
    );
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const deleteUser = async (): Promise<Error | void> => {
  try {
    await Api.delete("/api/v1/user");
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

export const AuthService = {
  login,
  signup,
  getUser,
  updateUser,
  deleteUser,
  resetPassword,
  forgotPassword,
  changePassword,
  handleSignInWithGoogle,
};
