import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import DailyUpdate from "./pages/DailyUpdate";
import LinkedinUpdate from "./pages/LinkedinUpdate";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/daily-update" element={<DailyUpdate />} />
        <Route path="/linkedin-update" element={<LinkedinUpdate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;