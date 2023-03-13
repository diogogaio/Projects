import React, { useState } from "react";
import { Badge, Collapse } from "react-bootstrap";

const CardText = ({ textTitle, text }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Badge
        className="mb-3"
        onClick={() => setOpen(!open)}
        aria-controls="example-collapse-text"
        aria-expanded={open}
        role="button"
      >
        {textTitle}
      </Badge>
      <Collapse in={open}>
        <article>{text}</article>
      </Collapse>
    </>
  );
};

export default CardText;
