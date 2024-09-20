import {
  Icon,
  Paper,
  Table,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  TableContainer,
  LinearProgress,
} from "@mui/material";
import { useCallback, useMemo } from "react";

import { SortTransaction } from "./SortTransactions";
import { capitalizeFirstLetter } from "../utils/formatText";
import { useAppContext, useTransactionContext } from "../contexts";
import { ITransaction } from "../services/transaction/TransactionService";

export const TransactionsTable = () => {
  const { App } = useAppContext();
  const { Transaction } = useTransactionContext();

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
        </TableCell>
      </TableRow>
    ));
  }, [Transaction.list]);

  const tableRows = useMemo(() => transactionRows(), [Transaction.list]);

  if (!!!Transaction.list.length)
    return (
      <Typography align="center">Nenhuma transação encontrada.</Typography>
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
        sx={{ maxWidth: "1100px", boxShadow: 20, borderRadius: 2 }}
      >
        <Table size="small" aria-label="tabela-transações">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography color="secondary" fontWeight="bold" variant="body1">
                  Descrição
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Organizar por valor">
                  <Typography
                    sx={effect}
                    role="button"
                    variant="body1"
                    fontWeight="bold"
                    color="secondary"
                    onClick={Transaction.sortByAmount}
                  >
                    Valor
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell align="left">
                <Tooltip title="Organizar por setor">
                  <Typography
                    sx={effect}
                    role="button"
                    variant="body1"
                    color="secondary"
                    fontWeight="bold"
                    onClick={Transaction.sortByTag}
                  >
                    Setor
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Organizar por data">
                  <Typography
                    sx={effect}
                    role="button"
                    variant="body1"
                    color="secondary"
                    fontWeight="bold"
                    onClick={Transaction.sortByDate}
                  >
                    Data
                  </Typography>
                </Tooltip>
              </TableCell>

              <TableCell align="right">
                <SortTransaction />
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
