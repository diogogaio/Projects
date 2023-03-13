import React from "react";
import Accordion from "react-bootstrap/Accordion";

const AccordionItem = ({ header, text, eventKey }) => {
  return (
    <>
      <Accordion.Item eventKey={eventKey}>
        <Accordion.Header>
          <h6>{header}</h6>
        </Accordion.Header>
        <Accordion.Body>
          <article className="" style={{ textAlign: "justify" }}>
            {text}
          </article>
        </Accordion.Body>
      </Accordion.Item>
    </>
  );
};

export default AccordionItem;
