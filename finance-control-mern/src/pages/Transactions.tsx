import {
  Stack,
  Button,
  Divider,
  Pagination,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import {
  useAppContext,
  useAuthContext,
  useTransactionContext,
} from "../shared/contexts";
import {
  WelcomeDialog,
  ChangePassword,
  NewTransaction,
  PatienceDialog,
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
import { useRequestTimer } from "../shared/utils/useRequestTimer";

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
  const { startRequestTimer, cancelRequestTimer } = useRequestTimer();

  const page = useMemo(
    () => Number(searchParams.get("page") || 1),
    [searchParams]
  );

  const perPage = useMemo(
    () => Number(searchParams.get("limit") || Environment.PER_PAGE_LISTING),
    [searchParams]
  );

  const filterTransactions = useCallback(async (url: string) => {
    startRequestTimer();
    await Transaction.filterTransactions(url);
    cancelRequestTimer();
  }, []);

  useEffect(() => {
    if (userEmail && !searchUrl) {
      //Sets the initial url state
      Transaction.fetchMonthTransactions();
    }

    if (searchUrl && userEmail) {
      filterTransactions(searchUrl);
    }
  }, [userEmail, searchUrl]);

  const handlePageChange = (value: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(value));
      return prev;
    });
  };

  return (
    <AppLayout>
      <Totals />

      {smDown && <Divider sx={{ width: "100%" }} />}

      <Stack
        spacing={3}
        maxWidth="1646px"
        direction="column"
        alignItems="center"
        width={{ xs: "100%", md: "100%", lg: "95%", xl: "85%", xxl: "40%" }}
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
        spacing={1.5}
        direction="column"
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TransactionsTable />

        {Transaction.count > perPage && (
          <Pagination
            page={page}
            disabled={App.loading}
            size={smDown ? "small" : "medium"}
            count={Math.ceil((Transaction.count || 1) / perPage)}
            onChange={(_: React.ChangeEvent<unknown>, value: number) =>
              handlePageChange(value)
            }
          />
        )}
      </Stack>
      <AppAlert />

      {/* Modals: */}
      <WelcomeDialog />
      {userEmail && <NewTransaction />}
      <ChangePassword />
      <PatienceDialog />
    </AppLayout>
  );
}
