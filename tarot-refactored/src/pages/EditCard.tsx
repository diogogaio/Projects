import {
  Box,
  Stack,
  Button,
  Skeleton,
  Accordion,
  TextField,
  Typography,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { ChangeEvent, useCallback, useMemo, useState } from "react";

import { TCardInfo } from "../shared/types";
import { Environment } from "../shared/environment";
import dbCards from "../../src/assets/CardsDatabase";
import { AppContainer, AppMainContainer } from "../shared/layouts";
import padilhaImages from "../assets/images/padilha/padilhaExports";
import { useGlobalContext, useServerContext } from "../shared/contexts";

export const EditCard = () => {
  const [imageLoading, setImageLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | false>(false);

  const { readingTableCards, setReadingTableCards, setScrollToElementId } =
    useGlobalContext();
  const { userUEC, Firestore, userServerUECtag, setUserUEC } =
    useServerContext();

  const { readingId, cardName } = useParams();
  const navigate = useNavigate();

  const handleChange =
    (panel: string) => (_: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  let isEditedCard = useMemo(
    () => userUEC?.find((card) => card.nome === cardName),
    [cardName, userUEC]
  );

  let defaultChart = useMemo(
    () => dbCards.find((dbCard) => dbCard.nome === cardName),
    [cardName]
  );

  const selectedCardToEdit = useMemo(
    () => readingTableCards?.find((card) => card.nome === cardName),
    [readingTableCards, cardName]
  );

  if (selectedCardToEdit && isEditedCard) {
    isEditedCard = {
      ...isEditedCard,

      id: selectedCardToEdit?.id,
      comments: selectedCardToEdit?.comments || "",
      invertida: selectedCardToEdit?.invertida || false,
      markedText: selectedCardToEdit?.markedText || "",
      markedColor: selectedCardToEdit?.markedColor || "",
    };
  }
  if (selectedCardToEdit && defaultChart) {
    defaultChart = {
      ...defaultChart,
      id: selectedCardToEdit?.id,
      comments: selectedCardToEdit?.comments || "",
      invertida: selectedCardToEdit?.invertida || false,
      markedText: selectedCardToEdit?.markedText || "",
      markedColor: selectedCardToEdit?.markedColor || "",
    };
  }

  const cardToEdit = isEditedCard ? isEditedCard : defaultChart;

  if (cardToEdit) {
    const [newCard, setNewCard] = useState<TCardInfo>(cardToEdit);

    const cardImage = (
      <Box width="120px" height="180px" position="relative">
        {imageLoading && (
          <Skeleton
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "10px",
              position: "absolute",
            }}
            animation="wave"
            variant="rectangular"
          />
        )}

        <img
          src={
            cardToEdit.url.length > 9
              ? cardToEdit.url
              : padilhaImages[cardToEdit.url as keyof typeof padilhaImages]
          }
          alt={cardToEdit.nome}
          loading="lazy"
          onLoad={() => setImageLoading(false)}
          style={{
            width: "120px",
            height: "180px",
            borderRadius: "10px",
          }}
        />
      </Box>
    );

    const handleFormChange = (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = event.target;

      setNewCard({
        ...newCard,
        edited: true, //new feature not available in old user data on server
        [name]: value || "",
      });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!event.currentTarget.checkValidity()) {
        // Form is invalid, display a custom message or handle it as needed
        alert("Por favor, preencha todos os campos...");
        return;
      }

      const saveOnServer = await Firestore.setDoc(
        userServerUECtag,
        cardToEdit.nome,
        newCard
      );

      if (saveOnServer) {
        // If Firestore operation is successful, proceed with the rest of the code

        console.log("Updating USER UEC state.");
        setUserUEC((userUEC) =>
          isEditedCard
            ? userUEC?.map((card) => (card.nome === cardName ? newCard : card))
            : [...(userUEC || []), newCard]
        );
        setReadingTableCards((prev) =>
          prev?.map((card) => {
            return card.nome === newCard.nome
              ? {
                  ...newCard,
                  id: card.id,
                  comments: card.comments || "",
                  invertida: card.invertida || false,
                  markedText: card.markedText || "",
                  markedColor: card.markedColor || "",
                }
              : card;
          })
        );
        setScrollToElementId(cardToEdit?.id);
        navigate(`/readings-table/${readingId}`);
      } else console.error("Something went wrong when saving...");
    };

    const cardToEditAccordion = useCallback(() => {
      if (cardToEdit) {
        const cardToEditKeys = Object.keys(cardToEdit).filter(
          (key) =>
            key !== "id" &&
            key !== "url" &&
            key !== "nome" &&
            key !== "naipe" &&
            key !== "edited" &&
            key !== "numero" &&
            key !== "infoUrl" &&
            key !== "comments" &&
            key !== "invertida" &&
            key !== "markedText" &&
            key !== "markedColor"
        );

        const formatText = (textToFormat: string) => {
          switch (textToFormat) {
            // ADD MISSING ELEMENTS
            case "palavrasChave":
              return "Palavras-chave";
            case "textoInicial":
              return "Significado";
            case "infoUrl":
              return "Info Completa";
            case "textoInicial":
              return "Significado";
            case "simOuNao":
              return "Sim ou Não";
            case "comments":
              return "Comentários";
            case "textoSecondario":
              return "Descrição do Arcano";
            case "amorRelacionamento":
              return "Amor e Relacionamento";
            case "dinheiroTrabalho":
              return "Dinheiro e Trabalho";
            case "saudeEspiritualidade":
              return "Saúde e Espiritualidade";
            case "significadoInvertido":
              return "Significado Invertido";
            case "palavrasChaveInvertidas":
              return "Palavras-chave Invertidas";
            case "invertidoAmorRelacionamento":
              return "Invertido Amor/Relacionamento";
            case "invertidoDinheiroTrabalho":
              return "Invertido Dinheiro/Trabalho";
            case "invertidoSaudeEspiritualidade":
              return "Invertido Saúde/Espiritualidade";
            default:
              console.error("No such option available for formatting text.");
              console.log("OPTION: ", textToFormat);
              return textToFormat;
          }
        };

        return cardToEditKeys?.map((key) => {
          return (
            <Accordion
              key={key}
              elevation={3}
              expanded={expanded === key}
              onChange={handleChange(key)}
            >
              <AccordionSummary
                expandIcon={<ArrowDropDown />}
                aria-controls={`${key}d-content`}
                id={`${key}d-content`}
              >
                <Typography>{formatText(key)}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  onChange={(event) => {
                    handleFormChange(event);
                  }}
                  // ADD MAX CARACTERS TO 2000 IF NOT PALAVRAS-CHAVE
                  rows={7}
                  required
                  fullWidth
                  multiline
                  name={key}
                  type="text"
                  defaultValue={cardToEdit[key]}
                  id={`outlined-multiline-static-${key}`}
                  inputProps={{
                    maxLength: key === "palavrasChave" ? 325 : 2000,
                  }}
                />
              </AccordionDetails>
            </Accordion>
          );
        });
      }
    }, [cardName, expanded, userUEC, readingTableCards]);

    return (
      <AppContainer>
        <AppMainContainer
          page="Personalizar Significados"
          subheading={cardToEdit?.nome}
        >
          <Box
            sx={{
              mt: 2,
              gap: 2,
              flex: 1,
              maxWidth: 1000,
              display: "flex",
              width: { xs: "98%" },
              alignItems: "center",
              flexDirection: "column",
              justifyContent: "space-evenly",
            }}
          >
            {cardImage}
            <Box
              noValidate
              width="100%"
              component="form"
              onSubmit={handleSubmit}
            >
              {cardToEditAccordion()}
            </Box>
            <Stack direction="row" textAlign="center">
              <Button color={Environment.APP_MAIN_TEXT_COLOR} type="submit">
                {" "}
                Salvar
              </Button>
              <Button
                color={Environment.APP_MAIN_TEXT_COLOR}
                onClick={() => {
                  setScrollToElementId(cardToEdit?.id);
                  navigate(`/readings-table/${readingId}`);
                }}
              >
                {" "}
                Cancelar
              </Button>
            </Stack>
          </Box>
        </AppMainContainer>
      </AppContainer>
    );
  } else {
    return (
      <Box width="100%">
        {" "}
        <LinearProgress color="info" />
      </Box>
    );
  }
};
