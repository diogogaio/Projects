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
import isequal from "lodash.isequal";
import debounce from "lodash.debounce";
import Grid from "@mui/material/Unstable_Grid2";
import { useTheme } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { capitalizeFirstLetter } from "../utils/formatText";
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

  const scrollIntoView = () => {
    const searchContainer = document.getElementById("search-container");
    searchContainer?.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
  };

  type TSearchForm = z.infer<typeof schema>;

  const schema = z.object({
    tag: z.string().nullable().optional(),
    description: z
      .string()
      .max(20, { message: "Limite de caracteres excedidos." })
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
    register,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TSearchForm>({
    resolver: zodResolver(schema),
  });

  const lastSubmittedData = useRef<TSearchForm | null>(null);

  const onSubmit: SubmitHandler<TSearchForm> = (data) => {
    if (errors.root) clearErrors();

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
    const filteredData = Object.fromEntries(
      Object.entries(data)
        .filter(([_, value]) => Boolean(value))
        .map(([key, value]) => [transformKey(key), value])
    );
    const isEmpty = Object.keys(filteredData).length === 0;

    if (isEmpty) {
      return alert("Busca vazia.");
    }

    console.log("DATA: ", data);

    // if (isequal(data, lastSubmittedData.current)) {
    //   alert("Busca repetida, altere os parâmetros e tente novamente.");
    //   return; // Prevent duplicate submission
    // }

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
    alert(`Favor conferir os dados enviados`);
    console.log("Invalid search fields:", error);
  };

  //this is submitted imediately but doesnt submit
  const debouncedSubmit = debounce(
    () => {
      console.log("here");
      return handleSubmit(onSubmit, invalidFieldsError);
    },
    1500,
    { leading: true, trailing: false }
  );
  //This works but nee to be submited imediately
  // const debouncedSubmit = debounce(
  //   handleSubmit(onSubmit, invalidFieldsError),
  //   1500,
  //   { leading: true, trailing: false }
  // );

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    debouncedSubmit();
  };

  const cleanSearchFields = () => {
    reset();
    setStartDate(undefined);
    setEndDate(undefined);
    scrollIntoView();
  };

  return (
    <>
      {App.loading && (
        <LinearProgress color="secondary" sx={{ width: "100%" }} />
      )}
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
        onSubmit={handleFormSubmit}
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
              error={!!errors.description}
              {...register("description")}
              label="Filtrar por descrição:"
              id="Filtro descrição da transação"
              disabled={App.loading || isSubmitting}
              defaultValue={searchParams.get("description")}
              helperText={errors.description?.message}
              inputProps={{
                maxLength: 21,
              }}
              // onChange={(event) => {
              //   const text = event.target.value;
              //   if (!text) {
              //     debounceSearchParams.cancel();
              //     clearDebounce("description");
              //   }

              //   if (text.length >= 2) {
              //     debounceSearchParams("description", text);
              //   }
              // }}
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
                    {...params}
                    inputRef={ref}
                    name="tag"
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
            <TextField
              fullWidth
              type="number"
              variant="filled"
              placeholder="1000,00"
              {...register("amount_gte")}
              label="Valores maiores que: "
              error={!!errors.amount_gte}
              helperText={errors.amount_gte?.message}
              disabled={App.loading || isSubmitting}
              defaultValue={searchParams.get("amount[gte]") || null}
              // onChange={(e) => {
              //   const value = e.target.value;

              //   if (!value) {
              //     debounceSearchParams.cancel();
              //     clearDebounce("amount[gte]");
              //     return;
              //   }

              //   const formattedValue = value.replace(",", ".");
              //   const numberValue = Number(parseFloat(formattedValue));

              //   // Ensure the value doesn't exceed the maximum allowed
              //   // if (numberValue > 9999999999) {
              //   //   // setError("Valor não permitido");
              //   //   alert("Valor acima do permitido.");
              //   //   return;
              //   // } /* else setError(""); */
              //   debounceSearchParams(
              //     "amount[gte]",
              //     String(numberValue.toFixed(2))
              //   );
              // }}
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
              fullWidth
              type="number"
              variant="filled"
              placeholder="1000,00"
              disabled={App.loading || isSubmitting}
              {...register("amount_lte")}
              label="Valores menores que: "
              error={!!errors.amount_lte}
              helperText={errors.amount_lte?.message}
              defaultValue={searchParams.get("amount[lte]") || null}
              // onChange={(e) => {
              //   const value = e.target.value;

              //   if (!value) {
              //     debounceSearchParams.cancel();
              //     clearDebounce("amount[lte]");
              //     return;
              //   }

              //   const formattedValue = value.replace(",", ".");
              //   const numberValue = Number(parseFloat(formattedValue));

              //   // Ensure the value doesn't exceed the maximum allowed
              //   if (numberValue > 9999999999) {
              //     // setError("Valor não permitido");
              //     alert("Valor acima do permitido.");
              //     return;
              //   } /* else setError(""); */
              //   debounceSearchParams(
              //     "amount[lte]",
              //     String(numberValue.toFixed(2))
              //   );
              // }}
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
              order: { md: 5, lg: 5 },
            }}
          >
            <Controller
              name="createdAt_gte"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="pt-br"
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
                  dateAdapter={AdapterDayjs}
                  adapterLocale="pt-br"
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
            <Controller
              name="transactionType"
              control={control}
              defaultValue={
                (searchParams.get("transactionType") as "income" | "outcome") ||
                null
              }
              render={({ field }) => (
                <RadioGroup sx={{ justifyContent: "center" }} {...field} row>
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
