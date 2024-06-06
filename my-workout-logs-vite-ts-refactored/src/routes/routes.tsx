import { Navigate, Route, Routes } from "react-router-dom";

import { Calendar } from "../pages";
import { SignUp, Login } from "../pages";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Calendar />} />
      <Route path="/Calendar" element={<Calendar />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/SignUp" element={<SignUp />} />
      <Route path="*" element={<Navigate to="/Calendar" />} />
    </Routes>
  );
};

export default AppRoutes;
