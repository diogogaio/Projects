import {
  Box,
  Link,
  Dialog,
  Button,
  Tooltip,
  Skeleton,
  Typography,
  DialogTitle,
} from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";

import { Environment } from "../environment";
import { useGlobalContext } from "../contexts";
import padilhaImages from "../../assets/images/padilha/padilhaExports";
import riderWaite from "../../assets/images/riderWaite/riderWaiteExports";

type TPanoramicViewProps = {
  readingTitle: string;
};

const PanoramicViewModalComponent = ({ readingTitle }: TPanoramicViewProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);

  const {
    // Utils,
    readingTableCards,
    openPanoramicView,
    scrollToElementId,
    readingTableColumns,
    setOpenPanoramicView,
    setScrollToElementId,
  } = useGlobalContext();

  const panoramicViewContent = useCallback(() => {
    return readingTableCards?.map((card) => {
      // Database card path were updated due to third party cookies disabled by google and not being able to fetch images from google drive
      const riderWaitePath = card.url.includes("astrolink")
        ? card.url
        : riderWaite[`${card.url}.jpg`];

      const isPadilha =
        card.url.includes("padilha") || card.url.includes("google");

      const padilhaPath = card.url.includes("padilha")
        ? padilhaImages[`${card.url}.png` as keyof typeof padilhaImages]
        : padilhaImages[
            `padilha${card.numero?.padStart(
              2,
              "0"
            )}.png` as keyof typeof padilhaImages
          ];

      const cardName = (
        <Typography
          sx={{
            p: 0,
            fontWeight: "none",
            color: card.markedText ? `${card.markedColor}` : "gray",
          }}
          noWrap
          component="h6"
          variant="captionXS"
        >
          {`${
            card?.numero && card.naipe !== "Padilha" ? card?.numero + " -" : ""
          } ${card.nome}`}
        </Typography>
      );

      const cardKeywords = card.invertida
        ? card.palavrasChaveInvertidas
        : card.palavrasChave;

      const cardMarkedText = (
        <Typography
          noWrap
          component="aside"
          variant="captionXS"
          color={card.markedColor}
        >
          {`(${card?.markedText})`}
        </Typography>
      );

      const cardComments = (
        <Link underline="hover">
          <Typography
            noWrap={showComments ? false : true}
            component="aside"
            sx={{
              width: "100%",
              role: "button",
              display: "block",
              cursor: "pointer",
              overflow: "hidden",
              textAlign: "center",
            }}
            variant="captionXS"
            onClick={() => setShowComments((prev) => !prev)}
          >
            {card.comments}
          </Typography>
        </Link>
      );

      return (
        <Box
          key={card.id}
          sx={{
            p: "2px",
            width: "100%",
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            borderRadius: "10px",
            flexDirection: "column",
            justifyContent: "start",
            border: scrollToElementId === card.id ? "1px solid red" : "",
          }}
        >
          <Box sx={{ position: "relative", width: "100%" }}>
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
            <Tooltip sx={{ textTransform: "capitalize" }} title={cardKeywords}>
              <img
                style={{
                  width: "90px",
                  height: "140px",
                  cursor: "pointer",
                  borderRadius: "10px",
                }}
                id={card.id}
                loading="lazy"
                alt={card.nome}
                onLoad={(e) => {
                  setImageLoading(false);
                  const element = e.currentTarget;
                  scrollToElementId === card.id
                    ? element.scrollIntoView({
                        block: "center",
                        inline: "center",
                        behavior: "instant",
                      })
                    : console.log;
                }}
                onClick={() => {
                  // Utils.scrollToAddedCard(card.id);
                  setScrollToElementId(card.id);
                  setOpenPanoramicView(false);
                }}
                src={isPadilha ? padilhaPath : riderWaitePath}
              />
            </Tooltip>
            {!imageLoading && (
              <>
                {cardName}
                {card.markedText && cardMarkedText}
                {card.comments && cardComments}
              </>
            )}
          </Box>
        </Box>
      );
    });
  }, [readingTableCards, scrollToElementId, imageLoading, showComments]);

  const panoramicCards = useMemo(
    () => panoramicViewContent(),
    [readingTableCards, scrollToElementId, imageLoading, showComments]
  );

  return (
    <Dialog
      fullScreen
      PaperProps={{
        elevation: 0,
      }}
      open={openPanoramicView}
      id="panoramic-view-dialog"
    >
      <Box
        sx={{
          gap: "10px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "inherit",
        }}
      >
        <DialogTitle
          textAlign="center"
          sx={{ m: 0, p: 2 }}
          id="panoramic-view-dialog-title"
        >
          <Typography
            variant="h6"
            component="p"
            color={Environment.APP_MAIN_TEXT_COLOR}
          >
            Visão Panorâmica
          </Typography>
          <Typography component="p" color="gray" variant="caption">
            {" "}
            {readingTitle}
          </Typography>
        </DialogTitle>

        <Box
          id="grid-container"
          sx={{
            rowGap: "10px",
            margin: "auto",
            display: "grid",
            columnGap: "0px",
            gridTemplateColumns: ` repeat(${readingTableColumns}, 120px)`,
          }}
        >
          {panoramicCards}
        </Box>
        <Button
          color={Environment.APP_MAIN_TEXT_COLOR}
          size="small"
          onClick={() => setOpenPanoramicView(false)}
        >
          Voltar
        </Button>
        <Typography component="span" color="gray" variant="captionXS">
          Ou clique na carta para navegar até ela
        </Typography>
      </Box>
    </Dialog>
  );
};

export const PanoramicViewModal = memo(PanoramicViewModalComponent);
