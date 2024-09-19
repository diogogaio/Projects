import { Navigate, Route, Routes } from "react-router-dom";
import { Transactions } from "../../pages";

export const AppRoutes = () => {
  //   const PrivateRoutes = () => {
  //     const { userServerTag } = useServerContext();

  //     return userServerTag ? <Outlet /> : <Navigate to="/login" />;
  //   };

  return (
    <Routes>
      <Route path="/" element={<Transactions />} />
      <Route path="/redefinir-senha/:id/:token" element={<Transactions />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// <Route
// path="/"
// element={<Navigate to="/readings-table/exemple-reading" />}
// />
// {/* <Route path="/" element={<ReadingsTable />} /> */}
// <Route path="/login" element={<Login />} />
// <Route path="/sign-up" element={<SignUp />} />
// //   <Route element={<PrivateRoutes />}>
// //     <Route
// //       path="/saved-readings-list/:readingId?"
// //       element={<SavedReadingList />}
// //     />
// <Route path="/edit-card/:readingId/:cardName" element={<EditCard />} />
// </Route>
// <Route path="/readings-table/:readingId" element={<ReadingsTable />} />
// <Route
// path="*"
// element={<Navigate to="/readings-table/exemple-reading" />}
// />
