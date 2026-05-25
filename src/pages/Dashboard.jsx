import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {

  Bell,
  Plus,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock3

} from "lucide-react";

import { supabase }
from "../services/supabase";

function Dashboard() {

  const navigate =
    useNavigate();

  const [users,
    setUsers] =
      useState([]);

  const [updates,
    setUpdates] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  // TODAY

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  // FETCH

  useEffect(() => {

    fetchDashboardData();

    const channel =
      supabase

        .channel(
          "dashboard-live"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table:
              "daily_updates"

          },

          () => {

            fetchDashboardData();

          }

        )

        .subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );

    };

  }, []);

  const fetchDashboardData =
    async () => {

      setLoading(true);

      // USERS

      const {

        data: usersData

      } = await supabase

        .from("users")

        .select("*");

      // DAILY UPDATES

      const {

        data: updatesData

      } = await supabase

        .from("daily_updates")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false
          }
        );

      if (usersData) {

        setUsers(usersData);

      }

      if (updatesData) {

        setUpdates(
          updatesData
        );

      }

      setLoading(false);

    };

  // TODAY UPDATES

  const todayUpdates =
    updates.filter(

      (item) =>

        item.update_date ===
        today

    );

  // TOTAL MEMBERS

  const totalMembers =
    users.filter(

      (user) =>

        user.role !==
        "pm"

    ).length;

  // TOTAL SUBMITTED

  const totalSubmitted =
    todayUpdates.length;

  // PENDING MEMBERS

  const pendingMembers =
    users.filter(
      (user) => {

        if (
          user.role ===
          "pm"
        ) return false;

        return !todayUpdates.find(

          (update) =>

            update.user_email ===
            user.email

        );

      }
    );

  // TEAMS

  const teams = [

    "canteen",
    "printing",
    "campus"

  ];

  // TEAM PROGRESS

  const teamProgress =
    teams.map(
      (team) => {

        const teamUsers =
          users.filter(

            (user) =>

              user.team_name ===
              team

          );

        const teamUpdates =
          todayUpdates.filter(

            (update) =>

              update.team_name ===
              team

          );

        const percentage =
          teamUsers.length > 0

            ? Math.round(

                (
                  teamUpdates.length /

                  teamUsers.length

                ) * 100

              )

            : 0;

        return {

          team,
          percentage

        };

      }
    );

  // RECENT

  const recentUpdates =
    updates.slice(0, 5);

  if (loading) {

    return (

      <div className="flex items-center justify-center h-[80vh]">

        <h1 className="text-3xl font-bold text-[#1d2b53]">

          Loading Dashboard...

        </h1>

      </div>

    );

  }

  return (

    <div className="space-y-6">

      {/* TOPBAR */}

      <div className="bg-white border-[3px] border-[#1d2b53] rounded-[28px] p-6 shadow-[5px_5px_0px_#1d2b53] flex items-center justify-between">

        <div>

          <h1 className="text-5xl font-black text-[#1d2b53]">

            Dashboard

          </h1>

          <p className="text-[#5c6b8a] mt-2 text-lg">

            Team monitoring & sprint tracking

          </p>

        </div>

        <div className="flex items-center gap-4">

          {/* NOTIFICATION */}

          <button

            onClick={() =>
              navigate("/team-chat")
            }

            className="relative w-14 h-14 rounded-2xl bg-[#fff5b8] border-[3px] border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53] flex items-center justify-center hover:translate-y-[2px] transition-all"

          >

            <Bell
              size={24}
              className="text-[#1d2b53]"
            />

            {

              pendingMembers.length > 0 && (

                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-pink-500 border-[2px] border-[#1d2b53] text-white text-xs flex items-center justify-center font-bold">

                  {
                    pendingMembers.length
                  }

                </div>

              )

            }

          </button>

          {/* NEW TASK */}

          <button

            onClick={() =>
              navigate("/tasks")
            }

            className="flex items-center gap-2 bg-[#3b82f6] text-white px-6 py-3 rounded-2xl border-[3px] border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53] font-bold hover:translate-y-[2px] transition-all"

          >

            <Plus size={20} />

            New Task

          </button>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-5">

        {/* CARD */}

        <div className="bg-[#dcecff] border-[3px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-6">

          <div className="flex items-center justify-between mb-6">

            <div className="w-14 h-14 rounded-2xl bg-[#3b82f6] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Activity
                size={24}
                className="text-white"
              />

            </div>

            <div className="px-4 py-1 rounded-full bg-white border-[2px] border-[#1d2b53] text-sm font-bold">

              Active

            </div>

          </div>

          <p className="text-[#4b5d7e] font-semibold mb-2">

            Submitted Today

          </p>

          <h1 className="text-5xl font-black text-[#1d2b53]">

            {totalSubmitted}

            <span className="text-2xl text-gray-400">

              /{totalMembers}

            </span>

          </h1>

        </div>

        {/* CARD */}

        <div className="bg-[#d8f7df] border-[3px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-6">

          <div className="flex items-center justify-between mb-6">

            <div className="w-14 h-14 rounded-2xl bg-[#22c55e] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <CheckCircle2
                size={24}
                className="text-white"
              />

            </div>

            <div className="px-4 py-1 rounded-full bg-white border-[2px] border-[#1d2b53] text-sm font-bold">

              Updated

            </div>

          </div>

          <p className="text-[#4b5d7e] font-semibold mb-2">

            Teams Active

          </p>

          <h1 className="text-5xl font-black text-[#1d2b53]">

            3

          </h1>

        </div>

        {/* CARD */}

        <div className="bg-[#ffe0f0] border-[3px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-6">

          <div className="flex items-center justify-between mb-6">

            <div className="w-14 h-14 rounded-2xl bg-[#ec4899] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <AlertTriangle
                size={24}
                className="text-white"
              />

            </div>

            <div className="px-4 py-1 rounded-full bg-white border-[2px] border-[#1d2b53] text-sm font-bold">

              Attention

            </div>

          </div>

          <p className="text-[#4b5d7e] font-semibold mb-2">

            Pending Members

          </p>

          <h1 className="text-5xl font-black text-[#1d2b53]">

            {
              pendingMembers.length
            }

          </h1>

        </div>

        {/* CARD */}

        <div className="bg-[#fff5b8] border-[3px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-6">

          <div className="flex items-center justify-between mb-6">

            <div className="w-14 h-14 rounded-2xl bg-[#facc15] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Clock3
                size={24}
                className="text-[#1d2b53]"
              />

            </div>

            <div className="px-4 py-1 rounded-full bg-white border-[2px] border-[#1d2b53] text-sm font-bold">

              Live

            </div>

          </div>

          <p className="text-[#4b5d7e] font-semibold mb-2">

            Recent Updates

          </p>

          <h1 className="text-5xl font-black text-[#1d2b53]">

            {
              recentUpdates.length
            }

          </h1>

        </div>

      </div>

      {/* MAIN */}

      <div className="grid grid-cols-3 gap-5">

        {/* TEAM PROGRESS */}

        <div className="col-span-2 bg-white border-[3px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-6">

          <h2 className="text-3xl font-black text-[#1d2b53] mb-8">

            Team Progress

          </h2>

          <div className="space-y-7">

            {

              teamProgress.map(
                (team) => (

                  <div
                    key={team.team}
                  >

                    <div className="flex items-center justify-between mb-3">

                      <p className="capitalize text-lg font-bold text-[#1d2b53]">

                        {team.team}

                      </p>

                      <p className="font-bold text-[#4b5d7e]">

                        {
                          team.percentage
                        }%

                      </p>

                    </div>

                    <div className="w-full h-5 rounded-full bg-[#e5e7eb] border-[2px] border-[#1d2b53] overflow-hidden">

                      <div

                        className="h-full bg-[#3b82f6]"

                        style={{
                          width: `${team.percentage}%`
                        }}

                      />

                    </div>

                  </div>

                )
              )

            }

          </div>

        </div>

        {/* PENDING */}

        <div className="bg-[#ffe0f0] border-[3px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-6">

          <h2 className="text-3xl font-black text-[#d61f69] mb-7">

            Pending Members

          </h2>

          <div className="space-y-4">

            {

              pendingMembers.length === 0 && (

                <div className="bg-white border-[3px] border-[#1d2b53] rounded-2xl p-4 font-semibold text-green-600">

                  All updates submitted

                </div>

              )

            }

            {

              pendingMembers.map(
                (member) => (

                  <button

                    key={member.id}

                    onClick={() =>
                      navigate("/calendar")
                    }

                    className="w-full bg-white border-[3px] border-[#1d2b53] rounded-2xl p-4 flex items-center justify-between hover:bg-[#fff5f8] transition-all text-left"

                  >

                    <div>

                      <h3 className="font-bold text-[#1d2b53]">

                        {
                          member.name
                        }

                      </h3>

                      <p className="text-sm text-[#5c6b8a] capitalize">

                        {
                          member.team_name
                        }

                      </p>

                    </div>

                    <div className="w-4 h-4 rounded-full bg-red-500 border-[2px] border-[#1d2b53]" />

                  </button>

                )
              )

            }

          </div>

        </div>

      </div>

      {/* RECENT */}

      <div className="bg-white border-[3px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-6">

        <h2 className="text-3xl font-black text-[#1d2b53] mb-8">

          Recent Updates

        </h2>

        <div className="space-y-4">

          {

            recentUpdates.map(
              (update) => (

                <button

                  key={update.id}

                  onClick={() =>
                    navigate("/calendar")
                  }

                  className="w-full text-left border-[3px] border-[#1d2b53] rounded-2xl p-5 bg-[#f8fafc] hover:bg-[#eef4ff] transition-all"

                >

                  <div className="flex items-center justify-between mb-2">

                    <h3 className="font-bold text-lg text-[#1d2b53]">

                      {
                        update.user_email
                      }

                    </h3>

                    <p className="text-sm text-[#5c6b8a]">

                      {
                        update.update_date
                      }

                    </p>

                  </div>

                  <p className="text-[#4b5d7e] leading-7">

                    {
                      update.task_summary
                    }

                  </p>

                </button>

              )
            )

          }

        </div>

      </div>

    </div>

  );

}

export default Dashboard;