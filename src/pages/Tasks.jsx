import {
  useEffect,
  useState
} from "react";

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

  // TEAM LIST

  const teams = [

    "canteen",
    "printer",
    "campus connect"

  ];

  // INITIAL

  useEffect(() => {

    fetchCurrentUser();

    // REALTIME TASKS

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

    // REALTIME COMMENTS

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

            table: "task_comments"

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

  // FETCH USER

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

      // MEMBERS AUTO TEAM

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

  // FETCH USERS

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

  // FETCH TASKS

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

            title:
              title,

            description:
              description,

            assigned_to:
              assignedTo,

            priority:
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

      // RESET

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setPriority("medium");
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

          status:
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

  // FILTER TEAM

  const filteredTasks =
    tasks.filter(
      (task) =>
        task.team_name ===
        selectedTeam
    );

  // FILTER STATUS

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

  return (

    <div className="h-screen overflow-y-auto bg-[#f5f7fb] p-10 relative">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-4xl font-bold">

            Tasks

          </h1>

          <p className="text-gray-500 mt-2">

            Team workflow management

          </p>

        </div>

        <button

          onClick={() =>
            setShowCreate(
              !showCreate
            )
          }

          className="bg-blue-600 hover:bg-blue-700 transition-all text-white px-6 py-4 rounded-2xl"

        >

          {
            showCreate

            ? "Close"

            : "Create Task"
          }

        </button>

      </div>

      {/* TEAM CARDS */}

      <div className="grid lg:grid-cols-3 gap-5 mb-10">

        {

          teams.map(
            (team) => {

              const activeCount =
                tasks.filter(
                  (task) =>

                    task.team_name ===
                    team &&

                    task.status !==
                    "completed"
                ).length;

              return (

                <div

                  key={team}

                  onClick={() =>
                    setSelectedTeam(
                      team
                    )
                  }

                  className={`

                    rounded-3xl p-6 cursor-pointer transition-all shadow-sm

                    ${
                      selectedTeam ===
                      team

                      ? "bg-blue-600 text-white"

                      : "bg-white"
                    }

                  `}

                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-2xl font-bold capitalize">

                        {team}

                      </h2>

                      <p className={`

                        mt-2 text-sm

                        ${
                          selectedTeam ===
                          team

                          ? "text-blue-100"

                          : "text-gray-500"
                        }

                      `}>

                        Active tasks

                      </p>

                    </div>

                    <div className={`

                      w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold

                      ${
                        selectedTeam ===
                        team

                        ? "bg-white text-blue-600"

                        : "bg-gray-100"
                      }

                    `}>

                      {
                        activeCount
                      }

                    </div>

                  </div>

                </div>

              );

            }
          )

        }

      </div>

      {/* CREATE */}

      {

        showCreate && (

          <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm">

            <h2 className="text-2xl font-bold mb-6">

              Create Task for {selectedTeam}

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

                className="border rounded-2xl px-5 py-4 outline-none"

              />

              <input

                type="date"

                value={dueDate}

                onChange={(e) =>
                  setDueDate(
                    e.target.value
                  )
                }

                className="border rounded-2xl px-5 py-4 outline-none"

              />

              <textarea

                placeholder="Task description"

                value={description}

                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }

                className="border rounded-2xl px-5 py-4 outline-none lg:col-span-2 h-32 resize-none"

              />

              <select

                value={assignedTo}

                onChange={(e) =>
                  setAssignedTo(
                    e.target.value
                  )
                }

                className="border rounded-2xl px-5 py-4 outline-none"

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

                className="border rounded-2xl px-5 py-4 outline-none"

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

              className="mt-6 bg-blue-600 text-white px-8 py-4 rounded-2xl"

            >

              Create Task

            </button>

          </div>

        )

      }

      {/* BOARD */}

      <div className="grid lg:grid-cols-3 gap-6 pb-32">

        {/* PENDING */}

        <div>

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-2xl font-bold">

              Pending

            </h2>

            <div className="bg-gray-200 px-3 py-1 rounded-full text-sm">

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

        <div>

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-2xl font-bold">

              In Progress

            </h2>

            <div className="bg-yellow-200 px-3 py-1 rounded-full text-sm">

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

        <div>

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-2xl font-bold">

              Completed

            </h2>

            <div className="bg-green-200 px-3 py-1 rounded-full text-sm">

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

      {/* DRAWER */}

      {

        selectedTask && (

          <div className="fixed top-0 right-0 w-[450px] h-screen bg-white shadow-2xl z-50 p-8 overflow-y-auto">

            {/* HEADER */}

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-3xl font-bold">

                Task Details

              </h2>

              <button

                onClick={() =>
                  setSelectedTask(
                    null
                  )
                }

                className="text-3xl"

              >

                ×

              </button>

            </div>

            {/* DETAILS */}

            <div className="space-y-6 mb-10">

              <div>

                <p className="text-sm text-gray-400 mb-2">

                  Title

                </p>

                <h3 className="text-2xl font-bold">

                  {
                    selectedTask.title
                  }

                </h3>

              </div>

              <div>

                <p className="text-sm text-gray-400 mb-2">

                  Description

                </p>

                <p className="leading-7 text-gray-700">

                  {
                    selectedTask.description
                  }

                </p>

              </div>

              <div className="grid grid-cols-2 gap-5">

                <div>

                  <p className="text-sm text-gray-400 mb-2">

                    Assigned

                  </p>

                  <p>

                    {
                      selectedTask.assigned_to
                    }

                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-400 mb-2">

                    Priority

                  </p>

                  <p className="capitalize">

                    {
                      selectedTask.priority
                    }

                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-400 mb-2">

                    Team

                  </p>

                  <p className="capitalize">

                    {
                      selectedTask.team_name
                    }

                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-400 mb-2">

                    Due Date

                  </p>

                  <p>

                    {
                      selectedTask.due_date
                    }

                  </p>

                </div>

              </div>

            </div>

            {/* COMMENTS */}

            <div>

              <h3 className="text-2xl font-bold mb-6">

                Comments

              </h3>

              <div className="space-y-4 mb-6">

                {

                  comments.map(
                    (comment) => (

                      <div

                        key={comment.id}

                        className="bg-gray-100 rounded-2xl p-4"

                      >

                        <div className="flex items-center justify-between mb-2">

                          <h4 className="font-semibold">

                            {
                              comment.user_name
                            }

                          </h4>

                          <span className="text-xs text-gray-400">

                            {
                              comment.user_role
                            }

                          </span>

                        </div>

                        <p className="text-sm text-gray-700 leading-6">

                          {
                            comment.comment
                          }

                        </p>

                      </div>

                    )
                  )

                }

              </div>

              {/* INPUT */}

              <textarea

                placeholder="Add comment..."

                value={commentText}

                onChange={(e) =>
                  setCommentText(
                    e.target.value
                  )
                }

                className="w-full border rounded-2xl p-4 outline-none h-28 resize-none"

              />

              <button

                onClick={
                  addComment
                }

                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-all text-white py-4 rounded-2xl"

              >

                Add Comment

              </button>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default Tasks;