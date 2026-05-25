import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../services/supabase";

function Dashboard() {

  const [users,
    setUsers] =
      useState([]);

  const [updates,
    setUpdates] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  // TEST DAY

  const today =
    "2026-06-01";

  // FETCH DATA

  useEffect(() => {

    fetchDashboardData();

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
        .select("*");

      if (usersData) {

        setUsers(usersData);

      }

      if (updatesData) {

        setUpdates(updatesData);

      }

      setLoading(false);

    };

  // FILTER TODAY UPDATES

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

        user.role !== "pm"

    ).length;

  // TOTAL SUBMITTED

  const totalSubmitted =
    todayUpdates.length;

  // PENDING MEMBERS

  const pendingMembers =
    users.filter((user) => {

      if (
        user.role === "pm"
      ) return false;

      return !todayUpdates.find(

        (update) =>

          update.user_email ===
          user.email

      );

    });

  // TEAM PROGRESS

  const teams = [

    "canteen",
    "printing",
    "campus"

  ];

  const teamProgress =
    teams.map((team) => {

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

    });

  // RECENT UPDATES

  const recentUpdates =
    [...updates]
      .reverse()
      .slice(0, 5);

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <h1 className="text-2xl font-semibold">

          Loading Dashboard...

        </h1>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#f5f7fb] p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold mb-3">

            Project Dashboard

          </h1>

          <p className="text-gray-500 text-lg">

            Team monitoring and sprint tracking

          </p>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-3 gap-6 mb-10">

          {/* TOTAL */}

          <div className="bg-white rounded-3xl p-8 shadow-sm">

            <p className="text-gray-500 mb-3">

              Submitted Today

            </p>

            <h2 className="text-5xl font-bold">

              {totalSubmitted}

              <span className="text-2xl text-gray-400">

                /{totalMembers}

              </span>

            </h2>

          </div>

          {/* PENDING */}

          <div className="bg-white rounded-3xl p-8 shadow-sm">

            <p className="text-gray-500 mb-3">

              Pending Updates

            </p>

            <h2 className="text-5xl font-bold text-red-500">

              {pendingMembers.length}

            </h2>

          </div>

          {/* ACTIVE */}

          <div className="bg-white rounded-3xl p-8 shadow-sm">

            <p className="text-gray-500 mb-3">

              Active Teams

            </p>

            <h2 className="text-5xl font-bold">

              3

            </h2>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-2 gap-6">

          {/* TEAM PROGRESS */}

          <div className="bg-white rounded-3xl p-8 shadow-sm">

            <h2 className="text-2xl font-bold mb-8">

              Team Progress

            </h2>

            <div className="space-y-6">

              {

                teamProgress.map(

                  (team) => (

                    <div
                      key={team.team}
                    >

                      <div className="flex items-center justify-between mb-2">

                        <p className="capitalize font-medium">

                          {team.team}

                        </p>

                        <p className="text-sm text-gray-500">

                          {
                            team.percentage
                          }%

                        </p>

                      </div>

                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                        <div

                          className="h-full bg-blue-500 rounded-full"

                          style={{
                            width: `${team.percentage}%`
                          }}

                        ></div>

                      </div>

                    </div>

                  )

                )

              }

            </div>

          </div>

          {/* PENDING MEMBERS */}

          <div className="bg-white rounded-3xl p-8 shadow-sm">

            <h2 className="text-2xl font-bold mb-8">

              Pending Members

            </h2>

            <div className="space-y-4">

              {

                pendingMembers.length === 0 && (

                  <p className="text-green-600">

                    All updates submitted

                  </p>

                )

              }

              {

                pendingMembers.map(

                  (member) => (

                    <div

                      key={member.id}

                      className="flex items-center justify-between border-b pb-4"

                    >

                      <div>

                        <h3 className="font-semibold">

                          {member.name}

                        </h3>

                        <p className="text-sm text-gray-500 capitalize">

                          {
                            member.team_name
                          }

                        </p>

                      </div>

                      <div className="w-3 h-3 rounded-full bg-red-500"></div>

                    </div>

                  )

                )

              }

            </div>

          </div>

        </div>

        {/* RECENT ACTIVITY */}

        <div className="bg-white rounded-3xl p-8 shadow-sm mt-6">

          <h2 className="text-2xl font-bold mb-8">

            Recent Updates

          </h2>

          <div className="space-y-5">

            {

              recentUpdates.map(

                (update) => (

                  <div

                    key={update.id}

                    className="border-b pb-5"

                  >

                    <div className="flex items-center justify-between mb-2">

                      <h3 className="font-semibold">

                        {
                          update.user_email
                        }

                      </h3>

                      <p className="text-sm text-gray-500">

                        {
                          update.update_date
                        }

                      </p>

                    </div>

                    <p className="text-gray-700">

                      {
                        update.task_summary
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

export default Dashboard;