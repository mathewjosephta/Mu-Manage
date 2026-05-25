import {
  useEffect,
  useRef,
  useState
} from "react";

import { supabase }
from "../services/supabase";

function TeamChat() {

  const [messages,
    setMessages] =
      useState([]);

  const [message,
    setMessage] =
      useState("");

  const [currentUser,
    setCurrentUser] =
      useState(null);

  const [selectedTeam,
    setSelectedTeam] =
      useState("");

  const [loading,
    setLoading] =
      useState(true);

  const [teamUnread,
    setTeamUnread] =
      useState({});

  const bottomRef =
    useRef(null);

  // PM TEAM ROOMS

  const teams = [

    "canteen",
    "printer",
    "campus connect"

  ];

  // FETCH USER

  useEffect(() => {

    fetchCurrentUser();

  }, []);

  const fetchCurrentUser =
    async () => {

      const {

        data: sessionData

      } = await supabase.auth
        .getUser();

      const email =
        sessionData.user.email;

      const {

        data

      } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .limit(1);

      if (
        data &&
        data.length > 0
      ) {

        const user =
          data[0];

        setCurrentUser(
          user
        );

        // PM

        if (
          user.role ===
          "pm"
        ) {

          setSelectedTeam(
            "canteen"
          );

          fetchMessages(
            "canteen"
          );

        }

        // MEMBERS

        else {

          setSelectedTeam(
            user.team_name
          );

          fetchMessages(
            user.team_name
          );

        }

        fetchUnreadCounts(
          user
        );

      }

      setLoading(false);

    };

  // FETCH MESSAGES

  const fetchMessages =
    async (
      roomTeam
    ) => {

      const {

        data

      } = await supabase

        .from("team_messages")

        .select("*")

        .eq(
          "team_name",
          roomTeam
        )

        .order(
          "created_at",
          {
            ascending: true
          }
        );

      if (data) {

        setMessages(data);

      }

    };

  // FETCH TEAM NOTIFICATIONS

  const fetchUnreadCounts =
    async (user) => {

      const lastSeen =
        JSON.parse(

          localStorage.getItem(
            "teamLastSeen"
          ) || "{}"

        );

      const {

        data

      } = await supabase

        .from(
          "team_messages"
        )

        .select("*");

      if (!data) return;

      const unreadMap =
        {};

      // PM

      if (
        user.role ===
        "pm"
      ) {

        teams.forEach(
          (team) => {

            const unread =
              data.filter(
                (msg) => {

                  if (
                    msg.team_name !==
                    team
                  ) {

                    return false;

                  }

                  if (
                    msg.sender_email ===
                    user.email
                  ) {

                    return false;

                  }

                  const seen =
                    lastSeen[
                      team
                    ];

                  if (!seen)
                    return true;

                  return (

                    new Date(
                      msg.created_at
                    ) >

                    new Date(
                      seen
                    )

                  );

                }
              );

            unreadMap[
              team
            ] =
              unread.length;

          }
        );

      }

      // MEMBERS

      else {

        const unread =
          data.filter(
            (msg) => {

              if (
                msg.team_name !==
                user.team_name
              ) {

                return false;

              }

              if (
                msg.sender_email ===
                user.email
              ) {

                return false;

              }

              const seen =
                lastSeen[
                  user.team_name
                ];

              if (!seen)
                return true;

              return (

                new Date(
                  msg.created_at
                ) >

                new Date(
                  seen
                )

              );

            }
          );

        unreadMap[
          user.team_name
        ] =
          unread.length;

      }

      setTeamUnread(
        unreadMap
      );

    };

  // AUTO REFRESH

  useEffect(() => {

    if (
      !currentUser ||
      !selectedTeam
    ) return;

    const interval =
      setInterval(() => {

        fetchMessages(
          selectedTeam
        );

        fetchUnreadCounts(
          currentUser
        );

      }, 2000);

    return () =>
      clearInterval(
        interval
      );

  }, [
    currentUser,
    selectedTeam
  ]);

  // AUTO SCROLL

  useEffect(() => {

    bottomRef.current?.
      scrollIntoView({

        behavior:
          "smooth"

      });

  }, [messages]);

  // MARK TEAM AS READ

  useEffect(() => {

    if (!selectedTeam)
      return;

    const stored =
      JSON.parse(

        localStorage.getItem(
          "teamLastSeen"
        ) || "{}"

      );

    stored[
      selectedTeam
    ] =
      new Date().toISOString();

    localStorage.setItem(

      "teamLastSeen",

      JSON.stringify(
        stored
      )

    );

    if (
      currentUser
    ) {

      fetchUnreadCounts(
        currentUser
      );

    }

  }, [
    selectedTeam,
    messages
  ]);

  // SEND MESSAGE

  const handleSend =
    async () => {

      if (!message.trim())
        return;

      await supabase

        .from(
          "team_messages"
        )

        .insert([{

          sender_name:
            currentUser.name,

          sender_email:
            currentUser.email,

          sender_role:
            currentUser.role,

          team_name:
            selectedTeam,

          message:
            message

        }]);

      setMessage("");

      fetchMessages(
        selectedTeam
      );

    };

  // TOTAL UNREAD

  const totalUnread =
    Object.values(
      teamUnread
    ).reduce(

      (a, b) => a + b,

      0

    );

  // LOADING

  if (loading) {

    return (

      <div className="h-full flex items-center justify-center">

        <h1 className="text-2xl font-semibold">

          Loading chat...

        </h1>

      </div>

    );

  }

  return (

    <div className="bg-[#f5f7fb] h-full flex flex-col">

      {/* TOPBAR */}

      <div className="bg-white border-b px-10 py-6 flex items-center justify-between shrink-0">

        <div>

          <h1 className="text-3xl font-bold">

            Team Chat

          </h1>

          <p className="text-gray-500 mt-1 capitalize">

            {

              currentUser?.role ===
              "pm"

              ? `Viewing ${selectedTeam} Team`

              : `${selectedTeam} Team Workspace`

            }

          </p>

        </div>

        <div className="flex items-center gap-4">

          {

            totalUnread > 0 && (

              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">

                {
                  totalUnread
                } unread
              </div>

            )

          }

          <div className="bg-blue-100 text-blue-700 px-5 py-2 rounded-2xl text-sm font-medium capitalize">

            {
              currentUser?.role
            }

          </div>

        </div>

      </div>

      {/* TEAM SWITCHER */}

      {

        currentUser?.role ===
        "pm" && (

          <div className="bg-white border-b px-10 py-4 flex gap-4 overflow-x-auto shrink-0">

            {

              teams.map(
                (team) => (

                  <button

                    key={team}

                    onClick={() => {

                      setSelectedTeam(
                        team
                      );

                      fetchMessages(
                        team
                      );

                    }}

                    className={`

                      px-5 py-3 rounded-2xl capitalize whitespace-nowrap transition-all flex items-center gap-3

                      ${
                        selectedTeam ===
                        team

                        ? "bg-blue-600 text-white"

                        : "bg-gray-100 hover:bg-gray-200"
                      }

                    `}
                  >

                    <span>

                      {team}

                    </span>

                    {

                      teamUnread[
                        team
                      ] > 0 && (

                        <div className="min-w-[22px] h-[22px] px-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">

                          {
                            teamUnread[
                              team
                            ]
                          }

                        </div>

                      )

                    }

                  </button>

                )
              )

            }

          </div>

        )

      }

      {/* CHAT AREA */}

      <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">

        {

          messages.map(

            (msg) => (

              <div
                key={msg.id}
                className={`

                  max-w-[850px]

                  ${
                    msg.sender_email ===
                    currentUser?.email

                    ? "ml-auto"

                    : ""
                  }

                `}
              >

                <div className="mb-3 flex items-center gap-3">

                  <h3 className="font-semibold text-lg">

                    {
                      msg.sender_name
                    }

                  </h3>

                  <span className="text-sm text-gray-400 capitalize">

                    {
                      msg.sender_role
                    }

                  </span>

                  <span className="text-sm text-gray-400 capitalize">

                    {
                      msg.team_name
                    }

                  </span>

                </div>

                <div className={`

                  rounded-[28px] px-7 py-5 shadow-sm

                  ${
                    msg.sender_email ===
                    currentUser?.email

                    ? "bg-blue-600 text-white"

                    : "bg-white"
                  }

                `}>

                  <p className="leading-8 whitespace-pre-wrap text-[16px]">

                    {msg.message}

                  </p>

                </div>

              </div>

            )

          )

        }

        <div ref={bottomRef}></div>

      </div>

      {/* INPUT */}

      <div className="bg-white border-t px-10 py-5 shrink-0">

        <div className="flex items-center gap-4">

          <input

            type="text"

            value={message}

            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }

            placeholder="Send message to team..."

            className="flex-1 border rounded-3xl px-7 py-5 outline-none focus:ring-2 focus:ring-blue-500"

            onKeyDown={(e) => {

              if (
                e.key === "Enter"
              ) {

                handleSend();

              }

            }}

          />

          <button

            onClick={
              handleSend
            }

            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-3xl transition-all"

          >

            Send

          </button>

        </div>

      </div>

    </div>

  );

}

export default TeamChat;