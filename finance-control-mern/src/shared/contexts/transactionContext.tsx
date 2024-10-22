import { lastDayOfMonth } from "date-fns";
import { createContext, useCallback, useContext } from "react";
import { useState, ReactElement, useMemo } from "react";

import {
  ITransaction,
  ITransactionTotals,
  TransactionServices,
} from "../services/transaction/TransactionService";
import { useAppContext } from "./AppContext";
import { useAuthContext } from "./AuthContext";
import { useLocation, useSearchParams } from "react-router-dom";
import { capitalizeFirstLetter } from "../utils/formatText";

let tag = "Todos Setores";

interface ITransactionMethods {
  tag: string;
  count: number;
  list: ITransaction[];
  openNewTransaction: boolean;
  totals: ITransactionTotals | null;
  transactionTags: (string | null)[];
  listInfo: "Mês atual" | "Busca personalizada";
  setCount: React.Dispatch<React.SetStateAction<number>>;
  fetchMonthTransactions: () => void;
  deleteById: (id: string) => Promise<void>;
  stopRecurrence: (id: string) => Promise<void>;
  filterTransactions: (query: string) => Promise<void>;
  setList: React.Dispatch<React.SetStateAction<ITransaction[]>>;
  setListInfo: React.Dispatch<
    React.SetStateAction<"Mês atual" | "Busca personalizada">
  >;
  setOpenNewTransaction: React.Dispatch<React.SetStateAction<boolean>>;
  createNewTransaction: (NewTransaction: ITransaction) => Promise<void>;
}

interface ITransactionContextData {
  Transaction: ITransactionMethods;
}
interface ITransactionProviderProps {
  children: React.ReactNode;
}

export const TransactionContext = createContext({} as ITransactionContextData);

export const TransactionProvider = ({
  children,
}: ITransactionProviderProps): ReactElement => {
  //States:
  const [count, setCount] = useState(0);
  const [list, setList] = useState<ITransaction[]>([]);
  const [listInfo, setListInfo] = useState<"Mês atual" | "Busca personalizada">(
    "Mês atual"
  );
  const [totals, setTotals] = useState<ITransactionTotals | null>(null);
  const [openNewTransaction, setOpenNewTransaction] = useState(false);

  const location = useLocation();
  const searchUrl = location.search;
  const [searchParams, setSearchParams] = useSearchParams();

  const { Auth } = useAuthContext();
  const { App } = useAppContext();

  const transactionTags = useMemo(
    () =>
      [...(Auth.user?.transactionTags || [])].map((trans) =>
        capitalizeFirstLetter(trans)
      ),
    [Auth.user?.transactionTags]
  );

  const createNewTransaction = useCallback(
    async (newTransaction: ITransaction) => {
      App.setLoading(true);

      const result = await TransactionServices.createNewTransaction(
        newTransaction
      );

      if (result instanceof Error) {
        App.setLoading(false);
        alert(
          "Erro ao criar transação: " + result.message || "Motivo indefinido."
        );
        return;
      }

      listInfo === "Mês atual"
        ? Transaction.fetchMonthTransactions()
        : await Transaction.filterTransactions(searchUrl);

      setOpenNewTransaction(false);
      App.setAppAlert({
        message: "Nova transação criada.",
        severity: "success",
      });
    },
    [listInfo]
  );

  const fetchMonthTransactions = useCallback(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() returns month index (0-11), so add 1 for 1-12
    const firstDayOfMonth_YYYYMMDD = `${year}-${month}-01`;
    const lastDayOfMonth_DD = lastDayOfMonth(new Date()).getDate();
    const lastDayOfMonth_YYYYMMDD = `${year}-${month}-${lastDayOfMonth_DD}`;

    listInfo === "Busca personalizada"
      ? setListInfo("Mês atual")
      : console.log();

    tag = "Todos Setores";

    setSearchParams({
      "createdAt[gte]": firstDayOfMonth_YYYYMMDD,
      "createdAt[lte]": lastDayOfMonth_YYYYMMDD,
    });
  }, [setSearchParams]);

  const filterTransactions = useCallback(
    async (query: string) => {
      if (!App.loading) App.setLoading(true);

      const filteredTag = searchParams.get("tag");
      if (filteredTag) tag = capitalizeFirstLetter(filteredTag) as string;

      const response = await TransactionServices.getTransactions(query);

      if (response instanceof Error) {
        App.setLoading(false);
        alert(
          "Erro ao buscar transações: " + response.message ||
            "Motivo Indefinido "
        );
        return;
      }

      App.setLoading(false);

      setList(response.transactions);
      setCount(response.count);
      setTotals(response.totals);
    },
    [App.loading, searchParams]
  );

  const stopRecurrence = useCallback(
    async (id: string) => {
      if (window.confirm("Deseja cancelar recorrência desta transação?")) {
        App.setLoading(true);

        const response = await TransactionServices.updateTransaction(
          id,
          "recurrent",
          false
        );

        if (response instanceof Error) {
          App.setLoading(false);
          alert("Erro ao cancelar recorrência:");
          return;
        }

        if (response.acknowledged) {
          App.setLoading(false);
          setList((prev) =>
            prev.map((item) =>
              item.transactionId === id ? { ...item, recurrent: false } : item
            )
          );
          App.setAppAlert({
            message: "Recorrência cancelada",
            severity: "success",
          });
        }
      }
    },
    [App.loading]
  );

  const deleteById = useCallback(
    async (id: string) => {
      const isRecurrentAndRoot = list.find(
        (item) =>
          item._id === id && item.recurrent === true && item.clone === false
      );

      if (
        window.confirm(
          isRecurrentAndRoot
            ? "Esta transação é a matriz de transações recorrentes, isto cancelará a recorrência, deseja continuar?"
            : "Deseja realmente apagar esta transação?"
        )
      ) {
        App.setLoading(true);
        const result = await TransactionServices.deleteTransaction(id);

        if (result instanceof Error) {
          App.setLoading(false);
          alert("Erro ao deletar: " + result.message);
          return;
        }

        App.setLoading(false);
        setList((prev) => prev.filter((trans) => trans._id !== id));
        App.setAppAlert({
          message: "Transação excluída.",
          severity: "success",
        });
      }
    },
    [list]
  );

  const Transaction: ITransactionMethods = useMemo(
    () => ({
      tag,
      list,
      count,
      totals,
      listInfo,
      transactionTags,
      openNewTransaction,
      setList,
      setCount,
      deleteById,
      setListInfo,
      stopRecurrence,
      filterTransactions,
      createNewTransaction,
      setOpenNewTransaction,
      fetchMonthTransactions,
    }),
    [
      tag,
      list,
      count,
      totals,
      listInfo,
      transactionTags,
      openNewTransaction,
      setList,
      setCount,
      deleteById,
      setListInfo,
      stopRecurrence,
      filterTransactions,
      createNewTransaction,
      setOpenNewTransaction,
      fetchMonthTransactions,
    ]
  );

  return (
    <TransactionContext.Provider
      value={{
        Transaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => useContext(TransactionContext);
