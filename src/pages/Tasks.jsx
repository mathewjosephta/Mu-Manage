import {
  useEffect,
  useState
} from "react";

import {
  Plus,
  ClipboardList,
  Clock3,
  CheckCircle2
} from "lucide-react";

import { supabase }
from "../services/supabase";

import TaskCard
from "../components/TaskCard";

function Tasks() {

  const [tasks,
    setTasks] =
      useState([]);

  const [users,
    setUsers] =
      useState([]);

  const [currentUser,
    setCurrentUser] =
      useState(null);

  const [selectedTeam,
    setSelectedTeam] =
      useState("canteen");

  const [showCreate,
    setShowCreate] =
      useState(false);

  const [selectedTask,
    setSelectedTask] =
      useState(null);

  const [comments,
    setComments] =
      useState([]);

  const [commentText,
    setCommentText] =
      useState("");

  // FORM

  const [title,
    setTitle] =
      useState("");

  const [description,
    setDescription] =
      useState("");

  const [assignedTo,
    setAssignedTo] =
      useState("");

  const [priority,
    setPriority] =
      useState("medium");

  const [dueDate,
    setDueDate] =
      useState("");

  // TEAMS

  const teams = [

    "canteen",
    "printer",
    "campus connect"

  ];

  // INITIAL

  useEffect(() => {

    fetchCurrentUser();

    const taskChannel =
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

            fetchTasks();

          }

        )

        .subscribe();

    const commentChannel =
      supabase

        .channel(
          "comments-realtime"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table:
              "task_comments"

          },

          () => {

            if (
              selectedTask
            ) {

              fetchComments(
                selectedTask.id
              );

            }

          }

        )

        .subscribe();

    return () => {

      supabase.removeChannel(
        taskChannel
      );

      supabase.removeChannel(
        commentChannel
      );

    };

  }, [selectedTask]);

  // USER

  const fetchCurrentUser =
    async () => {

      const {

        data: sessionData

      } = await supabase.auth
        .getUser();

      if (
        !sessionData?.user
      ) return;

      const email =
        sessionData.user.email;

      const {

        data

      } = await supabase

        .from("users")

        .select("*")

        .eq(
          "email",
          email
        )

        .single();

      if (!data)
        return;

      setCurrentUser(
        data
      );

      if (
        data.role !==
        "pm"
      ) {

        setSelectedTeam(
          data.team_name
        );

      }

      fetchTasks();
      fetchUsers();

    };

  // USERS

  const fetchUsers =
    async () => {

      const {

        data

      } = await supabase

        .from("users")

        .select("*");

      if (data) {

        setUsers(data);

      }

    };

  // TASKS

  const fetchTasks =
    async () => {

      const {

        data

      } = await supabase

        .from("tasks")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false
          }
        );

      if (data) {

        setTasks(data);

      }

    };

  // CREATE TASK

  const createTask =
    async () => {

      if (
        !title ||
        !assignedTo ||
        !dueDate
      ) {

        alert(
          "Fill all fields"
        );

        return;

      }

      const { error } =
        await supabase

          .from("tasks")

          .insert([{

            title,
            description,
            assigned_to:
              assignedTo,
            priority,
            due_date:
              dueDate,
            team_name:
              selectedTeam,
            status:
              "pending",
            created_by:
              currentUser.email

          }]);

      if (error) {

        console.log(
          error
        );

        return;

      }

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setPriority(
        "medium"
      );
      setDueDate("");

      setShowCreate(
        false
      );

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

        .eq(
          "id",
          id
        );

    };

  // COMMENTS

  const fetchComments =
    async (
      taskId
    ) => {

      const {

        data

      } = await supabase

        .from(
          "task_comments"
        )

        .select("*")

        .eq(
          "task_id",
          taskId
        )

        .order(
          "created_at",
          {
            ascending: true
          }
        );

      if (data) {

        setComments(
          data
        );

      }

    };

  const addComment =
    async () => {

      if (
        !commentText
      ) return;

      await supabase

        .from(
          "task_comments"
        )

        .insert([{

          task_id:
            selectedTask.id,

          user_name:
            currentUser.name,

          user_role:
            currentUser.role,

          comment:
            commentText

        }]);

      setCommentText("");

    };

  // OPEN TASK

  const openTask =
    (task) => {

      setSelectedTask(
        task
      );

      fetchComments(
        task.id
      );

    };

  // FILTERS

  const filteredTasks =
    tasks.filter(
      (task) =>
        task.team_name ===
        selectedTeam
    );

  const pending =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "pending"
    );

  const progress =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "in progress"
    );

  const completed =
    filteredTasks.filter(
      (task) =>
        task.status ===
        "completed"
    );

  // COLORS

  const teamColors = [

    "bg-[#dcecff]",
    "bg-[#ffe0f0]",
    "bg-[#fff5b8]"

  ];

  return (

    <div className="bg-[#f7f3ea] p-8 space-y-7 relative">

      {/* HEADER */}

      <div className="bg-white border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[6px_6px_0px_#1d2b53] flex items-center justify-between">

        <div>

          <h1 className="text-5xl font-black text-[#1d2b53]">

            Tasks

          </h1>

          <p className="text-[#5c6b8a] mt-2 text-lg">

            Team workflow management

          </p>

        </div>

        <button

          onClick={() =>
            setShowCreate(
              !showCreate
            )
          }

          className="flex items-center gap-3 bg-[#3b82f6] text-white px-7 py-4 rounded-[22px] border-[4px] border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53] font-black hover:translate-y-[2px] transition-all"

        >

          <Plus size={22} />

          {

            showCreate

            ? "Close"

            : "Create Task"

          }

        </button>

      </div>

      {/* TEAM CARDS */}

      <div className="grid lg:grid-cols-3 gap-5">

        {

          teams.map(
            (
              team,
              index
            ) => {

              const activeCount =
                tasks.filter(
                  (task) =>

                    task.team_name ===
                    team &&

                    task.status !==
                    "completed"
                ).length;

              return (

                <button

                  key={team}

                  onClick={() =>
                    setSelectedTeam(
                      team
                    )
                  }

                  className={`

                    p-7 rounded-[28px]
                    border-[4px] border-[#1d2b53]
                    text-left transition-all

                    ${
                      selectedTeam ===
                      team

                      ? "shadow-[6px_6px_0px_#1d2b53] scale-[1.02]"

                      : "shadow-[3px_3px_0px_#1d2b53]"
                    }

                    ${
                      teamColors[
                        index
                      ]
                    }

                  `}

                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-3xl font-black capitalize text-[#1d2b53]">

                        {team}

                      </h2>

                      <p className="text-[#5c6b8a] mt-2">

                        Active Tasks

                      </p>

                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center text-2xl font-black text-[#1d2b53]">

                      {
                        activeCount
                      }

                    </div>

                  </div>

                </button>

              );

            }
          )

        }

      </div>

      {/* CREATE */}

      {

        showCreate && (

          <div className="bg-[#fff7d6] border-[4px] border-[#1d2b53] rounded-[32px] p-8 shadow-[6px_6px_0px_#1d2b53]">

            <h2 className="text-4xl font-black text-[#1d2b53] mb-7">

              Create Task

            </h2>

            <div className="grid lg:grid-cols-2 gap-5">

              <input

                type="text"

                placeholder="Task title"

                value={title}

                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }

                className="border-[3px] border-[#1d2b53] rounded-[22px] px-5 py-4 bg-white outline-none"

              />

              <input

                type="date"

                value={dueDate}

                onChange={(e) =>
                  setDueDate(
                    e.target.value
                  )
                }

                className="border-[3px] border-[#1d2b53] rounded-[22px] px-5 py-4 bg-white outline-none"

              />

              <textarea

                placeholder="Task description"

                value={description}

                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }

                className="border-[3px] border-[#1d2b53] rounded-[22px] px-5 py-4 bg-white outline-none lg:col-span-2 h-32 resize-none"

              />

              <select

                value={assignedTo}

                onChange={(e) =>
                  setAssignedTo(
                    e.target.value
                  )
                }

                className="border-[3px] border-[#1d2b53] rounded-[22px] px-5 py-4 bg-white outline-none"

              >

                <option value="">
                  Assign User
                </option>

                {

                  users

                    .filter(
                      (user) =>

                        user.team_name ===
                        selectedTeam
                    )

                    .map(
                      (user) => (

                        <option
                          key={user.id}
                          value={user.name}
                        >

                          {user.name}

                        </option>

                      )
                    )

                }

              </select>

              <select

                value={priority}

                onChange={(e) =>
                  setPriority(
                    e.target.value
                  )
                }

                className="border-[3px] border-[#1d2b53] rounded-[22px] px-5 py-4 bg-white outline-none"

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

            </div>

            <button

              onClick={
                createTask
              }

              className="mt-7 bg-[#3b82f6] text-white px-8 py-4 rounded-[22px] border-[4px] border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53] font-black hover:translate-y-[2px] transition-all"

            >

              Create Task

            </button>

          </div>

        )

      }

      {/* BOARD */}

      <div className="grid lg:grid-cols-3 gap-6 pb-20">

        {/* PENDING */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-5">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-3">

              <ClipboardList
                size={26}
                className="text-[#1d2b53]"
              />

              <h2 className="text-2xl font-black text-[#1d2b53]">

                Pending

              </h2>

            </div>

            <div className="px-4 py-2 rounded-full border-[2px] border-[#1d2b53] bg-[#f7f3ea] text-sm font-bold text-[#1d2b53]">

              {
                pending.length
              }

            </div>

          </div>

          <div className="space-y-5">

            {

              pending.map(
                (task) => (

                  <TaskCard

                    key={task.id}

                    task={task}

                    updateStatus={
                      updateStatus
                    }

                    setSelectedTask={
                      openTask
                    }

                  />

                )
              )

            }

          </div>

        </div>

        {/* PROGRESS */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-5">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-3">

              <Clock3
                size={26}
                className="text-[#1d2b53]"
              />

              <h2 className="text-2xl font-black text-[#1d2b53]">

                In Progress

              </h2>

            </div>

            <div className="px-4 py-2 rounded-full border-[2px] border-[#1d2b53] bg-[#f7f3ea] text-sm font-bold text-[#1d2b53]">

              {
                progress.length
              }

            </div>

          </div>

          <div className="space-y-5">

            {

              progress.map(
                (task) => (

                  <TaskCard

                    key={task.id}

                    task={task}

                    updateStatus={
                      updateStatus
                    }

                    setSelectedTask={
                      openTask
                    }

                  />

                )
              )

            }

          </div>

        </div>

        {/* COMPLETED */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[28px] shadow-[5px_5px_0px_#1d2b53] p-5">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-3">

              <CheckCircle2
                size={26}
                className="text-[#1d2b53]"
              />

              <h2 className="text-2xl font-black text-[#1d2b53]">

                Completed

              </h2>

            </div>

            <div className="px-4 py-2 rounded-full border-[2px] border-[#1d2b53] bg-[#f7f3ea] text-sm font-bold text-[#1d2b53]">

              {
                completed.length
              }

            </div>

          </div>

          <div className="space-y-5">

            {

              completed.map(
                (task) => (

                  <TaskCard

                    key={task.id}

                    task={task}

                    updateStatus={
                      updateStatus
                    }

                    setSelectedTask={
                      openTask
                    }

                  />

                )
              )

            }

          </div>

        </div>

      </div>

    </div>

  );

}

export default Tasks;