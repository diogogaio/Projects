import { useContext, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";

/* If you are calling a custom hook inside the AuthContext provider or anywhere in the context file where it is being defined, you cannot use the same context you are trying to create. This leads to a circular dependency issue, where the context isn’t available yet, that's why this hook is not being used inside Auth context */

export const useRequestTimer = () => {
  const { Auth } = useContext(AuthContext);
  const timerId = useRef<number | null>(null);

  const startRequestTimer = () => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    timerId.current = setTimeout(() => {
      Auth?.setOpenPatienceDialog(true);
      autoCancel();
    }, 5000);
  };

  const cancelRequestTimer = () => {
    Auth?.setOpenPatienceDialog(false);

    if (timerId.current) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }
  };

  const autoCancel = () => {
    if (timerId.current) setTimeout(() => cancelRequestTimer(), 80 * 1000);
  };

  return { startRequestTimer, cancelRequestTimer };
};
