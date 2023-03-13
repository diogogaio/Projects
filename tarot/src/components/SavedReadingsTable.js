import React from "react";
import { useGlobalContext } from "../contexts/appContexts";
import { useServer } from "../contexts/ServerContext";
import { Trash3 } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import CardsRow from "./CardsRow";
import fromUnixTime from "date-fns/fromUnixTime";

const SavedReadingsTable = () => {
  const { Readings, savedReadingsList } = useGlobalContext();
  const { onlineUser } = useServer();
  const navigate = useNavigate();

  const goToClickedReading = (e) => {
    //Go to selected reading
    e.preventDefault();
    Readings.goToSelectedReading(e);
    navigate("/");
  };
  const getTableData = () => {
    //Populate the SavedReadings table
    const convertDateFromUnix = savedReadingsList.map((reading) => {
      return {
        ...reading,
        timestamp: fromUnixTime(reading.timestamp.seconds),
      };
    });

    const sortByDate = convertDateFromUnix.sort(
      (date1, date2) => date2.timestamp - date1.timestamp
    );

    const tableData = sortByDate.map((reading) => {
      const { id, title, timestamp } = reading;
      return (
        <tr key={id}>
          <td>
            <Link
              to="/"
              element={<CardsRow />}
              onClick={(e) => goToClickedReading(e)}
              id={id}
            >
              {title}
            </Link>
          </td>
          <td>{timestamp.toLocaleString("pt-BR")}</td>
          <td>
            <i>
              <Trash3
                role="button"
                className="ms-2 text-danger"
                onClick={() => Readings.deleteSavedReading(id, title)}
              />
            </i>
          </td>
        </tr>
      );
    });
    return tableData;
  };

  return (
    <div
      className="p-2 mx-auto shadow rounded-2 mt-4 overflow-auto"
      style={{ maxWidth: "900px", maxHeight: "420px" }}
    >
      <table className="table table-striped table-bordered table-hover p-1 mt-2">
        <thead className="thead">
          <tr>
            <th scope="col">Nome da tiragem</th>
            <th scope="col">Data/hora</th>
            <th scope="col"> </th>
          </tr>
        </thead>
        <tbody className="">{getTableData()}</tbody>
      </table>
    </div>
  );
};

export default SavedReadingsTable;
