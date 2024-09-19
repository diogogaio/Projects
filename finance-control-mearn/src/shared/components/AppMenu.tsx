import {
  Icon,
  Divider,
  MenuList,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Menu from "@mui/material/Menu";
import { useCallback, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";

import { generatePDF } from "../utils/exportPDF";
import {
  useAppContext,
  useAuthContext,
  useTransactionContext,
} from "../contexts";

interface IMenuItens {
  icon: string;
  label: string;
  onClick: () => void;
  iconColor: "secondary" | "error";
}

export function AppMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { App } = useAppContext();
  const { Auth } = useAuthContext();
  const { Transaction } = useTransactionContext();

  const renderAppMenu = useCallback(() => {
    const menuItems: IMenuItens[] = [
      {
        icon: "logout",
        label: "Sair",
        iconColor: "secondary",
        onClick: () => Auth.logout(),
      },
      {
        icon: "lockReset",
        label: "Mudar senha",
        iconColor: "secondary",
        onClick: () => Auth.setOpenChangePasswordModal(true),
      },
      {
        icon: "picture_as_pdf",
        label: "Exportar PDF",
        iconColor: "error",
        onClick: () => generatePDF(Auth.userEmail, Transaction.list),
      },
      {
        icon: "person_off",
        label: "Deletar usuário",
        iconColor: "error",
        onClick: () => Auth.deleteUser(),
      },
    ];

    return menuItems.map(({ icon, label, iconColor, onClick }, index) => [
      index === menuItems.length - 1 && <Divider key={`divider-${index}`} />,
      <MenuItem key={index} onClick={onClick}>
        <ListItemIcon>
          <Icon color={iconColor}>{icon}</Icon>
        </ListItemIcon>
        <ListItemText>{label}</ListItemText>
      </MenuItem>,
    ]);
  }, [Auth]);

  return (
    <>
      <IconButton
        id="menu-icon"
        aria-haspopup="true"
        onClick={handleClick}
        disabled={App.loading}
        aria-label="configurações"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? "configurações" : undefined}
      >
        <MenuIcon color="secondary" />
      </IconButton>
      <Menu
        open={open}
        id="menu-icon"
        anchorEl={anchorEl}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "menu-icon",
        }}
      >
        <MenuList>{renderAppMenu()}</MenuList>
      </Menu>
    </>
  );
}
