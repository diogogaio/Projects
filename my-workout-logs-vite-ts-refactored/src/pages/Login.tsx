import {
  Box,
  Alert,
  Stack,
  Button,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import { z } from "zod";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";

import { AppLayout } from "../shared/layout";
import { useThemeContext, useGlobalContext } from "../shared/contexts";

export const Login = () => {
  const navigate = useNavigate();
  const { App } = useGlobalContext();
  const { AppThemes } = useThemeContext();

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
    clearErrors();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      console.log("User sign in success :", user.email);
      reset();
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);

        if (errorCode === "auth/user-not-found")
          setError("root", { message: "Usuário não encontrado!" });
        else if (errorCode === "auth/wrong-password")
          setError("root", { message: "Senha incorreta." });
        else if (errorCode === "auth/network-request-failed")
          setError("root", { message: "Falha de conexão com servidor." });
        else
          setError("root", {
            message: `Erro ao logar: "${errorCode}". Favor informar ao desenvolvedor.`,
          });
      }
    }
  };

  const handleUnknownUser = () => {
    reset();
    clearErrors();
    App.init();
    navigate("/Calendar");
  };
  console.log("AppThemes.selectedAppTheme: " + AppThemes.selectedAppTheme);
  const style = {
    width: {
      xs: "95%",
      sm: "420px",
      lg: "520px",
    },
    backgroundColor: AppThemes.toggleBgTransparency(),
    boxShadow: 24,
    borderRadius: 4,
    p: 4,
  };

  return (
    <AppLayout>
      <Box sx={style}>
        <Typography component="h2" id="transition-modal-title" variant="h6">
          Login
        </Typography>
        {isSubmitting && (
          <Box sx={{ width: "100%", mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
        {errors.root && (
          <Box mt={1} mb={1}>
            <Alert severity="error">{errors.root.message}</Alert>
          </Box>
        )}

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            {...register("email")}
            autoFocus
            type="text"
            name="email"
            label="Usuário"
            variant="standard"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            {...register("password")}
            sx={{ mt: 2 }}
            label="Senha"
            name="password"
            type="password"
            variant="standard"
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ display: "flex", justifyContent: "center", mt: 3 }}
          >
            <Button disabled={isSubmitting} type="submit">
              Entrar
            </Button>
            <Button disabled={isSubmitting} onClick={() => navigate("/SignUp")}>
              Criar Conta
            </Button>
            <Button
              disabled={isSubmitting}
              size="small"
              sx={{ fontSize: "0.75rem" }}
              onClick={handleUnknownUser}
            >
              Entrar sem conta*
            </Button>
          </Stack>
        </Box>
        <Typography component="aside" variant="captionSMI" mt={2}>
          Entrando sem logar as informações serão salvas somente neste
          dispositivo, não podendo ser acessadas em outros aparelhos e nem
          resgatadas em caso de perda de dados neste dispositivo.*
        </Typography>
      </Box>
    </AppLayout>
  );
};
