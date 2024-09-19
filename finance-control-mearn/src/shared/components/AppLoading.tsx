import { Box, CircularProgress } from "@mui/material";

export const AppLoading = () => {
  return (
    <CircularProgress
      sx={{
        top: "50%",
        left: "50%",
        position: "absolute" as "absolute",
        transform: "translate(-50%, -50%)",
      }}
      color="secondary"
    />
  );
};
