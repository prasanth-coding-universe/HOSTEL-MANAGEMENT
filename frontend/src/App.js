import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import RoomsPage from "./pages/RoomsPage";
import WardensPage from "./pages/WardensPage";
import AllocationPage from "./pages/AllocationPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("hostel-auth") === "true");

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(localStorage.getItem("hostel-auth") === "true");
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener("hostel-auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("hostel-auth-changed", syncAuth);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        path="/signup"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignUpPage />}
      />
      <Route element={isLoggedIn ? <Layout /> : <Navigate to="/" replace />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/wardens" element={<WardensPage />} />
        <Route path="/allocations" element={<AllocationPage />} />
      </Route>
    </Routes>
  );
}

export default App;
