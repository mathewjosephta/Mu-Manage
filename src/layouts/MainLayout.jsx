import { Outlet, useNavigate }
from "react-router-dom";

import { supabase }
from "../services/supabase";

function MainLayout() {

  const navigate = useNavigate();

  const role =
    localStorage.getItem("userRole");

  const handleLogout = async () => {

    await supabase.auth.signOut();

    localStorage.removeItem(
      "userRole"
    );

    navigate("/");

  };

  return (

    <div className="min-h-screen flex bg-[#f5f7fb]">

      {/* SIDEBAR */}

      <div className="w-[260px] bg-white shadow-lg p-6 flex flex-col justify-between">

        <div>

          <h1 className="text-3xl font-bold mb-10">
            μManage
          </h1>

          <div className="space-y-4">

            {
              role === "pm" && (

                <>
                  <button
                    onClick={() =>
                      navigate("/dashboard")
                    }
                    className="w-full text-left bg-blue-50 p-4 rounded-2xl"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() =>
                      navigate("/analytics")
                    }
                    className="w-full text-left p-4 rounded-2xl hover:bg-gray-100"
                  >
                    Analytics
                  </button>

                  <button
                    onClick={() =>
                      navigate("/projects")
                    }
                    className="w-full text-left p-4 rounded-2xl hover:bg-gray-100"
                  >
                    Projects
                  </button>
                </>

              )
            }

            {
              (
                role === "lead" ||
                role === "member"
              ) && (

                <>
                  <button
                    onClick={() =>
                      navigate("/calendar")
                    }
                    className="w-full text-left bg-blue-50 p-4 rounded-2xl"
                  >
                    Calendar
                  </button>

                  <button
                    onClick={() =>
                      navigate("/daily-update")
                    }
                    className="w-full text-left p-4 rounded-2xl hover:bg-gray-100"
                  >
                    Daily Updates
                  </button>

                  <button
                    onClick={() =>
                      navigate("/linkedin-update")
                    }
                    className="w-full text-left p-4 rounded-2xl hover:bg-gray-100"
                  >
                    LinkedIn Updates
                  </button>
                </>

              )
            }

          </div>

        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-3 rounded-2xl"
        >
          Logout
        </button>

      </div>

      {/* MAIN CONTENT */}

      <div className="flex-1 p-8">

        <Outlet />

      </div>

    </div>

  );

}

export default MainLayout;