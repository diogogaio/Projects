import {
  Box,
  Alert,
  Stack,
  Button,
  TextField,
  Typography,
  FormControl,
  LinearProgress,
} from "@mui/material";
import { z } from "zod";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";

import { Wrapper } from "../shared/components";
import { Environment } from "../shared/environment";
import { useServerContext } from "../shared/contexts";
import { AppContainer, AppMainContainer } from "../shared/layouts";

export const Login = () => {
  const { serverLoading, setServerSnackBarAlert } = useServerContext();

  const navigate = useNavigate();

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
      setServerSnackBarAlert({
        open: true,
        severity: "success",
        message: "Login realizado com sucesso!",
      });
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

  return (
    <AppContainer>
      <AppMainContainer page="">
        <Wrapper onSubmit={handleSubmit(onSubmit)}>
          <Typography
            variant="h5"
            width="100%"
            align="center"
            component="h5"
            color={Environment.APP_MAIN_TEXT_COLOR}
          >
            Login
          </Typography>

          {errors.root && (
            <Box width="100%" mt={1} mb={1}>
              <Alert severity="error">{errors.root.message}</Alert>
            </Box>
          )}

          {isSubmitting ||
            (serverLoading && (
              <Box sx={{ width: "100%", m: "0.5rem 0px" }}>
                <LinearProgress color={Environment.APP_MAIN_TEXT_COLOR} />
              </Box>
            ))}
          <FormControl>
            <TextField
              {...register("email")}
              autoFocus
              id="email"
              name="email"
              label="Usuário"
              variant="filled"
              error={!!errors.email}
              disabled={isSubmitting}
              helperText={errors.email?.message}
            />{" "}
          </FormControl>
          <FormControl>
            <TextField
              {...register("password")}
              id="password"
              label="Senha"
              name="password"
              type="password"
              variant="filled"
              disabled={isSubmitting}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </FormControl>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ display: "flex", justifyContent: "center", mt: 3 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting || serverLoading}
              color={Environment.APP_MAIN_TEXT_COLOR}
            >
              Entrar
            </Button>
            <Button
              disabled={isSubmitting || serverLoading}
              onClick={() => navigate("/sign-up")}
              color={Environment.APP_MAIN_TEXT_COLOR}
            >
              Criar Conta
            </Button>
            <Button
              size="small"
              disabled={isSubmitting}
              sx={{ fontSize: "0.75rem" }}
              onClick={() => {
                // setReadingTableCards(undefined);
                navigate("/readings-table/exemple-reading");
              }}
              color={Environment.APP_MAIN_TEXT_COLOR}
            >
              Continuar sem conta*
            </Button>
          </Stack>
        </Wrapper>
        <Typography
          mt={2}
          color="gray"
          textAlign="center"
          variant="caption"
          component="aside"
        >
          Funcionalidades serão reduzidas e não será possível salvar dados no
          servidor para que possam ser acessados de outros dispositivos.*
        </Typography>
      </AppMainContainer>
    </AppContainer>
  );
};
