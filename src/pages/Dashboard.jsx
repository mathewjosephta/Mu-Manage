import {
  useEffect,
  useState
} from "react";

import {

  CalendarDays,
  Briefcase,
  Users

} from "lucide-react";

import { supabase }
from "../services/supabase";

function Dashboard() {

  const [users,
    setUsers] =
      useState([]);

  const [updates,
    setUpdates] =
      useState([]);

  const [linkedinUpdates,
    setLinkedinUpdates] =
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

    fetchData();

  }, []);

  const fetchData =
    async () => {

      try {

        setLoading(true);

        // USERS

        const {

          data: userData

        } = await supabase

          .from("users")

          .select("*");

        // DAILY UPDATES

        const {

          data: updateData

        } = await supabase

          .from(
            "daily_updates"
          )

          .select("*");

        // LINKEDIN

        const {

          data: linkedinData

        } = await supabase

          .from(
            "linkedin_updates"
          )

          .select("*");

        setUsers(
          userData || []
        );

        setUpdates(
          updateData || []
        );

        setLinkedinUpdates(
          linkedinData || []
        );

      }

      catch (err) {

        console.log(err);

      }

      finally {

        setLoading(false);

      }

    };

  // TODAY SUBMISSIONS

  const todayUpdates =
    updates.filter(
      (item) =>
        item.update_date ===
        today
    );

  // PERCENTAGE

  const submissionPercentage =

    users.length > 0

      ? Math.round(

          (
            todayUpdates.length /
            users.length
          ) * 100

        )

      : 0;

  // LINKEDIN %

  const linkedinPercentage =

    users.length > 0

      ? Math.round(

          (
            linkedinUpdates.length /
            users.length
          ) * 100

        )

      : 0;

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-white">

        <h1 className="text-2xl font-semibold text-gray-600">

          Loading...

        </h1>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-white p-8">

      {/* HEADER */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold text-gray-900">

          Dashboard

        </h1>

        <p className="text-gray-500 mt-2">

          Team accountability overview

        </p>

      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-6">

        {/* DAILY */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <p className="text-gray-500 text-sm">

                Daily Updates

              </p>

              <h2 className="text-4xl font-bold text-gray-900 mt-2">

                {
                  todayUpdates.length
                }

              </h2>

            </div>

            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">

              <CalendarDays
                size={26}
                className="text-gray-700"
              />

            </div>

          </div>

          <p className="text-sm text-gray-500">

            {
              submissionPercentage
            }% submitted today

          </p>

        </div>

        {/* LINKEDIN */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <p className="text-gray-500 text-sm">

                Linkedin Updates

              </p>

              <h2 className="text-4xl font-bold text-gray-900 mt-2">

                {
                  linkedinPercentage
                }%

              </h2>

            </div>

            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">

              <Briefcase
                size={26}
                className="text-gray-700"
              />

            </div>

          </div>

          <p className="text-sm text-gray-500">

            Weekly submission rate

          </p>

        </div>

        {/* USERS */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <p className="text-gray-500 text-sm">

                Team Members

              </p>

              <h2 className="text-4xl font-bold text-gray-900 mt-2">

                {
                  users.length
                }

              </h2>

            </div>

            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">

              <Users
                size={26}
                className="text-gray-700"
              />

            </div>

          </div>

          <p className="text-sm text-gray-500">

            Active users

          </p>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;