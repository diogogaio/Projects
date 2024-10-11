import Menu from "@mui/material/Menu";
import { useMemo, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import { Icon, Divider, MenuList, IconButton } from "@mui/material";

import { Environment } from "../environment";
import { useSearchParams } from "react-router-dom";
import { useTransactionContext } from "../contexts";

export function SortTransaction() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { Transaction } = useTransactionContext();

  const handleRowsPerPage = (value: string) => {
    setSearchParams((prev) => {
      prev.set("limit", value);
      prev.delete("page");
      return prev;
    });
  };
  const perPage = useMemo(
    () => searchParams.get("limit") || Environment.PER_PAGE_LISTING,
    [searchParams]
  );

  const defaultLimit = Environment.PER_PAGE_LISTING;
  const rowsPerPageMenu = [`${defaultLimit}`, "15", "20", "Mostrar todos"];

  return (
    <>
      <IconButton
        id="ícone-agrupar"
        aria-haspopup="true"
        onClick={handleClick}
        aria-label="agrupar"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? "agrupar" : undefined}
      >
        <Icon color="secondary">sort</Icon>
      </IconButton>
      <Menu
        open={open}
        id="ícone-agrupar"
        anchorEl={anchorEl}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "ícone-agrupar",
        }}
      >
        <MenuList sx={{ textAlign: "center" }}>
          <MenuItem>Agrupar por:</MenuItem>
          <MenuItem onClick={Transaction.sortByAmount}>Valor</MenuItem>
          <MenuItem onClick={Transaction.sortByTag}>Setor</MenuItem>
          <MenuItem onClick={Transaction.sortByDate}>Data</MenuItem>
          {/* <MenuItem onClick={Transaction.sortByDate}>Tipo</MenuItem> */}
          <Divider />
          <MenuItem>Linhas por página:</MenuItem>
          {rowsPerPageMenu.map((value) => (
            <MenuItem
              key={value}
              disabled={perPage === value}
              onClick={() => handleRowsPerPage(value)}
            >
              {value}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
}
