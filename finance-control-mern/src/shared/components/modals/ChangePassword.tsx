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

export type TChangePwdForm = z.infer<typeof schema>;

const schema = z
  .object({
    oldPassword: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres" }),
    newPassword: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres" }),
    newPasswordConfirm: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres" }),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Senhas não conferem",
    path: ["newPasswordConfirm"],
  });
export const ChangePassword = () => {
  const { Auth } = useAuthContext();

  const {
    reset,
    register,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TChangePwdForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<TChangePwdForm> = async (data) => {
    clearErrors();
    const response = await Auth.changePassword(data);

    if (response instanceof Error) {
      const errorMessage = response.message;
      setError("root", { message: errorMessage });
      return;
    }
    reset();
  };

  return (
    <Modal
      disableEscapeKeyDown
      open={Auth.openChangePasswordModal}
      aria-labelledby="modal-mudar-senha"
      onClose={() => Auth.setOpenChangePasswordModal(false)}
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
          id="modal-mudar-senha"
          color={Environment.APP_MAIN_TEXT_COLOR}
        >
          Mudar Senha
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
            {...register("oldPassword")}
            sx={{ mt: 1 }}
            type="password"
            label="Senha antiga: "
            name="oldPassword"
            error={!!errors.oldPassword}
            helperText={errors.oldPassword?.message}
          />
          <TextField
            {...register("newPassword")}
            label="Nova senha: "
            name="newPassword"
            type="password"
            variant="standard"
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <TextField
            {...register("newPasswordConfirm")}
            label="Confirme nova senha :"
            name="newPasswordConfirm"
            type="password"
            variant="standard"
            error={!!errors.newPasswordConfirm}
            helperText={errors.newPasswordConfirm?.message}
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
              onClick={() => {
                Auth.setOpenChangePasswordModal(false);
                reset();
                if (!!errors) clearErrors();
              }}
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
