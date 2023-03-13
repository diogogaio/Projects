import React, { useEffect, useRef } from "react";
import { useGlobalContext } from "../contexts/appContexts";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { useServer } from "../contexts/ServerContext";
const SaveReadingModal = () => {
  const {
    Readings,
    showSaveModal,
    setShowSaveModal,
    handleShowSignin,
    handleShowSignup,
    readingTitle,
    message,
  } = useGlobalContext();

  const { onlineUser, serverMessage, loading } = useServer();

  const inputRef = useRef();

  useEffect(() => {
    if (showSaveModal) inputRef.current.focus();
  }, [showSaveModal]);

  const showNotification = message || serverMessage;
  return (
    <div
      className="modal show"
      style={{ display: "block", position: "initial" }}
    >
      <Modal
        show={showSaveModal}
        onHide={() => setShowSaveModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title className="text-dark-purple">Salvar</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {showNotification && (
            <Alert className="text center" variant={showNotification.color}>
              {showNotification.text}
            </Alert>
          )}
          <Form
            className="row mt-2 mb-2"
            onSubmit={(e) => Readings.saveReading(e)}
          >
            <div className="col-xs-12 ">
              <Form.Group className="me-3 w-100">
                <Form.Control
                  as="textarea"
                  rows={1}
                  placeholder="Nome da tiragem ou pergunta."
                  onChange={(e) => Readings.addReadingTitle(e)}
                  value={readingTitle}
                  required
                  maxLength="130"
                  ref={inputRef}
                />
              </Form.Group>
            </div>
            <div className="col-xs-12 mt-2 d-flex justify-content-end">
              {loading && (
                <Spinner
                  className="align-self-center text-dark-purple align me-2"
                  animation="border"
                  variant="info"
                />
              )}
              <Button
                type="submit"
                className="bg-dark-purple me-2"
                size="sm"
                variant="success"
              >
                Salvar
              </Button>
              <Button
                className="bg-light-purple"
                size="sm"
                variant="secondary"
                onClick={() => {
                  Readings.clearReadingTitle();
                  setShowSaveModal(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          {!onlineUser && (
            <p>
              Já possui uma conta?{" "}
              <a
                tabIndex="0"
                className="nav-item"
                onClick={handleShowSignin}
                role="button"
              >
                Entrar
              </a>
              . Ou então,{" "}
              <a
                tabIndex="0"
                className="nav-item"
                onClick={handleShowSignup}
                role="button"
              >
                criar uma nova conta.
              </a>
            </p>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SaveReadingModal;
