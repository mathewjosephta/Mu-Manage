import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import MainLayout from "./layouts/MainLayout";

// PAGES

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import DailyUpdates from "./pages/DailyUpdates";
import LinkedinUpdates from "./pages/LinkedinUpdates";
import TeamChat from "./pages/TeamChat";

// AUTH

import Login from "./pages/Login";

// STYLES

import "./App.css";

function App() {

  const [user,
    setUser] =
      useState(null);

  // LOAD USER

  useEffect(() => {

    const storedUser =
      JSON.parse(

        localStorage.getItem(
          "user"
        )

      );

    setUser(
      storedUser
    );

  }, []);

  // PROTECTED ROUTE

  const ProtectedRoute = ({
    children
  }) => {

    if (!user) {

      return (

        <Navigate
          to="/login"
          replace
        />

      );

    }

    return children;

  };

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route

          path="/login"

          element={<Login />}

        />

        {/* MAIN */}

        <Route

          path="/"

          element={

            <ProtectedRoute>

              <MainLayout />

            </ProtectedRoute>

          }

        >

          {/* DASHBOARD */}

          <Route

            index

            element={
              <Dashboard />
            }

          />

          {/* PROJECTS */}

          <Route

            path="projects"

            element={
              <Projects />
            }

          />

          {/* TASKS */}

          <Route

            path="tasks"

            element={
              <Tasks />
            }

          />

          {/* DAILY */}

          <Route

            path="daily-updates"

            element={
              <DailyUpdates />
            }

          />

          {/* LINKEDIN */}

          <Route

            path="linkedin-updates"

            element={
              <LinkedinUpdates />
            }

          />

          {/* CHAT */}

          <Route

            path="team-chat"

            element={
              <TeamChat />
            }

          />

        </Route>

        {/* FALLBACK */}

        <Route

          path="*"

          element={

            <Navigate
              to="/"
              replace
            />

          }

        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;