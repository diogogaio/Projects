import {
  Box,
  Icon,
  Stack,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

import { useAppContext, useAuthContext } from "../contexts";

export const UserStatus = () => {
  const { App } = useAppContext();
  const { Auth } = useAuthContext();

  return (
    <>
      <Stack
        sx={{
          alignItems: "end",
        }}
        direction="row"
        justifyContent="center"
      >
        <Box sx={{ display: "flex", alignItems: "center", maxWidth: "250px" }}>
          <PersonIcon
            sx={{
              fontSize: "1.1rem",
              mr: "5px",
              color: Auth.userEmail ? "green" : "red",
            }}
          />
          <Typography noWrap variant="body2" textOverflow="ellipsis">
            {Auth.userEmail}
          </Typography>
        </Box>
        {Auth.userEmail && (
          <IconButton
            disabled={App.loading}
            sx={{ pb: 0 }}
            color="secondary"
            onClick={Auth.logout}
          >
            <Tooltip title="Sair">
              <Icon>logout</Icon>
            </Tooltip>
          </IconButton>
        )}
      </Stack>
    </>
  );
};
