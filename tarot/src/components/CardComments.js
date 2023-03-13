import React, { useState } from "react";
import { useGlobalContext } from "../contexts/appContexts";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";

const CardComments = ({ id, comments }) => {
  const [open, setOpen] = useState(false);
  const { Cards } = useGlobalContext();
  return (
    <div>
      <Badge
        className="bg-dark-purple mb-2 mt-3 shadow"
        onClick={() => setOpen(!open)}
        aria-controls="example-collapse-text"
        aria-expanded={open}
        role="button"
      >
        + Add Comentários
      </Badge>
      <Collapse in={open}>
        <Form.Group className="mb-3">
          <Form.Control
            className="shadow"
            placeholder="Escreva aqui seus comentários."
            value={comments}
            id={id}
            as="textarea"
            rows={3}
            onChange={(e) => Cards.cardComments(e)}
          />
        </Form.Group>
      </Collapse>
    </div>
  );
};

export default CardComments;
