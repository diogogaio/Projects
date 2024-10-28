import {
  Radio,
  Stack,
  Button,
  TextField,
  FormLabel,
  RadioGroup,
  Autocomplete,
  useMediaQuery,
  LinearProgress,
  InputAdornment,
  FormControlLabel,
} from "@mui/material";
import { z } from "zod";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import isequal from "lodash.isequal";
import Grid from "@mui/material/Unstable_Grid2";
import { useTheme } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { useAppContext, useTransactionContext } from "../contexts";

export const SearchFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.only("xs"));
  const [isExpanded, setIsExpanded] = useState(!xsDown);

  const { App } = useAppContext();
  const { Transaction } = useTransactionContext();

  useEffect(() => {
    if (xsDown && isExpanded) {
      setIsExpanded(false);
    } else if (!xsDown && !isExpanded) {
      setIsExpanded(true);
    }
  }, [xsDown]);

  // For calculating date picker's max and min values only:
  const [startDate, setStartDate] = useState<dayjs.Dayjs | undefined>(
    dayjs(undefined)
  );
  const [endDate, setEndDate] = useState<dayjs.Dayjs | undefined>(
    dayjs(undefined)
  );

  type TSearchForm = z.infer<typeof schema>;

  const schema = z.object({
    tag: z
      .string()
      .max(20, { message: "Máximo de 20 caracteres" })
      .regex(/^[^\[\]]*$/, "Colchetes não são permitidos.")
      .transform((value) => value.toLocaleLowerCase())
      .nullable()
      .optional(),
    description: z
      .string()
      .max(20, { message: "Limite de caracteres excedidos." })
      .regex(/^[^\[\]]*$/, "Colchetes não são permitidos.")
      .nullable()
      .optional(),
    amount_gte: z
      .string()
      .max(10, { message: "Limite de caracteres excedidos." })
      .nullable()
      .optional(),
    amount_lte: z
      .string()
      .max(10, { message: "Limite de caracteres excedidos." })
      .nullable()
      .optional(),
    createdAt_gte: z.string().nullable().optional(),
    createdAt_lte: z.string().nullable().optional(),
    transactionType: z.enum(["income", "outcome"]).nullable().optional(),
  });

  const {
    reset,
    watch,
    control,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TSearchForm>({
    resolver: zodResolver(schema),
  });

  const lastSubmittedData = useRef<TSearchForm | null>(null);

  const onSubmit: SubmitHandler<TSearchForm> = (data) => {
    clearErrors();

    // Helper function to transform keys like"amount_gte" into "amount[gte]"
    const transformKey = (key: string) => {
      const parts = key.split("_");
      if (parts.length > 1) {
        const lastPart = parts.pop();
        return `${parts.join("_")}[${lastPart}]`;
      }
      return key;
    };

    // Remove empty values and add brackets to properly build search string
    let filteredData = Object.fromEntries(
      Object.entries(data)
        .filter(([_, value]) => Boolean(value))
        .map(([key, value]) => [transformKey(key), value])
    );
    const isEmpty = Object.keys(filteredData).length === 0;

    if (isEmpty) {
      return alert("Busca vazia.");
    }

    if (isequal(data, lastSubmittedData.current)) {
      alert("Busca repetida, altere os parâmetros e tente novamente.");
      return;
    }

    const sort = searchParams.get("sort");
    const limit = searchParams.get("limit");

    if (sort || limit) {
      sort ? (filteredData.sort = sort) : console.log();
      limit ? (filteredData.limit = limit) : console.log();
    }

    lastSubmittedData.current = data;

    setSearchParams(
      new URLSearchParams(filteredData as Record<string, string>),
      { replace: true }
    );
  };

  const [hasFormValues, setHasFormValues] = useState(false);

  const formValues = watch();

  // Check if any value is present in the form
  useEffect(() => {
    const hasValues = Object.values(formValues).some((value) => Boolean(value));

    setHasFormValues(hasValues);
  }, [formValues]);

  const invalidFieldsError = (error: any) => {
    console.log("Invalid search fields:", error);
  };

  const cleanSearchFields = () => {
    reset();
    setStartDate(undefined);
    setEndDate(undefined);
    if (lastSubmittedData.current) Transaction.fetchMonthTransactions();
    lastSubmittedData.current = null;
  };

  return (
    <>
      <Grid
        sx={{
          p: 2,
          boxShadow: 20,
          width: " 100%",
          borderRadius: 2,
          display: "flex",
          justifyContent: "center",
        }}
        container
        noValidate
        spacing={2}
        component="form"
        id="search-container"
        onSubmit={handleSubmit(onSubmit, invalidFieldsError)}
      >
        {App.loading && (
          <LinearProgress color="secondary" sx={{ width: "100%" }} />
        )}
        {/* Description */}
        {isExpanded && (
          <Grid
            xs={12}
            sm={6}
            md={4}
            lg={2}
            sx={{ textAlign: "center", order: { md: 0, lg: 0 } }}
          >
            <Controller
              name="description"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  rows={1}
                  fullWidth
                  value={value || ""}
                  error={!!errors.description}
                  label="Filtrar por descrição:"
                  id="Filtro descrição da transação"
                  disabled={App.loading || isSubmitting}
                  helperText={errors.description?.message}
                  onChange={(e) => onChange(e.target.value)}
                  inputProps={{
                    maxLength: 21,
                  }}
                />
              )}
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
          <Controller
            name="tag"
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Autocomplete
                autoComplete
                disablePortal
                openText="Abrir"
                closeText="Fechar"
                noOptionsText="Sem opções"
                loadingText="Carregando..."
                disabled={App.loading || isSubmitting}
                options={
                  Transaction.transactionTags?.length > 0
                    ? Transaction.transactionTags
                    : ["geral"]
                }
                value={value || null}
                onChange={(_, selectedValue) => onChange(selectedValue)}
                renderInput={(params) => (
                  <TextField
                    name="tag"
                    {...params}
                    inputRef={ref}
                    label="Setor:"
                  />
                )}
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
            <Controller
              name="amount_gte"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  fullWidth
                  type="number"
                  variant="filled"
                  value={value || ""}
                  placeholder="1000,00"
                  error={!!errors.amount_gte}
                  label="Valores maiores que: "
                  helperText={errors.amount_gte?.message}
                  disabled={App.loading || isSubmitting}
                  onChange={(e) => onChange(e.target.value)}
                  InputProps={{
                    inputProps: { step: "0.01", min: "0", max: "10000000000" },
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                  }}
                />
              )}
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
            <Controller
              name="amount_lte"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  fullWidth
                  type="number"
                  variant="filled"
                  value={value || ""}
                  placeholder="1000,00"
                  error={!!errors.amount_lte}
                  label="Valores menores que: "
                  disabled={App.loading || isSubmitting}
                  onChange={(e) => onChange(e.target.value)}
                  helperText={errors.amount_lte?.message}
                  InputProps={{
                    inputProps: { step: "0.01", min: "0", max: "10000000" },
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                  }}
                />
              )}
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
              order: { md: 5, lg: 5 },
            }}
          >
            <Controller
              name="createdAt_gte"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <LocalizationProvider
                  adapterLocale="pt-br"
                  dateAdapter={AdapterDayjs}
                >
                  <DatePicker
                    label="De:"
                    disabled={App.loading}
                    onError={() => alert("Verifique a data inserida.")}
                    maxDate={endDate}
                    inputRef={ref} // Pass ref to the input
                    value={value ? dayjs(value) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setStartDate(newValue);
                        const formattedDate = newValue.format("YYYY-MM-DD");
                        onChange(formattedDate); // Update Controller's
                      }
                    }}
                  />
                </LocalizationProvider>
              )}
            />
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
            <Controller
              name="createdAt_lte"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <LocalizationProvider
                  adapterLocale="pt-br"
                  dateAdapter={AdapterDayjs}
                >
                  <DatePicker
                    label="Até:"
                    disabled={App.loading}
                    onError={() => alert("Verifique a data inserida.")}
                    minDate={startDate}
                    inputRef={ref} // Pass ref to the input
                    value={value ? dayjs(value) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setEndDate(newValue);
                        const formattedDate = newValue.format("YYYY-MM-DD");
                        onChange(formattedDate); // Update Controller's
                      }
                    }}
                  />
                </LocalizationProvider>
              )}
            />
          </Grid>
        )}

        {/* Transaction type */}
        {isExpanded && (
          <Grid
            xs={12}
            sm={6}
            md={4}
            lg={4}
            sx={{ order: { md: 6, lg: 6 }, textAlign: "center" }}
          >
            <FormLabel id="seleção tipo de transação">
              Tipo de Transação:
            </FormLabel>
            <Controller
              name="transactionType"
              control={control}
              render={({ field: { onChange, value } }) => (
                <RadioGroup
                  row
                  value={value || null}
                  sx={{ justifyContent: "center" }}
                  onChange={(event) => {
                    const value = event.target.value;
                    onChange(value);
                  }}
                >
                  <FormControlLabel
                    value="income"
                    control={<Radio />}
                    label="Entrada"
                  />
                  <FormControlLabel
                    value="outcome"
                    control={<Radio />}
                    label="Saída"
                  />
                </RadioGroup>
              )}
            />
          </Grid>
        )}

        {/* Submit and clean button*/}
        <Grid
          xs={6}
          sm={6}
          md={4}
          lg={4}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            order: { md: 8, lg: 7 },
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              color="secondary"
              variant="contained"
              disabled={!hasFormValues || App.loading || isSubmitting}
            >
              Buscar
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              onClick={cleanSearchFields}
              disabled={!hasFormValues || isSubmitting || App.loading}
            >
              Limpar
            </Button>
          </Stack>
        </Grid>

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
