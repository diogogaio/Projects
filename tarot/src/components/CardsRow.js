import React from "react";
import { Spinner } from "react-bootstrap";
import { useGlobalContext } from "../contexts/appContexts";
import SaveReadingModal from "./SaveReadingModal";
import { useServer } from "../contexts/ServerContext";
import EmptyCardRow from "./EmptyCardRow";
import CardsReading from "./CardsReading";
const CardsRow = () => {
  const { loading } = useServer();
  const { reading } = useGlobalContext();

  return (
    <div
      id="card-row-container"
      className="screen-width mt-4 text-center shadow-lg rounded-3 align-self-center p-1 mt-5 position-relative"
    >
      {reading.length <= 0 && loading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <Spinner
            className="align-self-center text-dark-purple"
            animation="border"
            variant="info"
          />
        </div>
      )}
      <SaveReadingModal />
      {reading.length <= 0 && !loading ? <EmptyCardRow /> : <CardsReading />}
    </div>
  );
};

export default CardsRow;
