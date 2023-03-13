import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { useGlobalContext } from "../contexts/appContexts";
import { useServer } from "../contexts/ServerContext";
import {
  XCircle,
  ArrowDownUp,
  Tag,
  Pen,
  Arrow90degLeft,
} from "react-bootstrap-icons";

const CardMenu = ({ id, cardPosition, name }) => {
  const {
    Cards,
    UEC,
    setShowMarkedCardModal,
    setShowEditCardMeaningModal,
    userEditedCards,
  } = useGlobalContext();

  const { onlineUser } = useServer();

  const handleMarkedCard = () => {
    setShowMarkedCardModal(true);
    Cards.setMarkedCardId(id);
  };

  const handleEditCardMeaning = () => {
    if (onlineUser) {
      setShowEditCardMeaningModal(true);
      UEC.setNewEditingCardMeanings(id);
    } else alert("Usuário não logado!");
  };

  const handleRestoreClick = () => {
    const hasEditedCard = userEditedCards.find((card) => card.nome === name);
    console.log(hasEditedCard);
    if (hasEditedCard) {
      if (
        window.confirm(
          "Gostaria de restaurar os significados padrões deste arcano?"
        )
      )
        UEC.restoreCardMeanings(name, id);
    } else
      alert("O siginificado deste arcano não foi modificado anteriormente.");
  };

  return (
    <div>
      <Dropdown>
        <Dropdown.Toggle
          className="badge text-black-50"
          size="sm"
          variant="light"
          id="dropdown-basic"
        >
          Menu
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={() => Cards.removeCard(id)}>
            <i className="me-1 text-danger">
              <XCircle />
            </i>
            Remover
          </Dropdown.Item>
          <Dropdown.Item onClick={() => Cards.upSideDown(id)}>
            <i className="me-1 text-dark-purple">
              <ArrowDownUp />
            </i>
            {cardPosition ? "Desinverter" : "Inverter"}
          </Dropdown.Item>
          <Dropdown.Item onClick={handleMarkedCard}>
            <i className="me-1 text-primary">
              <Tag />
            </i>
            Marcar
          </Dropdown.Item>
          <Dropdown.Item onClick={() => Cards.markCardOff(id)}>
            <i className="me-1 text-danger">
              <Tag />
            </i>
            Desmarcar
          </Dropdown.Item>
          <Dropdown.Item onClick={handleEditCardMeaning}>
            <i className="me-1 text-success">
              <Pen />
            </i>
            Personalizar significados
          </Dropdown.Item>
          <Dropdown.Item
            onClick={handleRestoreClick}
            disabled={onlineUser ? false : true}
          >
            <i className="me-1 text-warning">
              <Arrow90degLeft />
            </i>
            Restaurar significados do Arcano
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default CardMenu;
