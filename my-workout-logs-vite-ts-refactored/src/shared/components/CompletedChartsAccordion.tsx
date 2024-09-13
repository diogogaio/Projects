import {
  Box,
  Stack,
  Checkbox,
  Accordion,
  FormGroup,
  Typography,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { CustomDeleteIcon } from ".";
import { IMonthData, TChart, TDayTrainings } from "../types";
import { useGlobalContext, useLocalBaseContext } from "../contexts";

type TCompletedChartsAccordionProps = {
  maxItems: number;
  showToDoList?: boolean;
  selectedCellId: string | undefined;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | undefined>>;
};
//Number of accordion items to be displayed before overflowing container

//Also responsible for creating todo's accordion list
export const CompletedChartsAccordion = ({
  maxItems,
  selectedCellId,
  setSelectedCellId,
  showToDoList = false,
}: TCompletedChartsAccordionProps) => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [loading, setLoading] = useState(false);

  //@ts-ignore
  const { LocalBase } = useLocalBaseContext();
  const {
    App,
    Utils,
    Firestore,
    inputDate,
    userEmail,
    calendarData,
    selectedMonthDocName,
    setLoggedTrainingInfoMd,
  } = useGlobalContext();

  const containerSize = `${maxItems * 48}px`;
  const { day } = Utils.formatDate(inputDate, false);
  const dayData = App.getDayData(day, "selectedMonth");
  const hasMoreChartsOnThisDay = dayData
    ? dayData.completedCharts.length > 1
    : dayData;

  const handleAccordionChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleDelete = async (logId: string, dayId: string, tittle: string) => {
    if (!hasMoreChartsOnThisDay) setLoggedTrainingInfoMd(false);
    await App.deleteSpecificLog(logId, dayId, tittle, !!hasMoreChartsOnThisDay);
    if (selectedCellId) setSelectedCellId(undefined);
  };

  const handleCompletedTask = async (
    event: ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const isChecked = event.target.checked;
    if (!isChecked)
      if (window.confirm("Deseja realmente desmarcar a tarefa realizada?")) {
      } else return;
    setLoading(true);
    if (dayData && calendarData?.selectedMonth?.trainingData) {
      const updatedDayData: TDayTrainings = {
        ...dayData,
        completedCharts: dayData?.completedCharts.map((task) =>
          task.id === id
            ? { ...task, completed: isChecked ? true : false }
            : task
        ),
      };

      const updatedMonthData: IMonthData = {
        ...calendarData?.selectedMonth,
        trainingData: calendarData?.selectedMonth?.trainingData.map((day) =>
          day.id === dayData?.id ? updatedDayData : day
        ),
      };

      //SET DATA :
      await LocalBase.setData(
        `My Workout Data - ${userEmail}`,
        selectedMonthDocName,
        updatedMonthData
      );
      App.getSelectedMonthData();

      await Firestore.setDoc(
        `My Workout Data - ${userEmail}`,
        selectedMonthDocName,
        updatedMonthData
      );
      setLoading(false);
    }
  };

  let accordionArray: TChart[] | undefined = [];
  if (showToDoList) {
    accordionArray = dayData?.completedCharts?.filter(
      (ch) => ch.isTodo === true
    );
  } else {
    accordionArray = dayData?.completedCharts?.filter(
      (ch) => ch.isTodo === false
    );
  }

  const accordion = accordionArray?.map((c) => {
    let isDisabled = !c.comment && !c.description && !c.exercises;

    return (
      <Accordion
        id={c.id}
        key={c.id}
        elevation={3}
        expanded={expanded === c.id}
        aria-controls="panel1bh-content"
        onChange={
          isDisabled && !c.isTodo ? undefined : handleAccordionChange(c.id)
        }
      >
        <AccordionSummary
          id={c.id}
          sx={{ px: 1 }}
          aria-controls={c.id}
          expandIcon={
            <ExpandMoreIcon
              color={isDisabled && !c.isTodo ? "disabled" : "inherit"}
            />
          }
        >
          <Box
            sx={{
              width: "260px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              noWrap
              component="p"
              sx={{
                pl: "3px",
                ml: "1px",
                width: "100%",
                borderLeft: c.completed
                  ? `3px solid gray`
                  : `3px solid ${c.color}`,
                textDecoration: c.completed ? "line-through" : "",
              }}
            >
              {c.tittle}
            </Typography>
            <CustomDeleteIcon
              deleteFn={() => {
                const chartTittle = c.tittle;
                if (dayData) {
                  handleDelete(c.id, dayData.id, chartTittle);
                }
              }}
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {c.comment && (
            <Typography component="p" variant="body2">
              {c.comment}
            </Typography>
          )}
          {c.description && (
            <Typography component="p" variant="subtitle1">
              {c.description}
            </Typography>
          )}
          {c.exercises && (
            <Typography
              variant="body2"
              component="section"
              sx={{ mt: 2, whiteSpace: "pre-line", wordWrap: "break-word" }}
            >
              {c.exercises}
            </Typography>
          )}
          {c.isTodo && (
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={loading}
                    checked={!!c.completed}
                    value={!!c.completed}
                    onChange={(event) => handleCompletedTask(event, c.id)}
                  />
                }
                label="Tarefa realizada"
              />
            </FormGroup>
          )}
        </AccordionDetails>
      </Accordion>
    );
  });

  if (accordion?.length)
    return (
      <Box mt={2} width="100%">
        <Typography component="h2" mb={1} variant="subtitle1">
          {showToDoList ? "Tarefas:" : "Treinos Completos:"}
        </Typography>
        <Stack p="5px" overflow="auto" maxHeight={containerSize}>
          {accordion}
        </Stack>
      </Box>
    );
};
