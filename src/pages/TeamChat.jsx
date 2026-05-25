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

  // TEAMS

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

        // MEMBER

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

  // UNREAD COUNTS

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

      if (!data)
        return;

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

      // MEMBER

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

  // MARK READ

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

      <div className="h-screen flex items-center justify-center bg-[#f7f3ea]">

        <h1 className="text-3xl font-black text-[#1d2b53]">

          Loading chat...

        </h1>

      </div>

    );

  }

  return (

    <div className="h-screen bg-[#f7f3ea] flex flex-col overflow-hidden">

      {/* HEADER */}

      <div className="px-8 py-6 border-b-[4px] border-[#1d2b53] bg-[#fff7d6] shrink-0">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-5xl font-black text-[#1d2b53]">

              Team Chat

            </h1>

            <p className="text-[#5c6b8a] mt-2 text-lg capitalize">

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

                <div className="bg-[#ff5f7e] border-[3px] border-[#1d2b53] shadow-[3px_3px_0px_#1d2b53] text-white px-5 py-2 rounded-full text-sm font-bold">

                  {
                    totalUnread
                  } unread

                </div>

              )

            }

            <div className="bg-[#dcecff] border-[3px] border-[#1d2b53] shadow-[3px_3px_0px_#1d2b53] text-[#1d2b53] px-5 py-2 rounded-full text-sm font-bold capitalize">

              {
                currentUser?.role
              }

            </div>

          </div>

        </div>

      </div>

      {/* TEAM TABS */}

      {

        currentUser?.role ===
        "pm" && (

          <div className="px-8 py-5 flex gap-4 overflow-x-auto bg-[#f7f3ea] border-b-[4px] border-[#1d2b53] shrink-0">

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

                      px-6 py-4 rounded-[22px]
                      whitespace-nowrap
                      transition-all
                      flex items-center gap-3
                      border-[3px] border-[#1d2b53]
                      font-bold capitalize

                      ${
                        selectedTeam ===
                        team

                        ? "bg-[#3b82f6] text-white shadow-[4px_4px_0px_#1d2b53]"

                        : "bg-white text-[#1d2b53]"
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

                        <div className="min-w-[24px] h-[24px] px-2 rounded-full bg-[#ff5f7e] border-[2px] border-[#1d2b53] text-white text-xs flex items-center justify-center">

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

      {/* MESSAGES */}

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">

        <div className="space-y-8">

          {

            messages.map(

              (msg) => {

                const isMine =

                  msg.sender_email ===
                  currentUser?.email;

                return (

                  <div

                    key={msg.id}

                    className={`

                      flex

                      ${
                        isMine

                        ? "justify-end"

                        : "justify-start"
                      }

                    `}

                  >

                    <div className="max-w-[70%]">

                      {/* USER */}

                      <div className={`

                        flex items-center gap-3 mb-3

                        ${
                          isMine

                          ? "justify-end"

                          : "justify-start"
                        }

                      `}>

                        {

                          !isMine && (

                            <div className="w-12 h-12 rounded-2xl border-[3px] border-[#1d2b53] bg-[#ffe0f0] text-[#1d2b53] flex items-center justify-center font-black text-lg">

                              {

                                msg.sender_name?.[0]

                              }

                            </div>

                          )

                        }

                        <div className={

                          isMine
                          ? "text-right"
                          : ""

                        }>

                          <h3 className="font-black text-[#1d2b53] text-lg">

                            {
                              msg.sender_name
                            }

                          </h3>

                          <div className={`

                            flex gap-3 text-sm text-[#5c6b8a]

                            ${
                              isMine

                              ? "justify-end"

                              : ""
                            }

                          `}>

                            <span className="capitalize">

                              {
                                msg.sender_role
                              }

                            </span>

                            <span>

                              •

                            </span>

                            <span className="capitalize">

                              {
                                msg.team_name
                              }

                            </span>

                          </div>

                        </div>

                        {

                          isMine && (

                            <div className="w-12 h-12 rounded-2xl border-[3px] border-[#1d2b53] bg-[#3b82f6] text-white flex items-center justify-center font-black text-lg">

                              {

                                msg.sender_name?.[0]

                              }

                            </div>

                          )

                        }

                      </div>

                      {/* MESSAGE */}

                      <div className={`

                        rounded-[28px]
                        px-7 py-6
                        border-[4px] border-[#1d2b53]
                        leading-8
                        text-[16px]
                        break-words

                        ${
                          isMine

                          ? "bg-[#3b82f6] text-white shadow-[5px_5px_0px_#1d2b53]"

                          : "bg-white text-[#1d2b53] shadow-[5px_5px_0px_#1d2b53]"
                        }

                      `}>

                        {msg.message}

                      </div>

                    </div>

                  </div>

                );

              }

            )

          }

          <div ref={bottomRef}></div>

        </div>

      </div>

      {/* INPUT */}

      <div className="bg-[#fff7d6] border-t-[4px] border-[#1d2b53] px-8 py-6 shrink-0">

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

            className="flex-1 bg-white border-[4px] border-[#1d2b53] rounded-[26px] px-7 py-5 outline-none text-[#1d2b53] placeholder:text-[#8a94a6]"

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

            className="bg-[#22c55e] text-white px-10 py-5 rounded-[26px] border-[4px] border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53] font-black hover:translate-y-[2px] transition-all"

          >

            Send

          </button>

        </div>

      </div>

    </div>

  );

}

export default TeamChat;