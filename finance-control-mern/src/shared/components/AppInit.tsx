import { useEffect } from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

import { AppLayout } from "./AppLayout";
import { PatienceDialog } from "./modals";
import { useAuthContext } from "../contexts";
import { useRequestTimer } from "../utils/useRequestTimer";

// Keep user from accessing login page if he already have a token
export const AppInit = () => {
  const { Auth } = useAuthContext();
  const { startRequestTimer, cancelRequestTimer } = useRequestTimer();

  useEffect(() => {
    const initialize = async () => {
      startRequestTimer();
      console.log("Initializing App...");
      await Auth.appInit();
      cancelRequestTimer();
    };
    initialize();
  }, []);

  return (
    <AppLayout>
      <Box
        sx={{
          p: 4,
          gap: 2,
          top: "50%",
          left: "50%",
          boxShadow: 20,
          display: "flex",
          overflow: "auto",
          maxHeight: "90vh",
          position: "absolute",
          flexDirection: "column",
          bgcolor: "background.paper",
          width: { xs: "95vw", sm: "350px" },
          transform: "translate(-50%, -50%)",
        }}
      >
        <LinearProgress color="secondary" sx={{ width: "100%" }} />
        <Typography>Aguarde um momento...</Typography>
        <PatienceDialog />
      </Box>
    </AppLayout>
  );
};
