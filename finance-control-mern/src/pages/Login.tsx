import {
  Box,
  Alert,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import { z } from "zod";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { AppLayout, GoogleLogin } from "../shared/components";
import { useAppContext, useAuthContext } from "../shared/contexts";

import { Environment } from "../shared/environment";
import { ForgotPassword } from "../shared/components/modals";

export const Login = () => {
  const { Auth } = useAuthContext();
  const { App } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      console.log("Initializing App...");
      console.log("Environment mode: " + Environment.ENV);
      await Auth.appInit();
    };
    initialize();
  }, [Environment.ENV]);

  type TFormField = z.infer<typeof schema>;

  const schema = z.object({
    email: z.string().email({ message: "Insira um email válido" }),
    password: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres" }),
  });

  const {
    reset,
    register,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TFormField>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<TFormField> = async (data) => {
    if (errors.root) clearErrors();

    const response = await Auth.login(data);

    if (response instanceof Error) {
      const errorMessage = response.message;
      setError("root", { message: errorMessage });
      return;
    }
    reset();
  };

  return (
    <AppLayout>
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
          id="modal-login"
          color={Environment.APP_MAIN_TEXT_COLOR}
        >
          Login
        </Typography>

        <Divider />

        {(isSubmitting || App.loading) && (
          <Box sx={{ width: "100%", mt: 2 }}>
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
            {...register("email")}
            fullWidth
            type="text"
            name="email"
            label="Usuário"
            variant="standard"
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isSubmitting || App.loading}
          />
          <TextField
            {...register("password")}
            fullWidth
            sx={{ mt: 1 }}
            label="Senha"
            name="password"
            type="password"
            variant="standard"
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isSubmitting || App.loading}
          />

          <Divider flexItem sx={{ mt: 2 }} />
          {!Auth?.userEmail && <GoogleLogin />}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              mt: 3,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={() => {
                navigate("/signup");
              }}
              color="secondary"
              disabled={isSubmitting || App.loading}
              variant={Environment.BUTTON_VARIANT}
            >
              Criar Conta
            </Button>
            <Button
              type="submit"
              color="secondary"
              variant="contained"
              disabled={isSubmitting || App.loading}
            >
              Entrar
            </Button>
          </Stack>
          <Button
            size="small"
            onClick={() => {
              Auth.setOpenForgotPwdModal(true);
            }}
            disabled={isSubmitting || App.loading}
          >
            Esqueci minha senha
          </Button>
        </Box>
        {/* Modals: */}
      </Box>
      <ForgotPassword />
    </AppLayout>
  );
};
