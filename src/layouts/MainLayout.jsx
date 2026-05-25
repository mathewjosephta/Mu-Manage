import {
  Outlet,
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../services/supabase";

function MainLayout() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const role =
    localStorage.getItem(
      "userRole"
    );

  const [unreadCount,
    setUnreadCount] =
      useState(0);

  // LOGOUT

  const handleLogout =
    async () => {

      await supabase.auth
        .signOut();

      localStorage.removeItem(
        "userRole"
      );

      navigate("/");

    };

  // FETCH UNREAD

  const fetchUnreadMessages =
    async () => {

      const {

        data: sessionData

      } = await supabase.auth
        .getUser();

      if (
        !sessionData?.user
      ) return;

      const email =
        sessionData.user.email;

      const {

        data: userData

      } = await supabase

        .from("users")

        .select("*")

        .eq(
          "email",
          email
        )

        .single();

      if (!userData)
        return;

      const user =
        userData;

      const lastSeenData =
        JSON.parse(

          localStorage.getItem(
            "teamLastSeen"
          ) || "{}"

        );

      let query =
        supabase

          .from(
            "team_messages"
          )

          .select("*");

      if (
        user.role !==
        "pm"
      ) {

        query =
          query.eq(
            "team_name",
            user.team_name
          );

      }

      const {

        data: messages

      } = await query;

      if (!messages)
        return;

      if (

        location.pathname ===
        "/team-chat"

      ) {

        const currentRoom =
          localStorage.getItem(
            "currentChatRoom"
          );

        if (currentRoom) {

          const updated =
            {

              ...lastSeenData,

              [currentRoom]:
                new Date()
                  .toISOString()

            };

          localStorage.setItem(

            "teamLastSeen",

            JSON.stringify(
              updated
            )

          );

        }

      }

      let unread = 0;

      messages.forEach(
        (msg) => {

          if (
            msg.sender_email ===
            email
          ) return;

          const seen =
            lastSeenData[
              msg.team_name
            ];

          if (!seen) {

            unread++;

            return;

          }

          if (

            new Date(
              msg.created_at
            ) >

            new Date(
              seen
            )

          ) {

            unread++;

          }

        }
      );

      setUnreadCount(
        unread
      );

    };

  // AUTO REFRESH

  useEffect(() => {

    fetchUnreadMessages();

    const interval =
      setInterval(() => {

        fetchUnreadMessages();

      }, 2000);

    return () =>
      clearInterval(
        interval
      );

  }, [location.pathname]);

  // NAV STYLE

  const navClass =
    (path) => {

      return `

        w-full text-left p-4 rounded-2xl transition-all

        ${
          location.pathname ===
          path

          ? "bg-blue-50 text-blue-600 font-semibold"

          : "hover:bg-gray-100 text-gray-700"
        }

      `;

    };

  return (

    <div className="h-screen flex bg-[#f5f7fb] overflow-hidden">

      {/* SIDEBAR */}

      <div className="w-[260px] bg-white border-r p-6 flex flex-col justify-between shrink-0">

        <div>

          {/* LOGO */}

          <div className="mb-10">

            <h1 className="text-3xl font-bold">

              μManage

            </h1>

            <p className="text-gray-400 text-sm mt-2">

              Sprint Workspace

            </p>

          </div>

          {/* NAVIGATION */}

          <div className="space-y-3">

            {

              role === "pm" && (

                <>

                  <button
                    onClick={() =>
                      navigate(
                        "/dashboard"
                      )
                    }
                    className={navClass(
                      "/dashboard"
                    )}
                  >

                    Dashboard

                  </button>

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

                    <div className="flex items-center justify-between">

                      <span>
                        Team Chat
                      </span>

                      {

                        unreadCount > 0 && (

                          <div className="min-w-[22px] h-[22px] px-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">

                            {
                              unreadCount
                            }

                          </div>

                        )

                      }

                    </div>

                  </button>

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

                    Tasks

                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        "/analytics"
                      )
                    }
                    className={navClass(
                      "/analytics"
                    )}
                  >

                    Analytics

                  </button>

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

                    Projects

                  </button>

                </>

              )

            }

            {

              (
                role ===
                "lead" ||

                role ===
                "member"
              ) && (

                <>

                  <button
                    onClick={() =>
                      navigate(
                        "/calendar"
                      )
                    }
                    className={navClass(
                      "/calendar"
                    )}
                  >

                    Calendar

                  </button>

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

                    <div className="flex items-center justify-between">

                      <span>
                        Team Chat
                      </span>

                      {

                        unreadCount > 0 && (

                          <div className="min-w-[22px] h-[22px] px-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">

                            {
                              unreadCount
                            }

                          </div>

                        )

                      }

                    </div>

                  </button>

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

                    Tasks

                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        "/linkedin-update"
                      )
                    }
                    className={navClass(
                      "/linkedin-update"
                    )}
                  >

                    LinkedIn Updates

                  </button>

                </>

              )

            }

          </div>

        </div>

        {/* LOGOUT */}

        <button
          onClick={
            handleLogout
          }
          className="bg-red-500 hover:bg-red-600 transition-all text-white py-3 rounded-2xl font-medium"
        >

          Logout

        </button>

      </div>

      {/* CONTENT */}

      <div className="flex-1 overflow-hidden">

        <Outlet />

      </div>

    </div>

  );

}

export default MainLayout;