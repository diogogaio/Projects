import {
  Box,
  Button,
  Drawer,
  Checkbox,
  Skeleton,
  FormGroup,
  Typography,
  useMediaQuery,
  FormControlLabel,
} from "@mui/material";
import { nanoid } from "nanoid";
import { useParams } from "react-router-dom";
import { useCallback, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";

import {
  useThemeContext,
  useGlobalContext,
  useServerContext,
} from "../contexts";
import { Environment } from "../environment";
import dbCards from "../../assets/CardsDatabase";
import padilhaImages from "../../assets/images/padilha/padilhaExports";
import riderWaite from "../../assets/images/riderWaite/riderWaiteExports";

export const DrawerCards = () => {
  const [imageLoading, setImageLoading] = useState(true);
  const [isAddingMoreCards, setIsAddingMoreCards] = useState(false);
  const [addedCardsId, setAddedCardsId] = useState<string[] | []>([]);

  const { AppThemes } = useThemeContext();
  const { savedReadings } = useServerContext();
  const { drawerCards, setOpenDrawerCards, setScrollToElementId } =
    useGlobalContext();
  const { selectedReading, setSelectedReading } = useGlobalContext();
  const readingTableCards = selectedReading.reading;

  const { readingId } = useParams();

  const smDown = useMediaQuery(AppThemes.theme.breakpoints.down("sm"));

  const addedCardOpacity = (id: string) => {
    return addedCardsId.find((i) => i === id) ? 0.5 : undefined;
  };

  const handleClose = () => {
    setOpenDrawerCards({ open: false, content: "", cardAsideIndex: undefined });
    if (isAddingMoreCards) {
      setAddedCardsId([]);
      setIsAddingMoreCards(false);
    }
  };

  const addCardToTable = useCallback(
    (selectedCardId: string, addCardAsideIndex?: number | undefined) => {
      if (isAddingMoreCards) {
        setAddedCardsId((prev) => [...prev, selectedCardId]);
      }

      const isRepeatedCard = readingTableCards?.find(
        (card) => card.id === selectedCardId
      );

      let dbCard = dbCards.find((dbc) => dbc.id === selectedCardId);

      if (dbCard) {
        if (isRepeatedCard) {
          console.log("addCardToTable : Changing repeated card id...");
          dbCard = { ...dbCard, id: nanoid() };
        }

        let newReadingCards = [...(readingTableCards || [])];
        if (
          addCardAsideIndex !== undefined &&
          addCardAsideIndex >= 0 &&
          dbCard
        ) {
          newReadingCards.splice(addCardAsideIndex + 1, 0, dbCard);
          console.log("addCardToTable: Adding new card aside...");
        } else {
          console.log("addCardToTable: Adding new card...");
          newReadingCards.push(dbCard);
        }

        // setReadingTableCards(newReadingCards);
        setSelectedReading({ ...selectedReading, reading: newReadingCards });
        setScrollToElementId(dbCard.id);
        if (!isAddingMoreCards) {
          handleClose();
        }
      } else
        alert("Erro: Não foi possível encontrar base de dados das cartas.");
    },
    [
      readingId,
      savedReadings,
      readingTableCards,
      isAddingMoreCards,
      addedCardsId,
    ]
  );

  const drawerCardsContent = useCallback(
    (naipe: string) => {
      const cards = dbCards.filter((c) => c.naipe === naipe);
      const drawerCardsImages = cards.map((card) => (
        <Grid
          xs={1}
          id={card.id}
          key={card.id}
          sx={{
            display: "flex",
            maxWidth: "100%",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
          }}
          onClick={() => addCardToTable(card.id, drawerCards.cardAsideIndex)}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              position: "relative",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            {imageLoading && (
              <Skeleton
                sx={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                }}
                animation="wave"
                variant="rectangular"
              />
            )}

            <img
              src={
                card.url.includes("padilha")
                  ? padilhaImages[
                      `${card.url}.png` as keyof typeof padilhaImages
                    ]
                  : riderWaite[`${card.url}.jpg`]
              }
              alt={card.nome}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              style={{
                width: "90px",
                height: "140px",
                cursor: "pointer",
                borderRadius: "10px",
                opacity: isAddingMoreCards
                  ? addedCardOpacity(card.id)
                  : undefined,
                transition: "opacity 0.2s ease",
              }}
            />
            {!imageLoading && (
              <Typography
                noWrap
                width="100%"
                variant="caption"
                textAlign="center"
              >
                {`${
                  card?.numero && card.naipe !== "Padilha"
                    ? card?.numero + " -"
                    : ""
                } ${card.nome}`}
              </Typography>
            )}
          </Box>
        </Grid>
      ));
      return drawerCardsImages;
    },
    [drawerCards.content, isAddingMoreCards, imageLoading, addedCardsId]
  );

  return (
    <div>
      <Drawer
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        role="navigation"
        onClose={handleClose}
        open={drawerCards.open}
        anchor={smDown ? "top" : "right"}
      >
        <Box
          sx={{
            p: 1,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: { xs: "100vw", sm: 500 },
          }}
        >
          <Typography
            sx={{
              textShadow:
                AppThemes.selectedAppTheme === "light"
                  ? "1px 1px lightgray"
                  : "",
            }}
            color={Environment.APP_MAIN_TEXT_COLOR}
            variant="h6"
            component="h6"
          >
            {drawerCards.content}
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAddingMoreCards}
                  onChange={() => setIsAddingMoreCards((prev) => !prev)}
                />
              }
              label="Selecionar várias"
            />
            {isAddingMoreCards && !!addedCardsId.length && (
              <Button onClick={handleClose}>Finalizar</Button>
            )}
          </FormGroup>

          <Grid
            container
            spacing={1}
            columns={smDown ? 3 : 4}
            sx={{
              mt: 2,
              width: "100%",
              height: "100%",
              justifyContent: "center",
            }}
          >
            {drawerCardsContent(drawerCards.content)}
          </Grid>
          <Button
            color={Environment.APP_MAIN_TEXT_COLOR}
            sx={{ mt: 2 }}
            onClick={handleClose}
          >
            Fechar
          </Button>
        </Box>
      </Drawer>
    </div>
  );
};
