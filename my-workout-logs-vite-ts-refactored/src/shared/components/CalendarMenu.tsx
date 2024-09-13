import {
  Box,
  Icon,
  Menu,
  Button,
  Switch,
  Divider,
  MenuItem,
  FormGroup,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";

import { useGlobalContext, useThemeContext } from "../contexts";

type TCalendarMenu = {
  selectedCellId: string | undefined;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const CalendarMenu = ({
  selectedCellId,
  setSelectedCellId,
}: TCalendarMenu) => {
  const { App, User, setOpenNewGymChartModal, setGymChartsModal, appLoading } =
    useGlobalContext();
  const { AppThemes } = useThemeContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDeleteAllCharts = () => {
    App.deleteAllGymCharts();
    handleClose();
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedCellId) setSelectedCellId(undefined);
    setAnchorEl(event.currentTarget);
  };

  type TOptions = {
    icon: string;
    name: string;
    onClick: () => void;
    iconColor: "primary" | "success" | "warning" | "error";
  };

  const createMenuOptions = () => {
    const options: TOptions[] = [
      {
        name: "Fichas",
        icon: "note",
        iconColor: "primary",
        onClick: () => setGymChartsModal(true),
      },
      {
        name: "Criar fichas",
        icon: "note_add",
        iconColor: "success",
        onClick: () => setOpenNewGymChartModal(true),
      },
      {
        name: "Apagar todas fichas",
        icon: "note_delete",
        iconColor: "error",
        onClick: () => handleDeleteAllCharts(),
      },
      {
        name: "Apagar logs do mês",
        icon: "delete_forever",
        iconColor: "error",
        onClick: () => App.deleteMonthData(),
      },
    ];

    const menuItems = options.map((option) => (
      <MenuItem
        key={option.name}
        onClick={() => {
          option.onClick();
          handleClose();
        }}
      >
        <ListItemIcon>
          <Icon color={option.iconColor} fontSize="small">
            {option.icon}
          </Icon>
        </ListItemIcon>
        <ListItemText>{option.name}</ListItemText>
      </MenuItem>
    ));

    return menuItems;
  };

  const menuItems = createMenuOptions();

  return (
    <>
      <Box component="nav" sx={{ alignSelf: "end", mb: 1, mr: 1 }}>
        <Button
          id="basic-button"
          disabled={appLoading}
          aria-haspopup="true"
          onClick={handleClick}
          aria-expanded={open ? "true" : undefined}
          aria-controls={open ? "basic-menu" : undefined}
        >
          Menu
        </Button>
      </Box>{" "}
      <Menu
        open={open}
        id="basic-menu"
        anchorEl={anchorEl}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {menuItems}

        <MenuItem
          onClick={() => {
            handleClose();
          }}
        >
          <ListItemIcon>
            <Icon color="disabled" fontSize="small">
              dark_mode
            </Icon>
          </ListItemIcon>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  onChange={(e) => {
                    AppThemes.toggleTheme(e.target.checked);
                  }}
                  checked={AppThemes.selectedAppTheme === "dark" ? true : false}
                />
              }
              label="Tema escuro"
            />
          </FormGroup>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            handleClose();
            User.deleteAccount();
          }}
        >
          <ListItemIcon>
            <Icon color="error" fontSize="small">
              {" "}
              person_remove
            </Icon>
          </ListItemIcon>
          <ListItemText>Deletar Usuário</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
