import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import CardsRow from "./components/CardsRow";
import ReadingsList from "./components/ReadingsList";
/* import { useServer } from "./contexts/ServerContext";
import { useGlobalContext } from "./contexts/appContexts"; */
import Login from "./components/Login";
import Signup from "./components/Signup";
import Footer from "./components/Footer";
function App() {
  /* const { serverMessage } = useServer();
  const { showSignin, showSignup } = useGlobalContext(); */

  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        <NavBar />
        <Login />
        <Signup />
        <Routes>
          <Route exact path="/" element={<CardsRow />} />
          <Route path="/readingsList" element={<ReadingsList />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
