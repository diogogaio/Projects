import { getApiInstance } from "../api/axios-config";
import { TResetPwdData, TSignUp } from "../../../pages";
import { TChangePwdForm } from "../../components/modals";

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
  newUser?: boolean;
  token: string;
  user: IUser;
}

interface IGetUserResponse {
  status: "success";
  user: IUser;
}

const Api = getApiInstance();

const signup = async (form: TSignUp): Promise<IUserData | Error> => {
  try {
    const { data } = await Api.post<IUserData>("user/signup", form);
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const login = async (form: ILoginForm): Promise<IUserData | Error> => {
  try {
    const { data } = await Api.post<IUserData>("user/login", form);
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const handleSignInWithGoogle = async (token: string) => {
  try {
    const { data } = await Api.post<IUserData>("user/signinWithGoogle", token);
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const getUser = async (): Promise<IGetUserResponse | Error> => {
  try {
    const { data } = await Api.get<IGetUserResponse>("user");
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
    const { data } = await Api.patch<IGetUserResponse>("user", updatedField);
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
    const { data } = await Api.patch<IUserData>("user/changePassword", {
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
    const response = await Api.post("user/forgotPassword", { email });
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
      `user/resetPassword/${form.id}/${form.token}`,
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
    await Api.delete("user");
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
