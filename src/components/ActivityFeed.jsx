import {

  CheckCircle2,
  Clock3,
  MessageCircle,
  AlertTriangle,
  Trash2,
  PlusCircle,
  Linkedin,
  FolderKanban

} from "lucide-react";

function ActivityFeed({

  activities = []

}) {

  // ICONS

  const getIcon =
    (type) => {

      switch (type) {

        case "task_done":

          return (

            <CheckCircle2
              size={24}
              className="text-[#22c55e]"
            />

          );

        case "task_created":

          return (

            <PlusCircle
              size={24}
              className="text-[#3b82f6]"
            />

          );

        case "task_deleted":

          return (

            <Trash2
              size={24}
              className="text-red-500"
            />

          );

        case "review_needed":

          return (

            <AlertTriangle
              size={24}
              className="text-[#ec4899]"
            />

          );

        case "new_message":

          return (

            <MessageCircle
              size={24}
              className="text-[#f59e0b]"
            />

          );

        case "linkedin_update":

          return (

            <Linkedin
              size={24}
              className="text-[#2563eb]"
            />

          );

        default:

          return (

            <FolderKanban
              size={24}
              className="text-[#1d2b53]"
            />

          );

      }

    };

  // COLORS

  const getColor =
    (type) => {

      switch (type) {

        case "task_done":

          return "bg-[#d8f7df]";

        case "task_created":

          return "bg-[#dcecff]";

        case "task_deleted":

          return "bg-[#ffe0f0]";

        case "review_needed":

          return "bg-[#fff5b8]";

        case "new_message":

          return "bg-[#fff7d6]";

        case "linkedin_update":

          return "bg-[#dcecff]";

        default:

          return "bg-white";

      }

    };

  // FORMAT TIME

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

    <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] overflow-hidden shadow-[6px_6px_0px_#1d2b53]">

      {/* HEADER */}

      <div className="bg-[#fff7d6] border-b-[4px] border-[#1d2b53] px-7 py-6">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-black text-[#1d2b53]">

              Activity Feed

            </h1>

            <p className="text-[#5c6b8a] mt-2">

              Live team & sprint activities

            </p>

          </div>

          <div className="px-5 py-3 rounded-full bg-[#dcecff] border-[3px] border-[#1d2b53] text-[#1d2b53] font-black text-sm">

            {

              activities.length

            } activities

          </div>

        </div>

      </div>

      {/* ACTIVITIES */}

      <div className="max-h-[700px] overflow-y-auto p-6 space-y-5">

        {

          activities.length === 0 && (

            <div className="bg-[#f7f3ea] border-[4px] border-[#1d2b53] rounded-[28px] p-10 text-center">

              <Clock3
                size={42}
                className="mx-auto text-[#5c6b8a]"
              />

              <h2 className="text-3xl font-black text-[#1d2b53] mt-5">

                No Activities Yet

              </h2>

              <p className="text-[#5c6b8a] mt-3 leading-7">

                Team activities will appear here in realtime.

              </p>

            </div>

          )

        }

        {

          activities.map(
            (activity) => (

              <div

                key={activity.id}

                className={`

                  rounded-[30px]
                  border-[4px]
                  border-[#1d2b53]
                  p-6
                  shadow-[4px_4px_0px_#1d2b53]

                  ${
                    getColor(
                      activity.type
                    )
                  }

                `}

              >

                <div className="flex items-start gap-5">

                  {/* ICON */}

                  <div className="w-16 h-16 rounded-[22px] bg-white border-[3px] border-[#1d2b53] flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#1d2b53]">

                    {

                      getIcon(
                        activity.type
                      )

                    }

                  </div>

                  {/* CONTENT */}

                  <div className="flex-1">

                    {/* TOP */}

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

                      <div>

                        <h2 className="text-2xl font-black text-[#1d2b53] leading-tight">

                          {
                            activity.title
                          }

                        </h2>

                        <p className="text-[#5c6b8a] mt-2 leading-7">

                          {
                            activity.description
                          }

                        </p>

                      </div>

                      {/* TYPE */}

                      <div className="px-4 py-2 rounded-full bg-white border-[3px] border-[#1d2b53] text-sm font-black text-[#1d2b53] capitalize whitespace-nowrap h-fit">

                        {

                          activity.type
                            ?.replaceAll(
                              "_",
                              " "
                            )

                        }

                      </div>

                    </div>

                    {/* USER */}

                    <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div className="flex items-center gap-4">

                        {/* AVATAR */}

                        <div className="w-14 h-14 rounded-2xl bg-[#dcecff] border-[3px] border-[#1d2b53] flex items-center justify-center font-black text-[#1d2b53] text-lg">

                          {

                            activity.user_name?.[0]

                          }

                        </div>

                        {/* USER INFO */}

                        <div>

                          <h3 className="font-black text-[#1d2b53] text-lg">

                            {
                              activity.user_name
                            }

                          </h3>

                          <div className="flex items-center gap-3 text-[#5c6b8a] text-sm">

                            <span className="capitalize">

                              {
                                activity.role
                              }

                            </span>

                            <span>

                              •

                            </span>

                            <span className="capitalize">

                              {
                                activity.team_name
                              }

                            </span>

                          </div>

                        </div>

                      </div>

                      {/* TIME */}

                      <div className="flex items-center gap-3 text-[#5c6b8a]">

                        <Clock3
                          size={18}
                        />

                        <p className="font-semibold">

                          {

                            formatTime(
                              activity.created_at
                            )

                          }

                        </p>

                      </div>

                    </div>

                    {/* TASK */}

                    {

                      activity.task_title && (

                        <div className="mt-6 bg-white border-[3px] border-[#1d2b53] rounded-[22px] p-5">

                          <p className="text-sm text-[#5c6b8a] font-bold uppercase mb-2">

                            Related Task

                          </p>

                          <h3 className="text-xl font-black text-[#1d2b53]">

                            {
                              activity.task_title
                            }

                          </h3>

                        </div>

                      )

                    }

                  </div>

                </div>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default ActivityFeed;