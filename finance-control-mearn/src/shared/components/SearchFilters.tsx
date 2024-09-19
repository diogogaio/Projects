import {
  Radio,
  Button,
  Checkbox,
  TextField,
  RadioGroup,
  Autocomplete,
  useMediaQuery,
  LinearProgress,
  InputAdornment,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import dayjs from "dayjs";
import debounce from "lodash.debounce";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { useAppContext, useTransactionContext } from "../contexts";
import { capitalizeFirstLetter } from "../utils/formatText";

export const SearchFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.only("xs"));
  const [isExpanded, setIsExpanded] = useState(!xsDown);

  const navigate = useNavigate();

  const { App } = useAppContext();
  const { Transaction } = useTransactionContext();

  const searchParamsCount = searchParams.size;

  useEffect(() => {
    if (xsDown && isExpanded) {
      setIsExpanded(false);
    } else if (!xsDown && !isExpanded) {
      setIsExpanded(true);
    }
  }, [xsDown]);

  const startDate = useMemo(() => {
    const dateParam = searchParams.get("createdAt[gte]") || undefined;
    if (dateParam) {
      return dayjs(dateParam);
    }
    return undefined;
  }, [searchParams]);

  const endDate = useMemo(() => {
    const dateParam = searchParams.get("createdAt[lte]") || undefined;
    if (dateParam) {
      return dayjs(dateParam);
    }
    return undefined;
  }, [searchParams]);

  const startDateRef = useRef(startDate);
  const endDateRef = useRef(endDate);

  const scrollIntoView = () => {
    const searchContainer = document.getElementById("search-container");
    searchContainer?.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
  };

  const debounceSearchParams = useCallback(
    debounce(
      (name: string, value: string) => {
        setSearchParams(
          (prev) => {
            prev.set(name, value);
            return prev;
          },
          { replace: true }
        );
      },
      1500,
      { leading: false, trailing: true }
    ),
    []
  );

  const clearDebounce = useCallback(
    debounce(
      (name: string) => {
        setSearchParams((prev) => {
          prev.delete(name);
          return prev;
        });
        scrollIntoView();
      },
      500,
      { leading: false, trailing: true }
    ),
    []
  );

  return (
    <>
      {App.loading && (
        <LinearProgress color="secondary" sx={{ width: "100%" }} />
      )}
      <Grid
        container
        spacing={2}
        component="form"
        id="search-container"
        sx={{
          p: 2,
          boxShadow: 20,
          width: " 100%",
          borderRadius: 2,
          display: "flex",
          // border: "1px solid #283593",
          justifyContent: "center",
        }}
      >
        {/* Description */}
        {isExpanded && (
          <Grid
            xs={12}
            sm={6}
            md={4}
            lg={2}
            sx={{ textAlign: "center", order: { md: 0, lg: 0 } }}
          >
            <TextField
              rows={1}
              fullWidth
              name="description"
              disabled={App.loading}
              label="Filtrar por descrição:"
              id="Filtro descrição da transação"
              defaultValue={searchParams.get("description") || ""}
              inputProps={{
                maxLength: 10,
              }}
              onChange={(event) => {
                const text = event.target.value;
                if (!text) {
                  debounceSearchParams.cancel();
                  clearDebounce("description");
                }

                if (text.length >= 2) {
                  debounceSearchParams("description", text);
                }
              }}
            />
          </Grid>
        )}

        {/* Sector */}
        <Grid
          xs={12}
          sm={6}
          md={4}
          lg={2}
          sx={{ textAlign: "center", order: { md: 3, lg: 1 } }}
        >
          <Autocomplete
            autoComplete
            disablePortal
            openText="Abrir"
            closeText="Fechar"
            disabled={App.loading}
            noOptionsText="Sem opções"
            loadingText="Carregando..."
            value={capitalizeFirstLetter(searchParams.get("tag") || null)}
            onChange={(_, newValue) => {
              if (!newValue) {
                debounceSearchParams.cancel();
                clearDebounce("tag");
                return;
              }

              debounceSearchParams("tag", newValue.toLowerCase());
            }}
            options={
              Transaction.transactionTags &&
              Transaction.transactionTags.length > 0
                ? Transaction.transactionTags
                : ["geral"]
            }
            renderInput={(params) => (
              <TextField
                {...params}
                name="tag"
                //   disabled={serverLoading}
                label="Setor: "
              />
            )}
          />
        </Grid>

        {/* Amount[gte] */}
        {isExpanded && (
          <Grid
            xs={12}
            sm={6}
            md={4}
            lg={2}
            sx={{ textAlign: "center", order: { md: 1, lg: 2 } }}
          >
            <TextField
              required
              fullWidth
              type="number"
              variant="filled"
              name="amount[gte]"
              placeholder="1000,00"
              disabled={App.loading}
              label="Valores maiores que: "
              defaultValue={searchParams.get("amount[gte]") || null}
              onChange={(e) => {
                const value = e.target.value;

                if (!value) {
                  debounceSearchParams.cancel();
                  clearDebounce("amount[gte]");
                  return;
                }

                const formattedValue = value.replace(",", ".");
                const numberValue = Number(parseFloat(formattedValue));

                // Ensure the value doesn't exceed the maximum allowed
                if (numberValue > 9999999999) {
                  // setError("Valor não permitido");
                  alert("Valor acima do permitido.");
                  return;
                } /* else setError(""); */
                debounceSearchParams(
                  "amount[gte]",
                  String(numberValue.toFixed(2))
                );
              }}
              InputProps={{
                inputProps: { step: "0.01", min: "0", max: "10000000000" },
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              }}
            />
          </Grid>
        )}

        {/* Amount[lte] */}

        {isExpanded && (
          <Grid
            xs={12}
            sm={6}
            md={4}
            lg={2}
            sx={{ textAlign: "center", order: { md: 4, lg: 3 } }}
          >
            <TextField
              required
              fullWidth
              type="number"
              variant="filled"
              name="amount[lte]"
              // error={!!error}
              placeholder="1000,00"
              disabled={App.loading}
              label="Valores menores que: "
              // helperText={error ? error : ""}
              defaultValue={searchParams.get("amount[lte]") || null}
              onChange={(e) => {
                const value = e.target.value;

                if (!value) {
                  debounceSearchParams.cancel();
                  clearDebounce("amount[lte]");
                  return;
                }

                const formattedValue = value.replace(",", ".");
                const numberValue = Number(parseFloat(formattedValue));

                // Ensure the value doesn't exceed the maximum allowed
                if (numberValue > 9999999999) {
                  // setError("Valor não permitido");
                  alert("Valor acima do permitido.");
                  return;
                } /* else setError(""); */
                debounceSearchParams(
                  "amount[lte]",
                  String(numberValue.toFixed(2))
                );
              }}
              InputProps={{
                inputProps: { step: "0.01", min: "0", max: "10000000" },
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              }}
            />
          </Grid>
        )}

        {/* Start Date */}
        {isExpanded && (
          <Grid
            xs={12}
            sm={6}
            md={4}
            lg={2}
            sx={{
              textAlign: "center",
              order: { md: 2, lg: 4 },
            }}
          >
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="pt-br"
            >
              <DatePicker
                disableFuture
                label="De:"
                name="createdAt[gte]"
                disabled={App.loading}
                onError={() => alert("Verifique a data inserida.")}
                maxDate={
                  endDateRef
                    ? dayjs(endDateRef.current, "DD/MM/YYYY")
                    : undefined
                }
                value={startDateRef.current}
                onChange={(newValue) => {
                  if (newValue) {
                    startDateRef.current = newValue;
                    const formattedDate = newValue.format("YYYY-MM-DD");
                    debounceSearchParams("createdAt[gte]", formattedDate);
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
        )}

        {/* End Date */}
        {isExpanded && (
          <Grid
            xs={12}
            sm={6}
            md={4}
            lg={2}
            sx={{
              textAlign: "center",
              order: { md: 5, lg: 5 },
            }}
          >
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="pt-br"
            >
              <DatePicker
                label="Até:"
                name="createdAt[lte]"
                disabled={App.loading}
                onError={() => alert("Verifique a data inserida.")}
                minDate={
                  startDateRef
                    ? dayjs(startDateRef.current, "DD/MM/YYYY")
                    : undefined
                }
                value={endDateRef.current}
                onChange={(newValue) => {
                  if (newValue) {
                    endDateRef.current = newValue;
                    const formattedDate = newValue.format("YYYY-MM-DD");
                    debounceSearchParams("createdAt[lte]", formattedDate);
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
        )}

        {/* Transaction type */}
        {isExpanded && (
          <Grid
            // border="1px solid red"
            xs={12}
            sm={6}
            md={4}
            lg={4}
            sx={{ order: { md: 6, lg: 6 }, textAlign: "center" }}
          >
            <FormLabel id="seleção tipo de transação">
              Tipo de Transação:
            </FormLabel>
            <RadioGroup
              row
              name="transactionType"
              sx={{ justifyContent: "center" }}
              defaultValue={searchParams.get("transactionType") || undefined}
              onChange={(e) =>
                debounceSearchParams("transactionType", e.target.value)
              }
              aria-labelledby="seleção tipo de transação"
            >
              <FormControlLabel
                value="income"
                label="Entrada"
                control={<Radio />}
                disabled={App.loading}
              />
              <FormControlLabel
                value="outcome"
                label="Saída"
                control={<Radio />}
                disabled={App.loading}
              />
            </RadioGroup>
          </Grid>
        )}

        {/* Sort by Transaction type */}
        <Grid
          // border="1px solid red"
          xs={12}
          sm={6}
          md={4}
          lg={4}
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            order: { md: 8, lg: 7 },
          }}
        >
          <FormLabel id="seleção tipo de transação">Agrupar por:</FormLabel>
          <FormControlLabel
            label="tipo de transação"
            control={
              <Checkbox
                name="sort"
                disabled={App.loading}
                onChange={Transaction.sortByType}
                checked={Transaction.sortByTypeIsChecked}
              />
            }
          />
        </Grid>

        {/* Clear filters */}
        {(isExpanded || searchParamsCount > 0) && (
          <Grid
            xs={12}
            sm={12}
            md={4}
            lg={4}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              order: { md: 8, lg: 8 },
            }}
          >
            <Button
              color="secondary"
              variant="contained"
              disabled={!searchParamsCount}
              onClick={async () => {
                navigate("/");
                await Transaction.fetchMonthTransactions();
                scrollIntoView();
              }}
            >
              Limpar Busca
            </Button>
          </Grid>
        )}

        {xsDown && (
          <Grid
            xs={12}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              disabled={App.loading}
              onClick={() => setIsExpanded(!isExpanded)}
              color="secondary"
            >
              {" "}
              {isExpanded ? "Menos Filtros" : "Mais filtros"}
            </Button>
          </Grid>
        )}
      </Grid>
    </>
  );
};
