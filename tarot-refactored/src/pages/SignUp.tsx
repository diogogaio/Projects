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
import { createUserWithEmailAndPassword } from "firebase/auth";

import { Wrapper } from "../shared/components";
import { Environment } from "../shared/environment";
import { useServerContext } from "../shared/contexts";
import { AppContainer, AppMainContainer } from "../shared/layouts";

type TSignUp = z.infer<typeof schema>;

const schema = z
  .object({
    email: z.string().email({ message: "Insira um email válido" }),
    password: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres." }),
    passwordConfirm: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Senhas não conferem",
    path: ["passwordConfirm"], // path of error
  });

export const SignUp = () => {
  const { setServerSnackBarAlert } = useServerContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TSignUp>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<TSignUp> = async (data) => {
    clearErrors();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      reset();
      const user = userCredential.user;
      console.log(
        `User.createAccount(): User ${user.email} signed up successfully.`
      );
      setServerSnackBarAlert({
        open: true,
        severity: "success",
        message: "Conta criada com sucesso!",
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);

        if (errorCode === "auth/email-already-in-use")
          setError("root", { message: "Email já existente!" });
        else
          setError("root", {
            message: `Erro: "${errorCode}". Favor entrar em contato com desenvolvedor.`,
          });
      }
    }
  };

  const handleCancel = () => {
    reset();
    clearErrors();
    navigate("/login");
  };

  return (
    <AppContainer>
      <AppMainContainer page="">
        <Wrapper onSubmit={handleSubmit(onSubmit)}>
          <Typography
            color={Environment.APP_MAIN_TEXT_COLOR}
            variant="h5"
            width="100%"
            align="center"
            component="h5"
          >
            Criar Usuário
          </Typography>

          {errors.root && (
            <Box mt={1} mb={1} width="100%">
              <Alert severity="error">{errors.root.message}</Alert>
            </Box>
          )}
          {isSubmitting && (
            <Box sx={{ width: "100%", m: "0.5rem 0px" }}>
              <LinearProgress color={Environment.APP_MAIN_TEXT_COLOR} />
            </Box>
          )}
          <FormControl>
            <TextField
              {...register("email")}
              autoFocus
              id="email"
              name="email"
              label="Email"
              variant="filled"
              error={!!errors.email}
              disabled={isSubmitting}
              helperText={errors.email?.message}
            />
            <TextField
              {...register("password")}
              error={!!errors.password}
              sx={{ mt: 2 }}
              label="Senha"
              id="password"
              name="password"
              type="password"
              variant="filled"
              disabled={isSubmitting}
              helperText={errors.password?.message}
            />{" "}
            <TextField
              {...register("passwordConfirm")}
              sx={{ mt: 2 }}
              type="password"
              variant="filled"
              id="passwordConfirm"
              name="passwordConfirm"
              label="Repita sua senha"
              disabled={isSubmitting}
              error={!!errors.passwordConfirm}
              helperText={errors.passwordConfirm?.message}
            />
          </FormControl>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ display: "flex", justifyContent: "center", mt: 3 }}
          >
            <Button
              color={Environment.APP_MAIN_TEXT_COLOR}
              disabled={isSubmitting}
              type="submit"
            >
              Criar
            </Button>
            <Button
              color={Environment.APP_MAIN_TEXT_COLOR}
              disabled={isSubmitting}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
          </Stack>
        </Wrapper>
      </AppMainContainer>
    </AppContainer>
  );
};
