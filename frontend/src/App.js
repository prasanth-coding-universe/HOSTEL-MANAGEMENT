import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import RoomsPage from "./pages/RoomsPage";
import WardensPage from "./pages/WardensPage";
import AllocationPage from "./pages/AllocationPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<Layout />}>
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
