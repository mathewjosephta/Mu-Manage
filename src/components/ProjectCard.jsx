import {

  FolderKanban,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Users,
  ChevronRight,
  Activity

} from "lucide-react";

function ProjectCard({

  project,
  tasks,
  users,
  onClick

}) {

  // PROJECT TASKS

  const projectTasks =
    tasks.filter(
      (task) =>

        task.project_id ===
        project.id &&

        !task.is_deleted
    );

  // STATS

  const todo =
    projectTasks.filter(
      (task) =>
        task.status ===
        "todo"
    ).length;

  const progress =
    projectTasks.filter(
      (task) =>
        task.status ===
        "in progress"
    ).length;

  const review =
    projectTasks.filter(
      (task) =>
        task.status ===
        "under review"
    ).length;

  const done =
    projectTasks.filter(
      (task) =>
        task.status ===
        "done"
    ).length;

  const total =
    projectTasks.length;

  // HEALTH %

  const health =
    total > 0

      ? Math.round(

          (
            done /
            total
          ) * 100

        )

      : 0;

  // MEMBERS

  const projectMembers =
    users.filter(
      (user) =>
        user.project_id ===
        project.id
    );

  // RISK

  const overdue =
    projectTasks.filter(
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

  // HEALTH LABEL

  const getHealthLabel =
    () => {

      if (
        health >= 75
      ) {

        return {

          text:
            "Healthy",

          color:
            "bg-[#d8f7df]"

        };

      }

      if (
        health >= 40
      ) {

        return {

          text:
            "Moderate",

          color:
            "bg-[#fff5b8]"

        };

      }

      return {

        text:
          "At Risk",

        color:
          "bg-[#ffe0f0]"

      };

    };

  const healthState =
    getHealthLabel();

  return (

    <button

      onClick={() =>
        onClick(project)
      }

      className={`

        w-full text-left
        rounded-[34px]
        border-[4px]
        border-[#1d2b53]
        p-7
        transition-all
        shadow-[6px_6px_0px_#1d2b53]
        hover:translate-y-[2px]

        ${
          project.color ||

          "bg-[#dcecff]"
        }

      `}

    >

      {/* TOP */}

      <div className="flex items-start justify-between mb-7">

        {/* ICON */}

        <div className="w-20 h-20 rounded-[26px] bg-white border-[4px] border-[#1d2b53] flex items-center justify-center shadow-[4px_4px_0px_#1d2b53]">

          <FolderKanban
            size={36}
            className="text-[#1d2b53]"
          />

        </div>

        {/* HEALTH */}

        <div className={`

          px-5 py-3 rounded-full
          border-[3px]
          border-[#1d2b53]
          text-sm font-black

          ${
            healthState.color
          }

        `}>

          {
            healthState.text
          }

        </div>

      </div>

      {/* PROJECT */}

      <div>

        <h1 className="text-4xl font-black text-[#1d2b53] leading-tight">

          {
            project.name
          }

        </h1>

        <p className="text-[#5c6b8a] mt-3 leading-7">

          {

            project.description ||

            "No description added."

          }

        </p>

      </div>

      {/* TECH */}

      <div className="flex flex-wrap gap-3 mt-6">

        {

          project.tech_stack
            ?.split(",")

            .map(
              (tech) => (

                <div

                  key={tech}

                  className="px-4 py-2 rounded-full bg-white border-[2px] border-[#1d2b53] text-sm font-bold text-[#1d2b53]"

                >

                  {
                    tech.trim()
                  }

                </div>

              )
            )

        }

      </div>

      {/* PROGRESS */}

      <div className="mt-8">

        <div className="flex items-center justify-between mb-3">

          <p className="font-bold text-[#1d2b53]">

            Sprint Progress

          </p>

          <p className="text-xl font-black text-[#1d2b53]">

            {
              health
            }%

          </p>

        </div>

        <div className="w-full h-6 rounded-full bg-white border-[3px] border-[#1d2b53] overflow-hidden">

          <div

            className="h-full bg-[#3b82f6]"

            style={{
              width: `${health}%`
            }}

          />

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-3 mt-8">

        {/* TODO */}

        <div className="bg-white border-[3px] border-[#1d2b53] rounded-[24px] p-4">

          <p className="text-xs text-[#5c6b8a] font-bold uppercase">

            Todo

          </p>

          <h2 className="text-3xl font-black text-[#1d2b53] mt-2">

            {todo}

          </h2>

        </div>

        {/* PROGRESS */}

        <div className="bg-white border-[3px] border-[#1d2b53] rounded-[24px] p-4">

          <p className="text-xs text-[#5c6b8a] font-bold uppercase">

            Active

          </p>

          <h2 className="text-3xl font-black text-[#1d2b53] mt-2">

            {
              progress
            }

          </h2>

        </div>

        {/* REVIEW */}

        <div className="bg-white border-[3px] border-[#1d2b53] rounded-[24px] p-4">

          <p className="text-xs text-[#5c6b8a] font-bold uppercase">

            Review

          </p>

          <h2 className="text-3xl font-black text-[#1d2b53] mt-2">

            {
              review
            }

          </h2>

        </div>

        {/* DONE */}

        <div className="bg-white border-[3px] border-[#1d2b53] rounded-[24px] p-4">

          <p className="text-xs text-[#5c6b8a] font-bold uppercase">

            Done

          </p>

          <h2 className="text-3xl font-black text-[#1d2b53] mt-2">

            {done}

          </h2>

        </div>

      </div>

      {/* MEMBERS */}

      <div className="mt-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center">

            <Users
              size={24}
              className="text-[#1d2b53]"
            />

          </div>

          <div>

            <p className="text-sm text-[#5c6b8a]">

              Team Members

            </p>

            <h3 className="text-2xl font-black text-[#1d2b53]">

              {
                projectMembers.length
              }

            </h3>

          </div>

        </div>

        {/* DEADLINE */}

        <div className="text-right">

          <div className="flex items-center gap-2 justify-end mb-2">

            <Clock3
              size={18}
              className="text-[#5c6b8a]"
            />

            <p className="text-sm text-[#5c6b8a]">

              Deadline

            </p>

          </div>

          <h3 className="font-black text-[#1d2b53] text-lg">

            {
              project.deadline
            }

          </h3>

        </div>

      </div>

      {/* ALERTS */}

      {

        overdue > 0 && (

          <div className="mt-8 bg-[#ffe0f0] border-[3px] border-red-500 rounded-[24px] p-5">

            <div className="flex items-center gap-3 mb-2">

              <AlertTriangle
                size={22}
                className="text-red-600"
              />

              <h3 className="font-black text-red-600 text-lg">

                Risk Alert

              </h3>

            </div>

            <p className="text-red-500 font-semibold leading-7">

              {
                overdue
              } overdue tasks affecting sprint completion.

            </p>

          </div>

        )

      }

      {/* FOOTER */}

      <div className="mt-8 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <Activity
            size={20}
            className="text-[#5c6b8a]"
          />

          <p className="text-[#5c6b8a] font-semibold">

            {
              total
            } total tasks

          </p>

        </div>

        <div className="flex items-center gap-2 font-black text-[#1d2b53]">

          View Project

          <ChevronRight
            size={22}
          />

        </div>

      </div>

    </button>

  );

}

export default ProjectCard;