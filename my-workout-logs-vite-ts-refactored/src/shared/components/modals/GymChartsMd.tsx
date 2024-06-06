import { Stack, Box, Button, Typography, Modal, useTheme } from "@mui/material";

import { CustomDeleteIcon, GymChartsAccordion } from "..";
import { useGlobalContext, useThemeContext } from "../../contexts";

export const GymChartsMd = () => {
  const {
    App,
    gymCharts,
    gymChartsModal,
    setGymChartsModal,
    setOpenNewGymChartModal,
  } = useGlobalContext();
  const { AppThemes } = useThemeContext();
  const theme = useTheme();

  const style = {
    p: 4,
    top: "50%",
    width: 400,
    left: "50%",
    display: "flex",
    position: "absolute",
    flexDirection: "column",
    bgcolor: "background.paper",
    transform: "translate(-50%, -50%)",
    boxShadow: AppThemes.selectedAppTheme === "dark" ? theme.LightShadow : 4,
  };

  return (
    <Modal open={gymChartsModal} onClose={() => setGymChartsModal(false)}>
      <Box sx={style}>
        <Typography component="h2" id="modal-modal-title" mb={2} variant="h6">
          Fichas de treino
        </Typography>

        <GymChartsAccordion maxItems={10} deletable={true} />

        <Stack spacing={2} direction="row">
          <Button onClick={() => setGymChartsModal(false)}>Fechar</Button>
          <Button color="success" onClick={() => setOpenNewGymChartModal(true)}>
            Criar ficha
          </Button>
        </Stack>

        {gymCharts!?.length > 1 && (
          <Box sx={{ alignSelf: "end" }}>
            {" "}
            <CustomDeleteIcon
              deleteFn={App.deleteAllGymCharts}
              text="Apagar tudo"
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
};
