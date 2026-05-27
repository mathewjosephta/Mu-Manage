import {
  Outlet,
  useLocation,
  useNavigate
} from "react-router-dom";

import {

  LayoutDashboard,
  CalendarDays,
  Briefcase,
  LogOut

} from "lucide-react";

import { supabase }
from "../services/supabase";

function MainLayout() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  // LOGOUT

  const handleLogout =
    async () => {

      await supabase.auth
        .signOut();

      localStorage.removeItem(
        "user"
      );

      navigate("/login");

    };

  // NAV STYLE

  const navClass =
    (path) => {

      return `

        flex items-center gap-3
        px-4 py-3
        rounded-xl
        transition-all
        text-sm
        font-medium

        ${
          location.pathname === path

          ? "bg-black text-white"

          : "text-gray-600 hover:bg-gray-100"
        }

      `;

    };

  return (

    <div className="h-screen bg-white flex overflow-hidden">

      {/* SIDEBAR */}

      <div className="w-[260px] h-screen fixed left-0 top-0 border-r border-gray-200 bg-white flex flex-col justify-between p-6">

        {/* TOP */}

        <div>

          {/* LOGO */}

          <div className="mb-10 mt-3">

            <h1 className="text-3xl font-bold text-black">

              μManage

            </h1>

            <p className="text-gray-500 mt-1 text-sm">

              Team Accountability

            </p>

          </div>

          {/* NAVIGATION */}

          <div className="space-y-2">

            {/* DASHBOARD */}

            <button

              onClick={() =>
                navigate("/")
              }

              className={navClass("/")}

            >

              <LayoutDashboard
                size={18}
              />

              Dashboard

            </button>

            {/* DAILY */}

            <button

              onClick={() =>
                navigate(
                  "/daily-updates"
                )
              }

              className={navClass(
                "/daily-updates"
              )}

            >

              <CalendarDays
                size={18}
              />

              Daily Updates

            </button>

            {/* LINKEDIN */}

            <button

              onClick={() =>
                navigate(
                  "/linkedin-updates"
                )
              }

              className={navClass(
                "/linkedin-updates"
              )}

            >

              <Briefcase
                size={18}
              />

              Linkedin Updates

            </button>

          </div>

        </div>

        {/* BOTTOM */}

        <div className="pb-6">

          {/* USER */}

          <div className="mb-4">

            <h2 className="font-semibold text-black">

              {
                currentUser?.name
              }

            </h2>

            <p className="text-sm text-gray-500 capitalize">

              {
                currentUser?.role
              }

            </p>

          </div>

          {/* LOGOUT */}

          <button

            onClick={
              handleLogout
            }

            className="flex items-center gap-3 bg-red-50 text-red-500 hover:bg-red-100 px-4 py-3 rounded-xl transition-all w-full border border-red-100"

          >

            <LogOut
              size={18}
            />

            Logout

          </button>

        </div>

      </div>

      {/* CONTENT */}

      <div className="flex-1 ml-[260px] h-screen overflow-y-auto">

        <div className="p-8">

          <Outlet />

        </div>

      </div>

    </div>

  );

}

export default MainLayout;