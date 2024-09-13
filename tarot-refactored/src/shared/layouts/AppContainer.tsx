import React from "react";
import { Paper } from "@mui/material";

import { DrawerMenu, Header, Footer, DrawerCards } from "../components";

type TAppContainerProps = {
  children: React.ReactNode;
};

export const AppContainer = ({ children }: TAppContainerProps) => {
  return (
    <Paper
      component={Paper}
      elevation={0}
      sx={{
        gap: 2,
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Header />
      {children}
      <DrawerMenu />
      <DrawerCards />
      <Footer />
    </Paper>
  );
};
