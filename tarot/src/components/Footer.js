import React, { useState, useEffect } from "react";
import { Github, Envelope } from "react-bootstrap-icons";
import Image from "react-bootstrap/Image";
import ametista from "../assets/images/ametista.jpg";
const footerStyle = {
  backgroundImage: `url(${ametista})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
};

const Footer = () => {
  return (
    <div className="mt-auto">
      <footer
        style={footerStyle}
        className="mt-5 p-3 d-flex border-top bg-light"
      >
        <div
          className={`mt-2 d-flex flex-column align-items-center align-self-center mx-auto `}
        >
          <p className={`text-dark-purple mb-1 unfocus`}>
            Desenvolvido por Diogo Gaio.
          </p>
          <p className={`mb-1 unfocus`}>
            <Github className="text-dark-purple" />
            <a
              className="ms-1 text-dark-purple"
              href="https://github.com/diogogaio"
              target="_blank"
            >
              Perfil Github
            </a>
          </p>
          <p className={`text-dark-purple unfocus`}>
            <Envelope className="" />
            <a
              className="ms-1 text-dark-purple"
              href="mailto:diogogaio@gmail.com"
            >
              diogogaio@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
