import {
  useEffect,
  useState
} from "react";

import {

  Plus,
  Search,
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  X

} from "lucide-react";

import { supabase }
from "../services/supabase";

import TaskCard
from "../components/TaskCard";

import ReviewModal
from "../components/ReviewModal";

function Tasks() {

  const [tasks,
    setTasks] =
      useState([]);

  const [users,
    setUsers] =
      useState([]);

  const [projects,
    setProjects] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [search,
    setSearch] =
      useState("");

  const [selectedTask,
    setSelectedTask] =
      useState(null);

  const [reviewTask,
    setReviewTask] =
      useState(null);

  const [showCreate,
    setShowCreate] =
      useState(false);

  // USER

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  // FORM

  const [title,
    setTitle] =
      useState("");

  const [description,
    setDescription] =
      useState("");

  const [priority,
    setPriority] =
      useState("medium");

  const [assignedTo,
    setAssignedTo] =
      useState("");

  const [dueDate,
    setDueDate] =
      useState("");

  const [projectId,
    setProjectId] =
      useState("");

  // FETCH

  useEffect(() => {

    fetchData();

    const channel =
      supabase

        .channel(
          "tasks-realtime"
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

        data: taskData

      } = await supabase

        .from("tasks")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false
          }
        );

      const {

        data: userData

      } = await supabase

        .from("users")

        .select("*");

      const {

        data: projectData

      } = await supabase

        .from("projects")

        .select("*");

      setTasks(
        taskData || []
      );

      setUsers(
        userData || []
      );

      setProjects(
        projectData || []
      );

      setLoading(false);

    };

  // CREATE TASK

  const createTask =
    async () => {

      if (
        !title ||
        !dueDate
      ) return;

      const assignedUser =
        users.find(
          (user) =>
            user.email ===
            assignedTo
        );

      await supabase

        .from("tasks")

        .insert([{

          title,

          description,

          priority,

          assigned_to:
            assignedTo,

          assigned_name:
            assignedUser?.name ||
            null,

          due_date:
            dueDate,

          status: "todo",

          project_id:
            projectId,

          team_name:
            currentUser.team_name,

          created_by:
            currentUser.email,

          is_deleted:
            false

        }]);

      // NOTIFICATION

      if (assignedTo) {

        await supabase

          .from(
            "notifications"
          )

          .insert([{

            user_email:
              assignedTo,

            title:
              "New Task Assigned",

            message:
              `You were assigned "${title}"`,

            type:
              "task_assigned",

            is_read:
              false

          }]);

      }

      resetForm();

      fetchData();

    };

  // RESET

  const resetForm =
    () => {

      setTitle("");

      setDescription("");

      setPriority(
        "medium"
      );

      setAssignedTo("");

      setDueDate("");

      setProjectId("");

      setShowCreate(false);

    };

  // UPDATE STATUS

  const updateStatus =
    async (
      id,
      status
    ) => {

      await supabase

        .from("tasks")

        .update({

          status

        })

        .eq("id", id);

      fetchData();

    };

  // APPROVE

  const approveTask =
    async (id) => {

      await supabase

        .from("tasks")

        .update({

          status: "done"

        })

        .eq("id", id);

      setReviewTask(null);

      fetchData();

    };

  // REJECT

  const rejectTask =
    async (id) => {

      await supabase

        .from("tasks")

        .update({

          status:
            "in progress"

        })

        .eq("id", id);

      setReviewTask(null);

      fetchData();

    };

  // DELETE

  const deleteTask =
    async (id) => {

      await supabase

        .from("tasks")

        .update({

          is_deleted:
            true,

          deleted_by:
            currentUser.email,

          deleted_at:
            new Date()

        })

        .eq("id", id);

      fetchData();

    };

  // FILTER

  const visibleTasks =

    currentUser.role ===
    "pm"

      ? tasks

      : tasks.filter(
          (task) =>
            !task.is_deleted
        );

  const filteredTasks =
    visibleTasks.filter(
      (task) =>

        task.title
          ?.toLowerCase()

          .includes(
            search.toLowerCase()
          )
    );

  // GROUPS

  const todoTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "todo"
    );

  const progressTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "in progress"
    );

  const reviewTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "under review"
    );

  const doneTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "done"
    );

  // LOADING

  if (loading) {

    return (

      <div className="h-screen bg-[#f7f3ea] flex items-center justify-center">

        <h1 className="text-5xl font-black text-[#1d2b53]">

          Loading Tasks...

        </h1>

      </div>

    );

  }

  // COLUMN

  const renderColumn = (
    title,
    tasksList,
    color,
    icon
  ) => (

    <div className={`

      rounded-[34px]
      border-[4px]
      border-[#1d2b53]
      p-6
      min-h-[700px]
      shadow-[6px_6px_0px_#1d2b53]

      ${color}

    `}>

      {/* HEADER */}

      <div className="flex items-center justify-between mb-7">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center">

            {icon}

          </div>

          <div>

            <h2 className="text-3xl font-black text-[#1d2b53]">

              {title}

            </h2>

            <p className="text-[#5c6b8a]">

              {

                tasksList.length

              } tasks

            </p>

          </div>

        </div>

      </div>

      {/* TASKS */}

      <div className="space-y-5">

        {

          tasksList.length === 0 && (

            <div className="bg-white border-[4px] border-dashed border-[#1d2b53] rounded-[28px] p-10 text-center">

              <ClipboardList
                size={40}
                className="mx-auto text-[#5c6b8a]"
              />

              <p className="mt-5 text-[#5c6b8a] font-bold">

                No tasks

              </p>

            </div>

          )

        }

        {

          tasksList.map(
            (task) => (

              <TaskCard

                key={task.id}

                task={task}

                currentUser={
                  currentUser
                }

                updateStatus={
                  updateStatus
                }

                deleteTask={
                  deleteTask
                }

                openReviewModal={
                  setReviewTask
                }

                setSelectedTask={
                  setSelectedTask
                }

              />

            )
          )

        }

      </div>

    </div>

  );

  return (

    <div className="min-h-screen bg-[#f7f3ea] p-8">

      {/* HEADER */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">

        <div>

          <h1 className="text-6xl font-black text-[#1d2b53]">

            Sprint Board

          </h1>

          <p className="text-[#5c6b8a] mt-3 text-xl">

            Manage sprint workflow & reviews

          </p>

        </div>

        {/* RIGHT */}

        <div className="flex flex-col md:flex-row gap-4">

          {/* SEARCH */}

          <div className="flex items-center gap-3 bg-white border-[4px] border-[#1d2b53] rounded-[24px] px-5 py-4 shadow-[4px_4px_0px_#1d2b53]">

            <Search
              size={22}
              className="text-[#5c6b8a]"
            />

            <input

              type="text"

              placeholder="Search task..."

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

              className="bg-transparent outline-none text-[#1d2b53] font-semibold w-[220px]"

            />

          </div>

          {/* CREATE */}

          {

            (
              currentUser.role ===
              "lead" ||

              currentUser.role ===
              "pm"
            ) && (

              <button

                onClick={() =>
                  setShowCreate(
                    true
                  )
                }

                className="flex items-center gap-3 bg-[#3b82f6] text-white px-7 py-4 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[5px_5px_0px_#1d2b53] font-black text-lg hover:translate-y-[2px] transition-all"

              >

                <Plus size={24} />

                Create Task

              </button>

            )

          }

        </div>

      </div>

      {/* BOARD */}

      <div className="grid xl:grid-cols-4 gap-7 items-start">

        {

          renderColumn(

            "Todo",

            todoTasks,

            "bg-[#dcecff]",

            <ClipboardList
              size={26}
              className="text-[#1d2b53]"
            />

          )

        }

        {

          renderColumn(

            "In Progress",

            progressTasks,

            "bg-[#fff5b8]",

            <Clock3
              size={26}
              className="text-[#1d2b53]"
            />

          )

        }

        {

          renderColumn(

            "Under Review",

            reviewTasks,

            "bg-[#ffe0f0]",

            <AlertTriangle
              size={26}
              className="text-[#1d2b53]"
            />

          )

        }

        {

          renderColumn(

            "Done",

            doneTasks,

            "bg-[#d8f7df]",

            <CheckCircle2
              size={26}
              className="text-[#1d2b53]"
            />

          )

        }

      </div>

      {/* CREATE MODAL */}

      {

        showCreate && (

          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">

            <div className="w-full max-w-2xl bg-[#f7f3ea] border-[5px] border-[#1d2b53] rounded-[38px] overflow-hidden shadow-[10px_10px_0px_#1d2b53]">

              {/* HEADER */}

              <div className="bg-[#fff7d6] border-b-[5px] border-[#1d2b53] px-8 py-7 flex items-center justify-between">

                <div>

                  <h1 className="text-4xl font-black text-[#1d2b53]">

                    Create Task

                  </h1>

                  <p className="text-[#5c6b8a] mt-2">

                    Add sprint task

                  </p>

                </div>

                <button

                  onClick={
                    resetForm
                  }

                  className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center"

                >

                  <X
                    size={24}
                    className="text-[#1d2b53]"
                  />

                </button>

              </div>

              {/* FORM */}

              <div className="p-8 space-y-6">

                <input

                  type="text"

                  placeholder="Task title"

                  value={title}

                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }

                  className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none"

                />

                <textarea

                  rows={4}

                  placeholder="Description"

                  value={
                    description
                  }

                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }

                  className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none resize-none"

                />

                {/* PRIORITY */}

                <select

                  value={priority}

                  onChange={(e) =>
                    setPriority(
                      e.target.value
                    )
                  }

                  className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none"

                >

                  <option value="low">

                    Low

                  </option>

                  <option value="medium">

                    Medium

                  </option>

                  <option value="high">

                    High

                  </option>

                </select>

                {/* ASSIGN */}

                <select

                  value={assignedTo}

                  onChange={(e) =>
                    setAssignedTo(
                      e.target.value
                    )
                  }

                  className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none"

                >

                  <option value="">

                    Anyone Can Do

                  </option>

                  {

                    users.map(
                      (user) => (

                        <option

                          key={
                            user.id
                          }

                          value={
                            user.email
                          }

                        >

                          {
                            user.name
                          }

                        </option>

                      )
                    )

                  }

                </select>

                {/* PROJECT */}

                <select

                  value={projectId}

                  onChange={(e) =>
                    setProjectId(
                      e.target.value
                    )
                  }

                  className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none"

                >

                  <option value="">

                    Select Project

                  </option>

                  {

                    projects.map(
                      (project) => (

                        <option

                          key={
                            project.id
                          }

                          value={
                            project.id
                          }

                        >

                          {
                            project.name
                          }

                        </option>

                      )
                    )

                  }

                </select>

                {/* DATE */}

                <input

                  type="date"

                  value={dueDate}

                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }

                  className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none"

                />

                {/* BUTTON */}

                <button

                  onClick={
                    createTask
                  }

                  className="w-full bg-[#3b82f6] text-white py-5 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[5px_5px_0px_#1d2b53] font-black text-2xl"

                >

                  Create Task

                </button>

              </div>

            </div>

          </div>

        )

      }

      {/* REVIEW */}

      <ReviewModal

        selectedTask={
          reviewTask
        }

        closeModal={() =>
          setReviewTask(null)
        }

        approveTask={
          approveTask
        }

        rejectTask={
          rejectTask
        }

      />

    </div>

  );

}

export default Tasks;