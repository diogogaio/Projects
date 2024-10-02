import { Api } from "../api/axios-config";

interface ICreateSessionResponse {
  clientSecret: string;
}
export interface ISessionStatus {
  status: "complete" | "expired" | "open";
}

const createSession = async (email?: string) => {
  try {
    const { data } = await Api.post<ICreateSessionResponse>(
      "api/v1/payments/createCheckoutSession",
      { email }
    );
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

//On return page:
const sessionStatus = async (sessionId: string | undefined) => {
  try {
    const { data } = await Api.get<ISessionStatus>(
      `api/v1/payments/sessionStatus?${sessionId}`
    );
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

export const PaymentsService = {
  createSession,
  sessionStatus,
};
