import { fromUnixTime } from "date-fns";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, useMediaQuery, LinearProgress } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  SnackbarAlert,
  CardMarkedModal,
  SaveReadingModal,
  PanoramicViewModal,
} from "../shared/components";
import { Card } from "../shared/components/Card";
import { Environment } from "../shared/environment";
import ReadingNotes from "../shared/components/ReadingNotes";
import { AppContainer, AppMainContainer } from "../shared/layouts";
import { useGlobalContext, useServerContext } from "../shared/contexts";

export const ReadingsTable = () => {
  const [isOverflowing, setIsOverflowing] = useState(false);

  const { readingId } = useParams();

  const cardsRef = useRef(new Map());

  const { Reading, selectedReading, scrollToElementId } = useGlobalContext();

  const theme = useTheme();

  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const notes = useMemo(
    () => selectedReading.notes || undefined,
    [selectedReading]
  );

  const readingTableCards = useMemo(
    () => selectedReading.reading,
    [selectedReading.reading]
  );
  const readingTableColumns = useMemo(
    () => selectedReading.readingColumns || (smDown ? 1 : 3),
    [selectedReading.readingColumns, smDown]
  );

  const { serverLoading } = useServerContext();

  const previousReadingId = useRef<string | undefined>();

  useEffect(() => {
    if (previousReadingId.current === readingId) return; // prevent unnecessary calls
    previousReadingId.current = readingId;

    Reading.handleSelectedReading(readingId);
  }, [readingId]);

  useEffect(() => {
    if (document.readyState === "complete") {
      const element = cardsRef.current.get(scrollToElementId);
      if (scrollToElementId && element) {
        element?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }
  }, [scrollToElementId]);

  const readingCards = useMemo(
    () =>
      readingTableCards?.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          index={index}
          isEdited={!!card.edited}
          ref={(node) => {
            // Ref callBack: Store the DOM node in the Map with the card ID as the key
            // This allows us to access the DOM node later for scrolling
            const map = cardsRef.current;
            if (node) map.set(card.id, node); // Store Box's DOM node
            else map.delete(card.id);
          }}
        />
      )),
    [readingTableCards]
  );

  useEffect(() => {
    // TODO: Use refs for more reliability
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
        subheading={selectedReading.title}
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
            justifyContent: !!readingTableCards.length
              ? "space-evenly"
              : "start",
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

          {!!readingTableCards.length && (
            <ReadingNotes initialNotes={notes} readingId={readingId} />
          )}
        </Box>
        <CardMarkedModal />
        <SaveReadingModal />
        <PanoramicViewModal readingTitle={selectedReading.title} />
        <SnackbarAlert origin="app" />
        <SnackbarAlert origin="server" />
      </AppMainContainer>
    </AppContainer>
  );
};
