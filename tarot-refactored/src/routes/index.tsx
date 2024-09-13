import {
  EditCard,
  Login,
  ReadingsTable,
  SavedReadingList,
  SignUp,
} from "../pages";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useServerContext } from "../shared/contexts";

export const AppRoutes = () => {
  const PrivateRoutes = () => {
    const { userServerTag } = useServerContext();

    return userServerTag ? <Outlet /> : <Navigate to="/login" />;
  };
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/readings-table/exemple-reading" />}
      />
      {/* <Route path="/" element={<ReadingsTable />} /> */}
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route element={<PrivateRoutes />}>
        <Route
          path="/saved-readings-list/:readingId?"
          element={<SavedReadingList />}
        />
        <Route path="/edit-card/:readingId/:cardName" element={<EditCard />} />
      </Route>
      <Route path="/readings-table/:readingId" element={<ReadingsTable />} />
      <Route
        path="*"
        element={<Navigate to="/readings-table/exemple-reading" />}
      />
    </Routes>
  );
};
