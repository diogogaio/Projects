import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CircularProgress } from "@mui/material";

import { PaymentsService } from "../shared/services/payments/paymentsService";
import { useAppContext, useAuthContext } from "../shared/contexts";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const Checkout = () => {
  const { Auth } = useAuthContext();
  const { App } = useAppContext();
  const email = Auth.userEmail;

  const fetchClientSecret = useCallback(async () => {
    App.setLoading(true);
    const response = await PaymentsService.createSession(email);

    if (response instanceof Error) {
      App.setLoading(false);
      console.log("Checkout ERROR: ", response);
      return "";
    }
    App.setLoading(false);
    return response.clientSecret;
  }, [email]);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        {App.loading && (
          <CircularProgress
            color="secondary"
            sx={{
              width: "100%",
              position: "absolute",
              top: "40%",
              left: "50%",
            }}
          />
        )}

        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};
