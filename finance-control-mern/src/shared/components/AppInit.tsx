import { useEffect } from "react";
import { Box, LinearProgress } from "@mui/material";

import { useAuthContext } from "../contexts";

export const AppInit = () => {
  const { Auth } = useAuthContext();

  useEffect(() => {
    const initialize = async () => {
      console.log("Initializing App...");
      await Auth.appInit();
    };
    initialize();
  }, []);

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <LinearProgress color="secondary" />
    </Box>
  );
};
