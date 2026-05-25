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

import LinkedinUpdate
from "./pages/LinkedinUpdate";

import TeamChat
from "./pages/TeamChat";

import Tasks
from "./pages/Tasks";

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
    localStorage.getItem(
      "userRole"
    );

  return (

    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/test"
          element={<Test />}
        />

        {/* PROTECTED */}

        <Route

          element={

            <ProtectedRoute

              userRole={
                userRole
              }

              allowedRoles={[
                "pm",
                "lead",
                "member"
              ]}

            >

              <MainLayout />

            </ProtectedRoute>

          }

        >

          {/* PM */}

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

          {/* SHARED */}

          <Route
            path="/calendar"
            element={<Calendar />}
          />

          <Route
            path="/team-chat"
            element={<TeamChat />}
          />

          <Route
            path="/tasks"
            element={<Tasks />}
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