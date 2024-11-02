import {
  Box,
  Link,
  Icon,
  Paper,
  Stack,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Pagination,
  IconButton,
  Typography,
  useMediaQuery,
  TableContainer,
  LinearProgress,
} from "@mui/material";
import { fromUnixTime } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  useThemeContext,
  useGlobalContext,
  useServerContext,
} from "../shared/contexts";
//@ts-ignore
import Localbase from "localbase";
import { TCardInfo } from "../shared/types";
import { Environment } from "../shared/environment";
import dbCards, { exempleReading } from "../assets/CardsDatabase";
import { AppContainer, AppMainContainer } from "../shared/layouts";
import { SearchFilters, SnackbarAlert } from "../shared/components";

export const SavedReadingList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const {
    Reading,
    readingNotes,
    setReadingNotes,
    readingTableCards,
    scrollToElementId,
    setReadingTableCards,
    setScrollToElementId,
    setReadingTableColumns,
  } = useGlobalContext();
  const { AppThemes } = useThemeContext();
  const { userUEC, savedReadings, serverLoading, userServerTag } =
    useServerContext();

  const navigate = useNavigate();
  const { readingId } = useParams();
  const smDOwn = useMediaQuery(AppThemes.theme.breakpoints.down("sm"));
  const perPage = Environment.MAX_READINGS_LISTING; // Number of items per page

  const page = useMemo(() => {
    return Number(searchParams.get("page") || "1");
  }, [searchParams]);

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

  useEffect(() => {
    const searchParams = location.state?.searchParams || {};

    if (!!!Object.entries(searchParams).length) {
      return;
    }

    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([, value]) => Boolean(value))
    );

    setSearchParams(filteredParams as Record<string, string>);
  }, [location.state]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    const tableHead = window.document.querySelector("thead");
    tableHead?.scrollIntoView({ behavior: "smooth" });

    setSearchParams((prev) => {
      prev.set("page", String(value));
      return prev;
    });
  };

  const sortByDate = () => {
    let filteredList = savedReadings;
    const defaultStartDate = new Date(1986, 3, 10).getTime() / 1000;
    const defaultEndDate = Date.now();

    filteredList = filteredList?.sort((date1, date2) => {
      const convertDate1 = date1.timestamp.seconds;
      const convertDate2 = date2.timestamp.seconds;
      return convertDate2 - convertDate1;
    });

    if (startDate || endDate) {
      const startTimestamp =
        new Date(startDate || defaultStartDate).getTime() / 1000;
      const endTimestamp = new Date(endDate || defaultEndDate).getTime() / 1000;

      filteredList = filteredList?.filter((item) => {
        const itemTimestamp = item.timestamp.seconds;
        return itemTimestamp <= endTimestamp && itemTimestamp >= startTimestamp;
      });
    }

    return filteredList;
  };

  let sortedList = sortByDate();

  if (search) {
    sortedList = sortedList?.filter((reading) =>
      reading.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (cardSearch) {
    sortedList = sortedList?.filter((reading) =>
      reading.reading.find((card) => {
        let updatedCardName = card.nome;
        if (
          cardSearch === "Pessoa Intermediária Homem" &&
          card.nome === "Pessoa Intermediária" &&
          card.numero === "24"
        )
          updatedCardName = "Pessoa Intermediária Homem";
        if (
          cardSearch === "Pessoa Intermediária Mulher" &&
          card.nome === "Pessoa Intermediária" &&
          card.numero === "25"
        )
          updatedCardName = "Pessoa Intermediária Mulher";

        return cardSearch === updatedCardName;
      })
    );
  }

  const goToSelectedReading = async (
    id: string,
    reading: TCardInfo[],
    readingColumns?: number
  ) => {
    if (readingTableCards && readingId !== "exemple-reading") {
      if (
        window.confirm(
          "Existem cartas na mesa, deseja realmente abrir outra tiragem?"
        )
      ) {
      } else return;
    }

    try {
      setLoading(true);
      window.scrollTo(0, 0);
      const arrangedCards = await Promise.all(
        reading.map((card) => {
          let updatedCardName: string;
          if (card.nome === "Pessoa Intermediária") {
            // Fixing old database card names with updated names
            updatedCardName =
              card.numero === "24"
                ? "Pessoa Intermediária Homem"
                : "Pessoa Intermediária Mulher";
          } else updatedCardName = card.nome;

          let isEditedCard = userUEC?.find(
            (editedCard) => editedCard.nome === updatedCardName
          );
          let defaultCard = dbCards.find(
            (dbCard) => dbCard.nome === updatedCardName
          );

          if (isEditedCard) {
            isEditedCard = {
              ...isEditedCard,
              id: card.id,
              comments: card.comments || "",
              invertida: card.invertida || false,
              markedText: card.markedText || "",
              markedColor: card.markedColor || "",
            };
          }

          if (defaultCard) {
            defaultCard = {
              ...defaultCard,
              id: card.id,
              comments: card.comments || "",
              invertida: card.invertida || false,
              markedText: card.markedText || "",
              markedColor: card.markedColor || "",
            };
          }

          return isEditedCard ? isEditedCard : defaultCard ? defaultCard : card;
        })
      );

      if (scrollToElementId) setScrollToElementId(undefined);
      setReadingTableCards(arrangedCards);
      if (readingNotes) setReadingNotes(undefined);
      if (readingColumns) setReadingTableColumns(readingColumns);
      setTimeout(() => {
        setLoading(false);
        navigate(`/readings-table/${id}`, {
          state: {
            searchParams: {
              search,
              endDate,
              startDate,
              cardSearch,
              page,
            },
          },
        });
      }, 500);
    } catch (error) {
      alert("Erro ao processar.");
      console.error(error);
      setLoading(false);
    }
  };

  const listTable = useCallback(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    const paginatedList = sortedList?.slice(startIndex, endIndex);

    const listContent = paginatedList?.map((savedReading) => {
      let { id, title, reading, timestamp, readingColumns } = savedReading;

      const convertedTimestamp = fromUnixTime(timestamp.seconds);

      return (
        <TableRow
          hover
          key={id}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell
            onClick={() => {
              goToSelectedReading(id, reading, readingColumns);
            }}
            scope="row"
            align="left"
            component="th"
          >
            <Stack direction="row" spacing={1}>
              <Link
                fontSize="1rem"
                textAlign="left"
                component="button"
                underline="hover"
              >
                {title}
              </Link>
            </Stack>
          </TableCell>
          <TableCell align="center">
            {<time>{convertedTimestamp.toLocaleString("pt-BR")}</time>}
          </TableCell>
          <TableCell align="center">{reading.length}</TableCell>
          <TableCell align="center">
            <IconButton
              onClick={() => Reading.deleteReading(userServerTag, id)}
              disabled={loading || serverLoading}
              size="large"
            >
              <Icon color="error">delete_outlined</Icon>
            </IconButton>
          </TableCell>
        </TableRow>
      );
    });

    return (
      <TableContainer
        sx={{
          width: "98%",
          maxWidth: "1300px",
          boxShadow: AppThemes.themeShadows,
          borderRadius: 2,
        }}
        component={Paper}
      >
        <Table
          size="small"
          sx={{ minWidth: 650 }}
          aria-label="saved-reading-table"
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight="bold" variant="body1">
                  Leitura
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography fontWeight="bold" variant="body1">
                  Data
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography fontWeight="bold" variant="body1">
                  N° Cartas
                </Typography>
              </TableCell>
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{listContent}</TableBody>
        </Table>
      </TableContainer>
    );
  }, [
    page,
    search,
    endDate,
    loading,
    startDate,
    cardSearch,
    savedReadings,
    serverLoading,
    AppThemes.selectedAppTheme,
  ]);

  return (
    <AppContainer>
      <AppMainContainer page="Leituras Salvas">
        <Box
          sx={{
            mt: 4,
            gap: 3,
            flex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          <Box width="100%">
            {(serverLoading || loading) && (
              <LinearProgress color={Environment.APP_MAIN_TEXT_COLOR} />
            )}
          </Box>
          <Box
            gap={3}
            width="100%"
            display="flex"
            alignItems="center"
            flexDirection="column"
          >
            <SearchFilters
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
            {listTable()}

            <Pagination
              size={smDOwn ? "small" : "medium"}
              count={Math.ceil((sortedList?.length || 1) / perPage)}
              page={page}
              onChange={handlePageChange}
            />
          </Box>
          <Button
            disabled={!readingId}
            color={Environment.APP_MAIN_TEXT_COLOR}
            onClick={() => {
              if (readingId === "exemple-reading") {
                const exemple = exempleReading;
                goToSelectedReading(exemple.id, exemple.reading);
                return;
              }
              navigate(`/readings-table/${readingId}`, {
                state: {
                  searchParams: {
                    search,
                    endDate,
                    startDate,
                    cardSearch,
                    page,
                  },
                },
              });
            }}
          >
            Mesa de leituras
          </Button>
        </Box>
      </AppMainContainer>
      <SnackbarAlert origin="server" />
      <SnackbarAlert origin="app" />
    </AppContainer>
  );
};
