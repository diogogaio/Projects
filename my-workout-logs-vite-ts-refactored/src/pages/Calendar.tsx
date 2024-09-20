import {
  Box,
  Table,
  TableRow,
  useTheme,
  TableHead,
  TableCell,
  TableBody,
  LinearProgress,
  TableContainer,
} from "@mui/material";
import { nanoid } from "nanoid";
import { addMonths, subMonths } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActualDate,
  MonthPicker,
  CalendarDay,
  GymChartsMd,
  CalendarMenu,
  LogTrainingMd,
  NewGymChartMd,
  LoggedTrainingInfoMd,
} from "../shared/components";
import { IAppStateType } from "../shared/types";
import { AppCenterLayout, AppLayout } from "../shared/layout";
import { useGlobalContext, useThemeContext } from "../shared/contexts";

export const Calendar = () => {
  const [isTodo, setIsTodo] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState<string | undefined>(
    undefined
  );

  const { Utils, inputDate, calendarData, appLoading } = useGlobalContext();

  const { AppThemes } = useThemeContext();

  const [lastHiddenTime, setLastHiddenTime] = useState(0);

  useEffect(() => {
    // This is useful in scenarios where the app has been in the background for an extended period of time, the user might make changes from another device and then return to this app, ensuring they see the most up-to-date data.

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setLastHiddenTime(Date.now());
      } else {
        const currentTime = Date.now();
        if (lastHiddenTime && currentTime - lastHiddenTime > 3600000) {
          // 3600000 ms = 1 hour

          window.location.reload();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lastHiddenTime]);

  const tableHeadCellStyle = {
    textAlign: "center",
    padding: "0.5rem 0.9rem",
  };
  const weekendCellStyle = {
    textAlign: "center",
    fontWeight: "bolder",
    padding: "0.5rem 0.9rem",
  };

  const createCalendarContent = useCallback(
    (date: IAppStateType["inputDate"]) => {
      const { daysInMonth, firstDay, month, year } = Utils.formatDate(
        date,
        false
      );
      const previousMonthDate = subMonths(date, 1);
      const prevDate = Utils.formatDate(previousMonthDate, false);

      const nextMonthDate = addMonths(date, 1);
      const nextDate = Utils.formatDate(nextMonthDate, false);

      // Populate the monthDays array with day numbers
      const monthDays = [];
      for (let i = 1; i <= daysInMonth; i++) {
        monthDays.push(Number(i));
      }

      //Get the day of Week(i.e: Sunday is 0, Monday is 1 and so on...)
      const dayOfWeek = firstDay;

      // Get the last day of the previous month
      const lastDayOfPreviousMonth = new Date(
        year,
        Number(month) - 1,
        0
      ).getDate();

      // Generate empty cells for the days before the 1st of the month
      for (let i = 0; i < dayOfWeek; i++) {
        monthDays.unshift(lastDayOfPreviousMonth - i);
      }

      const tableRowStyle = {
        padding: 4,
        width: "95%",
      };

      // Create rows and columns for the calendar
      const rows = [];
      let cells: any[] = [];
      monthDays.forEach((day, index) => {
        if (index % 7 === 0 && cells.length > 0) {
          rows.push(
            <TableRow sx={tableRowStyle} key={rows.length}>
              {cells}
            </TableRow>
          );
          cells = [];
        }
        cells.push(
          <CalendarDay
            day={day}
            key={nanoid()}
            isNextMonth={false}
            isLastMonth={index < dayOfWeek}
            selectedCellId={selectedCellId}
            setSelectedCellId={setSelectedCellId}
            year={index < dayOfWeek ? prevDate.year : year}
            month={index < dayOfWeek ? prevDate.month : month}
          />
        );
      });

      // Add any remaining cells less than a row of 7
      if (cells.length > 0) {
        // Fill the remaining cells with days from the next month
        const remainingDays = 7 - cells.length;
        for (let i = 1; i <= remainingDays; i++) {
          cells.push(
            <CalendarDay
              day={i} // Day number from the next month
              key={nanoid()}
              isNextMonth={true}
              isLastMonth={false}
              year={nextDate.year}
              month={nextDate.month}
              selectedCellId={selectedCellId}
              setSelectedCellId={setSelectedCellId}
            />
          );
        }

        rows.push(
          <TableRow sx={tableRowStyle} key={rows.length}>
            {cells}
          </TableRow>
        );
      }

      return rows;
    },
    [calendarData, appLoading, inputDate, selectedCellId]
  );

  const rows = useMemo(
    () => createCalendarContent(inputDate),
    [calendarData, inputDate, appLoading, selectedCellId]
  );
  const theme = useTheme();

  const TableContainerStyles = {
    boxShadow: AppThemes.selectedAppTheme === "dark" ? theme.LightShadow : 4,
    width: {
      xs: "98%",
      sm: "98%",
      md: "95%",
      lg: "80%",
      xl: "90%",
    },
    mt: 2,

    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  };

  const tableStyles = {
    height: {
      lg: "70%",
      xl: "70%",
    },

    width: {
      xs: "98%",
      sm: "98%",
      md: "95%",
      lg: "80%",
      xl: "80%",
    },
    margin: "auto",
  };

  return (
    <AppLayout>
      <AppCenterLayout>
        <LoggedTrainingInfoMd
          selectedCellId={selectedCellId}
          setSelectedCellId={setSelectedCellId}
          setIsTodo={setIsTodo}
        />
        <LogTrainingMd
          selectedCellId={selectedCellId}
          setSelectedCellId={setSelectedCellId}
          setIsTodo={setIsTodo}
        />
        <GymChartsMd />
        <NewGymChartMd isTodo={isTodo} setIsTodo={setIsTodo} />

        <TableContainer sx={TableContainerStyles}>
          <MonthPicker
            selectedCellId={selectedCellId}
            setSelectedCellId={setSelectedCellId}
          />
          <CalendarMenu
            selectedCellId={selectedCellId}
            setSelectedCellId={setSelectedCellId}
          />

          {appLoading && (
            <Box width="100%">
              <LinearProgress />
            </Box>
          )}

          <Table id="TABLE" sx={tableStyles}>
            <TableHead>
              <TableRow>
                <TableCell sx={weekendCellStyle}>Dom</TableCell>
                <TableCell sx={tableHeadCellStyle}>Seg</TableCell>
                <TableCell sx={tableHeadCellStyle}>Ter</TableCell>
                <TableCell sx={tableHeadCellStyle}>Qua</TableCell>
                <TableCell sx={tableHeadCellStyle}>Qui</TableCell>
                <TableCell sx={tableHeadCellStyle}>Sex</TableCell>
                <TableCell sx={weekendCellStyle}>Sab</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </Table>

          {appLoading && (
            <Box width="100%">
              <LinearProgress />
            </Box>
          )}

          <ActualDate />
        </TableContainer>
      </AppCenterLayout>
    </AppLayout>
  );
};
