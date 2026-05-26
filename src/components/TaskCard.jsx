import {
  Check,
  Clock3,
  Eye,
  Trash2,
  User2
} from "lucide-react";

function TaskCard({

  task,
  currentUser,
  updateStatus,
  deleteTask,
  openReviewModal,
  setSelectedTask

}) {

  // ROLE

  const role =
    currentUser?.role;

  // COLORS

  const priorityColors = {

    low: "bg-[#d8f7df]",
    medium: "bg-[#fff5b8]",
    high: "bg-[#ffe0f0]"

  };

  const statusColors = {

    todo: "bg-[#dcecff]",

    "in progress":
      "bg-[#fff5b8]",

    "under review":
      "bg-[#ffe0f0]",

    done:
      "bg-[#d8f7df]"

  };

  // MEMBER WORKFLOW

  const canMoveToProgress =

    role === "member" &&
    task.status === "todo";

  const canMoveToReview =

    role === "member" &&
    task.status ===
      "in progress";

  // LEAD REVIEW

  const canReview =

    role === "lead" &&
    task.status ===
      "under review";

  // DELETE

  const canDelete =

    role === "lead";

  return (

    <div className={`

      rounded-[28px]
      border-[4px]
      p-6
      shadow-[5px_5px_0px_#1d2b53]
      transition-all

      ${
        task.is_deleted

        ? "bg-[#ffe0f0] border-red-500 opacity-70"

        : "bg-white border-[#1d2b53]"
      }

    `}>

      {/* TOP */}

      <div className="flex items-start justify-between gap-4 mb-5">

        <div>

          <h2 className="text-2xl font-black text-[#1d2b53] leading-tight">

            {task.title}

          </h2>

          <p className="text-[#5c6b8a] mt-2 leading-7">

            {
              task.description
            }

          </p>

        </div>

        {/* PRIORITY */}

        <div className={`

          px-4 py-2 rounded-full
          border-[2px] border-[#1d2b53]
          text-sm font-bold capitalize
          whitespace-nowrap

          ${
            priorityColors[
              task.priority
            ]
          }

        `}>

          {
            task.priority
          }

        </div>

      </div>

      {/* USER */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-[#dcecff] border-[3px] border-[#1d2b53] flex items-center justify-center">

            <User2
              size={22}
              className="text-[#1d2b53]"
            />

          </div>

          <div>

            <p className="text-sm text-[#5c6b8a]">

              Assigned To

            </p>

            <h3 className="font-black text-[#1d2b53]">

              {

                task.assigned_to ||

                "Anyone"

              }

            </h3>

          </div>

        </div>

        {/* STATUS */}

        <div className={`

          px-4 py-2 rounded-full
          border-[2px] border-[#1d2b53]
          text-sm font-bold capitalize

          ${
            statusColors[
              task.status
            ]
          }

        `}>

          {
            task.status
          }

        </div>

      </div>

      {/* DEADLINE */}

      <div className="flex items-center gap-3 mb-7">

        <Clock3
          size={20}
          className="text-[#5c6b8a]"
        />

        <p className="text-[#5c6b8a] font-semibold">

          Due:

          <span className="text-[#1d2b53] ml-2 font-black">

            {
              task.due_date
            }

          </span>

        </p>

      </div>

      {/* DELETED */}

      {

        task.is_deleted && (

          <div className="mb-6 bg-red-100 border-[3px] border-red-500 rounded-2xl p-4">

            <p className="font-bold text-red-600">

              Deleted by:
              {" "}
              {
                task.deleted_by
              }

            </p>

            <p className="text-sm text-red-500 mt-1">

              {
                task.deleted_at
              }

            </p>

          </div>

        )

      }

      {/* ACTIONS */}

      <div className="flex flex-wrap gap-3">

        {/* VIEW */}

        <button

          onClick={() =>
            setSelectedTask(
              task
            )
          }

          className="flex items-center gap-2 bg-[#dcecff] text-[#1d2b53] px-5 py-3 rounded-2xl border-[3px] border-[#1d2b53] font-bold shadow-[3px_3px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

        >

          <Eye size={18} />

          Details

        </button>

        {/* MEMBER */}

        {

          canMoveToProgress && (

            <button

              onClick={() =>

                updateStatus(

                  task.id,
                  "in progress"

                )

              }

              className="bg-[#fff5b8] text-[#1d2b53] px-5 py-3 rounded-2xl border-[3px] border-[#1d2b53] font-bold shadow-[3px_3px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

            >

              Start Task

            </button>

          )

        }

        {

          canMoveToReview && (

            <button

              onClick={() =>

                updateStatus(

                  task.id,
                  "under review"

                )

              }

              className="bg-[#ffe0f0] text-[#1d2b53] px-5 py-3 rounded-2xl border-[3px] border-[#1d2b53] font-bold shadow-[3px_3px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

            >

              Submit Review

            </button>

          )

        }

        {/* LEAD */}

        {

          canReview && (

            <button

              onClick={() =>
                openReviewModal(
                  task
                )
              }

              className="flex items-center gap-2 bg-[#d8f7df] text-[#1d2b53] px-5 py-3 rounded-2xl border-[3px] border-[#1d2b53] font-bold shadow-[3px_3px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

            >

              <Check size={18} />

              Review

            </button>

          )

        }

        {/* DELETE */}

        {

          canDelete &&
          !task.is_deleted && (

            <button

              onClick={() =>
                deleteTask(
                  task.id
                )
              }

              className="flex items-center gap-2 bg-red-200 text-red-700 px-5 py-3 rounded-2xl border-[3px] border-red-500 font-bold shadow-[3px_3px_0px_#ef4444] hover:translate-y-[2px] transition-all"

            >

              <Trash2 size={18} />

              Delete

            </button>

          )

        }

      </div>

    </div>

  );

}

export default TaskCard;