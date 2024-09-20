import { Alert, Snackbar, Typography } from "@mui/material";

import { useAppContext } from "../contexts";

export type IAppAlert = {
  message: string;
  severity: "error" | "warning" | "success" | "info";
};

export const AppAlert = () => {
  const { App } = useAppContext();
  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{
        borderRadius: "5px",
        border: "1px solid green",
      }}
      open={!!App.appAlert}
      autoHideDuration={3000}
      onClose={App.closeAppAlert}
    >
      <Alert
        variant="standard"
        sx={{ width: "100%" }}
        onClose={App.closeAppAlert}
        severity={App.appAlert?.severity}
      >
        <Typography
          noWrap
          color="inherit"
          variant="inherit"
          textOverflow="ellipsis"
        >
          {App.appAlert?.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};
