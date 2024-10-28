import { PaymentReturn } from "../../pages/PaymentReturn";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import {
  Login,
  SignUp,
  Checkout,
  Transactions,
  ResetPassword,
} from "../../pages";
import { AppInit } from "../components";
import { useAuthContext } from "../contexts";

const PrivateRoutes = () => {
  const { Auth } = useAuthContext();
  return Auth.userEmail ? <Outlet /> : <Navigate to="/login" />;
};
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppInit />} />
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/paymentReturn/:session_id" element={<PaymentReturn />} />
      </Route>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/resetPassword/:id/:token" element={<ResetPassword />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
