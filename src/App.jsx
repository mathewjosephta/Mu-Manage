import {

  BrowserRouter,
  Routes,
  Route

} from "react-router-dom";

import Dashboard
from "./pages/Dashboard";

import Calendar
from "./pages/Calendar";

import Projects
from "./pages/Projects";

import Analytics
from "./pages/Analytics";

import DailyUpdate
from "./pages/DailyUpdate";

import LinkedinUpdate
from "./pages/LinkedinUpdate";

import Login
from "./pages/Login";

import Test
from "./pages/Test";

import ProtectedRoute
from "./routes/ProtectedRoute";

function App() {

  const userRole =
    localStorage.getItem("userRole");

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/test"
          element={<Test />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute

              userRole={userRole}

              allowedRoles={["pm"]}

            >

              <Dashboard />

            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute

              userRole={userRole}

              allowedRoles={[
                "lead",
                "member"
              ]}

            >

              <Calendar />

            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/daily-update"
          element={<DailyUpdate />}
        />

        <Route
          path="/linkedin-update"
          element={<LinkedinUpdate />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;