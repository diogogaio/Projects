import Grid from "@mui/material/Unstable_Grid2";

import { Card } from "./Card";

export const Totals = () => {
  return (
    <Grid
      container
      sx={{
        gap: 3,
        margin: 0,
        padding: 0,
        width: "100%",
        justifyContent: "center",
      }}
    >
      <Card cardType="income" />
      <Card cardType="outcome" />
      <Card cardType="balance" />
    </Grid>
  );
};
