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
let listInfo = "Mês atual";
let isCustomSearch = false;
// let amountSortBy: "asc" | "desc";
// let dateSortBy: "asc" | "desc" = "asc";
const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() returns month index (0-11), so add 1 for 1-12
const firstDayOfMonth_YYYYMMDD = `${year}-${month}-01`;
const lastDayOfMonth_DD = lastDayOfMonth(new Date()).getDate();
const lastDayOfMonth_YYYYMMDD = `${year}-${month}-${lastDayOfMonth_DD}`;

interface ITransactionMethods {
  tag: string;
  count: number;
  listInfo: string;
  list: ITransaction[];
  isCustomSearch: boolean;
  openNewTransaction: boolean;
  // sortByTypeIsChecked: boolean;
  totals: ITransactionTotals | null;
  transactionTags: (string | null)[];
  setCount: React.Dispatch<React.SetStateAction<number>>;
  // sortByTag: () => void;
  // sortByDate: () => void;
  // sortByType: () => void;
  // sortByAmount: () => void;
  fetchMonthTransactions: () => void;
  deleteById: (id: string) => Promise<void>;
  stopRecurrence: (id: string) => Promise<void>;
  filterTransactions: (query: string) => Promise<void>;
  setList: React.Dispatch<React.SetStateAction<ITransaction[]>>;
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
  const [totals, setTotals] = useState<ITransactionTotals | null>(null);
  const [openNewTransaction, setOpenNewTransaction] = useState(false);
  // const [sortByTypeIsChecked, setSortByTypeIsChecked] = useState(false);

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
    console.log("fetching month transactions...");
    listInfo = "Mês atual";
    isCustomSearch = false;

    setSearchParams({
      "createdAt[gte]": firstDayOfMonth_YYYYMMDD,
      "createdAt[lte]": lastDayOfMonth_YYYYMMDD,
    });
  }, [setSearchParams]);

  const filterTransactions = useCallback(
    async (query: string) => {
      if (!App.loading) App.setLoading(true);
      listInfo = "Busca personalizada";
      isCustomSearch = true;
      console.log("FILTER TRANSACTIONS");

      const filteredTag = searchParams.get("tag");
      if (filteredTag) tag = filteredTag;

      const createdAt_gte = searchParams.get("createdAt[gte]");
      const createdAt_lte = searchParams.get("createdAt[lte]");

      if (searchParams.size === 2 && createdAt_gte && createdAt_lte) {
        if (
          createdAt_gte === firstDayOfMonth_YYYYMMDD &&
          createdAt_lte === lastDayOfMonth_YYYYMMDD
        ) {
          listInfo = " Mês Atual";
          isCustomSearch = false;
        }
      }

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
    [
      App.loading,
      searchParams,
      firstDayOfMonth_YYYYMMDD,
      lastDayOfMonth_YYYYMMDD,
    ]
  );

  // const sortByDate = () => {
  //   if (sortByTypeIsChecked) setSortByTypeIsChecked(false);

  //   const sortedList = [...Transaction.list].sort((a, b) => {
  //     const dateA = new Date(a.createdAt).getTime();
  //     const dateB = new Date(b.createdAt).getTime();

  //     if (dateSortBy === "asc") {
  //       return dateA - dateB; // Sort ascending
  //     } else {
  //       return dateB - dateA; // Sort descending
  //     }
  //   });

  //   dateSortBy = dateSortBy === "asc" ? "desc" : "asc"; // Toggle the sort order
  //   setList(sortedList);
  // };

  // const sortByAmount = () => {
  //   if (sortByTypeIsChecked) setSortByTypeIsChecked(false);

  //   const transactionsList = [...Transaction.list];
  //   const sortDesc = () => {
  //     amountSortBy = "desc";
  //     return transactionsList.sort((a, b) => b.amount - a.amount);
  //   };
  //   const sortAsc = () => {
  //     amountSortBy = "asc";
  //     return transactionsList.sort((a, b) => a.amount - b.amount);
  //   };

  //   const sortedList =
  //     !amountSortBy || amountSortBy === "asc" ? sortDesc() : sortAsc();

  //   setList(sortedList);
  // };

  // const sortByType = () => {
  //   if (sortByTypeIsChecked) {
  //     dateSortBy = "desc";
  //     return sortByDate();
  //   }

  //   const sortedTransactions = [...Transaction.list].sort((a, b) => {
  //     if (a.transactionType < b.transactionType) return -1;
  //     if (a.transactionType > b.transactionType) return 1;
  //     return 0;
  //   });
  //   setList(sortedTransactions);
  //   setSortByTypeIsChecked(true);
  // };

  // const sortByTag = () => {
  //   const sortedTransactions = [...Transaction.list].sort((a, b) => {
  //     if (a.tag.toLowerCase() < b.tag.toLowerCase()) return -1;
  //     if (a.tag.toLowerCase() > b.tag.toLowerCase()) return 1;
  //     return 0;
  //   });
  //   setList(sortedTransactions);
  // };

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
      isCustomSearch,
      transactionTags,
      openNewTransaction,
      setList,
      setCount,
      deleteById,
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
      isCustomSearch,
      transactionTags,
      openNewTransaction,
      setList,
      setCount,
      deleteById,
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
