import React, { useRef, useEffect } from "react";
import { Button, Form, Modal, Spinner, Alert } from "react-bootstrap";
import { useGlobalContext } from "../contexts/appContexts";
import { useServer } from "../contexts/ServerContext";

const Signup = () => {
  const { showSignup, handleCloseSignup } = useGlobalContext();
  const { createNewUser, serverMessage, loading, onlineUser } = useServer();

  const emailRef = useRef();
  const emailConfirmRef = useRef();
  const pwordRef = useRef();
  const pwordConfirmRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    createNewUser(
      emailRef.current.value,
      pwordRef.current.value,
      emailConfirmRef.current.value,
      pwordConfirmRef.current.value
    );
  };

  useEffect(() => {
    setTimeout(() => {
      handleCloseSignup();
    }, 3000);
  }, [onlineUser]);

  return (
    <div
      className="modal show"
      style={{ display: "block", position: "initial" }}
    >
      <Modal
        show={showSignup}
        onHide={handleCloseSignup}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-dark-purple">Criar Conta</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {serverMessage && (
            <Alert className="text-center" variant={serverMessage.color}>
              {serverMessage.text}
            </Alert>
          )}
          {loading && <Spinner animation="border" variant="primary" />}
          <Form onSubmit={(e) => handleSubmit(e)}>
            <Form.Group className="mb-3">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Insira seu email"
                ref={emailRef}
                required
              />
              <Form.Text className="text-muted">
                Seu email não será compartilhado com ninguém.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar Email:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Confirme seu email"
                ref={emailConfirmRef}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Senha:</Form.Label>
              <Form.Control
                type="password"
                placeholder="Senha"
                ref={pwordRef}
                required
              />
              <Form.Text className="text-muted">
                Senha precisa ter no mínimo 6 caracteres.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar senha:</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirme sua senha"
                ref={pwordConfirmRef}
                required
              />
            </Form.Group>

            <Button className="bg-dark-purple" variant="primary" type="submit">
              Criar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Signup;
