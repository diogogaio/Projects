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
  FormControl,
  Autocomplete,
  InputAdornment,
  FormHelperText,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { nanoid } from "nanoid";
import { useState } from "react";
import { z, ZodError } from "zod";
import { Save } from "@mui/icons-material";
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
import { capitalizeFirstLetter } from "../../utils/formatText";

export const NewTransaction = () => {
  //Hooks
  const [tag, setTag] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [createNewTag, setCreateNewTag] = useState(false);

  const { App } = useAppContext();
  const { Auth } = useAuthContext();
  const { Transaction } = useTransactionContext();

  type TNewTransaction = z.infer<typeof schema>;

  const formatValue = (value: string) => {
    let formattedValue = value.replace(",", ".");
    const numberValue = parseFloat(formattedValue);
    return parseFloat(numberValue.toFixed(2));
  };

  const schema = z.object({
    tag: z
      .string()
      .min(3, { message: "Mínimo de 3 caracteres" })
      .max(20, { message: "Máximo de 20 caracteres" })
      .regex(/^[^\[\]]*$/, "Colchetes não são permitidos.")
      .transform((value) => value.trim().toLowerCase()),
    description: z
      .string()
      .min(3, { message: "Mínimo de 3 caracteres." })
      .max(20, { message: "Limite de caracteres excedidos." })
      .regex(/^[^\[\]]*$/, "Colchetes não são permitidos."),
    amount: z
      .string()
      .min(1, { message: "Valor obrigatório." })
      .max(10, { message: "Limite de caracteres excedidos." })
      .regex(/^(?!0$)(\d+([.,]?\d{1,2})?)$/, "Valor é inválido.")
      .refine((value) => !isNaN(parseFloat(value)) || parseFloat(value) === 0, {
        message: "Número inválido.",
      })
      .transform((value) => formatValue(value)),
    createdAt: z.string().default(dayjs(new Date()).format("YYYY-MM-DD")),
    recurrent: z.boolean().default(false),
    transactionType: z.enum(["income", "outcome"], {
      errorMap: () => ({ message: "Selecione algum tipo." }),
    }),
  });

  const newTagSchema = z
    .string()
    .min(3, { message: "Mínimo de 3 caracteres." })
    .max(20, { message: "Máximo de 20 caracteres." })
    .regex(/^[^\[\]]*$/, "Colchetes não são permitidos.")
    .transform((value) => value.toLocaleLowerCase());

  const {
    reset,
    control,
    register,
    setError,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TNewTransaction>({
    resolver: zodResolver(schema),
  });

  const handleNewTag = async (tag: string) => {
    try {
      clearErrors();
      setLoading(true);
      if (!tag) return;
      newTagSchema.parse(tag);
      await Auth.createTag(tag.trim());
      setTag("");
      setLoading(false);
      setCreateNewTag(false);
      setValue("tag", (capitalizeFirstLetter(tag) as string).trim());
      App.setAppAlert({ message: "Setor Adicionado.", severity: "success" });
    } catch (error) {
      setLoading(false);
      const errors = error as ZodError;
      let errorMessages: string = "";
      errors.errors.forEach((err) => (errorMessages += ` ${err.message} `));
      setError("tag", { message: `${errorMessages}` || "Setor inválido" });
    }
  };

  const handleDeleteTag = async () => {
    if (!tag) return alert("Setor não encontrado.");
    if (tag.toLowerCase() === "geral") {
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
      setValue("tag", "Geral");
      App.setAppAlert({ message: "Setor removido.", severity: "success" });
    }
  };

  const onSubmit: SubmitHandler<TNewTransaction> = async (data) => {
    clearErrors();
    if (createNewTag)
      return alert("Por favor finalize a criação do novo setor.");

    const newTransaction: ITransaction = { ...data, transactionId: nanoid() };

    Transaction.createNewTransaction(newTransaction);
    reset();
    clearErrors();
    Transaction.setOpenNewTransaction(false);
  };

  const invalidFieldsError = (error: any) => {
    console.log("Invalid fields:", error);
  };

  const closeThisModal = (_: React.SyntheticEvent, reason?: string) => {
    if (reason && reason === "backdropClick") return;
    else {
      Transaction.setOpenNewTransaction(false);
      setLoading(false);
      setCreateNewTag(false);
      setTag("");
      clearErrors();
      reset();
    }
  };

  return (
    <Modal
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
              control={<Checkbox name="recurrent" />}
              label="Transação recorrente"
            />
            <Tooltip title="Transações recorrentes serão lançadas à meia noite do primeiro dia de cada mês.">
              <Icon fontSize="small" color="secondary">
                info
              </Icon>
            </Tooltip>
          </Stack>

          {/* Transaction Tag */}
          <Stack id="tag-selector" direction="row">
            <Controller
              name="tag"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <Autocomplete
                  fullWidth
                  autoComplete
                  disablePortal
                  openText="Abrir"
                  closeText="Fechar"
                  value={value || null}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      setTag(newValue);
                      onChange(newValue);
                      return;
                    }
                    setTag("");
                    onChange(null);
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
                      name="tag"
                      {...params}
                      inputRef={ref}
                      label="Setor: "
                      error={!!errors.tag && !createNewTag}
                      helperText={!createNewTag ? errors?.tag?.message : ""}
                    />
                  )}
                />
              )}
            />
            <Stack direction="row">
              {!createNewTag && !tag && (
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
                fullWidth
                name="tag"
                value={tag}
                disabled={loading}
                label="Adicionar setor: "
                inputProps={{ maxLength: 20 }}
                helperText={errors.tag?.message}
                placeholder="Ex: gastos escolares"
                error={!!errors.tag && createNewTag}
                onChange={(event) => setTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleNewTag(tag);
                }}
                FormHelperTextProps={{
                  style: { color: "warning" },
                }}
              />

              <Stack direction="row">
                {!loading && (
                  <IconButton
                    color="success"
                    disabled={loading || !tag}
                    aria-label="adicionar-setor-inserido"
                    onClick={() => {
                      if (!tag) {
                        alert("Por favor, adicione um setor válido.");
                        return;
                      }
                      handleNewTag(tag);
                    }}
                  >
                    <CheckIcon />
                  </IconButton>
                )}
                {!loading && (
                  <IconButton
                    color="error"
                    disabled={loading}
                    aria-label="cancelar-criação-setor'"
                    onClick={() => {
                      setTag("");
                      setCreateNewTag(false);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
                {loading && (
                  <CircularProgress
                    size="1rem"
                    color="secondary"
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
              disabled={App.loading || loading}
            >
              <span>Salvar</span>
            </LoadingButton>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};
