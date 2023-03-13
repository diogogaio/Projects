import React, { useRef, useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { useGlobalContext } from "../contexts/appContexts";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { Button } from "react-bootstrap";

const CardMarkedModal = () => {
  //Invoked on Card component below main div
  const { Cards, showMarkedCardModal, setShowMarkedCardModal } =
    useGlobalContext();

  const markedCardText = useRef();
  useEffect(() => {
    if (showMarkedCardModal) markedCardText.current.focus();
  }, [showMarkedCardModal]);

  const [colorInput, setColorInput] = useState("#924598");

  const handleMarkedCardSubmit = (e) => {
    e.preventDefault();
    setShowMarkedCardModal(false);
    Cards.setMarkedCard(markedCardText.current.value, colorInput);
  };

  const changeColorState = (e) => {
    setColorInput(e.target.value);
    console.log(e.target.value, colorInput);
  };
  return (
    <div>
      <Modal
        size="sm"
        show={showMarkedCardModal}
        onHide={() => setShowMarkedCardModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-dark-purple">Marcar arcano</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleMarkedCardSubmit(e)}>
            <Form.Group>
              <div className="d-flex">
                <Form.Label className="mb-0 pt-1">Cor do texto:</Form.Label>
                <input
                  className="form-control form-control-color w-25 ms-2"
                  type="color"
                  name="input-color"
                  id="input-color"
                  onChange={(e) => changeColorState(e)}
                  value={colorInput}
                />
              </div>
              <InputGroup className="mt-2">
                <Form.Control
                  type="text"
                  placeholder="Ex: Fundo do Maço"
                  ref={markedCardText}
                  autoFocus
                  maxLength="40"
                  required
                />
                <Button
                  className="bg-dark-purple"
                  type="submit"
                  id="button-addon2"
                  //onClick={() => setShowMarkedCardModal(false)}
                >
                  Marcar
                </Button>
              </InputGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CardMarkedModal;
