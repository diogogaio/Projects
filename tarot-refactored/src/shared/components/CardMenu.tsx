import {
  Icon,
  Menu,
  Button,
  Select,
  Divider,
  MenuItem,
  InputLabel,
  FormControl,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Environment } from "../environment";
import { useGlobalContext, useServerContext } from "../contexts";
import dbCards from "../../assets/CardsDatabase";

type TCardMenuProps = {
  id: string;
  name: string;
  index: number;
  isUpsideDown: boolean;
};

export const CardMenu = ({ id, isUpsideDown, name, index }: TCardMenuProps) => {
  const { Firestore, userUEC, serverLoading, userServerUECtag, setUserUEC } =
    useServerContext();
  const {
    // readingTableCards,
    // setReadingTableCards,
    selectedReading,
    setSelectedReading,
    setSelectedCardsId,
    setOpenDrawerCards,
    setOpenCardMarkedModal,
  } = useGlobalContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const { readingId } = useParams();
  const readingTableCards = selectedReading.reading;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    {
      name: "Marcar carta",
      onClick: () => {
        setSelectedCardsId([id]);
        setOpenCardMarkedModal(true);
      },
      icon: "local_offer_outlined",
      iconColor: "success",
    },
    {
      name: "Desmarcar",
      onClick: () => markCardOff(),
      icon: "local_offer_outlined",
      iconColor: "error",
    },
    {
      name: "Personalizar significados",
      onClick: () => navigate(`/edit-card/${readingId}/${name}`),
      icon: "edit",
      iconColor: "warning",
    },
    {
      name: "Restaurar significados padrões",
      onClick: () => restoreDefaultCardMeanings(name),
      icon: "restore_page_outlined",
      iconColor: "primary",
    },
  ].map((option) => (
    <MenuItem
      key={option.name}
      onClick={() => {
        option.onClick();
        handleClose();
      }}
    >
      <ListItemIcon>
        <Icon
          color={
            option.iconColor as "primary" | "error" | "success" | "warning"
          }
          fontSize="small"
        >
          {option.icon}
        </Icon>
      </ListItemIcon>
      <ListItemText>{option.name}</ListItemText>
    </MenuItem>
  ));

  const cardAsideOptions = (
    <MenuItem>
      <ListItemIcon>
        <Icon color="success" fontSize="small">
          {" "}
          add_circle
        </Icon>
      </ListItemIcon>
      <ListItemText>
        <FormControl sx={{ m: 1, width: "95%" }} size="small">
          <InputLabel id="select-small-label">Add carta ao lado</InputLabel>
          <Select
            value=""
            id="select-small"
            label="Add carta ao lado"
            labelId="select-small-label"
          >
            {[
              "Paus",
              "Pentáculos",
              "Espadas",
              "Copas",
              "Arcanos Maiores",
              "Padilha",
            ].map((text) => (
              <MenuItem
                key={text}
                onClick={() => {
                  setOpenDrawerCards({
                    open: true,
                    content: text,
                    cardAsideIndex: index,
                  });
                  handleClose();
                }}
                value={text}
              >
                {text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ListItemText>
    </MenuItem>
  );

  const markCardOff = () => {
    if (readingTableCards)
      setSelectedReading({
        ...selectedReading,
        reading: readingTableCards.map((card) =>
          card.id === id ? { ...card, markedText: "", markedColor: "" } : card
        ),
      });
  };

  const removeCard = (id: string) => {
    console.log("removeCard: Removing card...");
    if (readingTableCards)
      setSelectedReading({
        ...selectedReading,
        reading: readingTableCards.filter((card) => card.id !== id),
      });
  };

  const upSideDown = () => {
    if (readingTableCards)
      setSelectedReading({
        ...selectedReading,
        reading: readingTableCards.map((card) =>
          card.id === id ? { ...card, invertida: !card.invertida } : card
        ),
      });
  };

  const restoreDefaultCardMeanings = async (cardName: string) => {
    const isUEC = userUEC?.find((card) => card.nome === cardName);
    if (isUEC) {
      if (
        window.confirm(
          "Deseja retornar os significados desta carta para os padrões iniciais?"
        )
      )
        console.log(
          "restoreDefaultCardMeanings: Removing card from UEC: " + cardName
        );
      await Firestore.deleteDoc(userServerUECtag, cardName);
      setUserUEC(userUEC?.filter((card) => card.nome !== cardName));

      let defaultChart = dbCards.find((dbCard) => dbCard.nome === cardName);

      if (!defaultChart)
        return alert("Erro: Carta não encontrada na base de dados.");

      setSelectedReading((prev) => ({
        ...prev,
        reading: prev.reading.map((card) =>
          card.nome === cardName
            ? {
                ...defaultChart,
                id: card.id,
                comments: card.comments || "",
                invertida: card.invertida || false,
                markedText: card.markedText || "",
                markedColor: card.markedColor || "",
              }
            : card
        ),
      }));
    } else {
      alert("Esta carta já é padrão.");
    }
  };

  return (
    <>
      <Button
        size="small"
        id="basic-button"
        aria-haspopup="true"
        onClick={handleClick}
        disabled={serverLoading}
        color={Environment.APP_MAIN_TEXT_COLOR}
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? "basic-menu" : undefined}
      >
        menu
      </Button>
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
            upSideDown();
          }}
        >
          <ListItemIcon>
            <Icon color="info">swap_vert_outlined</Icon>
          </ListItemIcon>
          <ListItemText>
            {isUpsideDown ? "Desinverter Carta" : "Inverter carta"}
          </ListItemText>
        </MenuItem>

        {cardAsideOptions}

        <Divider />

        <MenuItem onClick={() => removeCard(id)}>
          <ListItemIcon>
            <Icon color="error" fontSize="small">
              {" "}
              remove_circle
            </Icon>
          </ListItemIcon>
          <ListItemText>Remover</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
