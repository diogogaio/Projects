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

// />
