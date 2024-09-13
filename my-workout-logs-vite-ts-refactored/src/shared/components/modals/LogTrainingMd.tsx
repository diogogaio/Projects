import {
  Box,
  Link,
  Modal,
  Stack,
  Button,
  useTheme,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { GymChartsAccordion } from "..";
import { IAppStateType } from "../../types";
import {
  useThemeContext,
  useGlobalContext,
  useLocalBaseContext,
} from "../../contexts";

type TLogTrainingMd = {
  setIsTodo: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCellId: string | undefined;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const LogTrainingMd = ({
  setIsTodo,
  selectedCellId,
  setSelectedCellId,
}: TLogTrainingMd) => {
  const [comment, setComment] = useState("");
  const {
    App,
    Utils,
    inputDate,
    calendarData,
    defaultGymCharts,
    logTrainingModal,
    loggedTrainingInfoMd,
    setOpenLogTrainingModal,
    setLoggedTrainingInfoMd,
    setOpenNewGymChartModal,
  } = useGlobalContext();
  const { AppThemes } = useThemeContext();
  // @ts-ignore
  const { LocalBase } = useLocalBaseContext();

  const theme = useTheme();

  const createDefaultChartsButtons = () => {
    const buttons = defaultGymCharts.map((c) => (
      <Button
        id={c.id}
        key={c.id}
        sx={{ mr: 2 }}
        variant="outlined"
        onClick={(e) =>
          handleLogTraining(e.currentTarget.id, comment, defaultGymCharts)
        }
      >
        {c.tittle}
      </Button>
    ));
    return (
      <Box mt={2} mb={2} maxHeight="300px">
        <Stack direction="row">{buttons}</Stack>
      </Box>
    );
  };

  const handleLogTraining = async (
    id: string,
    commentArg: string | undefined,
    gymCharts: IAppStateType["gymCharts"]
  ) => {
    setOpenLogTrainingModal(false);
    if (!calendarData) {
      console.error("Calendar data not found");
      return;
    }
    await App.logTraining(
      inputDate,
      gymCharts,
      id,
      calendarData.selectedMonth,
      commentArg
    );
    closeThisModal();
    if (selectedCellId) setSelectedCellId(undefined);
  };

  const closeThisModal = () => {
    setComment("");
    if (logTrainingModal) setOpenLogTrainingModal(false);
    if (loggedTrainingInfoMd) setLoggedTrainingInfoMd(false);
  };

  const style = {
    p: 4,
    gap: 2,
    top: "50%",
    width: 400,
    left: "50%",
    display: "flex",
    position: "absolute",
    flexDirection: "column",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: AppThemes.selectedAppTheme === "dark" ? theme.LightShadow : 4,
  };

  const commentChars = Utils.handleCharacters(comment.length, 50);
  return (
    <div>
      <Modal open={logTrainingModal} onClose={closeThisModal}>
        <Box component="form" noValidate sx={style}>
          <Typography component="h2" id="modal-modal-title" variant="h6">
            Logar treino
          </Typography>

          <Typography variant="subtitle1">
            Data do treino:{" "}
            <time>{Utils.formatDate(inputDate, false).brazilianDate}</time>
          </Typography>

          <Typography component="h3" variant="subtitle1">
            Ficha:
          </Typography>

          {Utils.isDefaultChart() ? (
            createDefaultChartsButtons()
          ) : (
            <GymChartsAccordion
              maxItems={5}
              comment={comment}
              deletable={false}
              callBack={handleLogTraining}
            />
          )}

          <TextField
            id="comment"
            value={comment}
            className="mt-5"
            label="Comentário"
            FormHelperTextProps={{
              style: { color: commentChars.color },
            }}
            onChange={(e) => setComment(e.target.value)}
            inputProps={{ maxLength: commentChars.maxChars }}
            helperText={
              commentChars.remainingChars <= 5 ? commentChars.helperText : ""
            }
          />
          {Utils.isDefaultChart() ? (
            <Typography component="aside" variant="captionXS">
              {" "}
              Após realizar o comentário, selecione uma ficha padrão para salvar
              o treino ou{" "}
              <Link href="#" onClick={() => setOpenNewGymChartModal(true)}>
                crie uma ficha personalizada.
              </Link>
            </Typography>
          ) : (
            <Typography component="aside" variant="captionXS">
              {" "}
              Após realizar o comentário, selecione a ficha executada para
              salvar o treino ou{" "}
              <Link href="#" onClick={() => setOpenNewGymChartModal(true)}>
                crie uma nova ficha.
              </Link>
            </Typography>
          )}
          <Stack direction="row">
            <Button onClick={closeThisModal}>Cancelar</Button>
            <Button onClick={() => setOpenNewGymChartModal(true)}>
              Criar Ficha
            </Button>

            <Button
              onClick={() => {
                setIsTodo(true);
                setOpenNewGymChartModal(true);
              }}
            >
              Add tarefa
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};
