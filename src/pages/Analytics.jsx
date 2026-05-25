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
  Tooltip,
  AreaChart,
  Area

} from "recharts";

import {

  Activity,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Trophy,
  Users

} from "lucide-react";

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

    "#ffb3c7",
    "#ffe58f",
    "#86efac"

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

  // WEEK DATA

  const weeklyData = [

    {
      day: "Mon",
      tasks: 3
    },

    {
      day: "Tue",
      tasks: 5
    },

    {
      day: "Wed",
      tasks: 8
    },

    {
      day: "Thu",
      tasks: 6
    },

    {
      day: "Fri",
      tasks: 11
    },

    {
      day: "Sat",
      tasks: 13
    },

    {
      day: "Sun",
      tasks: 15
    }

  ];

  return (

    <div className="bg-[#f7f3ea] p-8 space-y-7 min-h-screen">

      {/* HEADER */}

      <div className="bg-[#fff7d6] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[6px_6px_0px_#1d2b53]">

        <h1 className="text-5xl font-black text-[#1d2b53]">

          Analytics

        </h1>

        <p className="text-[#5c6b8a] mt-2 text-lg">

          Team productivity insights & sprint analytics

        </p>

      </div>

      {/* STATS */}

      <div className="grid lg:grid-cols-4 gap-5">

        {/* CARD */}

        <div className="bg-[#dcecff] border-[4px] border-[#1d2b53] rounded-[28px] p-6 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-5">

            <div className="w-14 h-14 rounded-2xl bg-[#3b82f6] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Activity
                size={24}
                className="text-white"
              />

            </div>

            <div className="bg-white border-[2px] border-[#1d2b53] rounded-full px-4 py-1 text-sm font-bold">

              Live

            </div>

          </div>

          <p className="text-[#5c6b8a] font-semibold">

            Total Tasks

          </p>

          <h1 className="text-5xl font-black text-[#1d2b53] mt-2">

            {tasks.length}

          </h1>

        </div>

        {/* CARD */}

        <div className="bg-[#d8f7df] border-[4px] border-[#1d2b53] rounded-[28px] p-6 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-5">

            <div className="w-14 h-14 rounded-2xl bg-[#22c55e] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <CheckCircle2
                size={24}
                className="text-white"
              />

            </div>

            <div className="bg-white border-[2px] border-[#1d2b53] rounded-full px-4 py-1 text-sm font-bold">

              Done

            </div>

          </div>

          <p className="text-[#5c6b8a] font-semibold">

            Completed

          </p>

          <h1 className="text-5xl font-black text-[#1d2b53] mt-2">

            {completed}

          </h1>

        </div>

        {/* CARD */}

        <div className="bg-[#fff5b8] border-[4px] border-[#1d2b53] rounded-[28px] p-6 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-5">

            <div className="w-14 h-14 rounded-2xl bg-[#facc15] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Clock3
                size={24}
                className="text-[#1d2b53]"
              />

            </div>

            <div className="bg-white border-[2px] border-[#1d2b53] rounded-full px-4 py-1 text-sm font-bold">

              Working

            </div>

          </div>

          <p className="text-[#5c6b8a] font-semibold">

            In Progress

          </p>

          <h1 className="text-5xl font-black text-[#1d2b53] mt-2">

            {progress}

          </h1>

        </div>

        {/* CARD */}

        <div className="bg-[#ffe0f0] border-[4px] border-[#1d2b53] rounded-[28px] p-6 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-5">

            <div className="w-14 h-14 rounded-2xl bg-[#ec4899] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Users
                size={24}
                className="text-white"
              />

            </div>

            <div className="bg-white border-[2px] border-[#1d2b53] rounded-full px-4 py-1 text-sm font-bold">

              Team

            </div>

          </div>

          <p className="text-[#5c6b8a] font-semibold">

            Members

          </p>

          <h1 className="text-5xl font-black text-[#1d2b53] mt-2">

            {users.length}

          </h1>

        </div>

      </div>

      {/* CHARTS */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* AREA */}

        <div className="lg:col-span-2 bg-white border-[4px] border-[#1d2b53] rounded-[30px] p-6 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center gap-3 mb-7">

            <Activity
              size={30}
              className="text-[#3b82f6]"
            />

            <h2 className="text-3xl font-black text-[#1d2b53]">

              Weekly Sprint Flow

            </h2>

          </div>

          <div className="h-[320px]">

            <ResponsiveContainer>

              <AreaChart
                data={weeklyData}
              >

                <XAxis
                  dataKey="day"
                />

                <Tooltip />

                <Area

                  type="monotone"

                  dataKey="tasks"

                  stroke="#3b82f6"

                  fill="#bfdbfe"

                  strokeWidth={5}

                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* PIE */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[30px] p-6 shadow-[5px_5px_0px_#1d2b53]">

          <h2 className="text-3xl font-black text-[#1d2b53] mb-7">

            Task Split

          </h2>

          <div className="h-[320px]">

            <ResponsiveContainer>

              <PieChart>

                <Pie

                  data={pieData}

                  dataKey="value"

                  innerRadius={65}

                  outerRadius={100}

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

      </div>

      {/* TEAM PERFORMANCE */}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* BAR */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[30px] p-6 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center gap-3 mb-7">

            <Trophy
              size={28}
              className="text-[#ec4899]"
            />

            <h2 className="text-3xl font-black text-[#1d2b53]">

              Team Performance

            </h2>

          </div>

          <div className="h-[300px]">

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

                  fill="#60a5fa"

                  radius={[
                    12,
                    12,
                    0,
                    0
                  ]}

                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* RECENT */}

        <div className="bg-[#fff7d6] border-[4px] border-[#1d2b53] rounded-[30px] p-6 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-7">

            <h2 className="text-3xl font-black text-[#1d2b53]">

              Recent Tasks

            </h2>

            <div className="bg-white border-[2px] border-[#1d2b53] rounded-full px-4 py-1 text-sm font-bold">

              Live

            </div>

          </div>

          <div className="space-y-4">

            {

              tasks

                .slice(0, 5)

                .map(
                  (task) => (

                    <div

                      key={task.id}

                      className="bg-white border-[3px] border-[#1d2b53] rounded-[22px] p-5 shadow-[3px_3px_0px_#1d2b53]"

                    >

                      <div className="flex items-center justify-between mb-3">

                        <h3 className="font-black text-[#1d2b53] text-lg">

                          {
                            task.title
                          }

                        </h3>

                        <div className={`

                          px-4 py-2 rounded-full text-xs font-bold border-[2px] border-[#1d2b53]

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

                      <p className="capitalize text-[#5c6b8a]">

                        {
                          task.team_name
                        }

                      </p>

                    </div>

                  )
                )

            }

          </div>

        </div>

      </div>

    </div>

  );

}

export default Analytics;