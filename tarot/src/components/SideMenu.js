import React from "react";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../contexts/appContexts";
import Offcanvas from "react-bootstrap/Offcanvas";
const SideMenu = () => {
  const { showSideBarMenu, setShowSideBarMenu, createMenu } =
    useGlobalContext();
  return (
    <>
      <Offcanvas
        show={showSideBarMenu}
        onHide={() => setShowSideBarMenu(false)}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Tarot</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="d-flex flex-column my-2 my-lg-0" navbarScroll>
            <div>
              <NavDropdown title="Paus" id="navbarScrollingDropdown">
                {createMenu("paus")}
              </NavDropdown>
            </div>
            <div>
              <NavDropdown title="Espadas" id="navbarScrollingDropdown">
                {createMenu("espadas")}
              </NavDropdown>
            </div>

            <NavDropdown title="Copas" id="navbarScrollingDropdown">
              {createMenu("copas")}
            </NavDropdown>

            <NavDropdown title="Ouros" id="navbarScrollingDropdown">
              {createMenu("ouros")}
            </NavDropdown>

            <NavDropdown title="Arcanos Maiores" id="navbarScrollingDropdown">
              {createMenu("arcanosMaiores")}
            </NavDropdown>

            <Nav.Item title="Tiragens Salvas">
              <Link to="/readingsList" className="nav-link">
                Tiragens Salvas
              </Link>
            </Nav.Item>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SideMenu;
