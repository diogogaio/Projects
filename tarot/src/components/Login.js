import React, { useRef, useEffect } from "react";
import { Button, Form, Modal, Alert } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { useGlobalContext } from "../contexts/appContexts";
import { useServer } from "../contexts/ServerContext";

const Login = () => {
  const { handleCloseSignin, showSignin, handleShowSignup } =
    useGlobalContext();
  const { signin, onlineUser, serverMessage, loading } = useServer();
  const emailRef = useRef();
  const pwordRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    signin(emailRef.current.value, pwordRef.current.value);
  };

  useEffect(() => {
    setTimeout(() => {
      handleCloseSignin();
    }, 2000);
  }, [onlineUser]);

  return (
    <div
      className="modal show"
      style={{ display: "block", position: "initial" }}
    >
      <Modal
        show={showSignin}
        onHide={handleCloseSignin}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-dark-purple">Entrar</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {serverMessage && (
            <Alert className="text-center" variant={serverMessage.color}>
              {serverMessage.text}
            </Alert>
          )}
          <Form onSubmit={(e) => handleSubmit(e)}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Insira seu email"
                required
                ref={emailRef}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Senha"
                ref={pwordRef}
                required
              />
            </Form.Group>

            {loading && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner
                  className="align-self-center text-dark-purple"
                  animation="border"
                  variant="info"
                />
              </div>
            )}

            <Button className="bg-dark-purple" variant="primary" type="submit">
              Entrar
            </Button>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <p>
            Não possui uma conta ainda?{" "}
            <a
              className="nav-item"
              onClick={() => handleShowSignup()}
              role="button"
            >
              {" "}
              Criar
            </a>{" "}
            nova conta.
          </p>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;
