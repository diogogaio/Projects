import { AxiosError } from "axios";
import { Environment } from "../../../../environment";

export type IServerProdError = {
  status: string | number;
  message: string;
};

export const errorInterceptor = (error: AxiosError<IServerProdError>) => {
  if (Environment.ENV === "development") {
    console.log(error);
  }

  switch (true) {
    case error.code === "ERR_NETWORK":
      return Promise.reject(
        new Error("Erro de conexão, ou limite de utilização atingido.")
      );

    case error?.response?.data.message === "User already exists.":
      return Promise.reject(new Error("Usuário já existe."));

    case error.response?.data.message === "Invalid email or password.":
      return Promise.reject(new Error("Email ou senha inválidos."));

    case error.response?.data.message === "Old Password does not match.":
      return Promise.reject(new Error("Senha antiga não confere."));

    case error?.response?.data.status === 500:
      return Promise.reject(new Error("Falha no servidor."));

    case error?.response?.data.status === 400:
      return Promise.reject(new Error("Confira os dados enviados."));

    case error?.response?.data.status === 404:
      return Promise.reject(new Error("Não encontrado."));

    case error?.response?.data.status === 401:
      return Promise.reject(new Error("Não Autorizado."));

    case error?.response?.data.status === 429:
      return Promise.reject(
        new Error("Limite de solicitações diárias excedido.")
      );

    default:
      return Promise.reject(
        new Error(error?.response?.data.message || error.message)
      );
  }
};
