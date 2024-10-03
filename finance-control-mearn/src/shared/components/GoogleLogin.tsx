import { useEffect } from "react";
import { Box } from "@mui/material";

import { useAppContext, useAuthContext } from "../contexts";

export const GoogleLogin = () => {
  const { Auth } = useAuthContext();
  const { App } = useAppContext();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Define the callback function globally so it can be accessed by Google callback
    (window as any).handleToken = async (response: any) => {
      await Auth.handleSignInWithGoogle(response);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Box sx={{ mt: 3 }}>
      <div
        id="g_id_onload"
        data-ux_mode="popup"
        data-context="signin"
        data-itp_support="true"
        data-auto_prompt="true"
        data-auto_select="true"
        data-callback="handleToken"
        data-close_on_tap_outside="false"
        data-intermediate_iframe_close_callback=""
        data-client_id={import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID}
      ></div>

      <div
        data-shape="pill"
        data-size="large"
        data-theme="outline"
        data-type="standard"
        data-text="signin_with"
        className="g_id_signin"
        data-logo_alignment="left"
      ></div>
    </Box>
  );
};
