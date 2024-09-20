import { indigo } from "@mui/material/colors";
import { Box, Typography } from "@mui/material";

import { useTransactionContext } from "../contexts";

export const Header = () => {
  const { Transaction } = useTransactionContext();
  return (
    <Box
      component="header"
      sx={{
        pb: 10,
        width: "100%",
        display: "flex",
        minHeight: "220px",
        bgcolor: indigo[800],
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography sx={{ textAlign: "center", color: "white" }} variant="h4">
        Equilíbrio Financeiro
      </Typography>
      <Typography
        gutterBottom
        variant="body2"
        sx={{ textAlign: "center", color: "white", opacity: "0.5" }}
      >
        {Transaction.listInfo}
      </Typography>
    </Box>
  );
};
