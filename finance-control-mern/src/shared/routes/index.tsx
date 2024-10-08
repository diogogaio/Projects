import { PaymentReturn } from "../../pages/PaymentReturn";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import {
  Login,
  SignUp,
  Checkout,
  Transactions,
  ResetPassword,
} from "../../pages";
import { useAuthContext } from "../contexts";

export const AppRoutes = () => {
  const PrivateRoutes = () => {
    const { Auth } = useAuthContext();

    return Auth.userEmail ? <Outlet /> : <Navigate to="/" />;
  };

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/resetPassword/:id/:token" element={<ResetPassword />} />
      <Route path="/paymentReturn/:session_id" element={<PaymentReturn />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

{
}
