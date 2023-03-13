import React from "react";
import { useGlobalContext } from "../contexts/appContexts";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

const CardsReading = () => {
  const { Cards, Readings, readingTitle, reading, readingNotes, message } =
    useGlobalContext();
  return (
    <div className="container-fluid mb-2 d-flex flex-column">
      {message && (
        <div className="position-sticky top-50 start-50 ">
          <Alert className="text-center d-inline-block" variant={message.color}>
            <h4>{message.text}</h4>
          </Alert>
        </div>
      )}
      <div>
        <h3 className="mt-1 text-dark-purple">
          <em>{readingTitle ? readingTitle : ""}</em>
        </h3>
      </div>
      <div className="row">{Cards.displayCards()}</div>
      {reading.length > 0 && (
        <div className=" mb-4">
          {/* larger text area */}
          <Form.Group>
            <Form.Control
              className="shadow"
              as="textarea"
              rows={5}
              placeholder="Interpretação da tiragem."
              onChange={(e) => Readings.addReadingNotes(e)}
              value={readingNotes}
              //inputRef={inputRef}
            />
          </Form.Group>
        </div>
      )}
    </div>
  );
};

export default CardsReading;
