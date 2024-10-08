import {
  Box,
  Stack,
  Alert,
  Button,
  Divider,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { AppLayout } from "../shared/components";
import { useAuthContext } from "../shared/contexts";
import { Environment } from "../shared/environment";

export type TSignUp = z.infer<typeof schema>;

const schema = z
  .object({
    email: z.string().email({ message: "Insira um email válido" }),
    emailConfirm: z.string().email({ message: "Insira um email válido" }),
    password: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres." }),
    passwordConfirm: z
      .string()
      .min(6, { message: "Senha precisar ter entre 6 e 15 caracteres" })
      .max(15, { message: "Senha precisar ter entre 6 e 15 caracteres" }),
  })
  .refine((data) => data.email === data.emailConfirm, {
    message: "Emails não conferem",
    path: ["emailConfirm"], // path of error
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Senhas não conferem",
    path: ["passwordConfirm"],
  });

export const SignUp = () => {
  const { Auth } = useAuthContext();
  const navigate = useNavigate();

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

    const response = await Auth.createNewUser(data);

    if (response instanceof Error) {
      const errorMessage = response.message;
      setError("root", { message: errorMessage });
    }
    reset();
  };

  const handleCancel = () => {
    reset();
    clearErrors();
    navigate("/login");
  };

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
          id="modal-novo-usuário"
          color={Environment.APP_MAIN_TEXT_COLOR}
        >
          Criar usuário
        </Typography>

        <Divider />

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
            gap: 1,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            {...register("email")}
            autoFocus
            fullWidth
            name="email"
            label="Email"
            variant="standard"
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            {...register("emailConfirm")}
            fullWidth
            variant="standard"
            name="emailConfirm"
            label="Repita seu email"
            error={!!errors.emailConfirm}
            helperText={errors.emailConfirm?.message}
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
          />

          <TextField
            {...register("passwordConfirm")}
            fullWidth
            type="password"
            variant="standard"
            name="passwordConfirm"
            label="Repita sua senha"
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm?.message}
          />
          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            sx={{
              mt: 4,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Button
              color="secondary"
              onClick={handleCancel}
              variant={Environment.BUTTON_VARIANT}
            >
              Cancelar
            </Button>
            <Button type="submit" color="secondary" variant="contained">
              Criar
            </Button>
          </Stack>
        </Box>
      </Box>
    </AppLayout>
  );
};
