import React, { useState } from "react";
import CardMenu from "./CardMenu";
import CardComments from "./CardComments";
import { Badge, Collapse, Spinner } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import CardMarkedModal from "./CardMarkedModal";
import AccordionItem from "./AccordionItem";
import EditCardMeaningsModal from "./EditCardMeaningsModal";

const Card = ({
  id,
  nome,
  url,
  textoInicial,
  textoSecondario,
  palavrasChave,
  palavrasChaveInvertidas,
  invertida,
  comments,
  amorRelacionamento,
  dinheiroTrabalho,
  saudeEspiritualidade,
  simOuNao,
  significadoInvertido,
  invertidoAmorRelacionamento,
  invertidoDinheiroTrabalho,
  invertidoSaudeEspiritualidade,
  infoUrl,
  markedText,
  markedColor,
}) => {
  const [imgLoading, setImgLoading] = useState("true");
  const [open, setOpen] = useState(false);
  const cardPosition = invertida ? "rotate(180deg)" : "";
  const cardBorderStyle = markedText
    ? {
        transform: `${cardPosition}`,
        borderStyle: "solid",
        borderColor: `${markedColor}`,
        borderWidth: "1px",
      }
    : { transform: `${cardPosition}` };

  return (
    <div className="container-fluid col-xs-12 col-sm-6 col-md-4 text-center d-flex flex-column mt-2 mb-3 p-0">
      <EditCardMeaningsModal />

      {/* CardMarked Modal: */}
      <CardMarkedModal />
      <div>
        <div className="d-flex flex-column justify-content-center align-items-center ">
          <CardMenu id={id} cardPosition={cardPosition} name={nome} />
          {/* Card image: */}
          <div className="container-fluid d-flex flex-column justify-content-center align-items-center p-0 ">
            {imgLoading && (
              <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ width: "25vw", height: "50vh" }}
              >
                <Spinner animation="border" />
              </div>
            )}

            <img
              className="w-100 max-img-width rounded-3 shadow"
              style={cardBorderStyle}
              src={url}
              alt={nome}
              onLoad={() => setImgLoading(false)}
            />
          </div>
        </div>
        <div className="d-flex flex-column " style={{ minHeight: "130px" }}>
          <h4 className="mb-0" style={{ color: `${markedColor}` }}>
            {nome}
          </h4>{" "}
          {markedText && (
            <span
              className="text-capitalize"
              style={{ color: `${markedColor}` }}
            >
              {`(${markedText})`}
            </span>
          )}
          {/* // add color style when marked */}
          <div className={invertida ? "text-danger" : ""}>
            <p className="text-capitalize " style={{ minHeight: "70px" }}>
              {invertida ? (
                <em>{`${palavrasChaveInvertidas} (invertido)`}</em>
              ) : (
                palavrasChave
              )}
            </p>
          </div>
        </div>
        <div className="d-flex flex-column p-0">
          {/* Main accordion */}
          <Accordion className="shadow">
            <AccordionItem
              header="Significado"
              text={textoInicial}
              eventKey="0"
            />
            <AccordionItem
              header="Descrição do Arcano"
              text={textoSecondario}
              eventKey="1"
            />
          </Accordion>

          <CardComments id={id} comments={comments} />

          <div>
            <Badge
              className="bg-dark-purple mb-3 shadow"
              onClick={() => setOpen(!open)}
              aria-controls="example-collapse-text"
              aria-expanded={open}
              role="button"
            >
              + Significados
            </Badge>
          </div>
          <Collapse in={open}>
            {/* Extra info accordion */}
            <Accordion className="shadow">
              <AccordionItem
                header="Amor e Relacionamento"
                text={amorRelacionamento}
                eventKey="0"
              />
              <AccordionItem
                header="Dinheiro e Trabalho"
                text={dinheiroTrabalho}
                eventKey="1"
              />
              <AccordionItem
                header="Saúde e Espiritualidade"
                text={saudeEspiritualidade}
                eventKey="2"
              />
              <AccordionItem
                header="Sim ou Não?"
                text={simOuNao}
                eventKey="3"
              />
              <AccordionItem
                header="Significado Invertido"
                text={significadoInvertido}
                eventKey="4"
              />
              <AccordionItem
                header="Invertido Amor/Relacionamento"
                text={invertidoAmorRelacionamento}
                eventKey="5"
              />
              <AccordionItem
                header="Invertido Dinheiro/Trabalho"
                text={invertidoDinheiroTrabalho}
                eventKey="6"
              />
              <AccordionItem
                header="Invertido Saúde/Espiritualidade"
                text={invertidoSaudeEspiritualidade}
                eventKey="7"
              />
              <AccordionItem
                header="Info Completa"
                text={
                  <a href={infoUrl} target="_blank">
                    {nome}
                  </a>
                }
                eventKey="8"
              />
            </Accordion>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default Card;
