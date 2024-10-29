import {
  Slide,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";

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

export const WelcomeDialog = () => {
  const { Auth } = useAuthContext();

  const handleClose = () => {
    Auth.setOpenWelcomeDialog(false);
  };
  (",  . . ");

  return (
    <>
      <Dialog
        open={Auth.openWelcomeDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="Seja bem vindo!"
      >
        <DialogTitle color={Environment.APP_MAIN_TEXT_COLOR}>
          Seja bem vindo!
        </DialogTitle>

        <DialogContent>
          <DialogContentText component="div" id="Seja bem vindo!">
            <b>Dicas de uso:</b>
            <ul>
              <li>
                Use o botão <b>"Nova transação"</b> para adicionar receitas ou
                despesas.
              </li>
              <li>
                Ao criar novas transações, organize-as em categorias apropriadas
                para obter resultados mais precisos ao aplicar os filtros de
                busca.
              </li>
              <li>
                Transações marcadas como recorrentes serão automaticamente
                registradas no primeiro dia de cada mês subsequente.
              </li>
              <li>
                Os gráficos serão atualizados automaticamente sempre que novas
                transações forem adicionadas.
              </li>
              <li>
                Os cálculos de <b>entrada</b>, <b>saída</b> e <b>saldo</b>{" "}
                referem-se às transações do <b>mês atual</b> ou aos resultados
                filtrados pela busca.
              </li>
              <li>
                Você pode acessar essas dicas a qualquer momento no menu da
                aplicação!
              </li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ok! </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
