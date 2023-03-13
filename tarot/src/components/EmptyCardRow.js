import React from "react";
import ametista2 from "../assets/images/ametista2.jpg";

const EmptyCardRow = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${ametista2})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
      className="screen-width d-flex flex-column rounded-3 justify-content-center"
    >
      <div
        style={{ maxWidth: "530px" }}
        className="align-self-center w-50 unfocused rounded-3 text-dark-purple pt-1"
      >
        <h6>Tiragem vazia.</h6>
        <p>
          <em>
            Selecione os arcanos na barra de navegação para criar um novo jogo.
          </em>
        </p>
      </div>
    </div>
  );
};

export default EmptyCardRow;
