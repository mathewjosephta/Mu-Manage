import {

  Trophy,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Activity,
  Users

} from "lucide-react";

function TeamProgress({

  teamName,
  tasks = [],
  members = [],
  updates = []

}) {

  // TEAM TASKS

  const teamTasks =
    tasks.filter(
      (task) =>

        task.team_name ===
        teamName &&

        !task.is_deleted
    );

  // COUNTS

  const todo =
    teamTasks.filter(
      (task) =>
        task.status ===
        "todo"
    ).length;

  const progress =
    teamTasks.filter(
      (task) =>
        task.status ===
        "in progress"
    ).length;

  const review =
    teamTasks.filter(
      (task) =>
        task.status ===
        "under review"
    ).length;

  const done =
    teamTasks.filter(
      (task) =>
        task.status ===
        "done"
    ).length;

  const total =
    teamTasks.length;

  // HEALTH

  const health =
    total > 0

      ? Math.round(
          (
            done /
            total
          ) * 100
        )

      : 0;

  // OVERDUE

  const overdue =
    teamTasks.filter(
      (task) => {

        if (
          task.status ===
          "done"
        ) return false;

        return (

          new Date(
            task.due_date
          ) < new Date()

        );

      }
    ).length;

  // ACTIVE MEMBERS

  const teamMembers =
    members.filter(
      (member) =>
        member.team_name ===
        teamName
    );

  // DAILY UPDATES

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const todayUpdates =
    updates.filter(
      (update) => {

        const date =
          new Date(
            update.created_at
          )

            .toISOString()
            .split("T")[0];

        return (

          update.team_name ===
          teamName &&

          date === today

        );

      }
    ).length;

  // UPDATE %

  const updatePercentage =

    teamMembers.length > 0

      ? Math.round(

          (
            todayUpdates /
            teamMembers.length
          ) * 100

        )

      : 0;

  // HEALTH STATUS

  const getHealthStatus =
    () => {

      if (
        health >= 75
      ) {

        return {

          label:
            "Healthy",

          color:
            "bg-[#d8f7df]"

        };

      }

      if (
        health >= 40
      ) {

        return {

          label:
            "Moderate",

          color:
            "bg-[#fff5b8]"

        };

      }

      return {

        label:
          "At Risk",

        color:
          "bg-[#ffe0f0]"

      };

    };

  const healthStatus =
    getHealthStatus();

  return (

    <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] p-7 shadow-[6px_6px_0px_#1d2b53]">

      {/* TOP */}

      <div className="flex items-start justify-between mb-8">

        <div>

          <h1 className="text-4xl font-black text-[#1d2b53] capitalize">

            {teamName}

          </h1>

          <p className="text-[#5c6b8a] mt-2">

            Sprint analytics & productivity

          </p>

        </div>

        {/* STATUS */}

        <div className={`

          px-5 py-3 rounded-full
          border-[3px]
          border-[#1d2b53]
          font-black text-sm

          ${
            healthStatus.color
          }

        `}>

          {
            healthStatus.label
          }

        </div>

      </div>

      {/* HEALTH */}

      <div className="mb-8">

        <div className="flex items-center justify-between mb-3">

          <div className="flex items-center gap-3">

            <Trophy
              size={24}
              className="text-[#1d2b53]"
            />

            <p className="font-black text-[#1d2b53]">

              Team Health

            </p>

          </div>

          <h2 className="text-3xl font-black text-[#1d2b53]">

            {health}%

          </h2>

        </div>

        {/* BAR */}

        <div className="w-full h-6 rounded-full bg-[#e7ecf5] border-[3px] border-[#1d2b53] overflow-hidden">

          <div

            className="h-full bg-[#3b82f6]"

            style={{
              width: `${health}%`
            }}

          />

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* TODO */}

        <div className="bg-[#dcecff] border-[3px] border-[#1d2b53] rounded-[24px] p-5">

          <p className="text-sm text-[#5c6b8a] font-bold uppercase">

            Todo

          </p>

          <h2 className="text-4xl font-black text-[#1d2b53] mt-3">

            {todo}

          </h2>

        </div>

        {/* ACTIVE */}

        <div className="bg-[#fff5b8] border-[3px] border-[#1d2b53] rounded-[24px] p-5">

          <p className="text-sm text-[#5c6b8a] font-bold uppercase">

            Active

          </p>

          <h2 className="text-4xl font-black text-[#1d2b53] mt-3">

            {
              progress
            }

          </h2>

        </div>

        {/* REVIEW */}

        <div className="bg-[#ffe0f0] border-[3px] border-[#1d2b53] rounded-[24px] p-5">

          <p className="text-sm text-[#5c6b8a] font-bold uppercase">

            Review

          </p>

          <h2 className="text-4xl font-black text-[#1d2b53] mt-3">

            {
              review
            }

          </h2>

        </div>

        {/* DONE */}

        <div className="bg-[#d8f7df] border-[3px] border-[#1d2b53] rounded-[24px] p-5">

          <p className="text-sm text-[#5c6b8a] font-bold uppercase">

            Done

          </p>

          <h2 className="text-4xl font-black text-[#1d2b53] mt-3">

            {done}

          </h2>

        </div>

      </div>

      {/* MEMBERS */}

      <div className="grid lg:grid-cols-2 gap-5 mb-8">

        {/* MEMBERS */}

        <div className="bg-[#f7f3ea] border-[3px] border-[#1d2b53] rounded-[28px] p-6">

          <div className="flex items-center gap-3 mb-5">

            <Users
              size={24}
              className="text-[#1d2b53]"
            />

            <h2 className="text-2xl font-black text-[#1d2b53]">

              Team Members

            </h2>

          </div>

          <div className="space-y-4">

            {

              teamMembers
                .slice(0, 5)

                .map(
                  (member) => (

                    <div

                      key={member.id}

                      className="flex items-center justify-between bg-white border-[2px] border-[#1d2b53] rounded-2xl px-4 py-3"

                    >

                      <div>

                        <h3 className="font-black text-[#1d2b53]">

                          {
                            member.name
                          }

                        </h3>

                        <p className="text-sm text-[#5c6b8a] capitalize">

                          {
                            member.role
                          }

                        </p>

                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-[#dcecff] border-[2px] border-[#1d2b53] flex items-center justify-center font-black text-[#1d2b53]">

                        {

                          member.name?.[0]

                        }

                      </div>

                    </div>

                  )
                )

            }

          </div>

        </div>

        {/* DAILY UPDATES */}

        <div className="bg-[#f7f3ea] border-[3px] border-[#1d2b53] rounded-[28px] p-6">

          <div className="flex items-center gap-3 mb-5">

            <Activity
              size={24}
              className="text-[#1d2b53]"
            />

            <h2 className="text-2xl font-black text-[#1d2b53]">

              Daily Updates

            </h2>

          </div>

          {/* UPDATE BAR */}

          <div className="mb-5">

            <div className="flex items-center justify-between mb-3">

              <p className="font-bold text-[#1d2b53]">

                Submission Rate

              </p>

              <p className="text-2xl font-black text-[#1d2b53]">

                {
                  updatePercentage
                }%

              </p>

            </div>

            <div className="w-full h-5 rounded-full bg-white border-[3px] border-[#1d2b53] overflow-hidden">

              <div

                className="h-full bg-[#22c55e]"

                style={{
                  width: `${updatePercentage}%`
                }}

              />

            </div>

          </div>

          {/* COUNTS */}

          <div className="space-y-4">

            <div className="flex items-center justify-between bg-white border-[2px] border-[#1d2b53] rounded-2xl px-5 py-4">

              <div className="flex items-center gap-3">

                <CheckCircle2
                  size={22}
                  className="text-[#22c55e]"
                />

                <p className="font-bold text-[#1d2b53]">

                  Submitted Today

                </p>

              </div>

              <h3 className="text-2xl font-black text-[#1d2b53]">

                {
                  todayUpdates
                }

              </h3>

            </div>

            <div className="flex items-center justify-between bg-white border-[2px] border-[#1d2b53] rounded-2xl px-5 py-4">

              <div className="flex items-center gap-3">

                <Clock3
                  size={22}
                  className="text-[#f59e0b]"
                />

                <p className="font-bold text-[#1d2b53]">

                  Missing Updates

                </p>

              </div>

              <h3 className="text-2xl font-black text-[#1d2b53]">

                {

                  teamMembers.length -
                  todayUpdates

                }

              </h3>

            </div>

          </div>

        </div>

      </div>

      {/* ALERTS */}

      {

        overdue > 0 && (

          <div className="bg-[#ffe0f0] border-[4px] border-red-500 rounded-[28px] p-6">

            <div className="flex items-center gap-3 mb-3">

              <AlertTriangle
                size={26}
                className="text-red-600"
              />

              <h2 className="text-2xl font-black text-red-600">

                Risk Alert

              </h2>

            </div>

            <p className="text-red-500 font-semibold leading-8">

              {
                overdue
              } overdue tasks are delaying sprint progress.

            </p>

          </div>

        )

      }

    </div>

  );

}

export default TeamProgress;