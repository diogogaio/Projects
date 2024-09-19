import { lastDayOfMonth } from "date-fns";
import { createContext, useContext } from "react";
import { useState, useCallback, ReactElement, useMemo } from "react";

import {
  ITransaction,
  TransactionServices,
} from "../services/transaction/TransactionService";
import { useAppContext } from "./AppContext";
import { useAuthContext } from "./AuthContext";
import { useLocation } from "react-router-dom";
import { capitalizeFirstLetter } from "../utils/formatText";

let tag = "Todos Setores";
let listInfo = "Mês atual";
let amountSortBy: "asc" | "desc";
let dateSortBy: "asc" | "desc" = "asc";

interface ITransactionMethods {
  tag: string;
  count: number;
  listInfo: string;
  list: ITransaction[];
  openNewTransaction: boolean;
  sortByTypeIsChecked: boolean;
  transactionTags: (string | null)[];
  sortByTag: () => void;
  sortByDate: () => void;
  sortByType: () => void;
  sortByAmount: () => void;
  deleteById: (id: string) => Promise<void>;
  fetchMonthTransactions: () => Promise<void>;
  stopRecurrence: (id: string) => Promise<void>;
  filterTransactions: (query: string) => Promise<void>;
  setList: React.Dispatch<React.SetStateAction<ITransaction[]>>;
  setOpenNewTransaction: React.Dispatch<React.SetStateAction<boolean>>;
  calculateTotals: (type: "income" | "outcome" | "balance") => number;
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
  const [openNewTransaction, setOpenNewTransaction] = useState(false);
  const [sortByTypeIsChecked, setSortByTypeIsChecked] = useState(false);

  const location = useLocation();
  const searchUrl = location.search;

  const { Auth } = useAuthContext();
  const { App } = useAppContext();

  const transactionTags = useMemo(
    () =>
      [...(Auth.user?.transactionTags || [])].map((trans) =>
        capitalizeFirstLetter(trans)
      ),
    [Auth.user?.transactionTags]
  );

  const createNewTransaction = async (newTransaction: ITransaction) => {
    App.setLoading(true);

    // await new Promise((resolve) => setTimeout(resolve, 2000));
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

    Transaction.listInfo === "Mês atual"
      ? await Transaction.fetchMonthTransactions()
      : await Transaction.filterTransactions(searchUrl);

    setOpenNewTransaction(false);
    App.setAppAlert({ message: "Nova transação criada.", severity: "success" });
  };

  const calculateTotals = useCallback(
    (type: "income" | "outcome" | "balance") => {
      if (!!!list.length) return 0;

      const totalIncome = Transaction.list.reduce((sum, trans) => {
        return trans.transactionType === "income"
          ? sum + Number(trans.amount)
          : sum;
      }, 0);

      const totalOutcome = list.reduce((sum, trans) => {
        return trans.transactionType === "outcome"
          ? sum + Math.abs(Number(trans.amount)) // Use absolute value to sum outcomes as positive numbers
          : sum;
      }, 0);

      const balance = totalIncome - totalOutcome;

      switch (type) {
        case "income":
          return totalIncome;
        case "outcome":
          return totalOutcome;
        case "balance":
          return balance;
        default:
          return 0;
      }
    },
    [list]
  );

  const filterTransactions = async (query: string) => {
    if (!App.loading) App.setLoading(true);

    const response = await TransactionServices.getTransactions(query);

    if (response instanceof Error) {
      App.setLoading(false);
      alert(
        "Erro ao buscar transações: " + response.message || "Motivo Indefinido "
      );
      return;
    }

    const queryString = query.startsWith("?") ? query.slice(1) : query;

    // Convert the query string to an object
    const params = new URLSearchParams(queryString);
    const paramsObject = Object.fromEntries(params.entries());

    listInfo = "Busca personalizada";
    if (Object.keys(paramsObject).some((key) => key.startsWith("tag")))
      tag = paramsObject.tag;
    App.setLoading(false);

    setList(response.transactions);
    setCount(response.count);
  };

  const sortByDate = () => {
    if (sortByTypeIsChecked) setSortByTypeIsChecked(false);

    const sortedList = [...Transaction.list].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (dateSortBy === "asc") {
        return dateA - dateB; // Sort ascending
      } else {
        return dateB - dateA; // Sort descending
      }
    });

    dateSortBy = dateSortBy === "asc" ? "desc" : "asc"; // Toggle the sort order
    setList(sortedList);
  };

  const sortByAmount = () => {
    if (sortByTypeIsChecked) setSortByTypeIsChecked(false);

    const transactionsList = [...Transaction.list];
    const sortDesc = () => {
      amountSortBy = "desc";
      return transactionsList.sort((a, b) => b.amount - a.amount);
    };
    const sortAsc = () => {
      amountSortBy = "asc";
      return transactionsList.sort((a, b) => a.amount - b.amount);
    };

    const sortedList =
      !amountSortBy || amountSortBy === "asc" ? sortDesc() : sortAsc();

    setList(sortedList);
  };

  const sortByType = () => {
    if (sortByTypeIsChecked) {
      dateSortBy = "desc";
      return sortByDate();
    }

    const sortedTransactions = [...Transaction.list].sort((a, b) => {
      if (a.transactionType < b.transactionType) return -1;
      if (a.transactionType > b.transactionType) return 1;
      return 0;
    });
    setList(sortedTransactions);
    setSortByTypeIsChecked(true);
  };

  const sortByTag = () => {
    const sortedTransactions = [...Transaction.list].sort((a, b) => {
      if (a.tag.toLowerCase() < b.tag.toLowerCase()) return -1;
      if (a.tag.toLowerCase() > b.tag.toLowerCase()) return 1;
      return 0;
    });
    setList(sortedTransactions);
  };

  const fetchMonthTransactions = async () => {
    if (!App.loading) App.setLoading(true);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() returns month index (0-11), so add 1 for 1-12
    const firstDayOfMonth_YYYYMMDD = `${year}-${month}-01`;
    const lastDayOfMonth_DD = lastDayOfMonth(new Date()).getDate();
    const lastDayOfMonth_YYYYMMDD = `${year}-${month}-${lastDayOfMonth_DD}`;

    const response = await TransactionServices.getTransactions(
      `?createdAt[gte]=${firstDayOfMonth_YYYYMMDD}&createdAt[lte]=${lastDayOfMonth_YYYYMMDD}`
    );

    if (response instanceof Error) {
      alert("Erro ao buscar transações mensais: " + response.message);
      App.setLoading(false);
      return;
    }
    listInfo = "Mês atual";
    setCount(response.count);
    setList(response.transactions || []);
    App.setLoading(false);
  };

  const stopRecurrence = async (id: string) => {
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
  };

  const deleteById = async (id: string) => {
    if (window.confirm("Deseja realmente apagar esta transação?")) {
      App.setLoading(true);
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = await TransactionServices.deleteTransaction(id);

      if (result instanceof Error) {
        App.setLoading(false);
        alert("Erro ao deletar: " + result.message);
        return;
      }

      App.setLoading(false);
      setList((prev) => prev.filter((trans) => trans._id !== id));
      App.setAppAlert({ message: "Transação excluída.", severity: "success" });
    }
  };

  const Transaction = {
    tag,
    list,
    count,
    listInfo,
    transactionTags,
    openNewTransaction,
    sortByTypeIsChecked,
    setList,
    sortByTag,
    deleteById,
    sortByDate,
    sortByType,
    sortByAmount,
    stopRecurrence,
    calculateTotals,
    filterTransactions,
    createNewTransaction,
    setOpenNewTransaction,
    fetchMonthTransactions,
  };

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