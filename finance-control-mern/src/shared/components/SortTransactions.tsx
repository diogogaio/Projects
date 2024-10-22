import Menu from "@mui/material/Menu";
import { useMemo, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import { useSearchParams } from "react-router-dom";
import { Icon, Divider, MenuList, IconButton } from "@mui/material";

import { Environment } from "../environment";

interface ISortTransactionProps {
  sortByTag: () => void;
  sortByDate: () => void;
  sortByType: () => void;
  sortByAmount: () => void;
  sortByDescription: () => void;
  dateSortBy: "ascendente" | "descendente";
  amountSortBy: "descendente" | "ascendente";
}

export function SortTransaction({
  sortByTag,
  sortByType,
  sortByDate,
  sortByAmount,
  sortByDescription,
  dateSortBy,
  amountSortBy,
}: ISortTransactionProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
        <MenuList sx={{ textAlign: "center" }} onClick={handleClose}>
          <MenuItem sx={{ fontStyle: "italic", fontWeight: "600" }}>
            Agrupar por:
          </MenuItem>

          <MenuItem onClick={sortByType}>Tipo</MenuItem>

          <MenuItem onClick={sortByTag}>Setor</MenuItem>

          <MenuItem onClick={sortByDate}>{`Data ${dateSortBy}`} </MenuItem>

          <MenuItem onClick={sortByAmount}>{`Valor ${amountSortBy}`}</MenuItem>

          <MenuItem onClick={sortByDescription}>Ordem alfabética</MenuItem>

          <Divider />
          <MenuItem sx={{ fontStyle: "italic", fontWeight: "600" }}>
            Linhas por página:
          </MenuItem>
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
