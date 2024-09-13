import React from "react";
import { Box } from "@mui/material";
import { useThemeContext } from "../contexts";
import { SubmitHandler } from "react-hook-form";

type TWrapper = {
  children: React.ReactNode;
  onSubmit: SubmitHandler<any>;
};

export const Wrapper = ({ children, onSubmit }: TWrapper) => {
  const { AppThemes } = useThemeContext();
  return (
    <Box
      id="wrapper"
      sx={{
        flex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          py: 4,
          px: 1,
          gap: 2,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          boxShadow: AppThemes.themeShadows,
          minWidth: { xs: "95%", sm: "80%", md: "50%", xl: "40%" },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
