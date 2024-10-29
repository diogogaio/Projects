import { useContext, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useRequestTimer = () => {
  const { Auth } = useContext(AuthContext);
  const timerId = useRef<number | null>(null);

  const startRequestTimer = () => {
    timerId.current = setTimeout(() => {
      Auth?.setOpenPatienceDialog(true);
      autoCancel();
    }, 5000);
  };

  const cancelRequestTimer = () => {
    Auth?.setOpenPatienceDialog(false);

    if (timerId.current) clearTimeout(timerId.current);
  };

  const autoCancel = () => {
    if (timerId.current) setTimeout(() => cancelRequestTimer(), 80 * 1000);
  };

  return { startRequestTimer, cancelRequestTimer };
};
