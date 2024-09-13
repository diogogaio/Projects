import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button, TextField, Autocomplete } from "@mui/material";

import Grid from "@mui/material/Unstable_Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { SetURLSearchParams, useNavigate } from "react-router-dom";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { useDebounce } from "../hooks";
import { Environment } from "../environment";
import dbCards from "../../assets/CardsDatabase";
import { useServerContext, useThemeContext } from "../contexts";

type TSearchFiltersProps = {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
};

export function SearchFilters({
  searchParams,
  setSearchParams,
}: TSearchFiltersProps) {
  const navigate = useNavigate();
  const { AppThemes } = useThemeContext();

  const search = useMemo(() => {
    return searchParams.get("search") || "";
  }, [searchParams]);

  const cardSearch = useMemo(() => {
    return searchParams.get("cardSearch") || "";
  }, [searchParams]);

  const startDate = useMemo(() => {
    return searchParams.get("startDate");
  }, [searchParams]);

  const endDate = useMemo(() => {
    return searchParams.get("endDate");
  }, [searchParams]);

  const [searchTerm, setSearchTerm] = useState(search || "");
  const { serverLoading } = useServerContext();
  const { debounce } = useDebounce(300);

  const cardNames = dbCards.map((card) => card.nome);

  return (
    <Grid
      container
      spacing={1}
      sx={{
        p: 2,
        borderRadius: 2,
        display: "flex",
        justifyContent: "center",
        width: { xs: "95%", md: "80%" },
        boxShadow: AppThemes.themeShadows,
      }}
    >
      <Grid xs={12} sm={7} md={8} lg={8} xl={4} sx={{ width: "100%" }}>
        <TextField
          fullWidth
          value={searchTerm}
          disabled={serverLoading}
          label="Filtrar por nome:"
          onChange={(event) => {
            const text = event.target.value;
            setSearchTerm(text);
            if (text.length >= 2 || !text) {
              debounce(() =>
                setSearchParams((prev) => {
                  return {
                    ...prev,
                    search: text,
                    page: "1",
                    startDate: startDate || "",
                    endDate: endDate || "",
                    cardSearch: cardSearch || "",
                  };
                })
              );
            }
          }}
          id="outlined-multiline-static"
          rows={1}
          inputProps={{
            maxLength: 10,
          }}
        />
      </Grid>

      <Grid xs={12} sm={5} md={4} lg={4} xl={3} sx={{}}>
        <Autocomplete
          autoComplete
          disablePortal
          openText="Abrir"
          closeText="Fechar"
          options={cardNames}
          disabled={serverLoading}
          noOptionsText="Sem opções"
          loadingText="Carregando..."
          value={cardSearch || null}
          onChange={(_, newValue) => {
            setSearchParams((prev) => {
              return {
                ...prev,
                page: "1",
                search: search,
                endDate: endDate || "",
                startDate: startDate || "",
                cardSearch: newValue || "",
              };
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              disabled={serverLoading}
              label="Filtrar por carta: "
            />
          )}
        />
      </Grid>

      {/* DATE TOP */}

      <Grid
        xs={12}
        sm={6}
        xl={2}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker
            disableFuture
            label="De:"
            name="startDate"
            disabled={serverLoading}
            onError={() => alert("Verifique a data inserida.")}
            maxDate={endDate ? new Date(endDate) : undefined}
            value={startDate ? new Date(startDate) : null}
            onChange={(newValue) => {
              setSearchParams((prev) => {
                return {
                  ...prev,
                  page: "1",
                  search: search,
                  endDate: endDate || "",
                  cardSearch: cardSearch || "",
                  startDate: newValue?.toString() || "",
                };
              });
            }}
          />
        </LocalizationProvider>
      </Grid>
      <Grid
        xs={12}
        sm={6}
        xl={2}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker
            disableFuture
            label="Até:"
            name="endDate"
            disabled={serverLoading}
            onError={() => alert("Verifique a data inserida.")}
            minDate={startDate ? new Date(startDate) : undefined}
            value={endDate ? new Date(endDate) : null}
            onChange={(newValue) => {
              setSearchParams((prev) => {
                return {
                  ...prev,
                  search: search,
                  page: "1",
                  startDate: startDate || "",
                  endDate: newValue?.toString() || "",
                  cardSearch: cardSearch || "",
                };
              });
            }}
          />
        </LocalizationProvider>
      </Grid>
      {/* DATE BOTTOM */}

      <Grid
        xs={12}
        xl={2}
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          disabled={
            serverLoading || (!search && !cardSearch && !startDate && !endDate)
          }
          onClick={() => {
            setSearchTerm("");
            navigate("/saved-readings-list");
          }}
          color={Environment.APP_MAIN_TEXT_COLOR}
        >
          {" "}
          Limpar Busca
        </Button>
      </Grid>
    </Grid>
  );
}
