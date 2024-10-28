import {
  ISessionStatus,
  PaymentsService,
} from "../shared/services/payments/paymentsService";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Box,
  Stack,
  Button,
  Avatar,
  Divider,
  Typography,
  LinearProgress,
} from "@mui/material";
import { AppLayout } from "../shared/components";
import { Environment } from "../shared/environment";
import developer3 from "../assets/img/developer 3.jpg";
import { useAppContext, useTransactionContext } from "../shared/contexts";

export const PaymentReturn = () => {
  const [status, setStatus] = useState<
    ISessionStatus["status"] | "error" | null
  >(null);

  const { App } = useAppContext();
  let { session_id } = useParams();
  const { Transaction } = useTransactionContext();

  const getSessionStatus = async () => {
    if (session_id && !status) {
      App.setLoading(true);

      const response = await PaymentsService.sessionStatus(session_id);

      if (response instanceof Error) {
        App.setLoading(false);
        session_id = "";
        setStatus("error");
        return console.error("Error in payment service: " + response);
      }
      App.setLoading(false);
      setStatus(response.status);
    }
  };
  useEffect(() => {
    getSessionStatus();
  }, []);

  return (
    <AppLayout>
      <Box
        sx={{
          p: 4,
          gap: 1,
          top: "50%",
          left: "50%",
          boxShadow: 20,
          display: "flex",
          maxHeight: "95vh",
          flexDirection: "column",
          bgcolor: "background.paper",
          position: "absolute" as "absolute",
          transform: "translate(-50%, -50%)",
          width: { xs: "95vw", sm: "450px" },
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          id="modal-mudar-senha"
          color={Environment.APP_MAIN_TEXT_COLOR}
        >
          Retorno pagamentos
        </Typography>

        <Divider />
        {App.loading && (
          <LinearProgress color="secondary" sx={{ width: "100%" }} />
        )}

        <Box
          sx={{
            pt: 2,
            gap: 2,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Avatar
            src={developer3}
            alt="developer-cartoon"
            sx={{ width: 200, height: 200 }}
          />
          {status && (
            <Typography sx={{ fontStyle: "italic" }} variant="body1">
              {status === "complete"
                ? "Muito Obrigado!"
                : status === "open"
                ? "Seu pagamento está pendente..."
                : status === "error"
                ? "Houve um erro ao processar seu pagamento..."
                : "Sua sessão expirou ou não foi encontrada..."}
            </Typography>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Button
              color="secondary"
              variant={Environment.BUTTON_VARIANT}
              onClick={() => {
                Transaction.fetchMonthTransactions();
              }}
            >
              Voltar para transações
            </Button>
          </Stack>
        </Box>
      </Box>
    </AppLayout>
  );
};
