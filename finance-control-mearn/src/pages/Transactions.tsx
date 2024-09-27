import {
  Stack,
  Button,
  Divider,
  Pagination,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import {
  useAppContext,
  useAuthContext,
  useTransactionContext,
} from "../shared/contexts";
import {
  Login,
  SignUp,
  ResetPassword,
  ChangePassword,
  NewTransaction,
  ForgotPassword,
} from "../shared/components/modals";
import {
  Charts,
  Totals,
  AppMenu,
  AppAlert,
  AppLayout,
  SearchFilters,
  TransactionsTable,
} from "../shared/components";
import { Environment } from "../shared/environment";

export function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [animateCharts, setAnimateCharts] = useState(true);

  const { Transaction } = useTransactionContext();

  const { Auth } = useAuthContext();
  const { App } = useAppContext();

  const theme = useTheme();
  const location = useLocation();
  const searchUrl = location.search;
  const userEmail = Auth?.userEmail;

  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const page = useMemo(
    () => Number(searchParams.get("page") || 1),
    [searchParams]
  );

  const perPage = useMemo(
    () => Number(searchParams.get("limit") || Environment.PER_PAGE_LISTING),
    [searchParams]
  );

  useEffect(() => {
    if (!searchUrl && userEmail) {
      Transaction.fetchMonthTransactions();
    }

    if (searchUrl && userEmail) {
      Transaction.filterTransactions(searchUrl);
    }
  }, [searchUrl, userEmail]);

  return (
    <AppLayout>
      <Totals />

      {smDown && <Divider sx={{ width: "100%" }} />}

      <Stack
        width={{ xs: "95%", md: "95%", lg: "85%", xl: "80%", xxl: "70%" }}
        alignItems="center"
        direction="column"
        spacing={3}
      >
        <Charts
          animateCharts={animateCharts}
          setAnimateCharts={setAnimateCharts}
        />
        <Stack
          direction="row"
          sx={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            color="secondary"
            variant="contained"
            disabled={App.loading}
            sx={{ alignSelf: "start" }}
            onClick={() => Transaction.setOpenNewTransaction(true)}
          >
            Nova Transação
          </Button>

          <AppMenu />
        </Stack>

        <SearchFilters />
      </Stack>
      <Stack
        spacing={2}
        direction="column"
        sx={{ alignItems: "center", width: "100%" }}
      >
        <Stack
          textAlign="center"
          spacing={{ xs: 1, md: 2 }}
          direction={{ xs: "column", sm: "row" }}
        >
          <Typography>{`Listando: ${Transaction.listInfo}`}</Typography>
          <Typography>{`Setor: ${Transaction.tag}`}</Typography>
        </Stack>

        <TransactionsTable />

        {Transaction.count > perPage && (
          <Pagination
            page={page}
            disabled={App.loading}
            size={smDown ? "small" : "medium"}
            count={Math.ceil((Transaction.count || 1) / perPage)}
            onChange={(_: React.ChangeEvent<unknown>, value: number) =>
              setSearchParams((prev) => {
                prev.set("page", String(value));
                return prev;
              })
            }
          />
        )}
      </Stack>
      <AppAlert />

      {/* Modals: */}
      <Login />
      <SignUp />
      <ResetPassword />
      <ForgotPassword />
      {userEmail && <NewTransaction />}
      <ChangePassword />
    </AppLayout>
  );
}
