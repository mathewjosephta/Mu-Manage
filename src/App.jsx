import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import MainLayout
from "./layouts/MainLayout";

// PAGES

import Dashboard
from "./pages/Dashboard";

import DailyUpdates
from "./pages/DailyUpdates";

import LinkedinUpdates
from "./pages/LinkedinUpdates";

// AUTH

import Login
from "./pages/Login";

// STYLES

import "./App.css";

function App() {

  // USER

  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    ) || null;

  // PROTECTED ROUTE

  const ProtectedRoute =
    ({ children }) => {

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

          element={
            <Login />
          }

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

          {/* ROLE BASED HOME */}

          <Route

            index

            element={

              user?.role === "pm"

                ? (

                  <Dashboard />

                )

                : (

                  <Navigate
                    to="/daily-updates"
                    replace
                  />

                )

            }

          />

          {/* DAILY UPDATES */}

          <Route

            path="daily-updates"

            element={
              <DailyUpdates />
            }

          />

          {/* LINKEDIN UPDATES */}

          <Route

            path="linkedin-updates"

            element={
              <LinkedinUpdates />
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