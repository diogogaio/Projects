import {
  Box,
  Alert,
  Modal,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import { z } from "zod";
import { useState } from "react";
import { useAuthContext } from "../../contexts";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { Environment } from "../../environment";
import { AuthService } from "../../services/auth/AuthService";

export const ForgotPassword = () => {
  const [successAlert, setSuccessAlert] = useState("");
  const [blockSubmit, setBlockSubmit] = useState(false);
  const { Auth } = useAuthContext();

  type TForgotPassword = z.infer<typeof schema>;

  const schema = z.object({
    email: z.string().email({ message: "Insira um email válido" }),
  });

  const {
    reset,
    register,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TForgotPassword>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<TForgotPassword> = async (data) => {
    if (errors) clearErrors();
    const response = await AuthService.forgotPassword(data.email);

    if (response instanceof Error) {
      const errorMessage = response.message;

      setError("root", { message: errorMessage });
      if (errorMessage === "Solicitação enviada recentemente.") {
        setBlockSubmit(true);
        setTimeout(() => {
          setBlockSubmit(false);
        }, 1000 * 60 * 10);
      }
      return;
    }

    reset();
    setSuccessAlert("Sucesso: Agora confira seu email.");
  };

  const closeThisModal = (_: React.SyntheticEvent, reason?: string) => {
    if (reason && reason === "backdropClick") return;
    reset();
    if (!!errors) clearErrors();
    Auth.setOpenForgotPwdModal(false);
    Auth.setOpenLoginModal(true);
  };

  return (
    <Modal
      disableEscapeKeyDown
      onClose={closeThisModal}
      open={Auth.openForgotPwdModal}
      aria-labelledby="modal-recuperação-senha"
    >
      <Box
        sx={{
          p: 4,
          gap: 2,
          top: "50%",
          left: "50%",
          boxShadow: 20,
          display: "flex",
          overflow: "auto",
          maxHeight: "90vh",
          flexDirection: "column",
          bgcolor: "background.paper",
          position: "absolute" as "absolute",
          transform: "translate(-50%, -50%)",
          width: { xs: "95vw", sm: "350px" },
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          id="modal-recuperação-senha"
          color={Environment.APP_MAIN_TEXT_COLOR}
        >
          Recuperação de senha
        </Typography>

        <Divider />

        {isSubmitting && (
          <Box sx={{ width: "100%", mt: 2 }}>
            <LinearProgress color="secondary" />
          </Box>
        )}

        {(errors.root || successAlert) && (
          <Box mt={1} mb={1}>
            <Alert severity={errors.root?.message ? "error" : "success"}>
              {errors.root?.message || successAlert}
            </Alert>
          </Box>
        )}

        <Box
          sx={{
            gap: 1,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            {...register("email")}
            fullWidth
            autoFocus
            type="text"
            name="email"
            label="Usuário"
            variant="standard"
            disabled={!!successAlert}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <Typography variant="body2" textAlign="center">
            As instruções para redefinição de senha serão enviadas no seu email
            de cadastro.
          </Typography>

          <Stack
            sx={{
              mt: 4,
              width: "100%",
              justifyContent: "center",
            }}
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
          >
            <Button
              onClick={closeThisModal}
              color="secondary"
              disabled={isSubmitting || blockSubmit}
              variant={Environment.BUTTON_VARIANT}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="secondary"
              variant="contained"
              disabled={isSubmitting || !!successAlert || blockSubmit}
            >
              Enviar
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};
