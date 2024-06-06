import {
  Box,
  TextField,
  Typography,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";
import { fromUnixTime } from "date-fns";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  useThemeContext,
  useGlobalContext,
  useServerContext,
} from "../shared/contexts";
import {
  SnackbarAlert,
  CardMarkedModal,
  SaveReadingModal,
  PanoramicViewModal,
} from "../shared/components";
import { useDebounce } from "../shared/hooks";
import { Card } from "../shared/components/Card";
import { exempleReading } from "../../src/assets/CardsDatabase";
import { AppContainer, AppMainContainer } from "../shared/layouts";
import { Environment } from "../shared/environment";

export const ReadingsTable = () => {
  const [isOverflowing, setIsOverflowing] = useState(false);

  const { readingId } = useParams();
  const { debounce } = useDebounce(500);

  const {
    readingNotes,
    readingTableCards,
    scrollToElementId,
    readingTableColumns,
    setReadingNotes,
  } = useGlobalContext();
  const { AppThemes } = useThemeContext();
  const { savedReadings, serverLoading, setSavedReadings } = useServerContext();

  const smDown = useMediaQuery(AppThemes.theme.breakpoints.down("sm"));
  const selectedReading = useMemo(() => {
    const reading = savedReadings?.find((sr) => sr.id === readingId);
    return reading
      ? reading
      : readingId === "exemple-reading"
      ? exempleReading
      : undefined;
  }, [readingId, savedReadings]);

  useEffect(() => {
    if (readingNotes !== undefined) debounce(handleReadingNotes);
  }, [readingNotes]);

  useEffect(() => {
    const onPageLoad = () => {
      const element = document.querySelector(
        `img#${CSS.escape(String(scrollToElementId))}`
      );

      if (scrollToElementId && element) {
        setTimeout(() => {
          element?.scrollIntoView({
            behavior: "instant",
            block: "center",
            inline: "center",
          });
        }, 500);
      } else console.log("Failed to scroll to element.");
    };

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad, false);
      // Remove the event listener when component unmounts
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, [scrollToElementId]);

  const handleReadingNotes = () => {
    setSavedReadings((prevSavedReadings) =>
      prevSavedReadings?.map((savedReading) =>
        savedReading.id === readingId
          ? { ...savedReading, notes: readingNotes }
          : savedReading
      )
    );
  };

  const readingCards = useMemo(
    () =>
      readingTableCards?.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          index={index}
          isEdited={!!card.edited}
        />
      )),
    [readingTableCards]
  );

  useEffect(() => {
    const innerContainer = document.getElementById("cards-container");
    const outerContainer = document.getElementById("reading-table-container");
    const checkOverflow = () => {
      if (innerContainer && outerContainer) {
        setIsOverflowing(
          innerContainer.clientWidth > outerContainer.clientWidth
        );
      }
    };
    checkOverflow();
  }, [readingTableColumns, readingTableCards]);

  return (
    <AppContainer>
      <AppMainContainer
        page="Mesa de Leituras"
        subheading={
          readingTableCards?.length
            ? selectedReading?.title || "Leitura sem título"
            : "Mesa vazia"
        }
      >
        <Box
          id="reading-table-container"
          sx={{
            gap: 3,
            flex: 1,
            p: "2px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: isOverflowing ? "" : "center",
          }}
        >
          <Typography
            sx={{
              p: 1,
              width: "100%",
              opacity: "0.8",
              component: "time",
              variant: "caption",
              textAlign: "center",
            }}
            component="time"
            variant="captionSMI"
          >
            {selectedReading
              ? fromUnixTime(
                  selectedReading?.timestamp.seconds
                ).toLocaleDateString("pt-br")
              : ""}
          </Typography>

          <Box width="100%">
            {serverLoading && (
              <LinearProgress color={Environment.APP_MAIN_TEXT_COLOR} />
            )}
          </Box>

          <Box overflow="auto">
            <Box display="inline-block">
              {/* to make the inner box expand with content and be able to get its width for calculating columns */}
              <Box
                id="cards-container"
                sx={{
                  display: "grid",
                  rowGap: "10px",

                  gridTemplateColumns: ` repeat(${
                    (readingTableCards?.length || 0) >= readingTableColumns
                      ? readingTableColumns
                      : readingTableCards?.length || 1
                  }, ${
                    readingTableColumns === 1 && smDown
                      ? "1fr"
                      : "minmax(350px, 600px))"
                  }`,
                }}
              >
                {readingCards}
              </Box>
            </Box>
          </Box>

          {readingTableCards && (
            <Box
              boxShadow={AppThemes.themeShadows}
              width="95%"
              alignSelf="center"
            >
              <TextField
                rows={4}
                fullWidth
                multiline
                id="reading-notes"
                name="reading-notes"
                disabled={serverLoading}
                defaultValue={selectedReading?.notes || ""}
                placeholder="Conclusões, observações e anotações da leitura."
                onChange={(event) => setReadingNotes(event.target.value)}
                inputProps={{
                  maxLength: 2000,
                }}
              />
            </Box>
          )}
        </Box>
        <CardMarkedModal />
        <SaveReadingModal />
        <PanoramicViewModal
          readingTitle={selectedReading?.title || "Leitura sem Título"}
        />
        <SnackbarAlert origin="app" />
        <SnackbarAlert origin="server" />
      </AppMainContainer>
    </AppContainer>
  );
};
