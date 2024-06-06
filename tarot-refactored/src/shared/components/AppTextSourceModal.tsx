import React from "react";
import { Box, Link, Modal, Paper, Stack, Typography } from "@mui/material";

import { useThemeContext } from "../contexts";

type TAppTextSourceModal = {
  openSourceModal: boolean;
  setOpenSourceModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppTextSourceModal = ({
  openSourceModal,
  setOpenSourceModal,
}: TAppTextSourceModal) => {
  const { AppThemes } = useThemeContext();
  const style = {
    p: 4,
    width: 400,
    top: "50%",
    left: "50%",
    border: "2px solid #000",
    bgcolor: "background.paper",
    boxShadow: AppThemes.themeShadows,
    transform: "translate(-50%, -50%)",
    position: "absolute" as "absolute",
  };

  return (
    <Modal
      open={openSourceModal}
      aria-labelledby="source-modal-title"
      onClose={() => setOpenSourceModal(false)}
      aria-describedby="source-modal-description"
    >
      <Box component={Paper} sx={style}>
        <Typography id="source-modal-title" variant="h6" component="h2">
          Fontes
        </Typography>

        <Stack mt={2} direction="column" spacing={1}>
          <Link
            underline="hover"
            target="_blank"
            href="https://tarotfarm.com.br"
          >
            TarotFarm
          </Link>
          <Link
            underline="hover"
            target="_blank"
            href="https://www.astrolink.com.br/tarot"
          >
            Astrolink
          </Link>
          <Link
            underline="hover"
            target="_blank"
            href="https://linhadasaguas.com.br/categoria-carta/dona-sete/"
          >
            Linha das Águas (Padilha/Dona Sete)
          </Link>
        </Stack>
      </Box>
    </Modal>
  );
};
