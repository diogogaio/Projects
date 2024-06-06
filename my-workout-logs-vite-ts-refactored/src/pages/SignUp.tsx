import {
  Box,
  Stack,
  Alert,
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

import { AppLayout } from "../shared/layout";
import { useThemeContext } from "../shared/contexts";

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
  const navigate = useNavigate();
  const { AppThemes } = useThemeContext();

  const {
    reset,
    register,
    setError,
    clearErrors,
    handleSubmit,
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
    navigate("/Login");
  };

  const style = {
    p: 4,
    width: {
      xs: "95%",
      sm: "420px",
      lg: "520px",
    },
    boxShadow: 24,
    borderRadius: 4,
    backgroundColor: AppThemes.toggleBgTransparency(),
  };

  return (
    <AppLayout>
      <Box sx={style}>
        <Typography component="h2" id="transition-modal-title" variant="h6">
          Criar usuário
        </Typography>
        {errors.root && (
          <Box mt={1} mb={1}>
            <Alert severity="error">{errors.root.message}</Alert>
          </Box>
        )}
        {isSubmitting && (
          <Box sx={{ width: "100%", mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
        <Box
          component="form"
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormControl>
            <TextField
              {...register("email")}
              autoFocus
              name="email"
              label="Email"
              variant="standard"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </FormControl>
          <FormControl>
            <TextField
              {...register("password")}
              sx={{ mt: 2 }}
              label="Senha"
              name="password"
              type="password"
              variant="standard"
              error={!!errors.password}
              helperText={errors.password?.message}
            />{" "}
          </FormControl>
          <FormControl>
            <TextField
              {...register("passwordConfirm")}
              sx={{ mt: 2 }}
              type="password"
              variant="standard"
              name="passwordConfirm"
              label="Repita sua senha"
              error={!!errors.passwordConfirm}
              helperText={errors.passwordConfirm?.message}
            />
          </FormControl>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ display: "flex", justifyContent: "center", mt: 3 }}
          >
            <Button type="submit">Criar</Button>
            <Button onClick={handleCancel}>Cancelar</Button>
          </Stack>
        </Box>
      </Box>
    </AppLayout>
  );
};
