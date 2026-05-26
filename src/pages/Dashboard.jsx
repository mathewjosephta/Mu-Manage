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
  MessageCircle,
  Users

} from "lucide-react";

import { supabase }
from "../services/supabase";

import TeamProgress
from "../components/TeamProgress";

import ActivityFeed
from "../components/ActivityFeed";

import NotificationBell
from "../components/NotificationBell";

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

  const [LinkedinUpdates,
    setLinkedinUpdates] =
      useState([]);

  const [activities,
    setActivities] =
      useState([]);

  const [notifications,
    setNotifications] =
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

  const fetchData =
    async () => {

      setLoading(true);

      const {

        data: projectData

      } = await supabase

        .from("projects")

        .select("*");

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

      const {

        data: updateData

      } = await supabase

        .from("daily_updates")

        .select("*");

      const {

        data: LinkedinData

      } = await supabase

        .from(
          "Linkedin_updates"
        )

        .select("*");

      const {

        data: activityData

      } = await supabase

        .from("activities")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false
          }
        )

        .limit(15);

      const {

        data: notificationData

      } = await supabase

        .from("notifications")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false
          }
        );

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
        LinkedinData || []
      );

      setActivities(
        activityData || []
      );

      setNotifications(
        notificationData || []
      );

      setLoading(false);

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

  // TODAY

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

  // Linkedin %

  const LinkedinPercentage =

    users.length > 0

      ? Math.round(

          (
            LinkedinUpdates.length /
            users.length
          ) * 100

        )

      : 0;

  // NOTIFICATIONS

  const markAsRead =
    async (id) => {

      await supabase

        .from(
          "notifications"
        )

        .update({

          is_read: true

        })

        .eq("id", id);

      fetchData();

    };

  const markAllAsRead =
    async () => {

      await supabase

        .from(
          "notifications"
        )

        .update({

          is_read: true

        })

        .eq(
          "is_read",
          false
        );

      fetchData();

    };

  const deleteNotification =
    async (id) => {

      await supabase

        .from(
          "notifications"
        )

        .delete()

        .eq("id", id);

      fetchData();

    };

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

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">

        <div>

          <h1 className="text-6xl font-black text-[#1d2b53]">

            Project Dashboard

          </h1>

          <p className="text-[#5c6b8a] mt-3 text-xl">

            Realtime sprint analytics & workflow management

          </p>

        </div>

        <div className="flex items-center gap-5">

          {/* LIVE */}

          <div className="bg-[#d8f7df] border-[4px] border-[#1d2b53] rounded-full px-7 py-4 shadow-[5px_5px_0px_#1d2b53] flex items-center gap-4">

            <div className="w-4 h-4 rounded-full bg-[#22c55e] animate-pulse"></div>

            <span className="font-black text-[#1d2b53]">

              LIVE SYSTEM

            </span>

          </div>

          {/* NOTIFICATIONS */}

          <NotificationBell

            notifications={
              notifications
            }

            markAsRead={
              markAsRead
            }

            markAllAsRead={
              markAllAsRead
            }

            deleteNotification={
              deleteNotification
            }

          />

        </div>

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

            <div className="bg-white border-[3px] border-[#1d2b53] rounded-full px-4 py-2 text-sm font-black">

              Projects

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

        {/* DONE */}

        <div className="bg-[#d8f7df] border-[4px] border-[#1d2b53] rounded-[32px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-6">

            <div className="w-16 h-16 rounded-[24px] bg-white border-[3px] border-[#1d2b53] flex items-center justify-center">

              <CheckCircle2
                size={30}
                className="text-[#22c55e]"
              />

            </div>

            <div className="bg-white border-[3px] border-[#1d2b53] rounded-full px-4 py-2 text-sm font-black">

              Done

            </div>

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

          <div className="flex items-center justify-between mb-6">

            <div className="w-16 h-16 rounded-[24px] bg-white border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Clock3
                size={30}
                className="text-[#f59e0b]"
              />

            </div>

            <div className="bg-white border-[3px] border-[#1d2b53] rounded-full px-4 py-2 text-sm font-black">

              Review

            </div>

          </div>

          <p className="text-[#5c6b8a] font-bold">

            Pending Reviews

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-3">

            {
              reviewTasks.length
            }

          </h2>

        </div>

        {/* RISKS */}

        <div className="bg-[#ffe0f0] border-[4px] border-[#1d2b53] rounded-[32px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-6">

            <div className="w-16 h-16 rounded-[24px] bg-white border-[3px] border-[#1d2b53] flex items-center justify-center">

              <AlertTriangle
                size={30}
                className="text-red-500"
              />

            </div>

            <div className="bg-white border-[3px] border-[#1d2b53] rounded-full px-4 py-2 text-sm font-black">

              Risk

            </div>

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

      <div className="grid xl:grid-cols-3 gap-7 mb-8">

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

                Today submissions

              </p>

            </div>

          </div>

          <h1 className="text-7xl font-black text-[#1d2b53]">

            {
              todayUpdates.length
            }

          </h1>

        </div>

        {/* Linkedin */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] p-7 shadow-[6px_6px_0px_#1d2b53]">

          <div className="flex items-center gap-4 mb-6">

            <div className="w-16 h-16 rounded-[24px] bg-[#dcecff] border-[3px] border-[#1d2b53] flex items-center justify-center">

              <Linkedin
                size={28}
                className="text-[#2563eb]"
              />

            </div>

            <div>

              <h2 className="text-3xl font-black text-[#1d2b53]">

                Weekly Linkedin

              </h2>

              <p className="text-[#5c6b8a]">

                Submission progress

              </p>

            </div>

          </div>

          <h1 className="text-7xl font-black text-[#1d2b53]">

            {
              LinkedinPercentage
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