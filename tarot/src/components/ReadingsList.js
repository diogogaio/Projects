import React from "react";
import { useGlobalContext } from "../contexts/appContexts";
import { useServer } from "../contexts/ServerContext";
import { Link } from "react-router-dom";
import CardsRow from "./CardsRow";
import Alert from "react-bootstrap/Alert";
import SavedReadingsTable from "./SavedReadingsTable";
import { Spinner } from "react-bootstrap";
import SavedReadingsFilters from "./SavedReadingsFilters";

const ReadingsList = () => {
  const { savedReadingsList } = useGlobalContext();
  const { serverMessage, loading } = useServer();
  return (
    <>
      <div className="screen-width max-screen-width align-self-center shadow-lg rounded-3 d-flex flex-column  mt-5 ">
        <div className="text-center text-dark-purple mt-3">
          <h5>Tiragens salvas</h5>
        </div>
        {/* Alert */}
        {serverMessage.text && (
          <div className="position-sticky top-50 start-50  text-center mb-0">
            <Alert
              className="d-inline-block text-center"
              variant={serverMessage.color}
            >
              {serverMessage.text}
            </Alert>
          </div>
        )}
        {/* Spinner */}
        {loading && (
          <div className="position-sticky top-50 start-50 align-self-center translate-middle">
            <Spinner animation="border" className="text-dark-purple" />
          </div>
        )}
        <div className="container">
          {savedReadingsList.length > 0 && <SavedReadingsFilters />}
          {savedReadingsList.length > 0 && <SavedReadingsTable />}
          {!savedReadingsList.length > 0 && (
            <div className="mt-5 text-center">
              <h6>Nenhuma tiragem salva encontrada!</h6>
            </div>
          )}
          <br />
        </div>
        <Link to="/" element={<CardsRow />} className="mb-1 align-self-center">
          voltar
        </Link>
      </div>
    </>
  );
};

export default ReadingsList;
