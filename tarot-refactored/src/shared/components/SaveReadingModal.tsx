import {
  Box,
  Modal,
  Paper,
  Stack,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { nanoid } from "nanoid";
import SaveIcon from "@mui/material/Icon";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";

import {
  useThemeContext,
  useServerContext,
  useGlobalContext,
  useLocalBaseContext,
} from "../contexts";
import { Environment } from "../environment";
import { TUserSavedReadings } from "../types";
import { Timestamp } from "firebase/firestore";

export const SaveReadingModal = () => {
  const [loading, setLoading] = useState(false);

  const {
    selectedReading,
    setSelectedReading,
    openSaveReadingModal,
    setOpenSaveReadingModal,
  } = useGlobalContext();

  const { AppThemes } = useThemeContext();
  const { LocalBase } = useLocalBaseContext();
  const { savedReadings, Firestore, userServerTag, setSavedReadings } =
    useServerContext();

  const { readingId } = useParams();

  const defaultTitle =
    selectedReading.id === "new-reading" ? "" : selectedReading.title;

  const [readingTittle, setReadingTittle] = useState(defaultTitle);

  useEffect(() => {
    if (selectedReading) {
      setReadingTittle(defaultTitle);
    }
  }, [selectedReading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const savedReadingsLength = savedReadings?.length;
    const amountOfSaveOnServerAllowed =
      Environment.MAX_SERVER_READINGS - (savedReadingsLength || 0);
    const isAllowedToSaveOnServer =
      (savedReadingsLength || 0) < Environment.MAX_SERVER_READINGS
        ? true
        : false;

    if (
      amountOfSaveOnServerAllowed < Environment.SAVE_READINGS_LIMIT_ALERT &&
      isAllowedToSaveOnServer
    ) {
      alert(
        `Seu limite de tiragens salvas no servidor está acabando. Você pode salvar mais ${amountOfSaveOnServerAllowed} ${
          amountOfSaveOnServerAllowed > 1 ? "leituras" : "leitura"
        }. Se necessário, apague tiragens antigas.`
      );
    }

    console.log("IS ALLOWED TO SAVE? ", isAllowedToSaveOnServer);

    if (
      selectedReading &&
      userServerTag &&
      readingId &&
      (userServerTag === Environment.ADMIN_USER_TAG
        ? true
        : isAllowedToSaveOnServer)
    ) {
      if (!readingTittle) {
        alert("Por favor, insira um título para a leitura.");
        setLoading(false);
        return;
      }

      const isNewReading = !!!savedReadings?.find(
        (reading) => reading.id === readingId
      );

      if (!isNewReading && readingId !== "new-reading") {
        // UPDATE EXISTING SAVED READINGS:
        console.log("Updating existing reading...");
        console.log("READING TITLE: ", readingTittle);
        const updatedReading: TUserSavedReadings = {
          ...selectedReading,
          title: readingTittle,
        };

        console.log("Saving updated reading...", updatedReading);

        const saveOnServer = await Firestore.setDoc(
          userServerTag,
          updatedReading.id,
          updatedReading
        );

        if (saveOnServer) {
          await LocalBase.setData(
            userServerTag,
            updatedReading.id,
            updatedReading
          );

          setSavedReadings((prevSavedReadings) =>
            prevSavedReadings.map((savedReading) =>
              savedReading.id === readingId ? updatedReading : savedReading
            )
          );
          setSelectedReading((prev) => ({ ...prev, title: readingTittle }));

          setLoading(false);
          setOpenSaveReadingModal(false);
        }
        setLoading(false);
        return;
      }

      if (readingId === "new-reading" && isNewReading) {
        //UPDATE SAVED READING WITH NEW READING:
        console.log("Creating new reading...");
        const newReading: TUserSavedReadings = {
          ...selectedReading,
          id: nanoid(),
          timestamp: Timestamp.fromDate(new Date()),
          title: readingTittle,
        };
        // if (!selectedReading && readingTittle) {
        //   //UPDATE SAVED READING WITH NEW READING:
        //   console.log("Creating new reading...");
        //   const newReading: TUserSavedReadings = {
        //     id: nanoid(),
        //     notes: readingNotes || "",
        //     reading: readingTableCards,
        //     readingColumns: readingTableColumns,
        //     timestamp: Timestamp.fromDate(new Date()),
        //     title: readingTittle || "Leitura sem Título",
        //   };

        console.log("Saving new reading...");
        const saveOnServer = await Firestore.setDoc(
          userServerTag,
          newReading.id,
          newReading
        );

        if (saveOnServer) {
          await LocalBase.setData(userServerTag, newReading.id, newReading);
          setSavedReadings((prevSavedReadings) => [
            ...(prevSavedReadings || []),
            newReading,
          ]);
          setSelectedReading((prev) => ({ ...prev, title: readingTittle }));
          setLoading(false);
          setOpenSaveReadingModal(false);
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      alert("Erro ao executar este processo.");
    } else {
      if (!isAllowedToSaveOnServer) {
        alert(
          "Você atingiu o limite de leituras salvas no servidor. Apague algumas leitura antigas e tente novamente."
        );
        setLoading(false);
        setOpenSaveReadingModal(false);
        return;
      }
      setLoading(false);
      alert("Erro ao executar este processo.");
      setOpenSaveReadingModal(false);
    }
  };

  const closeSavedReadingModal = (_: React.SyntheticEvent, reason?: string) => {
    if (reason && reason === "backdropClick") return;
    if (loading) setLoading(false);
    setOpenSaveReadingModal(false);
  };

  return (
    <div>
      <Modal
        disableEscapeKeyDown
        open={openSaveReadingModal}
        onClose={closeSavedReadingModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          component={Paper}
          sx={{
            p: 4,
            gap: 2,
            top: "50%",
            left: "50%",
            display: "flex",
            position: "absolute",
            flexDirection: "column",
            bgcolor: "background.paper",
            boxShadow: AppThemes.themeShadows,
            transform: "translate(-50%, -50%)",
            width: { xs: "98%", sm: "80%", md: 500, lg: 600 },
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            id="modal-title"
            sx={{
              textShadow:
                AppThemes.selectedAppTheme === "light"
                  ? "1px 1px lightgray"
                  : "",
            }}
            color={Environment.APP_MAIN_TEXT_COLOR}
          >
            Salvar tiragem
          </Typography>
          <Box
            gap={2}
            display="flex"
            component="form"
            flexDirection="column"
            onSubmit={handleSubmit}
          >
            <TextField
              fullWidth
              required
              type="text"
              id="reading-title"
              name="reading-title"
              onChange={(event) => setReadingTittle(event?.target.value)}
              defaultValue={readingTittle}
              placeholder="Nome da tiragem ou pergunta."
              inputProps={{
                maxLength: 130,
              }}
            />
            <Stack display="flex" justifyContent="end" direction="row">
              <Button
                color={Environment.APP_MAIN_TEXT_COLOR}
                onClick={closeSavedReadingModal}
              >
                Cancelar
              </Button>
              <LoadingButton
                type="submit"
                loading={loading}
                loadingPosition="start"
                color={Environment.APP_MAIN_TEXT_COLOR}
                startIcon={<SaveIcon />}
              >
                Salvar
              </LoadingButton>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};
