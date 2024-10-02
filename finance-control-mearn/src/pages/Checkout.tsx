import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { useAuthContext } from "../shared/contexts";
import { PaymentsService } from "../shared/services/payments/paymentsService";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
export const Checkout = () => {
  const { Auth } = useAuthContext();
  const email = Auth.userEmail;

  const fetchClientSecret = useCallback(async () => {
    const response = await PaymentsService.createSession(email);

    if (response instanceof Error) {
      console.log("Checkout ERROR: ", response);
      return "";
    }
    return response.clientSecret;
  }, [email]);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};
