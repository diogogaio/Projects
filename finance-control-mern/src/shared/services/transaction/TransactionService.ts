import { Api } from "../api/axios-config";

export interface ITransaction {
  tag: string;
  _id?: string;
  amount: number;
  clone?: boolean;
  createdAt: string;
  description: string;
  recurrent?: boolean;
  transactionId: string;
  transactionType: string; //income or outcome
}

interface ITotalsByEachTag {
  [key: string]: number;
}

export interface ITransactionTotals {
  income: number;
  totalsByEachIncomeTags: ITotalsByEachTag | null;
  outcome: number;
  totalsByEachOutcomeTags: ITotalsByEachTag | null;
  balance: number;
}

export type TNewTransactionResponse = {
  status: string;
  transaction: ITransaction;
};

export interface IGetTransactionResponse {
  status: string;
  count: number;
  totals: ITransactionTotals;
  transactions: ITransaction[];
}

export interface IUpdateTransactionResponse {
  status: string;
  matchedCount: number; // Number of documents matched
  modifiedCount: number; // Number of documents modified
  acknowledged: boolean; // Boolean indicating everything went smoothly.
}

const createNewTransaction = async (
  transaction: ITransaction
): Promise<TNewTransactionResponse | Error> => {
  try {
    const { data } = await Api.post<TNewTransactionResponse>(
      "transactions",
      transaction
    );
    return data;
  } catch (error) {
    let err = error as Error;
    return err;
  }
};

const getTransactions = async (
  query: string
): Promise<IGetTransactionResponse | Error> => {
  try {
    const { data } = await Api.get<IGetTransactionResponse>(
      `transactions${query}`
    );
    return data;
  } catch (error) {
    let err = error as Error;
    return err;
  }
};

const updateTransaction = async (
  id: string,
  fieldName: keyof ITransaction,
  fieldValue: string | boolean
): Promise<IUpdateTransactionResponse | Error> => {
  try {
    const updatedField = { [fieldName]: fieldValue };
    const { data } = await Api.patch<IUpdateTransactionResponse>(
      `transactions/${id}`,
      updatedField
    );
    return data;
  } catch (error) {
    const err = error as Error;
    return err;
  }
};

const deleteTransaction = async (id: string) => {
  try {
    await Api.delete(`transactions/${id}`);
  } catch (error) {
    let err = error as Error;
    return err;
  }
};

export const TransactionServices = {
  getTransactions,
  updateTransaction,
  deleteTransaction,
  createNewTransaction,
};
