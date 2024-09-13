import { ReactNode } from "react";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

import { useThemeContext } from "../contexts";
import gym1 from "../../assets/images/gym1.jpg";
import gymLight from "../../assets/images/gymLight.jpg";
import { Footer, Header, UserStatus } from "../components";

interface IAppLayout {
  children: ReactNode;
}

export const AppLayout = ({ children }: IAppLayout) => {
  const { AppThemes } = useThemeContext();

  const location = useLocation();
  const currentLocation = location.pathname;

  return (
    <Box
      sx={{
        width: "99vw",
        height: "100vh",
        display: "flex",
        overflowX: "hidden", // Prevent horizontal overflow
        textAlign: "center",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundImage:
          AppThemes.selectedAppTheme === "dark"
            ? `url(${gym1})`
            : `url(${gymLight})`,
      }}
    >
      <Header />
      {children}
      {currentLocation !== "/Login" && currentLocation !== "/SignUp" && (
        <Box sx={{ mt: 2, alignSelf: "center" }}>
          <UserStatus />
        </Box>
      )}
      <Footer />
    </Box>
  );
};
