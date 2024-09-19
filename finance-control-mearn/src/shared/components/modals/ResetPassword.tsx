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
import { LoadingButton } from "@mui/lab";
import { useAuthContext } from "../../contexts";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { Send } from "@mui/icons-material";
import { Environment } from "../../environment";
import { useNavigate, useParams } from "react-router-dom";

export type TResetPwdForm = z.infer<typeof schema>;
export type TResetPwdData = TResetPwdForm & { id: string; token: string };

const schema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres" }),
    passwordConfirm: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Senhas não conferem",
    path: ["passwordConfirm"],
  });

export const ResetPassword = () => {
  const { Auth } = useAuthContext();

  const { id, token } = useParams();
  const navigate = useNavigate();

  const {
    reset,
    register,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TResetPwdForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<TResetPwdForm> = async (data) => {
    clearErrors();

    if (!id || !token) {
      setError("root", {
        message: "Falha ao redefinir senha, informações ausentes.",
      });
      return;
    }
    const resetPwdData: TResetPwdData = {
      id,
      token,
      ...data,
    };

    const response = await Auth.resetPassword(resetPwdData);

    if (response instanceof Error) {
      const errorMessage = response.message;
      setError("root", { message: errorMessage });
      return;
    }
    reset();
  };

  const closeThisModal = (_: React.SyntheticEvent, reason?: string) => {
    if (reason && reason === "backdropClick") return;
    reset();
    if (!!errors) clearErrors();
    Auth.setOpenResetPwdModal(false);
    navigate("/");
    Auth.setOpenLoginModal(true);
  };

  return (
    <Modal
      disableEscapeKeyDown
      onClose={closeThisModal}
      open={Auth.openResetPwdModal}
      aria-labelledby="modal-redefinir-senha"
    >
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
          width: { xs: "95vw", sm: "350px" },
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          id="modal-redefinir-senha"
          color={Environment.APP_MAIN_TEXT_COLOR}
        >
          Redefinir senha
        </Typography>

        <Divider />

        {isSubmitting && (
          <Box sx={{ width: "100%" }}>
            <LinearProgress color="secondary" />
          </Box>
        )}

        {errors.root && (
          <Box mt={1} mb={1}>
            <Alert severity="error">{errors.root.message}</Alert>
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
            {...register("password")}
            label="Nova senha: "
            name="password"
            type="password"
            variant="standard"
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            {...register("passwordConfirm")}
            label="Confirme nova senha :"
            name="passwordConfirm"
            type="password"
            variant="standard"
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm?.message}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              mt: 4,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={closeThisModal}
              color="secondary"
              disabled={isSubmitting}
              variant={Environment.BUTTON_VARIANT}
            >
              cancelar
            </Button>
            <LoadingButton
              type="submit"
              color="secondary"
              endIcon={<Send />}
              variant="contained"
              loadingPosition="end"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <span>Enviar</span>
            </LoadingButton>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};
