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

import MainLayout
from "./layouts/MainLayout";

function App() {

  const userRole =
    localStorage.getItem("userRole");

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/test"
          element={<Test />}
        />

        {/* PM ROUTES */}

        <Route
          element={
            <ProtectedRoute

              userRole={userRole}

              allowedRoles={["pm"]}

            >

              <MainLayout />

            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

        </Route>

        {/* LEAD + MEMBER */}

        <Route
          element={
            <ProtectedRoute

              userRole={userRole}

              allowedRoles={[
                "lead",
                "member"
              ]}

            >

              <MainLayout />

            </ProtectedRoute>
          }
        >

          <Route
            path="/calendar"
            element={<Calendar />}
          />

          <Route
            path="/daily-update"
            element={<DailyUpdate />}
          />

          <Route
            path="/linkedin-update"
            element={<LinkedinUpdate />}
          />

        </Route>

      </Routes>

    </BrowserRouter>

  );

}

export default App;