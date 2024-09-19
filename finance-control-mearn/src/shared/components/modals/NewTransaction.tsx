import {
  Box,
  Modal,
  Stack,
  Radio,
  Button,
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
  Tooltip,
  Icon,
} from "@mui/material";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { Save } from "@mui/icons-material";
import { FormEvent, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  useAppContext,
  useAuthContext,
  useTransactionContext,
} from "../../contexts";
import { Environment } from "../../environment";
import { AppDatePicker } from "../AppDatePicker";
import { ITransaction } from "../../services/transaction/TransactionService";

export const NewTransaction = () => {
  //Hooks
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [createNewTag, setCreateNewTag] = useState(false);
  const [form, setForm] = useState<ITransaction>({
    amount: 0,
    tag: "geral",
    description: "",
    recurrent: false,
    transactionId: "",
    transactionType: "outcome",
    createdAt: dayjs(new Date()).format("YYYY-MM-DD"),
  });

  const { App } = useAppContext();
  const { Auth } = useAuthContext();
  const { Transaction } = useTransactionContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Convert comma to dot for decimal separator and ensure two decimal places
    let formattedValue = value;
    if (name === "amount") {
      formattedValue = value.replace(",", ".");
      const numberValue = parseFloat(formattedValue);
      formattedValue = numberValue.toFixed(2);
      // Ensure the value doesn't exceed the maximum allowed
      if (numberValue > 99999999) {
        setError("Valor não permitido");
        return;
      } else setError("");
    }

    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNewTag = async () => {
    const newTag = form.tag.trim();

    if (!newTag || newTag === "") return alert("Favor inserir novo setor.");

    setLoading(true);
    await Auth.createTag(newTag);
    setLoading(false);
    App.setAppAlert({ message: "Setor Adicionado.", severity: "success" });
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

  const submitTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (createNewTag)
      return alert("Por favor finalize a criação do novo setor.");

    const NewTransaction: ITransaction = { ...form, transactionId: nanoid() };

    Transaction.createNewTransaction(NewTransaction);
  };

  const closeThisModal = (_: React.SyntheticEvent, reason?: string) => {
    if (reason && reason === "backdropClick") return;
    else Transaction.setOpenNewTransaction(false);
  };

  return (
    <Modal
      disableEscapeKeyDown
      open={Transaction.openNewTransaction}
      onClose={closeThisModal}
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
          onSubmit={submitTransaction}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Transaction Tag */}
          <Stack id="tag-selector" direction="row">
            <Autocomplete
              fullWidth
              value={tag}
              autoComplete
              disablePortal
              openText="Abrir"
              closeText="Fechar"
              onChange={(_, newValue) => {
                if (newValue) setForm({ ...form, tag: newValue.toLowerCase() });
                setTag(newValue);
              }}
              options={
                Transaction.transactionTags &&
                Transaction.transactionTags.length > 0
                  ? Transaction.transactionTags
                  : []
              }
              noOptionsText="Sem opções"
              loadingText="Carregando..."
              disabled={createNewTag || App.loading || loading}
              renderInput={(params) => (
                <TextField {...params} name="tag" label="Setor: " />
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
                onChange={handleInputChange}
                placeholder="Ex: gastos escolares"
                inputProps={{ maxLength: 20 }}
                FormHelperTextProps={{
                  style: { color: "warning" },
                }}
              />

              <Stack direction="row">
                {form.tag && form.tag.toLowerCase() !== "geral" && !loading && (
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
                )}
                {!loading && (
                  <IconButton
                    color="error"
                    disabled={loading}
                    aria-label="cancelar-criação-setor'"
                    onClick={() => {
                      setForm({ ...form, tag: "geral" });
                      setTag(null);
                      setCreateNewTag(false);
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

          {/* Transaction date picker */}
          <AppDatePicker form={form} setForm={setForm} />

          {/* Description */}
          <TextField
            required
            name="description"
            label="Descrição: "
            onChange={handleInputChange}
            placeholder="Ex: Mensalidade Escolar"
            inputProps={{ maxLength: 20 }}
            FormHelperTextProps={{
              style: { color: "warning" },
            }}
          />
          {/* Amount */}
          <TextField
            required
            fullWidth
            type="number"
            name="amount"
            label="Valor: "
            variant="filled"
            placeholder="1000,00"
            onChange={handleInputChange}
            error={!!error}
            helperText={error ? error : ""}
            InputProps={{
              inputProps: { step: "0.01", min: "0", max: "10000000" }, // Set step and min attributes for number input

              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
            }}
          />

          {/* Transaction Type */}
          <FormLabel id="transaction-type">Tipo: </FormLabel>
          <RadioGroup
            name="transactionType"
            defaultValue="outcome"
            onChange={handleInputChange}
            aria-labelledby="transaction-type-radio-buttons-group-label"
          >
            <Stack direction="row" justifyContent="center">
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
            </Stack>
          </RadioGroup>

          {/* Recurrent checkbox */}
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <FormControlLabel
              control={
                <Checkbox name="recurrent" onChange={handleInputChange} />
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
              onClick={() => Transaction.setOpenNewTransaction(false)}
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
