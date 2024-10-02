import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { useAuthContext } from "../shared/contexts";
import { PaymentsService } from "../shared/services/payments/paymentsService";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
console.log("CHECKOUT LOADED");
export const Checkout = () => {
  const { Auth } = useAuthContext();
  const email = Auth.userEmail;

  console.log("CHECKOUT RENDERED!");

  const fetchClientSecret = useCallback(async () => {
    const response = await PaymentsService.createSession(email);

    console.log("FETCH CLIENT response: ", response);

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
