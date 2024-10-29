import {
  Slide,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";

import { Patience } from "../Patience";
import { useAuthContext } from "../../contexts";
import { Environment } from "../../environment";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const PatienceDialog = () => {
  const { Auth } = useAuthContext();

  const handleClose = () => {
    Auth.setOpenPatienceDialog(false);
  };

  return (
    <>
      <Dialog
        onClose={handleClose}
        open={Auth.openPatienceDialog}
        TransitionComponent={Transition}
        aria-describedby="Seja bem vindo!"
      >
        <DialogTitle color={Environment.APP_MAIN_TEXT_COLOR}>Olá!</DialogTitle>

        <DialogContent>
          <Patience />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ok! </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
