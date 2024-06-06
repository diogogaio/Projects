import {
  Box,
  Stack,
  Accordion,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { TChart } from "../types";
import { CustomDeleteIcon } from ".";
import { useGlobalContext } from "../contexts";

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
  const containerSize = `${maxItems * 48}px`;
  const { App, Utils, inputDate, setLoggedTrainingInfoMd } = useGlobalContext();

  const [expanded, setExpanded] = useState<string | false>(false);

  const handleAccordionChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const { day } = Utils.formatDate(inputDate, false);
  const dayData = App.getDayData(day, "selectedMonth");
  const hasMoreChartsOnThisDay = dayData
    ? dayData.completedCharts.length > 1
    : dayData;

  const handleDelete = async (logId: string, dayId: string, tittle: string) => {
    if (!hasMoreChartsOnThisDay) setLoggedTrainingInfoMd(false);
    await App.deleteSpecificLog(logId, dayId, tittle, !!hasMoreChartsOnThisDay);
    if (selectedCellId) setSelectedCellId(undefined);
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
        onChange={!isDisabled ? handleAccordionChange(c.id) : undefined}
      >
        <AccordionSummary
          id={c.id}
          sx={{ px: 1 }}
          aria-controls={c.id}
          expandIcon={
            <ExpandMoreIcon color={isDisabled ? "disabled" : "inherit"} />
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
                borderLeft: `3px solid ${c.color}`,
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
