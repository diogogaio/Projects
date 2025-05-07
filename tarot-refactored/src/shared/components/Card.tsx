import {
  Box,
  Badge,
  Tooltip,
  Checkbox,
  Skeleton,
  FormGroup,
  Typography,
} from "@mui/material";
import { forwardRef, useMemo, useRef, useState } from "react";

import { TCardInfo } from "../types";
import { CardMenu } from "./CardMenu";
import { Environment } from "../environment";
import { useGlobalContext } from "../contexts";
import { CardMeaningsAccordion } from "./CardMeaningsAccordion";
import padilhaImages from "../../assets/images/padilha/padilhaExports";
import riderWaite from "../../assets/images/riderWaite/riderWaiteExports";

type TCardProps = {
  index: number;
  card: TCardInfo;
  isEdited?: boolean;
};

export const Card = forwardRef<HTMLDivElement, TCardProps>(
  // This allows us to access the DOM node later via ref`s node callback for scrolling
  ({ card, index, isEdited }, ref) => {
    const [expandKeywords, setExpandKeywords] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const {
      selectedCardsId,
      selectedReading,
      isSelectingCards,
      scrollToElementId,
      setSelectedCardsId,
      setOpenPanoramicView,
      setScrollToElementId,
      setAppSnackbarOptions,
    } = useGlobalContext();

    const readingTableCards = useMemo(
      () => selectedReading.reading || [],
      [selectedReading.reading]
    );
    const isUpsideDown = card?.invertida;
    const typographyRef = useRef<HTMLDetailsElement>(null);
    const isAlreadySelected = !!selectedCardsId?.find(
      (sci) => sci === card?.id
    );

    const isPadilha =
      card.url.includes("padilha") || card.url.includes("google"); // Older database versions urls has google.drive paths;

    //Old padilha cards database has a link to google drive as url and need path correction:
    const padilhaPath = card.url.includes("padilha")
      ? padilhaImages[`${card.url}.png` as keyof typeof padilhaImages]
      : padilhaImages[
          `padilha${card.numero?.padStart(
            2,
            "0"
          )}.png` as keyof typeof padilhaImages
        ];

    const riderWaitePath = card.url.includes("astrolink")
      ? card.url
      : riderWaite[`${card.url}.jpg`];

    const handleOnclickAction = () => {
      if (readingTableCards)
        isSelectingCards
          ? handleCardsSelection(card?.id)
          : handlePanoramicViewFeature();
    };

    const handleCardsSelection = (cardId: string) => {
      console.log("handleCardsSelection: ", cardId);
      if (isAlreadySelected) {
        if (selectedCardsId) {
          const removeId = selectedCardsId.filter((id) => id !== cardId);
          setSelectedCardsId(removeId);
        }
      } else {
        setSelectedCardsId((prev: string[] | undefined) => [
          ...(prev || []),
          card?.id,
        ]);
      }
    };

    const handlePanoramicViewFeature = () => {
      console.log("handlePanoramicViewFeature: ");
      if (readingTableCards && readingTableCards.length >= 2) {
        setScrollToElementId(card.id);
        setOpenPanoramicView(true);
      } else
        setAppSnackbarOptions({
          open: true,
          message: "Adicione mais cartas para abrir a Visão Panorâmica.",
          severity: "error",
        });
    };

    const scrollToTop = () => {
      if (typographyRef.current) {
        typographyRef.current.scrollTop = 0;
      }
    };

    const cardImage = (
      <Box
        ref={ref}
        sx={{
          role: "button",
          width: "210px",
          height: "320px",
          position: "relative",
          border: card.markedText
            ? `2px solid ${card.markedColor}`
            : "2px solid black",
          borderRadius: "10px",
        }}
      >
        {imageLoading && (
          <Skeleton
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              border: "3px solid white",
              zIndex: 1000,
            }}
            animation="pulse"
            variant="rectangular"
          />
        )}

        <img
          style={{
            width: "100%",
            height: "100%",
            cursor: "pointer",
            borderRadius: "10px",
            transform: card?.invertida ? "rotate(180deg)" : "none",
            opacity: isAlreadySelected ? 0.5 : undefined,
            transition: "opacity 0.3s ease",
          }}
          id={card?.id}
          alt={card?.nome}
          onClick={handleOnclickAction}
          onLoad={(e) => {
            setImageLoading(false);
            const element = e.currentTarget;
            scrollToElementId === card.id
              ? element.scrollIntoView({
                  block: "center",
                  inline: "center",
                  behavior: "smooth",
                })
              : console.log;
          }}
          src={isPadilha ? padilhaPath : riderWaitePath}
        />
      </Box>
    );

    const cardName = (
      <Tooltip placement="top" title={isEdited ? "Carta Personalizada" : ""}>
        <Typography
          sx={{
            color: card.markedText ? `${card.markedColor}` : "none",
          }}
          noWrap
          component="h6"
          variant="h6"
        >
          {`${
            card?.numero && card.naipe !== "Padilha" ? card?.numero + " -" : ""
          } ${card.nome}`}
          <Badge
            sx={{ top: -5, left: 5 }}
            variant="dot"
            invisible={!isEdited}
            color={Environment.APP_MAIN_TEXT_COLOR}
          />
        </Typography>
      </Tooltip>
    );

    const cardMarkedText = (
      <Typography component="aside" variant="caption" color={card.markedColor}>
        {`(${card?.markedText})`}
      </Typography>
    );

    const cardKeyword = (
      <Box
        onClick={() => {
          if (expandKeywords) {
            scrollToTop();
          }
          setExpandKeywords((prev) => !prev);
        }}
        sx={{ height: expandKeywords ? "140px" : "70px", mt: 1, mb: 1 }}
      >
        <Typography
          sx={{
            height: "100%",
            display: "flex",
            cursor: "pointer",
            flexDirection: "column",
            textTransform: "capitalize",
            justifyContent: "space-between",
            color: card.invertida ? "red" : "inherit",
            overflow: expandKeywords ? "auto" : "hidden",
          }}
          style={
            expandKeywords
              ? undefined
              : {
                  display: "-webkit-box",
                  textOverflow: "ellipsis",
                  overflow: expandKeywords ? "auto" : "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3, // Adjust the number of lines as needed
                  lineHeight: "1.5em", // Adjust line-height to ensure text fills the height
                  maxHeight: "calc(1.5em * 3)",
                }
          }
          variant="body1"
          component="span"
          ref={typographyRef}
        >
          {card?.invertida && card?.palavrasChaveInvertidas ? (
            <em>{`${card.palavrasChaveInvertidas} (invertido)`}</em>
          ) : (
            card.palavrasChave
          )}
          {expandKeywords && (
            <Typography component="aside" variant="captionSMI" color="gray">
              {" "}
              Clique para diminuir
            </Typography>
          )}
        </Typography>
      </Box>
    );

    return (
      <Box
        id="card"
        key={index}
        sx={{
          p: "3px",
          width: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "start",
          flexDirection: "column",
        }}
      >
        {isSelectingCards && (
          <FormGroup>
            <Checkbox
              onChange={() => handleCardsSelection(card.id)}
              checked={isAlreadySelected}
            />
          </FormGroup>
        )}

        <CardMenu
          key={card.id}
          index={index}
          id={card.id}
          isUpsideDown={!!isUpsideDown}
          name={card?.nome}
        />

        {cardImage}

        <Box width="100%" minHeight="140px">
          {cardName}
          {card?.markedText && cardMarkedText}
          {cardKeyword}
        </Box>

        <Box width="100%">
          <CardMeaningsAccordion card={card} />
        </Box>
      </Box>
    );
  }
);
