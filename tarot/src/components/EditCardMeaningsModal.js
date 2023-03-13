import React, { useState } from "react";
import { useGlobalContext } from "../contexts/appContexts";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";

const EditCardMeaningsModal = () => {
  const {
    UEC,
    showEditCardMeaningModal,
    setShowEditCardMeaningModal,
    newEditedCardMeaning,
  } = useGlobalContext();

  const GET_EDITING_CARD_KEYS = Object.keys(newEditedCardMeaning);

  const filterProperties = GET_EDITING_CARD_KEYS.filter((key) => {
    return (
      key !== "id" &&
      key !== "infoUrl" &&
      key !== "naipe" &&
      key !== "url" &&
      key !== "invertida" &&
      key !== "nome"
    );
  });
  //Arcanos data hasn't all the properties like the names on the accordion header
  const meaningsAccordion = filterProperties.map((key, idx) => {
    if (key === "textoInicial") key = "significado";
    if (key === "textoSecondario") key = "descriçãoDoArcano";

    const switchKeyBack = () => {
      if (key === "significado") return "textoInicial";
      else if (key === "descriçãoDoArcano") return "textoSecondario";
      else return key;
    };

    const formartKey = () =>
      key
        .replace(/([A-Z])/g, " $1")
        .trim()
        .toUpperCase();

    return (
      <Accordion key={idx} defaultActiveKey="0">
        <Accordion.Item>
          <Accordion.Header>{formartKey()}</Accordion.Header>
          <Accordion.Body>
            <Form.Control
              id={switchKeyBack()}
              as="textarea"
              rows="5"
              onChange={(e) => UEC.editCardMeanings(e)}
              value={newEditedCardMeaning[switchKeyBack()]}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  });

  const handleSubmit = () => {
    setShowEditCardMeaningModal(false);
    UEC.setUserEditedCard();
  };

  return (
    <Modal
      size="lg"
      fullscreen="sm-down"
      show={showEditCardMeaningModal}
      onHide={() => setShowEditCardMeaningModal(false)}
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Mudar Significados</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>{newEditedCardMeaning.nome}</h5>
        {meaningsAccordion}
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="bg-light-purple"
          variant="secondary"
          onClick={() => setShowEditCardMeaningModal(false)}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-dark-purple"
          variant="primary"
          onClick={() => handleSubmit()}
        >
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCardMeaningsModal;
