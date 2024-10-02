import { Navigate, Route, Routes } from "react-router-dom";
import { Checkout, Transactions } from "../../pages";
import { PaymentReturn } from "../../pages/PaymentReturn";

export const AppRoutes = () => {
  //   const PrivateRoutes = () => {
  //     const { userServerTag } = useServerContext();

  //     return userServerTag ? <Outlet /> : <Navigate to="/login" />;
  //   };

  return (
    <Routes>
      <Route path="/" element={<Transactions />} />
      {<Route path="/paymentReturn/:session_id" element={<PaymentReturn />} />}
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/redefinir-senha/:id/:token" element={<Transactions />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
