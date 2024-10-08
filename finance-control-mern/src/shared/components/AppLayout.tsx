import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Box } from "@mui/material";

import { UserStatus } from "./UserStatus";

interface IAppLayout {
  children: ReactNode;
}
interface IMain {
  children: ReactNode;
}

export const AppLayout = ({ children }: IAppLayout) => {
  const Main = ({ children }: IMain) => {
    return (
      <Box
        component="main"
        sx={{
          px: 1,
          gap: 4,
          flex: 1,
          display: "flex",
          marginTop: "-6rem",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        gap: 2,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "whitesmoke",
        justifyContent: "space-between",
      }}
    >
      <Header />
      <Main>{children}</Main>
      <UserStatus />
      <Footer />
    </Box>
  );
};
