import React from "react";
import { Badge } from "react-bootstrap";
import { useServer } from "../contexts/ServerContext";
import { useGlobalContext } from "../contexts/appContexts";
import { Link } from "react-router-dom";
import CardsRow from "./CardsRow";
const UserStatus = () => {
  const { onlineUser } = useServer();
  const { Utils } = useGlobalContext();

  const handleSignOut = () => {
    if (
      window.confirm(
        "Deseja realmente sair? Caso sim, não esqueça de salvar as suas alterações ; )"
      )
    )
      setTimeout(() => {
        Utils.clearUserData();
      }, 1000);
  };

  return (
    <div className="d-flex justify-content-end me-2">
      <span className="text-muted me-1">
        <em>{onlineUser.email}</em>
        <Badge
          role="button"
          className="bg-dark-purple ms-1"
          size="sm"
          onClick={handleSignOut}
        >
          <Link
            className="text-light text-decoration-none"
            to="/"
            component={<CardsRow />}
          >
            sair
          </Link>
        </Badge>
      </span>
    </div>
  );
};

export default UserStatus;
