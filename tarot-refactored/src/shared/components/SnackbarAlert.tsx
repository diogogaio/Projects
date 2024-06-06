import { Alert, Snackbar } from "@mui/material";

import { useGlobalContext, useServerContext } from "../contexts";

type TSnackbarAlertProps = {
  origin: "server" | "app";
};
export const SnackbarAlert = ({ origin }: TSnackbarAlertProps) => {
  const { appSnackbarOptions, handleCloseAppSnackBarOptions } =
    useGlobalContext();
  const { serverSnackBarAlert, handleCloseServerSnackBar } = useServerContext();

  const originObject =
    origin === "server" ? serverSnackBarAlert : appSnackbarOptions;
  const closeDestination =
    origin === "server"
      ? handleCloseServerSnackBar
      : handleCloseAppSnackBarOptions;

  return (
    <Snackbar
      open={originObject?.open}
      autoHideDuration={5000}
      onClose={closeDestination}
    >
      <Alert
        onClose={closeDestination}
        severity={originObject?.severity}
        sx={{ width: "100%" }}
        variant={origin === "server" ? "filled" : "standard"}
      >
        {originObject?.message}
      </Alert>
    </Snackbar>
  );
};
