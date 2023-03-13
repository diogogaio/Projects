import React from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Alert from "react-bootstrap/Alert";
import {
  Trash3,
  CloudArrowUp,
  CloudArrowDown,
  ArrowCounterclockwise,
  Recycle,
} from "react-bootstrap-icons";
import { useGlobalContext } from "../contexts/appContexts";
import { useServer } from "../contexts/ServerContext";
import { useNavigate } from "react-router-dom";
import UserStatus from "./UserStatus";

const NavBar = () => {
  const {
    Cards,
    UEC,
    Readings,
    Utils,
    data,
    readingId,
    readingTitle,
    handleShowSignin,
    handleShowSignup,
    setShowSaveModal,
    alerts,
    reading,
  } = useGlobalContext();

  const { onlineUser } = useServer();
  const navigate = useNavigate();

  function goToPage(target) {
    navigate(target);
  }
  const handleMenuClick = (e) => {
    //Redirect user if any dropdown menu card is selected out of card CardsRow component:
    Cards.addCard(e.target.id, e.target.innerText);
    if (Utils.getCurrentUrl() === "readingsList") goToPage("/");
  };

  const createMenu = (naipe) => {
    //Create navbar dropdowns select items
    const naipeMenu = data.map((card) => {
      if (card.naipe === naipe) {
        return (
          <NavDropdown.Item
            id={card.id}
            key={card.id}
            onClick={(e) => {
              handleMenuClick(e);
            }}
          >
            {card.nome}
          </NavDropdown.Item>
        );
      }
    });
    return naipeMenu;
  };

  return (
    <Navbar className="shadow" bg="light" expand="md" sticky="top">
      <Container fluid>
        <Navbar.Brand className="text-light-purple logo">Tarot</Navbar.Brand>{" "}
        {/* add link to home */}
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <NavDropdown
              className="ms-0 ps-0 text-dark-purple"
              title="Paus"
              id="navbarScrollingDropdown"
            >
              {createMenu("paus")}
            </NavDropdown>

            <NavDropdown
              className="text-dark-purple"
              title="Espadas"
              id="navbarScrollingDropdown"
            >
              {createMenu("espadas")}
            </NavDropdown>

            <NavDropdown
              className="text-dark-purple"
              title="Copas"
              id="navbarScrollingDropdown"
            >
              {createMenu("copas")}
            </NavDropdown>

            <NavDropdown
              className="text-dark-purple"
              title="Ouros"
              id="navbarScrollingDropdown"
            >
              {createMenu("ouros")}
            </NavDropdown>

            <NavDropdown
              className="text-dark-purple"
              title="Arcanos Maiores"
              id="navbarScrollingDropdown"
            >
              {createMenu("arcanosMaiores")}
            </NavDropdown>

            <NavDropdown
              className="text-dark-purple"
              title="Opções"
              id="navbarScrollingDropdown"
              disabled={Utils.getCurrentUrl() === "readingsList" ? true : false}
            >
              <NavDropdown.Item
                disabled={reading.length === 0 ? true : false}
                onClick={() => {
                  setShowSaveModal(true);
                  //inputRef.current.focus();
                }}
              >
                <i className="text-success me-1">
                  <CloudArrowUp />
                </i>
                Salvar tiragem
              </NavDropdown.Item>

              <NavDropdown.Item
                disabled={onlineUser ? false : true}
                onClick={() => goToPage("/readingsList")}
              >
                <i className="text-primary me-1">
                  <CloudArrowDown />
                </i>
                Tiragens salvas
              </NavDropdown.Item>

              <NavDropdown.Item onClick={Readings.newReading}>
                <i className="text-warning me-1">
                  <ArrowCounterclockwise />
                </i>
                Nova tiragem
              </NavDropdown.Item>

              <NavDropdown.Item
                onClick={() =>
                  Readings.deleteSavedReading(readingId, readingTitle)
                }
                disabled={
                  onlineUser &&
                  readingId &&
                  readingTitle !== "Tiragem de Exemplo"
                    ? false
                    : true
                }
              >
                <i className="text-danger me-1">
                  <Trash3 />
                </i>
                Deletar tiragem
              </NavDropdown.Item>

              <NavDropdown.Item
                onClick={() => UEC.restoreAllEditedCardsMeanings()}
              >
                <i className="text-danger me-1">
                  <Recycle />
                </i>
                Restaurar significados de todos os Arcanos
              </NavDropdown.Item>
            </NavDropdown>
            {alerts && (
              <Alert
                className="text-center mb-0 p-1 ps-2 pe-2"
                variant={alerts.color}
              >
                {alerts.text}
              </Alert>
            )}
          </Nav>
          <div>
            {onlineUser ? (
              <UserStatus />
            ) : (
              <div className="d-flex">
                <Button
                  className="bg-dark-purple"
                  size="sm"
                  onClick={handleShowSignin}
                >
                  Entrar
                </Button>
                <div className="vr m-2"></div>
                <Button
                  className="bg-light-purple"
                  variant="success"
                  size="sm"
                  onClick={handleShowSignup}
                >
                  Criar Conta
                </Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
