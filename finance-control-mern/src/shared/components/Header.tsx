import { indigo } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";

import { useAuthContext, useTransactionContext } from "../contexts";

export const Header = () => {
  const { Transaction } = useTransactionContext();
  const { Auth } = useAuthContext();
  const userEmail = Auth.userEmail;
  const navigate = useNavigate();
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
      <Typography
        onClick={() => {
          if (Auth.userEmail) navigate("/transactions");
        }}
        sx={{
          color: "white",
          margin: "0 auto",
          textAlign: "center",
          display: "inline-block",
          cursor: Auth.userEmail ? "pointer" : "default",
        }}
        variant="h4"
      >
        Equilíbrio Financeiro
      </Typography>
      {userEmail && (
        <Typography
          gutterBottom
          variant="body2"
          sx={{ textAlign: "center", color: "white", opacity: "0.5" }}
        >
          {Transaction.listInfo}
        </Typography>
      )}
    </Box>
  );
};
