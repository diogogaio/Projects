import { useEffect } from "react";
import { Box } from "@mui/material";

import { useAppContext, useAuthContext } from "../contexts";
import { useRequestTimer } from "../utils/useRequestTimer";

let tokenHandled = false;

export const GoogleLogin = () => {
  const { App } = useAppContext();
  const { Auth } = useAuthContext();
  const { startRequestTimer, cancelRequestTimer } = useRequestTimer();

  useEffect(() => {
    if (!Auth.userEmail) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      if (!tokenHandled) {
        (window as any).handleToken = async (response: any) => {
          App.setLoading(true);
          tokenHandled = true;
          startRequestTimer();
          await Auth.handleSignInWithGoogle(response);
          cancelRequestTimer();
        };
      }
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [Auth.userEmail]);

  return (
    <Box sx={{ mt: 3 }}>
      {!tokenHandled && (
        <div
          id="g_id_onload"
          data-ux_mode="popup"
          data-context="signin"
          data-itp_support="true"
          data-auto_prompt={tokenHandled ? false : true}
          data-auto_select="true"
          data-callback="handleToken"
          data-close_on_tap_outside="false"
          data-client_id={import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID}
        ></div>
      )}

      <div
        data-shape="pill"
        data-size="large"
        data-theme="outline"
        data-type="standard"
        data-text="signin_with"
        className="g_id_signin"
        data-logo_alignment="left"
        style={{
          pointerEvents: App.loading ? "none" : "auto",
          opacity: App.loading ? 0.5 : 1,
        }}
      ></div>
    </Box>
  );
};
