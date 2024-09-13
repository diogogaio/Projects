import {
  Box,
  Link,
  Stack,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import React, { useCallback, useMemo } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { CustomDeleteIcon } from ".";
import { IAppStateType, TChart } from "../types";
import { useGlobalContext } from "../contexts/GlobalContext";

type TGymChartsAccordion = {
  maxItems: number;
  deletable: boolean;
  comment?: string;
  showTodoList?: boolean;
  callBack?: (
    id: string,
    comment: string | undefined,
    gymCharts: IAppStateType["gymCharts"]
  ) => void;
};

//Used by LogTrainingInfoMd and GymCharts components
export const GymChartsAccordion = ({
  callBack,
  maxItems,
  comment,
  deletable,
  showTodoList = false,
}: TGymChartsAccordion) => {
  const containerSize = `${maxItems * 48}px`;
  const { gymCharts, calendarData, Utils, App } = useGlobalContext();

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleAccordionChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  type TActionsProps = {
    id: string;
    tittle: string;
  };

  const Actions = ({ tittle, id }: TActionsProps) => {
    return deletable ? (
      <CustomDeleteIcon
        deleteFn={() => {
          const chartTittle = tittle;
          const chartId = id;
          App.deleteGymChart(chartId, chartTittle);
        }}
      />
    ) : (
      <Link
        id={id}
        sx={{
          mr: 1,
          color: "green",
        }}
        underline="hover"
        component="button"
        variant="buttonSM"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (callBack) callBack(id, comment, gymCharts);
        }}
      >
        Selecionar
      </Link>
    );
  };

  const createAccordion = useCallback(
    (showTodoList: boolean | undefined, charts: TChart[] | undefined) => {
      //Not showing todo list with this accordion yet, but leaving it available for later, if eventually needed one day.

      let accordionArray: TChart[] | undefined = [];

      if (showTodoList) {
        accordionArray = charts?.filter((ch) => ch.isTodo === true);
      } else {
        accordionArray = charts?.filter((ch) => ch.isTodo === false);
      }

      const accordion = accordionArray?.map((c) => {
        let isDisabled = !c.comment && !c.description && !c.exercises;
        return (
          <Accordion
            id={c.id}
            key={c.id}
            elevation={3}
            expanded={expanded === c.id}
            onChange={!isDisabled ? handleAccordionChange(c.id) : undefined}
          >
            <AccordionSummary
              id={c.id}
              aria-controls={c.id}
              expandIcon={
                <ExpandMoreIcon color={isDisabled ? "disabled" : "inherit"} />
              }
            >
              <Box
                sx={{
                  width: "280px",
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
                {!Utils.isDefaultChart() && (
                  <Actions key={c.id} tittle={c.tittle} id={c.id} />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {c.description && (
                <Typography component="p" sx={{ fontWeight: "bold" }}>
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
              <Typography
                component="time"
                color="secondary"
                variant="captionXS"
                sx={{ alignSelf: "end" }}
              >
                Criada em:
                <time>{c.dateCreated}</time>
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      });

      return accordion;
    },
    [gymCharts, expanded, showTodoList, calendarData, comment]
  );

  const accordion = useMemo(
    () => createAccordion(showTodoList, gymCharts),
    [gymCharts, expanded, showTodoList, calendarData, comment]
  );

  if (accordion?.length)
    return (
      <Box width="100%" mb={1}>
        <Stack p="5px" overflow="auto" maxHeight={containerSize}>
          {accordion}
        </Stack>
      </Box>
    );
  else
    return (
      <Typography component="p" mb={2}>
        {" "}
        Você ainda não criou fichas personalizadas.
      </Typography>
    );
};
