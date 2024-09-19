import { indigo } from "@mui/material/colors";
import { Box, Typography, useTheme } from "@mui/material";

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
        Controle Financeiro
      </Typography>
      <Typography
        sx={{ textAlign: "center", color: "white", opacity: "0.5" }}
        variant="body2"
        gutterBottom
      >
        {Transaction.listInfo}
      </Typography>
    </Box>
  );
};
