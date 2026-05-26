import {
  useEffect,
  useState
} from "react";

import {

  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Activity,
  Briefcase,
  Users

} from "lucide-react";

import { supabase }
from "../services/supabase";

function Dashboard() {

  const [projects,
    setProjects] =
      useState([]);

  const [tasks,
    setTasks] =
      useState([]);

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

  // FETCH

  useEffect(() => {

    fetchData();

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

  // FETCH DATA

  const fetchData =
    async () => {

      try {

        setLoading(true);

        // PROJECTS

        const {

          data: projectData

        } = await supabase

          .from("projects")

          .select("*");

        // TASKS

        const {

          data: taskData

        } = await supabase

          .from("tasks")

          .select("*");

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

          .from("daily_updates")

          .select("*");

        // LINKEDIN

        const {

          data: linkedinData

        } = await supabase

          .from(
            "linkedin_updates"
          )

          .select("*");

        // SET STATE

        setProjects(
          projectData || []
        );

        setTasks(
          taskData || []
        );

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

  // COUNTS

  const activeTasks =
    tasks.filter(
      (task) =>
        !task.is_deleted
    );

  const completedTasks =
    activeTasks.filter(
      (task) =>
        task.status ===
        "done"
    );

  const reviewTasks =
    activeTasks.filter(
      (task) =>
        task.status ===
        "under review"
    );

  const overdueTasks =
    activeTasks.filter(
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
    );

  // TODAY UPDATES

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
          date === today
        );

      }
    );

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

  // LOADING

  if (loading) {

    return (

      <div className="h-screen bg-[#f7f3ea] flex items-center justify-center">

        <h1 className="text-5xl font-black text-[#1d2b53]">

          Loading Dashboard...

        </h1>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#f7f3ea] p-8">

      {/* HEADER */}

      <div className="mb-10">

        <h1 className="text-6xl font-black text-[#1d2b53]">

          Project Dashboard

        </h1>

        <p className="text-[#5c6b8a] mt-3 text-xl">

          Sprint analytics & project management

        </p>

      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        {/* PROJECTS */}

        <div className="bg-[#dcecff] border-[4px] border-[#1d2b53] rounded-[32px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-6">

            <div className="w-16 h-16 rounded-[24px] bg-white border-[3px] border-[#1d2b53] flex items-center justify-center">

              <FolderKanban
                size={30}
                className="text-[#1d2b53]"
              />

            </div>

          </div>

          <p className="text-[#5c6b8a] font-bold">

            Active Projects

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-3">

            {
              projects.length
            }

          </h2>

        </div>

        {/* COMPLETED */}

        <div className="bg-[#d8f7df] border-[4px] border-[#1d2b53] rounded-[32px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="w-16 h-16 rounded-[24px] bg-white border-[3px] border-[#1d2b53] flex items-center justify-center mb-6">

            <CheckCircle2
              size={30}
              className="text-[#22c55e]"
            />

          </div>

          <p className="text-[#5c6b8a] font-bold">

            Completed Tasks

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-3">

            {
              completedTasks.length
            }

          </h2>

        </div>

        {/* REVIEW */}

        <div className="bg-[#fff5b8] border-[4px] border-[#1d2b53] rounded-[32px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="w-16 h-16 rounded-[24px] bg-white border-[3px] border-[#1d2b53] flex items-center justify-center mb-6">

            <Clock3
              size={30}
              className="text-[#f59e0b]"
            />

          </div>

          <p className="text-[#5c6b8a] font-bold">

            Under Review

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-3">

            {
              reviewTasks.length
            }

          </h2>

        </div>

        {/* OVERDUE */}

        <div className="bg-[#ffe0f0] border-[4px] border-[#1d2b53] rounded-[32px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="w-16 h-16 rounded-[24px] bg-white border-[3px] border-[#1d2b53] flex items-center justify-center mb-6">

            <AlertTriangle
              size={30}
              className="text-red-500"
            />

          </div>

          <p className="text-[#5c6b8a] font-bold">

            Overdue Tasks

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-3">

            {
              overdueTasks.length
            }

          </h2>

        </div>

      </div>

      {/* SECOND ROW */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">

        {/* DAILY */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="flex items-center gap-4 mb-6">

            <div className="w-16 h-16 rounded-[24px] bg-[#dcecff] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Activity
                size={28}
                className="text-[#1d2b53]"
              />

            </div>

            <div>

              <h2 className="text-3xl font-black text-[#1d2b53]">

                Daily Updates

              </h2>

              <p className="text-[#5c6b8a]">

                Submitted today

              </p>

            </div>

          </div>

          <h1 className="text-7xl font-black text-[#1d2b53]">

            {
              todayUpdates.length
            }

          </h1>

        </div>

        {/* LINKEDIN */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="flex items-center gap-4 mb-6">

            <div className="w-16 h-16 rounded-[24px] bg-[#dcecff] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Briefcase
                size={28}
                className="text-[#2563eb]"
              />

            </div>

            <div>

              <h2 className="text-3xl font-black text-[#1d2b53]">

                Linkedin Progress

              </h2>

              <p className="text-[#5c6b8a]">

                Weekly submissions

              </p>

            </div>

          </div>

          <h1 className="text-7xl font-black text-[#1d2b53]">

            {
              linkedinPercentage
            }%

          </h1>

        </div>

        {/* USERS */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="flex items-center gap-4 mb-6">

            <div className="w-16 h-16 rounded-[24px] bg-[#dcecff] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Users
                size={28}
                className="text-[#1d2b53]"
              />

            </div>

            <div>

              <h2 className="text-3xl font-black text-[#1d2b53]">

                Team Members

              </h2>

            </div>

          </div>

          <h1 className="text-7xl font-black text-[#1d2b53]">

            {
              users.length
            }

          </h1>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;