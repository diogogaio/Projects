import React from "react";
import { Box, Typography, Modal, Button, Stack, useTheme } from "@mui/material";

import { CompletedChartsAccordion, CustomDeleteIcon } from "..";
import { useGlobalContext, useThemeContext } from "../../contexts";

type TLoggedTrainingInfoMd = {
  setIsTodo: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCellId: string | undefined;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const LoggedTrainingInfoMd = React.memo(
  ({ setIsTodo, selectedCellId, setSelectedCellId }: TLoggedTrainingInfoMd) => {
    const {
      App,
      Utils,
      inputDate,
      loggedTrainingInfoMd,
      setLoggedTrainingInfoMd,
      setOpenLogTrainingModal,
      setOpenNewGymChartModal,
    } = useGlobalContext();
    const { AppThemes } = useThemeContext();
    const theme = useTheme();

    const { day, brazilianDate } = Utils.formatDate(inputDate, false);

    const style = {
      p: 4,
      gap: 2,
      top: "50%",
      width: 400,
      left: "50%",
      display: "flex",
      overflow: "auto",
      maxHeight: "90vh",
      position: "absolute",
      flexDirection: "column",
      bgcolor: "background.paper",
      transform: "translate(-50%, -50%)",
      boxShadow: AppThemes.selectedAppTheme === "dark" ? theme.LightShadow : 4,
    };

    const dayData = App.getDayData(day, "selectedMonth");

    const hasMoreChartsOnThisDay = dayData
      ? dayData.completedCharts.length > 1
      : dayData;

    const closeModal = () => {
      setLoggedTrainingInfoMd(false);
    };

    return (
      <div>
        <Modal open={loggedTrainingInfoMd} onClose={closeModal}>
          <Box component="form" noValidate sx={style}>
            <Typography component="h2" id="modal-modal-title" variant="h6">
              Informações do dia
            </Typography>

            <Typography variant="subtitle1">
              Data: <time>{brazilianDate}</time>{" "}
            </Typography>
            {/* Completed charts: */}
            <CompletedChartsAccordion
              selectedCellId={selectedCellId}
              setSelectedCellId={setSelectedCellId}
              maxItems={5}
            />
            {/* To do list: */}
            <CompletedChartsAccordion
              selectedCellId={selectedCellId}
              setSelectedCellId={setSelectedCellId}
              maxItems={5}
              showToDoList={true}
            />

            <Typography
              mt={1}
              component="aside"
              variant="captionXS"
              sx={{ mt: 0, alignSelf: "end", fontStyle: "italic" }}
            >
              Toque na ficha ou tarefa acima para expandir
            </Typography>
            <Stack direction="row">
              <Button onClick={closeModal}>sair</Button>
              <Button onClick={() => setOpenLogTrainingModal(true)}>
                Add treino
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
            {hasMoreChartsOnThisDay && (
              <Box sx={{ display: "flex", alignSelf: "end" }}>
                <CustomDeleteIcon
                  deleteFn={() => {
                    const dayId = dayData?.id;
                    App.deleteAllDayLogs(dayId!);
                  }}
                  text={"Apagar tudo"}
                />
              </Box>
            )}
          </Box>
        </Modal>
      </div>
    );
  }
);
