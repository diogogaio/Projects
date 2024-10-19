import {
  Box,
  Icon,
  Modal,
  Stack,
  Radio,
  Button,
  Tooltip,
  Divider,
  Checkbox,
  TextField,
  FormLabel,
  RadioGroup,
  IconButton,
  Typography,
  Autocomplete,
  InputAdornment,
  FormControlLabel,
  CircularProgress,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { z } from "zod";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { Message, Save } from "@mui/icons-material";
import { FormEvent, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import {
  useAppContext,
  useAuthContext,
  useTransactionContext,
} from "../../contexts";
import { Environment } from "../../environment";
import { ITransaction } from "../../services/transaction/TransactionService";

export const NewTransaction = () => {
  //Hooks
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [createNewTag, setCreateNewTag] = useState(false);
  // const [form, setForm] = useState<ITransaction>({
  //   amount: 0,
  //   tag: "geral",
  //   description: "",
  //   recurrent: false,
  //   transactionId: "",
  //   transactionType: "outcome",
  //   createdAt: dayjs(new Date()).format("YYYY-MM-DD"),
  // });

  const { App } = useAppContext();
  const { Auth } = useAuthContext();
  const { Transaction } = useTransactionContext();

  type TNewTransaction = z.infer<typeof schema>;

  const formatValue = (value: string) => {
    // Replace comma with dot, parse float, and format to two decimal places
    let formattedValue = value.replace(",", ".");
    const numberValue = parseFloat(formattedValue);
    return parseFloat(numberValue.toFixed(2)); // Return value formatted to two decimal places
  };

  const schema = z.object({
    description: z
      .string()
      .min(3, { message: "Mínimo de 3 caracteres." })
      .max(20, { message: "Limite de caracteres excedidos." })
      .regex(/^[^\[\]]*$/, "Colchetes não são permitidos."), // Regex to disallow square brackets
    tag: z
      .string()
      .min(3, { message: "Mínimo de 3 caracteres" })
      .max(20, { message: "Máximo de 20 caracteres" })
      .regex(/^[^\[\]]*$/, "Colchetes não são permitidos.")
      .transform((value) => value.toLocaleLowerCase()),
    amount: z
      .string()
      .min(1, { message: "Valor obrigatório." })
      .max(10, { message: "Limite de caracteres excedidos." })
      .regex(/^(?!0$)(\d+([.,]?\d{1,2})?)$/, "Valor é inválido.") // Regex to validate format
      .refine((value) => !isNaN(parseFloat(value)) || parseFloat(value) === 0, {
        message: "Número inválido.",
      }) // Ensure the value is a valid number
      .transform((value) => formatValue(value)),
    createdAt: z.string().default(dayjs(new Date()).format("YYYY-MM-DD")),
    recurrent: z.boolean().default(false),
    transactionType: z.enum(["income", "outcome"], {
      errorMap: () => ({ message: "Selecione algum tipo." }),
    }),
  });

  const {
    reset,
    control,
    register,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TNewTransaction>({
    resolver: zodResolver(schema),
  });

  const handleNewTag = async () => {
    console.log("not available yet");
    // const newTag = form.tag.trim();

    // if (!newTag || newTag === "") return alert("Favor inserir novo setor.");

    // setLoading(true);
    // await Auth.createTag(newTag);
    // setLoading(false);
    // App.setAppAlert({ message: "Setor Adicionado.", severity: "success" });
  };

  const handleDeleteTag = async () => {
    if (!tag) return alert("Setor não encontrado.");
    if (tag === "geral") {
      return alert('Setor padrão "geral" não pode ser deletado.');
    }
    if (
      window.confirm(
        `Deseja apagar o setor "${tag}"?. Transações associadas a estes setor NÃO serão apagadas.`
      )
    ) {
      setLoading(true);
      await Auth.deleteTag(tag);
      setLoading(false);
      App.setAppAlert({ message: "Setor removido.", severity: "success" });
    }
  };

  const onSubmit: SubmitHandler<TNewTransaction> = async (data) => {
    clearErrors();

    console.log("@ DATA @ ", data);
    // if (createNewTag)
    //   return alert("Por favor finalize a criação do novo setor.");

    const newTransaction: ITransaction = { ...data, transactionId: nanoid() };

    Transaction.createNewTransaction(newTransaction);
    reset();
    clearErrors();
    Transaction.setOpenNewTransaction(false);
  };

  const invalidFieldsError = (error: any) => {
    console.log("Invalid fields:", error);
    let invalidMessages: string = "";
    Object.keys(error).forEach((field) => {
      invalidMessages += `${error[field].message ?? error[field].type} `;
    });
  };

  const closeThisModal = (_: React.SyntheticEvent, reason?: string) => {
    if (reason && reason === "backdropClick") return;
    else {
      Transaction.setOpenNewTransaction(false);
      clearErrors();
      reset();
    }
  };

  return (
    <Modal
      disableEscapeKeyDown
      onClose={closeThisModal}
      open={Transaction.openNewTransaction}
      aria-labelledby="modal-nova-transação"
    >
      <Box
        sx={{
          gap: 2,
          top: "50%",
          left: "50%",
          boxShadow: 20,
          display: "flex",
          overflow: "auto",
          maxHeight: "95vh",
          p: { xs: 2, md: 3 },
          flexDirection: "column",
          bgcolor: "background.paper",
          position: "absolute" as "absolute",
          transform: "translate(-50%, -50%)",
          width: { xs: "95vw", sm: "350px" },
        }}
      >
        <Typography
          color={Environment.APP_MAIN_TEXT_COLOR}
          id="modal-nova-transação"
          variant="h6"
          component="h2"
        >
          Adicionar Transação
        </Typography>

        <Divider />
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit, invalidFieldsError)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Transaction Tag */}
          <Stack id="tag-selector" direction="row">
            <Controller
              name="tag"
              control={control}
              render={({ field: { onChange, ref } }) => (
                <Autocomplete
                  fullWidth
                  autoComplete
                  disablePortal
                  openText="Abrir"
                  closeText="Fechar"
                  onChange={(_, newValue) => {
                    if (newValue) onChange(newValue);
                  }}
                  options={
                    Transaction.transactionTags &&
                    Transaction.transactionTags.length > 0
                      ? Transaction.transactionTags
                      : ["geral"]
                  }
                  noOptionsText="Sem opções"
                  loadingText="Carregando..."
                  disabled={
                    createNewTag || App.loading || loading || isSubmitting
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={ref}
                      error={!!errors.tag}
                      helperText={errors.tag?.message}
                      name="tag"
                      label="Setor: "
                    />
                  )}
                />
              )}
            />
            <Stack direction="row">
              {!tag && (
                <IconButton
                  sx={{ px: 2 }}
                  color="success"
                  aria-label="criar-setor"
                  onClick={() => setCreateNewTag(true)}
                  disabled={createNewTag || loading || App.loading}
                >
                  <AddIcon />
                </IconButton>
              )}
              {tag && !loading && (
                <IconButton
                  sx={{ px: 2 }}
                  color="error"
                  onClick={handleDeleteTag}
                  aria-label="excluir-setor-selecionado"
                  disabled={createNewTag || loading || App.loading}
                >
                  <DeleteIcon />
                </IconButton>
              )}
              {loading && !createNewTag && (
                <CircularProgress
                  size="1rem"
                  color="secondary"
                  sx={{ ml: 1, alignSelf: "center" }}
                />
              )}
            </Stack>
          </Stack>

          {/* Create new Tag */}
          {createNewTag && (
            <Stack direction="row">
              <TextField
                required
                autoFocus
                fullWidth
                name="tag"
                disabled={loading}
                label="Adicionar setor: "
                // onChange={handleInputChange}
                placeholder="Ex: gastos escolares"
                inputProps={{ maxLength: 20 }}
                FormHelperTextProps={{
                  style: { color: "warning" },
                }}
              />

              <Stack direction="row">
                {
                  /* form.tag && form.tag.toLowerCase() !== "geral" && */ !loading && (
                    <IconButton
                      color="success"
                      disabled={loading}
                      aria-label="adicionar-setor-inserido"
                      onClick={() => {
                        handleNewTag();
                      }}
                    >
                      <CheckIcon />
                    </IconButton>
                  )
                }
                {!loading && (
                  <IconButton
                    color="error"
                    disabled={loading}
                    aria-label="cancelar-criação-setor'"
                    onClick={() => {
                      console.log("not set yet");
                      // setForm({ ...form, tag: "geral" });
                      // setTag(null);
                      // setCreateNewTag(false);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
                {loading && (
                  <CircularProgress
                    color="secondary"
                    size="1rem"
                    sx={{ ml: 1, alignSelf: "center" }}
                  />
                )}
              </Stack>
            </Stack>
          )}

          {/* Transaction date */}
          <Controller
            name="createdAt"
            control={control}
            defaultValue={dayjs(new Date()).format("YYYY-MM-DD")}
            render={({ field: { onChange, value, ref } }) => (
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="pt-br"
              >
                <DatePicker
                  label="De:"
                  disabled={App.loading}
                  onError={() => alert("Verifique a data inserida.")}
                  inputRef={ref} // Pass ref to the input
                  value={value ? dayjs(value) : null}
                  onChange={(newValue: dayjs.Dayjs | null) => {
                    if (newValue) {
                      const formattedDate = newValue.format("YYYY-MM-DD");
                      onChange(formattedDate); // Update Controller's
                    }
                  }}
                />
              </LocalizationProvider>
            )}
          />

          {/* Description */}
          <TextField
            label="Descrição: "
            {...register("description")}
            placeholder="Ex: Mensalidade Escolar"
            inputProps={{ maxLength: 21 }}
            FormHelperTextProps={{
              style: { color: "warning" },
            }}
            error={!!errors.description}
            disabled={App.loading || isSubmitting}
            helperText={errors.description?.message}
          />
          {/* Amount */}
          <TextField
            fullWidth
            type="number"
            label="Valor: "
            variant="filled"
            placeholder="1000,00"
            {...register("amount")}
            error={!!errors.amount}
            helperText={errors?.amount?.message}
            InputProps={{
              inputProps: { step: "0.01", min: "0" },
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
            }}
          />

          {/* Transaction Type */}
          <FormLabel id="seleção tipo de transação">
            Tipo de Transação:
          </FormLabel>
          <Controller
            control={control}
            name="transactionType"
            render={({ field }) => (
              <FormControl
                component="fieldset"
                error={!!errors.transactionType}
              >
                <RadioGroup
                  sx={{ justifyContent: "center" }}
                  {...field}
                  value={field.value || ""}
                  row
                >
                  <FormControlLabel
                    value="income"
                    control={<Radio />}
                    label="Entrada"
                  />
                  <FormControlLabel
                    value="outcome"
                    control={<Radio />}
                    label="Saída"
                  />
                </RadioGroup>
                {errors.transactionType && (
                  <FormHelperText>
                    {errors.transactionType.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* Recurrent checkbox */}
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            {...register("recurrent")}
            justifyContent="center"
          >
            <FormControlLabel
              control={
                <Checkbox name="recurrent" /*onChange={console.log()} */ />
              }
              label="Transação recorrente"
            />
            <Tooltip title="Transações recorrentes serão lançadas à meia noite do primeiro dia de cada mês.">
              <Icon fontSize="small" color="secondary">
                info
              </Icon>
            </Tooltip>
          </Stack>

          <Divider />
          {/* Buttons */}
          <Stack mt={1} direction="row" spacing={1} alignSelf="end">
            <Button
              color="secondary"
              variant={Environment.BUTTON_VARIANT}
              onClick={closeThisModal}
            >
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              color="secondary"
              endIcon={<Save />}
              variant="contained"
              loading={App.loading || loading}
              loadingPosition="end"
              disabled={App.loading || loading || !!error}
            >
              <span>Salvar</span>
            </LoadingButton>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};
