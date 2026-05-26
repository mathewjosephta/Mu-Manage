import {
  Bell,
  Check,
  Trash2,
  Clock3,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  X
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState
} from "react";

function NotificationBell({

  notifications = [],
  markAsRead,
  markAllAsRead,
  deleteNotification

}) {

  const [open,
    setOpen] =
      useState(false);

  const dropdownRef =
    useRef(null);

  // CLOSE OUTSIDE

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (

          dropdownRef.current &&

          !dropdownRef.current.contains(
            event.target
          )

        ) {

          setOpen(false);

        }

      };

    document.addEventListener(

      "mousedown",

      handleClickOutside

    );

    return () => {

      document.removeEventListener(

        "mousedown",

        handleClickOutside

      );

    };

  }, []);

  // UNREAD COUNT

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  // ICONS

  const getIcon =
    (type) => {

      switch (type) {

        case "task_assigned":

          return (

            <Clock3
              size={20}
              className="text-[#f59e0b]"
            />

          );

        case "task_done":

          return (

            <CheckCircle2
              size={20}
              className="text-[#22c55e]"
            />

          );

        case "review_needed":

          return (

            <AlertTriangle
              size={20}
              className="text-[#ec4899]"
            />

          );

        case "new_message":

          return (

            <MessageCircle
              size={20}
              className="text-[#3b82f6]"
            />

          );

        default:

          return (

            <Bell
              size={20}
              className="text-[#1d2b53]"
            />

          );

      }

    };

  // TIME FORMAT

  const formatTime =
    (timestamp) => {

      if (!timestamp)
        return "";

      const date =
        new Date(timestamp);

      return date.toLocaleString(
        "en-IN",

        {

          day: "numeric",

          month: "short",

          hour: "numeric",

          minute: "2-digit"

        }

      );

    };

  return (

    <div
      className="relative"
      ref={dropdownRef}
    >

      {/* BELL */}

      <button

        onClick={() =>
          setOpen(!open)
        }

        className="relative w-16 h-16 rounded-[24px] bg-white border-[4px] border-[#1d2b53] shadow-[5px_5px_0px_#1d2b53] flex items-center justify-center hover:translate-y-[2px] transition-all"

      >

        <Bell
          size={28}
          className="text-[#1d2b53]"
        />

        {/* BADGE */}

        {

          unreadCount > 0 && (

            <div className="absolute -top-2 -right-2 min-w-[34px] h-[34px] px-2 rounded-full bg-[#ff5f7e] border-[3px] border-[#1d2b53] flex items-center justify-center text-white font-black text-sm shadow-[2px_2px_0px_#1d2b53]">

              {

                unreadCount > 99

                ? "99+"

                : unreadCount

              }

            </div>

          )

        }

      </button>

      {/* DROPDOWN */}

      {

        open && (

          <div className="absolute right-0 mt-5 w-[430px] bg-[#f7f3ea] border-[5px] border-[#1d2b53] rounded-[34px] shadow-[8px_8px_0px_#1d2b53] overflow-hidden z-50">

            {/* HEADER */}

            <div className="bg-[#fff7d6] border-b-[5px] border-[#1d2b53] px-7 py-6">

              <div className="flex items-center justify-between">

                <div>

                  <h1 className="text-3xl font-black text-[#1d2b53]">

                    Notifications

                  </h1>

                  <p className="text-[#5c6b8a] mt-1">

                    {

                      unreadCount

                    } unread notifications

                  </p>

                </div>

                {/* ACTIONS */}

                <div className="flex items-center gap-3">

                  {/* MARK ALL */}

                  {

                    unreadCount > 0 && (

                      <button

                        onClick={
                          markAllAsRead
                        }

                        className="w-12 h-12 rounded-2xl bg-[#d8f7df] border-[3px] border-[#1d2b53] flex items-center justify-center shadow-[3px_3px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

                      >

                        <Check
                          size={20}
                          className="text-[#1d2b53]"
                        />

                      </button>

                    )

                  }

                  {/* CLOSE */}

                  <button

                    onClick={() =>
                      setOpen(false)
                    }

                    className="w-12 h-12 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center shadow-[3px_3px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

                  >

                    <X
                      size={20}
                      className="text-[#1d2b53]"
                    />

                  </button>

                </div>

              </div>

            </div>

            {/* LIST */}

            <div className="max-h-[550px] overflow-y-auto p-5 space-y-4">

              {

                notifications.length === 0 && (

                  <div className="bg-white border-[4px] border-[#1d2b53] rounded-[28px] p-8 text-center">

                    <Bell
                      size={40}
                      className="mx-auto text-[#5c6b8a]"
                    />

                    <h2 className="text-2xl font-black text-[#1d2b53] mt-5">

                      No Notifications

                    </h2>

                    <p className="text-[#5c6b8a] mt-2">

                      Everything looks quiet.

                    </p>

                  </div>

                )

              }

              {

                notifications.map(
                  (notification) => (

                    <div

                      key={
                        notification.id
                      }

                      className={`

                        rounded-[28px]
                        border-[4px]
                        p-5
                        transition-all

                        ${
                          notification.is_read

                          ? "bg-white border-[#1d2b53] opacity-70"

                          : "bg-[#dcecff] border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53]"
                        }

                      `}

                    >

                      {/* TOP */}

                      <div className="flex items-start justify-between gap-4">

                        {/* LEFT */}

                        <div className="flex gap-4 flex-1">

                          {/* ICON */}

                          <div className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center shrink-0">

                            {

                              getIcon(
                                notification.type
                              )

                            }

                          </div>

                          {/* CONTENT */}

                          <div className="flex-1">

                            <h2 className="font-black text-[#1d2b53] text-lg leading-tight">

                              {
                                notification.title
                              }

                            </h2>

                            <p className="text-[#5c6b8a] mt-2 leading-7">

                              {
                                notification.message
                              }

                            </p>

                            <div className="flex items-center gap-3 mt-4">

                              <Clock3
                                size={16}
                                className="text-[#5c6b8a]"
                              />

                              <p className="text-sm text-[#5c6b8a] font-semibold">

                                {

                                  formatTime(
                                    notification.created_at
                                  )

                                }

                              </p>

                            </div>

                          </div>

                        </div>

                        {/* DELETE */}

                        <button

                          onClick={() =>

                            deleteNotification(
                              notification.id
                            )

                          }

                          className="w-11 h-11 rounded-xl bg-red-100 border-[3px] border-red-500 flex items-center justify-center hover:translate-y-[2px] transition-all shrink-0"

                        >

                          <Trash2
                            size={18}
                            className="text-red-600"
                          />

                        </button>

                      </div>

                      {/* ACTION */}

                      {

                        !notification.is_read && (

                          <button

                            onClick={() =>

                              markAsRead(
                                notification.id
                              )

                            }

                            className="mt-5 bg-[#22c55e] text-white px-5 py-3 rounded-2xl border-[3px] border-[#1d2b53] shadow-[3px_3px_0px_#1d2b53] font-bold hover:translate-y-[2px] transition-all"

                          >

                            Mark as Read

                          </button>

                        )

                      }

                    </div>

                  )
                )

              }

            </div>

          </div>

        )

      }

    </div>

  );

}

export default NotificationBell;