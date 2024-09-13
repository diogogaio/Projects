import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// days js
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useGlobalContext } from "../contexts";

type TMonthPicker = {
  selectedCellId: string | undefined;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export function MonthPicker({
  selectedCellId,
  setSelectedCellId,
}: TMonthPicker) {
  const { appLoading, App, inputDate } = useGlobalContext();

  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <DatePicker
          disabled={appLoading}
          value={dayjs(inputDate)}
          views={["month", "year"]}
          label="Mês selecionado: "
          sx={{ marginTop: 2, color: "white" }}
          onChange={(newValue) => {
            const date1 = (newValue as any).$d;
            //Ts complaining about newValue not having $d property but its does.
            if (selectedCellId) setSelectedCellId(undefined);
            App.changeDate(date1);
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}
