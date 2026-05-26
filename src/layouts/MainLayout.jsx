import {
  Outlet,
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import {

  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Linkedin,
  MessageCircle,
  LogOut,
  CalendarDays

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
    ) || {

      role: "pm"

    };

  const role =
    currentUser.role;

  const [unreadCount,
    setUnreadCount] =
      useState(0);

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

  // FETCH UNREAD

  const fetchUnreadMessages =
    async () => {

      const {

        data: messages

      } = await supabase

        .from(
          "team_messages"
        )

        .select("*");

      if (!messages)
        return;

      setUnreadCount(

        messages.length

      );

    };

  useEffect(() => {

    fetchUnreadMessages();

  }, []);

  // NAV STYLE

  const navClass =
    (path) => {

      return `

        flex items-center gap-4
        w-full
        px-5 py-4
        rounded-[22px]
        border-[3px]
        transition-all
        font-black

        ${
          location.pathname ===
          path

          ? "bg-[#3b82f6] text-white border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53]"

          : "bg-white text-[#1d2b53] border-[#1d2b53]"
        }

      `;

    };

  return (

    <div className="h-screen flex bg-[#f7f3ea] overflow-hidden">

      {/* SIDEBAR */}

      <div className="w-[290px] bg-white border-r-[4px] border-[#1d2b53] flex flex-col justify-between p-6 shrink-0">

        <div>

          {/* LOGO */}

          <div className="mb-10">

            <div className="bg-[#dcecff] border-[4px] border-[#1d2b53] rounded-[28px] p-6 shadow-[5px_5px_0px_#1d2b53]">

              <h1 className="text-4xl font-black text-[#1d2b53]">

                μManage

              </h1>

              <p className="text-[#5c6b8a] mt-2">

                Sprint Workspace

              </p>

            </div>

          </div>

          {/* NAVIGATION */}

          <div className="space-y-4">

            {/* DASHBOARD */}

            <button

              onClick={() =>
                navigate("/")
              }

              className={navClass(
                "/"
              )}

            >

              <LayoutDashboard
                size={24}
              />

              Dashboard

            </button>

            {/* PROJECTS */}

            {

              role === "pm" && (

                <button

                  onClick={() =>
                    navigate(
                      "/projects"
                    )
                  }

                  className={navClass(
                    "/projects"
                  )}

                >

                  <FolderKanban
                    size={24}
                  />

                  Projects

                </button>

              )

            }

            {/* TASKS */}

            <button

              onClick={() =>
                navigate(
                  "/tasks"
                )
              }

              className={navClass(
                "/tasks"
              )}

            >

              <CheckSquare
                size={24}
              />

              Tasks

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
                size={24}
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

              <Linkedin
                size={24}
              />

              Linkedin Updates

            </button>

            {/* CHAT */}

            <button

              onClick={() =>
                navigate(
                  "/team-chat"
                )
              }

              className={navClass(
                "/team-chat"
              )}

            >

              <div className="flex items-center justify-between w-full">

                <div className="flex items-center gap-4">

                  <MessageCircle
                    size={24}
                  />

                  Team Chat

                </div>

                {

                  unreadCount > 0 && (

                    <div className="min-w-[28px] h-[28px] rounded-full bg-red-500 text-white text-sm flex items-center justify-center">

                      {
                        unreadCount
                      }

                    </div>

                  )

                }

              </div>

            </button>

          </div>

        </div>

        {/* USER */}

        <div className="space-y-5">

          <div className="bg-[#fff7d6] border-[4px] border-[#1d2b53] rounded-[28px] p-5 shadow-[4px_4px_0px_#1d2b53]">

            <h2 className="text-xl font-black text-[#1d2b53]">

              {

                currentUser.name ||

                "Guest"

              }

            </h2>

            <p className="text-[#5c6b8a] mt-2 capitalize">

              {role}

            </p>

          </div>

          {/* LOGOUT */}

          <button

            onClick={
              handleLogout
            }

            className="flex items-center justify-center gap-3 w-full bg-red-500 hover:bg-red-600 transition-all text-white py-5 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[5px_5px_0px_#1d2b53] font-black"

          >

            <LogOut
              size={22}
            />

            Logout

          </button>

        </div>

      </div>

      {/* CONTENT */}

      <div className="flex-1 overflow-y-auto">

        <div className="p-8">

          <Outlet />

        </div>

      </div>

    </div>

  );

}

export default MainLayout;