import {
  Alert,
  Box,
  Button,
  FormControl,
  LinearProgress,
  Modal,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { Environment } from "../../environment";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useGlobalContext } from "../../contexts/GlobalContext";
import { useLocalBaseContext } from "../../contexts/LocalBaseContext";

type TNewGymChartMdProps = {
  isTodo: boolean;
  setIsTodo: React.Dispatch<React.SetStateAction<boolean>>;
};

export function NewGymChartMd({ isTodo, setIsTodo }: TNewGymChartMdProps) {
  const {
    App,
    Utils,
    Firestore,
    inputDate,
    userEmail,
    gymCharts,
    calendarData,
    logTrainingModal,
    loggedTrainingInfoMd,
    openNewGymChartModal,
    setOpenNewGymChartModal,
    setOpenLogTrainingModal,
    setLoggedTrainingInfoMd,
  } = useGlobalContext();
  const { AppThemes } = useThemeContext();

  const theme = useTheme();
  //@ts-ignore
  const { LocalBase } = useLocalBaseContext();
  const [alert, setAlert] = useState<TAlert | undefined>(undefined);

  const gymChartsQuantity = gymCharts?.length;
  const maxChartsQuantityReached =
    gymChartsQuantity === Environment.GYM_CHARTS_MAX_QUANTITY;

  if (maxChartsQuantityReached && !alert) {
    setAlert({
      message:
        "Limite de criação de fichas atingido, favor apagar suas fichas não utilizadas.",
      color: "error",
    });
  }

  type TAlert = {
    message: string;
    color: "success" | "error";
  };

  type TNewGymChart = z.infer<typeof schema>;

  const schema = z.object({
    color: z.string(),
    tittle: z
      .string()
      .min(1, { message: "Favor preencher este campo" })
      .max(25, { message: "Limite de caracteres excedido" }),
    description: z
      .string()
      .max(30, { message: "Limite de caracteres excedido" }),
    exercises: z
      .string()
      .max(400, { message: "limite de caracteres excedido" }),
  });

  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TNewGymChart>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<TNewGymChart> = async (data) => {
    setAlert(undefined);
    clearErrors();

    const newGymChart = {
      ...data,
      id: nanoid(),
      isTodo: isTodo,
      dateCreated: Utils.formatDate(new Date(), false).brazilianDate,
    };

    if (isTodo && calendarData) {
      await App.logTraining(
        inputDate,
        newGymChart,
        newGymChart.id,
        calendarData?.selectedMonth
      );

      setAlert({ message: "Criada com sucesso!", color: "success" });

      setTimeout(() => {
        setAlert(undefined);
        if (loggedTrainingInfoMd || logTrainingModal) {
          setOpenNewGymChartModal(false);
          loggedTrainingInfoMd
            ? setLoggedTrainingInfoMd(false)
            : setOpenLogTrainingModal(false);
        }
      }, 1000);
      reset();
      setIsTodo(false);
      clearErrors();

      return;
    }

    /* If user is using default charts and create a custom chart, default charts are replaced with that custom chart. */
    const result: boolean = await LocalBase.setData(
      `My Gym Charts - ${userEmail}`,
      newGymChart.id,
      newGymChart
    );
    console.log("result", result);
    if (result) {
      console.log(
        `App.createGymChart(): Created "${newGymChart.tittle}" chart.`
      );

      await Firestore.setDoc(
        `My Workout Data - ${userEmail}`,
        newGymChart.id,
        newGymChart
      );

      setAlert({ message: "Criada com sucesso!", color: "success" });

      setTimeout(() => {
        setAlert(undefined);
        if (loggedTrainingInfoMd || logTrainingModal) {
          setOpenNewGymChartModal(false);
        }
      }, 1500);

      reset();
      clearErrors();
      App.getUserGymCharts();
    } else {
      //More details on kind of error will be displayed to the user by firebase methods above
      setAlert({
        message:
          "Erro ao salvar no dispositivo, recarregue a página e tente limpar os dados de navegação do seu navegador.",
        color: "error",
      });
    }
  };

  const closeThisModal = (_: React.SyntheticEvent, reason?: string) => {
    if (reason && reason === "backdropClick") return;
    else {
      reset();
      clearErrors();
      setAlert(undefined);
      setOpenNewGymChartModal(false);
      if (isTodo) setIsTodo(false);
    }
  };

  const style = {
    p: 4,
    width: 400,
    top: "50%",
    left: "50%",
    display: "flex",
    position: "absolute",
    flexDirection: "column",
    bgcolor: "background.paper",
    transform: "translate(-50%, -50%)",
    boxShadow: AppThemes.selectedAppTheme === "dark" ? theme.LightShadow : 4,
  };

  const formStyles = {
    mt: 4,
    gap: 2,
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div>
      <Modal
        disableEscapeKeyDown
        open={openNewGymChartModal}
        onClose={closeThisModal}
      >
        <Box sx={style}>
          <Typography component="h2" id="modal-modal-title" variant="h6">
            {isTodo ? "Criar tarefa" : "Criar Ficha de treino"}
          </Typography>
          {isSubmitting && (
            <Box sx={{ width: "100%", mt: 2 }}>
              <LinearProgress />
            </Box>
          )}
          {alert && <Alert color={alert.color}>{alert.message}</Alert>}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={formStyles}
          >
            <FormControl>
              <TextField
                {...register("color")}
                disabled={isSubmitting || maxChartsQuantityReached}
                type="color"
                name="color"
                className="mt-5"
                label="Cor de fundo"
                defaultValue="#3F64F4"
              />
            </FormControl>
            <FormControl>
              <TextField
                {...register("tittle")}
                autoFocus
                name="tittle"
                className="mt-5"
                id="gymChartTittle"
                error={!!errors.tittle}
                inputProps={{ maxLength: 26 }}
                FormHelperTextProps={{
                  style: { color: "warning" },
                }}
                helperText={errors.tittle?.message}
                label={isTodo ? "Nome da tarefa" : "Nome da ficha"}
                disabled={isSubmitting || maxChartsQuantityReached}
              />
            </FormControl>
            <FormControl>
              <TextField
                {...register("description")}
                className="mt-5"
                id="description"
                label="Descrição"
                name="description"
                FormHelperTextProps={{
                  style: { color: "warning" },
                }}
                error={!!errors.description}
                inputProps={{ maxLength: 31 }}
                helperText={errors.description?.message}
                disabled={isSubmitting || maxChartsQuantityReached}
              />
            </FormControl>
            <FormControl>
              <TextField
                {...register("exercises")}
                rows={4}
                multiline
                name="exercises"
                id="exercise-list"
                FormHelperTextProps={{
                  style: { color: "warning" },
                }}
                error={!!errors.exercises}
                inputProps={{ maxLength: 401 }}
                helperText={errors.exercises?.message}
                label={isTodo ? "Anotações" : "Exercícios"}
                disabled={isSubmitting || maxChartsQuantityReached}
              />
            </FormControl>
            <Stack direction="row" sx={{ mt: 2 }}>
              <Button onClick={closeThisModal}>Fechar</Button>
              <Button
                disabled={isSubmitting || maxChartsQuantityReached}
                type="submit"
              >
                Salvar
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
