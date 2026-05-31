import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import MainLayout
from "./layouts/MainLayout";

import { useAuth }
from "./context/AuthContext";

// PAGES

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

  const { user: authUser } = useAuth();

  const storedUser =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    ) || null;

  const user = authUser || storedUser;

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

        {/* MAIN LAYOUT */}

        <Route

          path="/"

          element={

            <ProtectedRoute>

              <MainLayout />

            </ProtectedRoute>

          }

        >

          {/* DEFAULT PAGE */}

          <Route

            index

            element={

              <Navigate
                to="/daily-updates"
                replace
              />

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