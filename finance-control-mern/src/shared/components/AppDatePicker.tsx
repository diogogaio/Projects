import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useState } from "react";
import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ITransaction } from "../services/transaction/TransactionService";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

type TAppDatePickerProps = {
  form: ITransaction;
  setForm: React.Dispatch<React.SetStateAction<ITransaction>>;
};

export function AppDatePicker({ form, setForm }: TAppDatePickerProps) {
  const [date, setDate] = useState<Date | string>(new Date());
  return (
    <Box width="100%">
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <DatePicker
          name="date"
          value={dayjs(date)}
          label="Data transação: "
          sx={{ marginTop: 2, color: "white", width: "100%" }}
          onChange={(newValue) => {
            if (newValue) {
              const newDate = dayjs(newValue).format("YYYY-MM-DD");
              setDate(newDate);
              setForm({ ...form, createdAt: newDate });
            }
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}
