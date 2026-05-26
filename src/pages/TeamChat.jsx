import {
  useEffect,
  useRef,
  useState
} from "react";

import {

  Send,
  Image,
  Paperclip,
  Search,
  Users,
  MessageCircle,
  Trash2

} from "lucide-react";

import { supabase }
from "../services/supabase";

import ChatBubble
from "../components/ChatBubble";

function TeamChat() {

  const [messages,
    setMessages] =
      useState([]);

  const [users,
    setUsers] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [message,
    setMessage] =
      useState("");

  const [selectedTeam,
    setSelectedTeam] =
      useState("all");

  const [search,
    setSearch] =
      useState("");

  const messagesEndRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  // USER

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  // FETCH

  useEffect(() => {

    fetchData();

    const channel =
      supabase

        .channel(
          "team-chat-live"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table:
              "team_messages"

          },

          () => {

            fetchData();

          }

        )

        .subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );

    };

  }, []);

  // AUTO SCROLL

  useEffect(() => {

    scrollToBottom();

  }, [messages]);

  const scrollToBottom =
    () => {

      messagesEndRef.current
        ?.scrollIntoView({

          behavior: "smooth"

        });

    };

  const fetchData =
    async () => {

      setLoading(true);

      const {

        data: messageData

      } = await supabase

        .from(
          "team_messages"
        )

        .select("*")

        .order(
          "created_at",
          {
            ascending: true
          }
        );

      const {

        data: userData

      } = await supabase

        .from("users")

        .select("*");

      setMessages(
        messageData || []
      );

      setUsers(
        userData || []
      );

      setLoading(false);

    };

  // SEND MESSAGE

  const sendMessage =
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

            selectedTeam ===
            "all"

              ? "all"

              : currentUser.team_name,

          message,

          is_read: false

        }]);

      setMessage("");

      fetchData();

    };

  // DELETE

  const deleteMessage =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this message?"
        );

      if (!confirmDelete)
        return;

      await supabase

        .from(
          "team_messages"
        )

        .delete()

        .eq("id", id);

      fetchData();

    };

  // FILE

  const uploadFile =
    async (event) => {

      const file =
        event.target.files[0];

      if (!file)
        return;

      const fileName =

        `${Date.now()}-${file.name}`;

      const {

        data,
        error

      } = await supabase

        .storage

        .from("chat-files")

        .upload(

          fileName,
          file
        );

      if (error)
        return;

      const {

        data: publicUrl

      } = supabase

        .storage

        .from("chat-files")

        .getPublicUrl(
          fileName
        );

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

            selectedTeam ===
            "all"

              ? "all"

              : currentUser.team_name,

          message:
            "Uploaded a file",

          file_url:
            publicUrl.publicUrl

        }]);

      fetchData();

    };

  // FILTER

  const filteredMessages =

    messages.filter(
      (msg) => {

        const matchesTeam =

          selectedTeam ===
          "all"

            ? true

            : msg.team_name ===
              selectedTeam;

        const matchesSearch =

          msg.sender_name
            ?.toLowerCase()

            .includes(
              search.toLowerCase()
            ) ||

          msg.message
            ?.toLowerCase()

            .includes(
              search.toLowerCase()
            );

        return (

          matchesTeam &&
          matchesSearch

        );

      }
    );

  // TEAMS

  const teams = [

    "all",

    ...new Set(

      users.map(
        (user) =>
          user.team_name
      )

    )

  ];

  // LOADING

  if (loading) {

    return (

      <div className="h-screen bg-[#f7f3ea] flex items-center justify-center">

        <h1 className="text-5xl font-black text-[#1d2b53]">

          Loading Chat...

        </h1>

      </div>

    );

  }

  return (

    <div className="h-screen bg-[#f7f3ea] p-6 overflow-hidden">

      <div className="h-full grid xl:grid-cols-[320px_1fr] gap-6">

        {/* SIDEBAR */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] shadow-[6px_6px_0px_#1d2b53] overflow-hidden flex flex-col">

          {/* HEADER */}

          <div className="bg-[#fff7d6] border-b-[4px] border-[#1d2b53] p-6">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-[24px] bg-white border-[3px] border-[#1d2b53] flex items-center justify-center">

                <MessageCircle
                  size={30}
                  className="text-[#1d2b53]"
                />

              </div>

              <div>

                <h1 className="text-3xl font-black text-[#1d2b53]">

                  Team Chat

                </h1>

                <p className="text-[#5c6b8a] mt-1">

                  Realtime collaboration

                </p>

              </div>

            </div>
          </div>

          {/* SEARCH */}

          <div className="p-5 border-b-[4px] border-[#1d2b53]">

            <div className="flex items-center gap-3 bg-[#f7f3ea] border-[3px] border-[#1d2b53] rounded-[20px] px-4 py-4">

              <Search
                size={20}
                className="text-[#5c6b8a]"
              />

              <input

                type="text"

                placeholder="Search messages..."

                value={search}

                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }

                className="bg-transparent outline-none flex-1 font-semibold text-[#1d2b53]"

              />

            </div>

          </div>

          {/* TEAMS */}

          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {

              teams.map(
                (team) => (

                  <button

                    key={team}

                    onClick={() =>
                      setSelectedTeam(
                        team
                      )
                    }

                    className={`

                      w-full flex items-center gap-4
                      rounded-[24px]
                      border-[3px]
                      px-5 py-5
                      text-left
                      transition-all

                      ${
                        selectedTeam ===
                        team

                        ? "bg-[#3b82f6] text-white border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53]"

                        : "bg-white text-[#1d2b53] border-[#1d2b53]"
                      }

                    `}

                  >

                    <div className={`

                      w-14 h-14 rounded-2xl
                      border-[3px]
                      flex items-center justify-center

                      ${
                        selectedTeam ===
                        team

                        ? "bg-white border-white"

                        : "bg-[#dcecff] border-[#1d2b53]"
                      }

                    `}>

                      <Users
                        size={24}
                        className={

                          selectedTeam ===
                          team

                          ? "text-[#1d2b53]"

                          : "text-[#1d2b53]"
                        }
                      />

                    </div>

                    <div>

                      <h2 className="font-black text-lg capitalize">

                        {team}

                      </h2>

                      <p className={`

                        text-sm mt-1

                        ${
                          selectedTeam ===
                          team

                          ? "text-white"

                          : "text-[#5c6b8a]"
                        }

                      `}>

                        {

                          team === "all"

                          ? "Global chat"

                          : "Team room"

                        }

                      </p>

                    </div>

                  </button>

                )
              )

            }

          </div>

        </div>

        {/* CHAT AREA */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] shadow-[6px_6px_0px_#1d2b53] overflow-hidden flex flex-col h-full">

          {/* TOP */}

          <div className="bg-[#dcecff] border-b-[4px] border-[#1d2b53] px-7 py-6 flex items-center justify-between">

            <div>

              <h2 className="text-4xl font-black text-[#1d2b53] capitalize">

                {selectedTeam}

              </h2>

              <p className="text-[#5c6b8a] mt-2">

                {

                  filteredMessages.length

                } messages

              </p>

            </div>

            <div className="bg-white border-[3px] border-[#1d2b53] rounded-full px-5 py-3 font-black text-[#1d2b53]">

              LIVE CHAT

            </div>

          </div>

          {/* MESSAGES */}

          <div className="flex-1 overflow-y-auto p-7 space-y-7 bg-[#f7f3ea]">

            {

              filteredMessages.length === 0 && (

                <div className="h-full flex flex-col items-center justify-center">

                  <MessageCircle
                    size={60}
                    className="text-[#5c6b8a]"
                  />

                  <h2 className="text-4xl font-black text-[#1d2b53] mt-6">

                    No Messages Yet

                  </h2>

                </div>

              )

            }

            {

              filteredMessages.map(
                (msg) => (

                  <div
                    key={msg.id}
                    className="group relative"
                  >

                    <ChatBubble

                      message={msg}

                      currentUser={
                        currentUser
                      }

                    />

                    {/* DELETE */}

                    {

                      msg.sender_email ===
                        currentUser.email && (

                        <button

                          onClick={() =>
                            deleteMessage(
                              msg.id
                            )
                          }

                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all w-12 h-12 rounded-2xl bg-red-100 border-[3px] border-red-500 flex items-center justify-center"

                        >

                          <Trash2
                            size={18}
                            className="text-red-600"
                          />

                        </button>

                      )

                    }

                  </div>

                )
              )

            }

            <div
              ref={
                messagesEndRef
              }
            />

          </div>

          {/* INPUT */}

          <div className="border-t-[4px] border-[#1d2b53] bg-white p-6">

            <div className="flex items-end gap-4">

              {/* FILE */}

              <button

                onClick={() =>

                  fileInputRef.current.click()

                }

                className="w-16 h-16 rounded-[22px] bg-[#fff5b8] border-[4px] border-[#1d2b53] flex items-center justify-center shadow-[4px_4px_0px_#1d2b53]"

              >

                <Paperclip
                  size={24}
                  className="text-[#1d2b53]"
                />

              </button>

              {/* IMAGE */}

              <button

                onClick={() =>

                  fileInputRef.current.click()

                }

                className="w-16 h-16 rounded-[22px] bg-[#ffe0f0] border-[4px] border-[#1d2b53] flex items-center justify-center shadow-[4px_4px_0px_#1d2b53]"

              >

                <Image
                  size={24}
                  className="text-[#1d2b53]"
                />

              </button>

              {/* INPUT */}

              <div className="flex-1 bg-[#f7f3ea] border-[4px] border-[#1d2b53] rounded-[28px] px-6 py-5 shadow-[4px_4px_0px_#1d2b53]">

                <textarea

                  rows={2}

                  placeholder="Type message..."

                  value={message}

                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }

                  onKeyDown={(e) => {

                    if (

                      e.key ===
                        "Enter" &&

                      !e.shiftKey

                    ) {

                      e.preventDefault();

                      sendMessage();

                    }

                  }}

                  className="w-full bg-transparent resize-none outline-none text-[#1d2b53] font-medium"

                />

              </div>

              {/* SEND */}

              <button

                onClick={
                  sendMessage
                }

                className="w-20 h-20 rounded-[26px] bg-[#3b82f6] border-[4px] border-[#1d2b53] flex items-center justify-center shadow-[5px_5px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

              >

                <Send
                  size={30}
                  className="text-white"
                />

              </button>

              {/* HIDDEN FILE */}

              <input

                type="file"

                ref={fileInputRef}

                onChange={
                  uploadFile
                }

                className="hidden"

              />

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default TeamChat;