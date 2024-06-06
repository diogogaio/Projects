import { useState, FormEvent, useEffect, ChangeEvent } from "react";
import {
  Box,
  Modal,
  Stack,
  Paper,
  Button,
  Backdrop,
  TextField,
  Typography,
  FormControl,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { Sell } from "@mui/icons-material";
import { Environment } from "../environment";
import { useGlobalContext, useThemeContext } from "../contexts";

type TForm = {
  color?: string | undefined;
  text?: string | undefined;
};

export function CardMarkedModal() {
  const { AppThemes } = useThemeContext();

  const [form, setForm] = useState<TForm | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const {
    selectedCardsId,
    isSelectingCards,
    readingTableCards,
    openCardMarkedModal,
    setSelectedCardsId,
    setIsSelectingCards,
    setReadingTableCards,
    setOpenCardMarkedModal,
  } = useGlobalContext();

  useEffect(() => {
    if (readingTableCards) {
      handleClose();
    }
  }, [readingTableCards]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readingTableCards) {
      setLoading(true);
      setReadingTableCards(
        readingTableCards.map((card) =>
          selectedCardsId?.includes(card.id)
            ? {
                ...card,
                markedColor: form?.color || "#3F64F4",
                markedText: form?.text,
              }
            : card
        )
      );
      setSelectedCardsId(undefined);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleClose = (_?: React.SyntheticEvent, reason?: string) => {
    if (reason && reason === "backdropClick") return;

    if (form) setForm(undefined);

    setSelectedCardsId(undefined);
    if (isSelectingCards) {
      setIsSelectingCards(false);
    }

    if (loading) setLoading(false);

    setOpenCardMarkedModal(false);
  };

  const style = {
    p: 4,
    gap: 3,
    width: 400,
    top: "50%",
    left: "50%",
    display: "flex",
    flexDirection: "column",
    bgcolor: "background.paper",
    boxShadow: AppThemes.themeShadows,
    transform: "translate(-50%, -50%)",
    position: "absolute" as "absolute",
  };

  return (
    <Modal
      closeAfterTransition
      disableEscapeKeyDown
      open={openCardMarkedModal}
      onClose={() => handleClose()}
      slots={{ backdrop: Backdrop }}
      aria-labelledby="markCard-modal-title"
      aria-describedby="markCard-modal-description"
    >
      <Box sx={style} component={Paper} boxShadow={AppThemes.themeShadows}>
        <Typography
          variant="h6"
          component="h6"
          id="markCard-modal-title"
          sx={{
            textShadow:
              AppThemes.selectedAppTheme === "light" ? "1px 1px lightgray" : "",
          }}
          color={Environment.APP_MAIN_TEXT_COLOR}
        >
          Marcar carta
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl>
            <TextField
              onChange={handleChange}
              type="color"
              name="color"
              id="color-input"
              className="mt-5"
              label="Cor do texto"
              defaultValue="#9c27b0"
            />{" "}
          </FormControl>
          <FormControl>
            <TextField
              required
              id="text"
              name="text"
              label="Marcação:"
              onChange={handleChange}
              placeholder="Ex: Fundo do Maço"
              inputProps={{ maxLength: 26 }}
              FormHelperTextProps={{
                style: { color: "warning" },
              }}
            />
          </FormControl>
          <Stack display="flex" direction="row" justifyContent="end">
            <Button
              color={Environment.APP_MAIN_TEXT_COLOR}
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              loading={loading}
              disabled={loading}
              endIcon={<Sell />}
              loadingPosition="end"
              color={Environment.APP_MAIN_TEXT_COLOR}
            >
              <span>Marcar</span>
            </LoadingButton>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
}
