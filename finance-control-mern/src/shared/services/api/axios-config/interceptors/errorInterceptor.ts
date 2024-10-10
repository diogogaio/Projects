import { AxiosError } from "axios";

export type IServerProdError = {
  status: string | number;
  message: string;
};

export const errorInterceptor = (error: AxiosError<IServerProdError>) => {
  if (error.response?.data) {
    if (error.response.data.message === "User already exists.") {
      return Promise.reject(new Error("Usuário já existe."));
    }

    if (error.response?.data.message === "Invalid email or password.") {
      return Promise.reject(new Error("Email ou senha inválidos."));
    }
    if (error.response?.data.message === "Old Password does not match.") {
      return Promise.reject(new Error("Senha antiga não confere."));
    }

    if (error.response.data.status === 500) {
      return Promise.reject(
        new Error(
          "Limite de requisições diárias excedidas ou possível falha no servidor"
        )
      );
    }
    if (error.response.data.status === 400) {
      return Promise.reject(new Error("Confira os dados enviados."));
    }
    if (error.response.data.status === 404) {
      return Promise.reject(new Error("Não encontrado."));
    }
    if (error.response.data.status === 401) {
      return Promise.reject(new Error("Não Autorizado."));
    }
    if (error.response.data.status === 429) {
      return Promise.reject(
        new Error("Limite de solicitações diárias excedido.")
      );
    }
    if (error.message === "Network Error") {
      return Promise.reject(new Error("Erro de conexão"));
    }

    return Promise.reject(new Error(error.response.data.message));
  } else return Promise.reject(new Error(error.message));
};
