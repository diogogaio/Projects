import { PaymentReturn } from "../../pages/PaymentReturn";
import { Navigate, Route, Routes } from "react-router-dom";

import {
  Login,
  SignUp,
  Checkout,
  Transactions,
  ResetPassword,
} from "../../pages";

export const AppRoutes = () => {
  //   const PrivateRoutes = () => {
  //     const { userServerTag } = useServerContext();

  //     return userServerTag ? <Outlet /> : <Navigate to="/login" />;
  //   };

  return (
    <Routes>
      <Route path="/" element={<Transactions />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/resetPassword/:id/:token" element={<ResetPassword />} />
      {<Route path="/paymentReturn/:session_id" element={<PaymentReturn />} />}
      <Route path="/checkout" element={<Checkout />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
