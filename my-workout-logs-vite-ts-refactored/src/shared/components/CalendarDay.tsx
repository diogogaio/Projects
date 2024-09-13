import { Box, Typography, TableCell, LinearProgress } from "@mui/material";

import {
  useThemeContext,
  useGlobalContext,
  useLocalBaseContext,
} from "../contexts";

/* Component to represent a single day in the calendar. This component renders the day of the month. */
type ICalendarDayProps = {
  day: number;
  year: number;
  month: string;
  isNextMonth: boolean;
  isLastMonth: boolean;
  selectedCellId: string | undefined;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const CalendarDay = ({
  day,
  year,
  month,
  isNextMonth,
  isLastMonth,
  selectedCellId,
  setSelectedCellId,
}: ICalendarDayProps) => {
  const {
    App,
    Utils,
    appLoading,
    setOpenLogTrainingModal,
    setLoggedTrainingInfoMd,
  } = useGlobalContext();

  const { AppThemes } = useThemeContext();
  //@ts-ignore
  const { LocalBase } = useLocalBaseContext();

  const currentDate = Utils.formatDate(new Date(), false);

  const dayDataArgument = isLastMonth
    ? "previousMonth"
    : isNextMonth
    ? "nextMonth"
    : "selectedMonth";
  const dayData = App.getDayData(day, dayDataArgument);

  const handleDayClick = (event: React.MouseEvent) => {
    // Access the data-* attribute of the parent element
    const element = event.currentTarget;
    const cell_Date = element.getAttribute("data-cell_date");
    const cell_Id = element.getAttribute("id");
    if (!appLoading) {
      setSelectedCellId(cell_Id ?? undefined);
      if (cell_Date) App.changeDate(cell_Date);
      dayData ? setLoggedTrainingInfoMd(true) : setOpenLogTrainingModal(true);
    }
  };

  const getDayCharts = () => {
    const chartsLength = dayData ? dayData?.completedCharts?.length : 0;
    const charts = dayData?.completedCharts.slice(0, 7).map((c) => {
      return (
        <Typography
          key={c.id}
          width="100%"
          component="p"
          sx={{
            ml: 1,
            mb: "1px",
            fontSize: "0.7rem",
            fontWeight: c.completed ? "inherit" : "bold",
            paddingLeft: "1px",
            borderLeft: c.completed ? `3px solid gray` : `3px solid ${c.color}`,
            textDecoration: c.completed ? "line-through" : "",
          }}
        >
          {c.tittle}
        </Typography>
      );
    });

    const dayChartsStyle = {
      width: "99%",
      display: "flex",
      overflow: "hidden",
      maxHeight: "130px",
      flexDirection: "column",
      alignItems: "flex-start",
      whiteSpace: chartsLength <= 2 ? "brakeWord" : "noWrap",
    };

    return (
      <>
        <Box sx={dayChartsStyle}>{charts}</Box>
        {chartsLength >= 7 && chartsLength - 7 !== 0 && (
          <Typography variant="captionXS" align="center" width="100%">
            +{chartsLength - 7}
          </Typography>
        )}
      </>
    );
  };

  const isToday =
    day === currentDate.day &&
    month === currentDate.month &&
    year === currentDate.year;

  const dayStyle = {
    alignSelf: "center",
  };

  const todayStyle = {
    padding: "5px",
    fontWeight: "bold",
    borderRadius: "5px",
    alignSelf: "center",
    border: "2px solid green",
  };

  const cellStyle = {
    margin: "auto",
    height: "150px",
    maxWidth: "40px",
    padding: "1px 2px",
    position: "relative",
  };

  const cellLayout = {
    width: "100%",
    height: "95%",
    display: "flex",
    marginTop: "0.5rem",
    flexDirection: "column",
    alignItems: "flex-start",
    cursor: day ? "pointer" : "default",
  };
  const overlayStyles = {
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    position: "absolute",
    backgroundColor:
      AppThemes.selectedAppTheme === "dark"
        ? "rgba(0, 0, 0, 0.6)"
        : "rgba(0, 0, 0, 0.2)",
  };
  const tableCellId = `${year}${Number(month)}${day}`;
  return (
    <TableCell
      role="button"
      sx={cellStyle}
      id={tableCellId}
      onClick={handleDayClick}
      data-cell_date={`${year}-${month}-${String(day).padStart(2, "0")}`}
    >
      {" "}
      {(isLastMonth || isNextMonth) && (
        <Box
          role="button"
          id={tableCellId}
          sx={overlayStyles}
          onClick={handleDayClick}
          data-cell_date={`${year}-${month}-${String(day).padStart(2, "0")}`}
        ></Box>
      )}
      <Box sx={cellLayout}>
        <Box sx={isToday ? todayStyle : dayStyle}>{day}</Box>
        {tableCellId === selectedCellId && appLoading && (
          <Box mb="5px" width="100%">
            <LinearProgress />
          </Box>
        )}
        {getDayCharts()}
      </Box>
    </TableCell>
  );
};
