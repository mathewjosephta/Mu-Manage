import {
  useEffect,
  useState
} from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip
} from "recharts";

import { supabase }
from "../services/supabase";

function Analytics() {

  const [tasks,
    setTasks] =
      useState([]);

  const [users,
    setUsers] =
      useState([]);

  useEffect(() => {

    fetchData();

    const channel =
      supabase

        .channel(
          "analytics-live"
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

  // FETCH

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

  // COUNTS

  const pending =
    tasks.filter(
      (task) =>
        task.status ===
        "pending"
    ).length;

  const progress =
    tasks.filter(
      (task) =>
        task.status ===
        "in progress"
    ).length;

  const completed =
    tasks.filter(
      (task) =>
        task.status ===
        "completed"
    ).length;

  // PIE

  const pieData = [

    {
      name: "Pending",
      value: pending
    },

    {
      name: "Progress",
      value: progress
    },

    {
      name: "Completed",
      value: completed
    }

  ];

  const COLORS = [

    "#d1d5db",
    "#facc15",
    "#22c55e"

  ];

  // TEAM DATA

  const teams = [

    "canteen",
    "printer",
    "campus connect"

  ];

  const teamData =
    teams.map(
      (team) => ({

        team,

        tasks:
          tasks.filter(
            (task) =>
              task.team_name ===
              team
          ).length

      })
    );

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <h1 className="text-4xl font-bold">

          Analytics

        </h1>

        <p className="text-gray-500 mt-2">

          Team productivity overview

        </p>

      </div>

      {/* STATS */}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl p-5 border">

          <p className="text-sm text-gray-400 mb-2">

            Total Tasks

          </p>

          <h2 className="text-4xl font-bold">

            {tasks.length}

          </h2>

        </div>

        <div className="bg-white rounded-2xl p-5 border">

          <p className="text-sm text-gray-400 mb-2">

            Completed

          </p>

          <h2 className="text-4xl font-bold text-green-500">

            {completed}

          </h2>

        </div>

        <div className="bg-white rounded-2xl p-5 border">

          <p className="text-sm text-gray-400 mb-2">

            In Progress

          </p>

          <h2 className="text-4xl font-bold text-yellow-500">

            {progress}

          </h2>

        </div>

        <div className="bg-white rounded-2xl p-5 border">

          <p className="text-sm text-gray-400 mb-2">

            Members

          </p>

          <h2 className="text-4xl font-bold text-blue-500">

            {users.length}

          </h2>

        </div>

      </div>

      {/* CHARTS */}

      <div className="grid lg:grid-cols-2 gap-5">

        {/* PIE */}

        <div className="bg-white rounded-2xl border p-5">

          <h2 className="text-xl font-semibold mb-4">

            Task Distribution

          </h2>

          <div className="h-[260px]">

            <ResponsiveContainer>

              <PieChart>

                <Pie

                  data={pieData}

                  dataKey="value"

                  innerRadius={55}

                  outerRadius={85}

                >

                  {

                    pieData.map(
                      (
                        entry,
                        index
                      ) => (

                        <Cell

                          key={index}

                          fill={
                            COLORS[
                              index
                            ]
                          }

                        />

                      )
                    )

                  }

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* BAR */}

        <div className="bg-white rounded-2xl border p-5">

          <h2 className="text-xl font-semibold mb-4">

            Team Tasks

          </h2>

          <div className="h-[260px]">

            <ResponsiveContainer>

              <BarChart
                data={teamData}
              >

                <XAxis
                  dataKey="team"
                />

                <Tooltip />

                <Bar
                  dataKey="tasks"
                  radius={[
                    8,
                    8,
                    0,
                    0
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* RECENT */}

      <div className="bg-white rounded-2xl border p-5">

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-xl font-semibold">

            Recent Tasks

          </h2>

          <span className="text-sm text-gray-400">

            Live

          </span>

        </div>

        <div className="space-y-3">

          {

            tasks

              .slice(0, 5)

              .map(
                (task) => (

                  <div

                    key={task.id}

                    className="flex items-center justify-between border rounded-xl px-4 py-3"

                  >

                    <div>

                      <h3 className="font-medium">

                        {
                          task.title
                        }

                      </h3>

                      <p className="text-sm text-gray-400 capitalize">

                        {
                          task.team_name
                        }

                      </p>

                    </div>

                    <div className={`

                      px-3 py-1 rounded-full text-sm capitalize

                      ${
                        task.status ===
                        "completed"

                        ? "bg-green-100 text-green-700"

                        : task.status ===
                          "in progress"

                        ? "bg-yellow-100 text-yellow-700"

                        : "bg-gray-200 text-gray-700"
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

    </div>

  );

}

export default Analytics;