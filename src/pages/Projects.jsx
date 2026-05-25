import {
  useEffect,
  useState
} from "react";

import {

  FolderKanban,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Activity,
  ChevronRight

} from "lucide-react";

import { supabase }
from "../services/supabase";

function Projects() {

  const [tasks,
    setTasks] =
      useState([]);

  const [users,
    setUsers] =
      useState([]);

  const [selectedProject,
    setSelectedProject] =
      useState(null);

  // PROJECTS

  const projects = [

    {
      name: "Campus Bites",
      team: "canteen",
      deadline: "May 30",
      color: "bg-[#dcecff]"
    },

    {
      name: "Q-Doc",
      team: "printer",
      deadline: "June 05",
      color: "bg-[#ffe0f0]"
    },

    {
      name: "Campus Connect",
      team: "campus connect",
      deadline: "June 12",
      color: "bg-[#fff5b8]"
    }

  ];

  // FETCH

  useEffect(() => {

    fetchData();

    const channel =
      supabase

        .channel(
          "projects-live"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table: "tasks"

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

  const fetchData =
    async () => {

      const {

        data: taskData

      } = await supabase

        .from("tasks")

        .select("*");

      const {

        data: userData

      } = await supabase

        .from("users")

        .select("*");

      setTasks(
        taskData || []
      );

      setUsers(
        userData || []
      );

    };

  // PROJECT STATS

  const getProjectStats =
    (team) => {

      const projectTasks =
        tasks.filter(
          (task) =>
            task.team_name ===
            team
        );

      const completed =
        projectTasks.filter(
          (task) =>
            task.status ===
            "completed"
        ).length;

      const pending =
        projectTasks.filter(
          (task) =>
            task.status ===
            "pending"
        ).length;

      const progress =
        projectTasks.filter(
          (task) =>
            task.status ===
            "in progress"
        ).length;

      const total =
        projectTasks.length;

      const percentage =
        total > 0

          ? Math.round(

              (
                completed /
                total
              ) * 100

            )

          : 0;

      const delayed =
        pending > 3;

      return {

        completed,
        pending,
        progress,
        total,
        percentage,
        delayed

      };

    };

  // HEALTH

  const getHealth =
    (percentage) => {

      if (
        percentage >= 75
      ) {

        return {

          label:
            "Healthy",

          color:
            "bg-[#d8f7df]"

        };

      }

      if (
        percentage >= 45
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

  return (

    <div className="bg-[#f7f3ea] p-8 space-y-7 relative min-h-screen">

      {/* HEADER */}

      <div className="bg-[#fff7d6] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[6px_6px_0px_#1d2b53]">

        <h1 className="text-5xl font-black text-[#1d2b53]">

          Projects

        </h1>

        <p className="text-[#5c6b8a] mt-2 text-lg">

          Team project overview & sprint health

        </p>

      </div>

      {/* PROJECT CARDS */}

      <div className="grid lg:grid-cols-3 gap-6">

        {

          projects.map(
            (project) => {

              const stats =
                getProjectStats(
                  project.team
                );

              const health =
                getHealth(
                  stats.percentage
                );

              return (

                <button

                  key={project.name}

                  onClick={() =>
                    setSelectedProject(
                      project
                    )
                  }

                  className={`

                    ${project.color}

                    border-[4px]
                    border-[#1d2b53]
                    rounded-[32px]
                    p-7
                    shadow-[6px_6px_0px_#1d2b53]
                    text-left
                    hover:translate-y-[2px]
                    transition-all

                  `}

                >

                  {/* TOP */}

                  <div className="flex items-center justify-between mb-7">

                    <div className="w-16 h-16 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center">

                      <FolderKanban
                        size={30}
                        className="text-[#1d2b53]"
                      />

                    </div>

                    <div className={`

                      px-4 py-2 rounded-full
                      border-[2px]
                      border-[#1d2b53]
                      text-sm font-bold

                      ${health.color}

                    `}>

                      {
                        health.label
                      }

                    </div>

                  </div>

                  {/* INFO */}

                  <h2 className="text-4xl font-black text-[#1d2b53]">

                    {
                      project.name
                    }

                  </h2>

                  <p className="text-[#5c6b8a] mt-2 capitalize">

                    {
                      project.team
                    } team

                  </p>

                  {/* PROGRESS */}

                  <div className="mt-7">

                    <div className="flex items-center justify-between mb-3">

                      <p className="font-bold text-[#1d2b53]">

                        Sprint Progress

                      </p>

                      <p className="font-black text-[#1d2b53]">

                        {
                          stats.percentage
                        }%

                      </p>

                    </div>

                    <div className="w-full h-5 rounded-full bg-white border-[2px] border-[#1d2b53] overflow-hidden">

                      <div

                        className="h-full bg-[#3b82f6]"

                        style={{
                          width: `${stats.percentage}%`
                        }}

                      />

                    </div>

                  </div>

                  {/* STATS */}

                  <div className="grid grid-cols-3 gap-3 mt-7">

                    <div className="bg-white border-[2px] border-[#1d2b53] rounded-2xl p-4">

                      <p className="text-xs text-[#5c6b8a] font-bold">

                        Done

                      </p>

                      <h3 className="text-2xl font-black text-[#1d2b53] mt-2">

                        {
                          stats.completed
                        }

                      </h3>

                    </div>

                    <div className="bg-white border-[2px] border-[#1d2b53] rounded-2xl p-4">

                      <p className="text-xs text-[#5c6b8a] font-bold">

                        Pending

                      </p>

                      <h3 className="text-2xl font-black text-[#1d2b53] mt-2">

                        {
                          stats.pending
                        }

                      </h3>

                    </div>

                    <div className="bg-white border-[2px] border-[#1d2b53] rounded-2xl p-4">

                      <p className="text-xs text-[#5c6b8a] font-bold">

                        Active

                      </p>

                      <h3 className="text-2xl font-black text-[#1d2b53] mt-2">

                        {
                          stats.progress
                        }

                      </h3>

                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="mt-7 flex items-center justify-between">

                    <div>

                      <p className="text-sm text-[#5c6b8a]">

                        Deadline

                      </p>

                      <h4 className="font-black text-[#1d2b53]">

                        {
                          project.deadline
                        }

                      </h4>

                    </div>

                    <ChevronRight
                      size={28}
                      className="text-[#1d2b53]"
                    />

                  </div>

                </button>

              );

            }
          )

        }

      </div>

      {/* TIMELINE + ALERTS */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* TIMELINE */}

        <div className="lg:col-span-2 bg-white border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="flex items-center gap-3 mb-8">

            <Activity
              size={30}
              className="text-[#3b82f6]"
            />

            <h2 className="text-3xl font-black text-[#1d2b53]">

              Sprint Timeline

            </h2>

          </div>

          <div className="flex items-center justify-between gap-4">

            {

              [

                "Research",
                "Design",
                "Development",
                "Testing",
                "Deployment"

              ].map(
                (
                  stage,
                  index
                ) => (

                  <div

                    key={stage}

                    className="flex-1 text-center"

                  >

                    <div className={`

                      w-16 h-16 mx-auto
                      rounded-2xl
                      border-[3px] border-[#1d2b53]
                      flex items-center justify-center
                      font-black text-lg

                      ${
                        index < 3

                        ? "bg-[#3b82f6] text-white"

                        : "bg-white text-[#1d2b53]"
                      }

                    `}>

                      {
                        index + 1
                      }

                    </div>

                    <p className="mt-4 font-bold text-[#1d2b53]">

                      {stage}

                    </p>

                  </div>

                )
              )

            }

          </div>

        </div>

        {/* ALERTS */}

        <div className="bg-[#ffe0f0] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="flex items-center gap-3 mb-8">

            <AlertTriangle
              size={28}
              className="text-[#ec4899]"
            />

            <h2 className="text-3xl font-black text-[#1d2b53]">

              Risk Alerts

            </h2>

          </div>

          <div className="space-y-5">

            {

              projects.map(
                (project) => {

                  const stats =
                    getProjectStats(
                      project.team
                    );

                  return (

                    <div

                      key={project.name}

                      className="bg-white border-[3px] border-[#1d2b53] rounded-[24px] p-5"

                    >

                      <div className="flex items-center justify-between mb-3">

                        <h3 className="font-black text-[#1d2b53]">

                          {
                            project.name
                          }

                        </h3>

                        {

                          stats.delayed && (

                            <div className="px-3 py-1 bg-[#ffe0f0] border-[2px] border-[#1d2b53] rounded-full text-xs font-bold">

                              Risk

                            </div>

                          )

                        }

                      </div>

                      <p className="text-[#5c6b8a] leading-7">

                        {

                          stats.delayed

                          ? `${stats.pending} pending tasks delaying sprint progress.`

                          : "Project sprint running smoothly."

                        }

                      </p>

                    </div>

                  );

                }
              )

            }

          </div>

        </div>

      </div>

      {/* ACTIVITY */}

      <div className="bg-white border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[6px_6px_0px_#1d2b53]">

        <div className="flex items-center gap-3 mb-8">

          <Clock3
            size={28}
            className="text-[#f59e0b]"
          />

          <h2 className="text-3xl font-black text-[#1d2b53]">

            Recent Activity

          </h2>

        </div>

        <div className="space-y-5">

          {

            tasks

              .slice(0, 6)

              .map(
                (task) => (

                  <div

                    key={task.id}

                    className="bg-[#f7f3ea] border-[3px] border-[#1d2b53] rounded-[24px] p-5 flex items-center justify-between"

                  >

                    <div>

                      <h3 className="font-black text-[#1d2b53] text-lg">

                        {
                          task.title
                        }

                      </h3>

                      <p className="text-[#5c6b8a] capitalize mt-1">

                        {
                          task.team_name
                        } team

                      </p>

                    </div>

                    <div className={`

                      px-4 py-2 rounded-full
                      border-[2px] border-[#1d2b53]
                      text-sm font-bold capitalize

                      ${
                        task.status ===
                        "completed"

                        ? "bg-[#d8f7df]"

                        : task.status ===
                          "in progress"

                        ? "bg-[#fff5b8]"

                        : "bg-[#ffe0f0]"
                      }

                    `}>

                      {
                        task.status
                      }

                    </div>

                  </div>

                )
              )

          }

        </div>

      </div>

      {/* DRAWER */}

      {

        selectedProject && (

          <div className="fixed top-0 right-0 h-screen w-[430px] bg-[#f7f3ea] border-l-[5px] border-[#1d2b53] shadow-[-6px_0px_0px_#1d2b53] p-7 overflow-y-auto z-50">

            <div className="flex items-center justify-between mb-7">

              <h2 className="text-4xl font-black text-[#1d2b53]">

                {
                  selectedProject.name
                }

              </h2>

              <button

                onClick={() =>
                  setSelectedProject(
                    null
                  )
                }

                className="bg-white border-[3px] border-[#1d2b53] rounded-2xl px-4 py-2 font-bold"

              >

                Close

              </button>

            </div>

            <div className="space-y-6">

              <div className="bg-white border-[3px] border-[#1d2b53] rounded-[24px] p-5">

                <p className="text-sm text-[#5c6b8a]">

                  Deadline

                </p>

                <h3 className="text-2xl font-black text-[#1d2b53] mt-2">

                  {
                    selectedProject.deadline
                  }

                </h3>

              </div>

              <div className="bg-white border-[3px] border-[#1d2b53] rounded-[24px] p-5">

                <p className="text-sm text-[#5c6b8a] mb-4">

                  Team Members

                </p>

                <div className="space-y-3">

                  {

                    users

                      .filter(
                        (user) =>
                          user.team_name ===
                          selectedProject.team
                      )

                      .map(
                        (user) => (

                          <div

                            key={user.id}

                            className="flex items-center justify-between bg-[#f7f3ea] border-[2px] border-[#1d2b53] rounded-2xl p-3"

                          >

                            <div>

                              <h4 className="font-bold text-[#1d2b53]">

                                {
                                  user.name
                                }

                              </h4>

                              <p className="text-sm text-[#5c6b8a] capitalize">

                                {
                                  user.role
                                }

                              </p>

                            </div>

                          </div>

                        )
                      )

                  }

                </div>

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default Projects;