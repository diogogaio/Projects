import { isSameMonth } from "date-fns";
import { Box, Link, Typography } from "@mui/material";

import { useGlobalContext } from "../contexts";

export const ActualDate = () => {
  const { App, inputDate } = useGlobalContext();

  const today = new Date();

  const sameMonth = isSameMonth(inputDate, today);

  return (
    <Box mt={1}>
      <Typography
        variant="captionSMI"
        sx={{
          mt: 1,
          alignSelf: "center",
          cursor: sameMonth ? "default" : "pointer",
        }}
      >
        <Link
          underline={sameMonth ? "none" : "hover"}
          onClick={() => (sameMonth ? "" : App.changeDate(today.getTime()))}
        >
          {sameMonth ? "Data de hoje:" : "Ir para data de hoje: "}{" "}
          <time>
            {today.toLocaleString("default", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </Link>
      </Typography>
    </Box>
  );
};
