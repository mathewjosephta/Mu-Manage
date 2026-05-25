function TaskCard({

  task,
  updateStatus,
  setSelectedTask

}) {

  return (

    <div className="bg-white rounded-3xl p-5 shadow-sm">

      {/* TITLE */}

      <div className="mb-4">

        <h2 className="text-xl font-bold">

          {task.title}

        </h2>

        <p className="text-sm text-gray-500 mt-2 leading-6">

          {
            task.description
          }

        </p>

      </div>

      {/* INFO */}

      <div className="space-y-2 text-sm mb-5">

        <div className="flex justify-between">

          <span className="text-gray-400">

            Assigned

          </span>

          <span>

            {
              task.assigned_to
            }

          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-gray-400">

            Team

          </span>

          <span className="capitalize">

            {
              task.team_name
            }

          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-gray-400">

            Priority

          </span>

          <span className={`

            px-3 py-1 rounded-full text-xs capitalize

            ${
              task.priority ===
              "high"

              ? "bg-red-100 text-red-600"

              : task.priority ===
                "medium"

              ? "bg-yellow-100 text-yellow-700"

              : "bg-green-100 text-green-700"
            }

          `}>

            {
              task.priority
            }

          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-gray-400">

            Due

          </span>

          <span>

            {
              task.due_date
            }

          </span>

        </div>

      </div>

      {/* STATUS */}

      <div className="flex gap-2 flex-wrap">

        <button

          onClick={() =>
            updateStatus(
              task.id,
              "pending"
            )
          }

          className="px-3 py-2 bg-gray-100 rounded-xl text-sm"

        >

          Pending

        </button>

        <button

          onClick={() =>
            updateStatus(
              task.id,
              "in progress"
            )
          }

          className="px-3 py-2 bg-yellow-100 rounded-xl text-sm"

        >

          Progress

        </button>

        <button

          onClick={() =>
            updateStatus(
              task.id,
              "completed"
            )
          }

          className="px-3 py-2 bg-green-100 rounded-xl text-sm"

        >

          Done

        </button>

      </div>

      {/* DETAILS */}

      <button

        onClick={() =>
          setSelectedTask(
            task
          )
        }

        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-all text-white py-3 rounded-2xl"

      >

        View Details

      </button>

    </div>

  );

}

export default TaskCard;