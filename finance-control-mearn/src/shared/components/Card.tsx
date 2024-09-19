import Icon from "@mui/material/Icon";
import { red } from "@mui/material/colors";
import Grid from "@mui/material/Unstable_Grid2";
import { Box, Stack, Typography } from "@mui/material";

import { Environment } from "../environment";
import { useTransactionContext } from "../contexts";
import { useMemo } from "react";

interface ICardProps {
  cardType: "income" | "outcome" | "balance";
}

export const Card = ({ cardType }: ICardProps) => {
  const { Transaction } = useTransactionContext();

  const value = useMemo(
    () => Transaction.calculateTotals(cardType),
    [Transaction.list, cardType]
  );
  const isNegative: boolean = value < 0;
  let formattedValue = value.toLocaleString("pt-br", {
    minimumFractionDigits: 2,
  });
  if (isNegative) formattedValue = formattedValue.slice(1);

  const cardIcon =
    cardType === "income"
      ? { icon: "upload", color: "green" }
      : cardType === "outcome"
      ? { icon: "download", color: "red" }
      : { icon: "paid", color: "white" };

  const cardObj = {
    cardName:
      cardType === "income"
        ? "Entradas"
        : cardType === "outcome"
        ? "Saídas"
        : "Saldo",
    textColor: cardType !== "balance" ? "inherit" : "white",
    icon: cardIcon.icon,
    iconColor: cardIcon.color,
    bgColor: cardType !== "balance" ? "white" : Environment.APP_MAIN_TEXT_COLOR,
  };

  return (
    <Grid
      sx={{
        display: "flex",
        height: "145px",
        justifyContent: "center",
        maxWidth: { xs: "90%", sm: " 270px" },
      }}
      xs={12}
      md={4}
    >
      <Box
        sx={{
          padding: 2,
          width: "100%",
          display: "flex",
          borderRadius: 2,
          flexDirection: "column",
          justifyContent: "space-between",
          color: cardObj.textColor,
          bgcolor:
            isNegative && cardType === "balance" ? red[400] : cardObj.bgColor,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">{cardObj.cardName} </Typography>
          <Icon fontSize="large" sx={{ color: cardObj.iconColor }}>
            {cardObj.icon}
          </Icon>
        </Box>

        <Stack direction="row" justifyContent="center">
          <Typography
            id="currency"
            variant="caption"
            sx={{ whiteSpace: "nowrap", mr: "0.5px" }}
          >
            {cardType === "balance" && isNegative ? "-R$" : "R$"}
          </Typography>
          <Typography
            noWrap
            variant={formattedValue.length > 12 ? "h5" : "h4"}
            sx={{ textOverflow: "ellipsis" }}
          >
            {formattedValue}
          </Typography>
        </Stack>
      </Box>
    </Grid>
  );
};
