import React, { useState, useRef } from "react";
import { useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useGlobalContext } from "../contexts/appContexts";
import Alert from "react-bootstrap/Alert";
const SavedReadingsFilters = () => {
  const { Filters, Readings, filtersMessage } = useGlobalContext();

  const [fromDate, setFromDate] = useState("1971-03-10");
  const [untilDate, setUntilDate] = useState("2090-03-10");

  const notInitialRender = useRef(false);
  const date1 = useRef();
  const date2 = useRef();

  useEffect(() => {
    if (notInitialRender.current) {
      Filters.filterByDate(fromDate, untilDate);
    } else {
      notInitialRender.current = true;
    }
  }, [fromDate, untilDate]);

  const handleClearSearch = () => {
    date1.current.value = "";
    date2.current.value = "";
    Filters.clearSearchResults();
  };

  return (
    <div className="container d-flex flex-column shadow rounded-2 p-1 mb-2 p-2 mt-4">
      <Form className="container row justify-content-center mx-auto">
        <div className="col-sm-12 col-md-4 col-lg-3 text-dark-purple">
          <Form.Label>Filtrar por nome: </Form.Label>
          <Form.Control
            type="text"
            placeholder="Nome da tiragem"
            onChange={(e) => Filters.filterByName(e.target.value)}
          />
        </div>
        <div className="col-sm-12 col-md-4 col-lg-3 text-dark-purple">
          <Form.Label>De: </Form.Label>
          <Form.Control
            ref={date1}
            type="date"
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="col-sm-12 col-md-4 col-lg-3 text-dark-purple">
          <Form.Label>Até: </Form.Label>
          <Form.Control
            ref={date2}
            type="date"
            onChange={(e) => setUntilDate(e.target.value)}
          />
        </div>
        <div className="col-sm-12 col-md-12 col-lg-2">
          <Form.Label className="invisible">Limpar</Form.Label>
          <Button
            className="bg-dark-purple d-block mx-auto"
            size="sm"
            onClick={() => handleClearSearch()}
          >
            Limpar Busca
          </Button>
        </div>
      </Form>
      <div className="mt-2 mb-0 text-center ">
        {filtersMessage && (
          <Alert
            className="d-inline-block mt-2 pt-1 pb-1"
            variant={filtersMessage.color}
          >
            {filtersMessage.text}
          </Alert>
        )}
      </div>
      {Readings.checkLastUpdatedTime() >= 10 ||
      Readings.checkLastUpdatedTime() === null ? (
        <small role="button" className="align-self-center mt-2">
          Para atualizar a lista neste dispositivo clique{" "}
          <span
            className="text-primary"
            onClick={Readings.updateDeviceReadings}
          >
            <u>aqui.</u>
          </span>
        </small>
      ) : (
        <small className="align-self-center mt-2">
          {" "}
          Lista de tiragens foram atualizadas recentemente neste dispositivo.
        </small>
      )}
    </div>
  );
};

export default SavedReadingsFilters;
