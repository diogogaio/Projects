import React, { useState, useRef, useEffect } from "react";
import { Avatar, Box, LinearProgress, Typography } from "@mui/material";

import patience from "../../assets/img/patience2.jpg";
import { useAppContext, useAuthContext } from "../contexts";

const formatTime = (seconds: number) => {
  // const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

const StopWatch: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const { Auth } = useAuthContext();
  const intervalRef = useRef<number | null>(null);

  const startTimer = () => {
    if (!isRunning && Auth.openPatienceDialog) {
      setIsRunning(true);
      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setSeconds(0);
  };

  useEffect(() => {
    startTimer();

    return () => {
      resetTimer();
    };
  }, []);

  return (
    <Typography variant="body2" component="div">
      {formatTime(seconds)}
    </Typography>
  );
};

export const Patience = () => {
  const { App } = useAppContext();

  return (
    <Box
      sx={{
        gap: 2,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {App.loading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress color="secondary" />
        </Box>
      )}

      <Avatar
        src={patience}
        alt="patience-cartoon"
        sx={{ width: 300, height: 300 }}
      />

      <StopWatch />

      <Typography variant="body1" align="center">
        Por favor, tenha paciência, esta aplicação está rodando em servidor de
        nível gratuito, e após um certo período de inatividade é necessário
        aguardar em torno de cinquenta segundos para voltar a funcionar
        normalmente.
      </Typography>
    </Box>
  );
};
