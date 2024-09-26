import { useEffect } from "react";
import { Box } from "@mui/material";

import { useAuthContext } from "../contexts";

export const GoogleLogin = () => {
  const { Auth } = useAuthContext();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Define the callback function globally so it can be accessed by Google callback
    (window as any).handleToken = (response: any) => {
      Auth.handleSignInWithGoogle(response);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Box mt={3}>
      <div
        id="g_id_onload"
        data-client_id={import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleToken"
        data-itp_support="true"
        data-auto_prompt="true"
        data-auto_select="true"
        data-close_on_tap_outside="false"
      ></div>

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="pill"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
      ></div>
    </Box>
  );
};
