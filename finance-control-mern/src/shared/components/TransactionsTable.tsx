import {
  Icon,
  Paper,
  Table,
  Stack,
  Tooltip,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  TableContainer,
  LinearProgress,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Environment } from "../environment";
import { SortTransaction } from "./SortTransactions";
import { capitalizeFirstLetter } from "../utils/formatText";
import { useAppContext, useTransactionContext } from "../contexts";
import { ITransaction } from "../services/transaction/TransactionService";

let dateSortBy: "ascendente" | "descendente" = "ascendente";
let amountSortBy: "descendente" | "ascendente" = "descendente";

export const TransactionsTable = () => {
  const [sortingBy, setSortingBy] = useState("date");

  const { App } = useAppContext();
  const { Transaction } = useTransactionContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get("sort");

  const sortBy = (value: string, order: "ascendente" | "descendente") => {
    const formattedValue = order === "descendente" ? `-${value}` : value;
    setSearchParams((prev) => {
      prev.delete("sort");
      prev.set("sort", formattedValue);
      return prev;
    });
  };
  const sortByDate = () => {
    sortBy("createdAt", dateSortBy);
    setSortingBy("date");
    dateSortBy = dateSortBy === "descendente" ? "ascendente" : "descendente";
  };

  const sortByAmount = () => {
    sortBy("amount", amountSortBy);
    setSortingBy("amount");
    amountSortBy =
      amountSortBy === "descendente" ? "ascendente" : "descendente";
  };

  const sortByType = () => {
    sortBy("transactionType", "ascendente");
    setSortingBy("transactionType");
  };

  const sortByTag = () => {
    sortBy("tag", "ascendente");
    setSortingBy("tag");
  };

  const sortByDescription = () => {
    sortBy("description", "ascendente");
    setSortingBy("description");
  };

  const isSortingByColor = (value: string) => {
    if (value === "date") {
      return value === sortingBy ? "inherit" : "lightGray";
    }

    return sort && value === sortingBy ? "inherit" : "lightGray";
  };

  const transactionRows = useCallback(() => {
    return Transaction.list.map((trans: ITransaction) => (
      <TableRow
        hover
        key={trans._id}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          <Typography noWrap>
            {capitalizeFirstLetter(trans.description)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography
            noWrap
            variant="body2"
            color={trans.transactionType === "income" ? "green" : "red"}
          >
            {trans.amount.toLocaleString("pt-br", {
              minimumFractionDigits: 2,
            })}
          </Typography>
        </TableCell>

        <TableCell align="left">
          <Typography noWrap variant="body2" color="GrayText">
            {capitalizeFirstLetter(trans.tag)}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography component="time" noWrap variant="body2" color="GrayText">
            {new Date(trans.createdAt).toLocaleString("pt-BR", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              timeZone: "UTC",
            })}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() =>
                trans._id
                  ? Transaction.deleteById(trans._id)
                  : alert("Falha ao excluir transação: _id ausente.")
              }
              size="small"
              disabled={App.loading}
            >
              <Icon color="error">delete_outlined</Icon>
            </IconButton>
            {trans.recurrent && (
              <IconButton
                id={trans.transactionId}
                onClick={(e) => {
                  const id = e.currentTarget.id;
                  Transaction.stopRecurrence(id);
                }}
                size="small"
                disabled={App.loading}
              >
                <Icon color="warning">sync_disabled</Icon>
              </IconButton>
            )}
          </Stack>
        </TableCell>
      </TableRow>
    ));
  }, [Transaction.list]);

  const tableRows = useMemo(() => transactionRows(), [Transaction.list]);

  if (!!!Transaction.list.length)
    return (
      <Typography variant="h6" align="center">
        Nenhuma transação encontrada.
      </Typography>
    );

  const effect = {
    cursor: "pointer",
    display: "inline-block",

    "&:hover": {
      textDecoration: "underline",
      opacity: "0.9",
    },
  };

  return (
    <>
      {App.loading && (
        <LinearProgress color="secondary" sx={{ width: "100%" }} />
      )}

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 20,
          borderRadius: 2,
          width: { xs: "100%", lg: "90%" },
          maxWidth: "1100px",
        }}
      >
        <Stack
          textAlign="center"
          direction="column"
          sx={{
            py: 1,
            width: "100%",
            fontStyle: "italic",
          }}
        >
          <Typography color={Environment.APP_MAIN_TEXT_COLOR} variant="h6">
            {Transaction.listInfo}
          </Typography>

          <Typography color="GrayText" variant="caption">
            {Transaction.tag}
          </Typography>
          <Divider variant="middle" />
        </Stack>

        <Table size="small" aria-label="tabela-transações">
          <TableHead>
            <TableRow>
              <TableCell>
                <Tooltip title="Organizar em Ordem Alfabética">
                  <Typography
                    sx={effect}
                    variant="body1"
                    fontWeight="bold"
                    onClick={sortByDescription}
                    color={Environment.APP_MAIN_TEXT_COLOR}
                  >
                    Descrição
                    <Icon sx={{ color: isSortingByColor("description") }}>
                      arrow_drop_down
                    </Icon>
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Organizar por valor">
                  <Typography
                    sx={effect}
                    role="button"
                    variant="body1"
                    fontWeight="bold"
                    onClick={sortByAmount}
                    color={Environment.APP_MAIN_TEXT_COLOR}
                  >
                    Valor
                    <Icon sx={{ color: isSortingByColor("amount") }}>
                      {amountSortBy === "descendente"
                        ? "arrow_drop_up"
                        : "arrow_drop_down"}
                    </Icon>
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell align="left" color="inherit">
                <Tooltip title="Organizar por setor">
                  <Typography
                    sx={effect}
                    role="button"
                    variant="body1"
                    fontWeight="bold"
                    onClick={sortByTag}
                    color={Environment.APP_MAIN_TEXT_COLOR}
                  >
                    Setor
                    <Icon sx={{ color: isSortingByColor("tag") }}>
                      arrow_drop_down
                    </Icon>
                  </Typography>
                </Tooltip>
              </TableCell>

              <TableCell align="right">
                <Tooltip title="Organizar por data">
                  <Typography
                    sx={effect}
                    role="button"
                    variant="body1"
                    fontWeight="bold"
                    onClick={sortByDate}
                    color={Environment.APP_MAIN_TEXT_COLOR}
                  >
                    Data
                    <Icon sx={{ color: isSortingByColor("date") }}>
                      {dateSortBy === "descendente"
                        ? "arrow_drop_up"
                        : "arrow_drop_down"}
                    </Icon>
                  </Typography>
                </Tooltip>
              </TableCell>

              <TableCell align="right">
                <SortTransaction
                  sortByTag={sortByTag}
                  sortByDate={sortByDate}
                  sortByType={sortByType}
                  sortByAmount={sortByAmount}
                  sortByDescription={sortByDescription}
                  dateSortBy={dateSortBy}
                  amountSortBy={amountSortBy}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{tableRows}</TableBody>
        </Table>
      </TableContainer>
      {App.loading && (
        <LinearProgress color="secondary" sx={{ width: "100%" }} />
      )}
    </>
  );
};
