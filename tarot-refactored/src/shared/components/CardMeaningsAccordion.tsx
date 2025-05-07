import {
  Link,
  Badge,
  Tooltip,
  TextField,
  Accordion,
  Typography,
  useMediaQuery,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  useThemeContext,
  useGlobalContext,
  useServerContext,
} from "../contexts";
import { TCardInfo } from "../types";
import { useDebounce } from "../hooks";

type TCardMeaningsAccordionProps = {
  card: TCardInfo;
};

type TCardCommentsProps = {
  card: TCardInfo;
};

const CardComments = ({ card }: TCardCommentsProps) => {
  const { debounce } = useDebounce(500);
  const { serverLoading } = useServerContext();
  const { selectedReading, setSelectedReading } = useGlobalContext();
  const [cardComments, setCardComments] = useState<string>(card.comments || "");

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    } else {
      debounce(handleCardComments);
    }
  }, [cardComments]);

  const handleCardComments = () => {
    const newReadingTableCardsComments = selectedReading.reading?.map((c) => {
      if (c.id === card.id) {
        return {
          ...c,
          comments: cardComments,
        };
      } else {
        return c;
      }
    });

    setSelectedReading({
      ...selectedReading,
      reading: newReadingTableCardsComments,
    });
  };

  return (
    <TextField
      rows={4}
      multiline
      fullWidth
      id={card.id}
      name="comments"
      disabled={serverLoading}
      onChange={(event) => setCardComments(event.target.value)}
      defaultValue={card.comments}
      placeholder={"Ex: Carta tem aparecido frequentemente."}
      inputProps={{
        maxLength: 250,
      }}
    />
  );
};

export const CardMeaningsAccordion = ({
  card,
}: TCardMeaningsAccordionProps) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const { AppThemes } = useThemeContext();
  const { serverLoading } = useServerContext();

  const shrinkFont = useMediaQuery(AppThemes.theme.breakpoints.down(960));

  // useEffect(() => {
  //   if (cardComments !== undefined) debounce(handleCardComments);
  // }, [cardComments]);

  const handleChange =
    (panel: string) => (_: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  const moreInfo = useMemo(() => {
    const cardProperties = [
      "textoSecondario",
      "simOuNao",
      "dinheiroTrabalho",
      "amorRelacionamento",
      "saudeEspiritualidade",
      "significadoInvertido",
      "invertidoDinheiroTrabalho",
      "invertidoAmorRelacionamento",
      "invertidoSaudeEspiritualidade",
      "infoUrl",
    ];

    const formatText = (textToFormat: string) => {
      switch (textToFormat) {
        // ADD MISSING ELEMENTS
        case "textoInicial":
          return "Significado";
        case "textoSecondario":
          return "Descrição do Arcano";
        case "comments":
          return "Comentários";
        case "amorRelacionamento":
          return "Amor e Relacionamento";
        case "dinheiroTrabalho":
          return "Dinheiro e Trabalho";
        case "saudeEspiritualidade":
          return "Saúde e Espiritualidade";
        case "simOuNao":
          return "Sim ou Não";
        case "significadoInvertido":
          return "Significado Invertido";
        case "invertidoAmorRelacionamento":
          return "Invertido Amor/Relacionamento";
        case "invertidoDinheiroTrabalho":
          return "Invertido Trabalho";
        case "invertidoSaudeEspiritualidade":
          return "Invertido Saúde/Espiritualidade";
        case "infoUrl":
          return "Info Completa";
        default:
          console.log("No such option available for formatting text.");
          return textToFormat;
      }
    };

    return (
      <details
        style={{
          color: "purple",
          cursor: "pointer",
          fontStyle: "italic",
        }}
      >
        {(card.naipe === "Padilha" ? ["textoSecondario"] : cardProperties).map(
          (text) => {
            return (
              <Accordion
                key={text}
                elevation={3}
                expanded={expanded === text}
                onChange={handleChange(text)}
                disabled={!!!card[text as keyof TCardInfo]}
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDown />}
                  aria-controls={`${text}d-content`}
                  id={`${text}d-content`}
                >
                  <Typography variant={shrinkFont ? "caption" : "body1"}>
                    {formatText(text)}{" "}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {text === "infoUrl" ? (
                    <Link
                      component="a"
                      target="_blank"
                      href={String(card[text as keyof TCardInfo])}
                    >
                      {card.nome}
                    </Link>
                  ) : (
                    <Typography variant="body1" textAlign="justify">
                      {card[text as keyof TCardInfo]}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          }
        )}
      </details>
    );
  }, [card, shrinkFont, expanded, serverLoading]);

  return (
    <>
      <Accordion
        elevation={3}
        expanded={expanded === "textoInicial"}
        onChange={handleChange("textoInicial")}
      >
        <AccordionSummary
          expandIcon={<ArrowDropDown />}
          aria-controls="textoInicial-d-content"
          id="textoInicial-d-content"
        >
          <Typography
            sx={{ fontWeight: "600", letterSpacing: "1px" }}
            variant="body1"
          >
            Significado
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" textAlign="justify">
            {card.textoInicial}{" "}
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        elevation={3}
        sx={{ mb: 1 }}
        expanded={expanded === "comments"}
        onChange={handleChange("comments")}
      >
        <AccordionSummary
          expandIcon={<ArrowDropDown />}
          aria-controls="comments-d-content"
          id="comments-d-content"
        >
          <Tooltip title={card.comments ? "Possui comentários" : ""}>
            <Typography
              sx={{ fontWeight: "600", letterSpacing: "1px" }}
              variant="body1"
            >
              Comentários
              <Badge
                sx={{ top: -5, left: 5 }}
                variant="dot"
                color="success"
                invisible={!card.comments}
              />
            </Typography>
          </Tooltip>
        </AccordionSummary>
        <AccordionDetails>
          <CardComments card={card} />
        </AccordionDetails>
      </Accordion>
      {moreInfo}
    </>
  );
};
