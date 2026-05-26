import {
  CheckCircle2,
  RotateCcw,
  X
} from "lucide-react";

function ReviewModal({

  selectedTask,
  closeModal,
  approveTask,
  rejectTask

}) {

  if (!selectedTask)
    return null;

  return (

    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">

      {/* MODAL */}

      <div className="w-full max-w-2xl bg-[#f7f3ea] border-[5px] border-[#1d2b53] rounded-[38px] shadow-[10px_10px_0px_#1d2b53] overflow-hidden animate-[fadeIn_.2s_ease]">

        {/* HEADER */}

        <div className="bg-[#fff7d6] border-b-[5px] border-[#1d2b53] px-8 py-7 flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-black text-[#1d2b53]">

              Review Task

            </h1>

            <p className="text-[#5c6b8a] mt-2 text-lg">

              Verify sprint task before marking done

            </p>

          </div>

          {/* CLOSE */}

          <button

            onClick={closeModal}

            className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center shadow-[3px_3px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

          >

            <X
              size={24}
              className="text-[#1d2b53]"
            />

          </button>

        </div>

        {/* CONTENT */}

        <div className="p-8 space-y-7">

          {/* TITLE */}

          <div className="bg-white border-[4px] border-[#1d2b53] rounded-[28px] p-6 shadow-[4px_4px_0px_#1d2b53]">

            <p className="text-sm font-bold uppercase text-[#5c6b8a] mb-3">

              Task Title

            </p>

            <h2 className="text-3xl font-black text-[#1d2b53] leading-tight">

              {
                selectedTask.title
              }

            </h2>

          </div>

          {/* DESCRIPTION */}

          <div className="bg-white border-[4px] border-[#1d2b53] rounded-[28px] p-6 shadow-[4px_4px_0px_#1d2b53]">

            <p className="text-sm font-bold uppercase text-[#5c6b8a] mb-3">

              Description

            </p>

            <p className="text-[#1d2b53] leading-8 text-lg">

              {

                selectedTask.description ||

                "No description provided."

              }

            </p>

          </div>

          {/* INFO GRID */}

          <div className="grid md:grid-cols-3 gap-5">

            {/* PRIORITY */}

            <div className="bg-[#ffe0f0] border-[4px] border-[#1d2b53] rounded-[26px] p-5 shadow-[4px_4px_0px_#1d2b53]">

              <p className="text-sm font-bold uppercase text-[#5c6b8a] mb-2">

                Priority

              </p>

              <h3 className="text-2xl font-black text-[#1d2b53] capitalize">

                {
                  selectedTask.priority
                }

              </h3>

            </div>

            {/* ASSIGNED */}

            <div className="bg-[#dcecff] border-[4px] border-[#1d2b53] rounded-[26px] p-5 shadow-[4px_4px_0px_#1d2b53]">

              <p className="text-sm font-bold uppercase text-[#5c6b8a] mb-2">

                Assigned

              </p>

              <h3 className="text-2xl font-black text-[#1d2b53]">

                {

                  selectedTask.assigned_to ||

                  "Anyone"

                }

              </h3>

            </div>

            {/* DEADLINE */}

            <div className="bg-[#fff5b8] border-[4px] border-[#1d2b53] rounded-[26px] p-5 shadow-[4px_4px_0px_#1d2b53]">

              <p className="text-sm font-bold uppercase text-[#5c6b8a] mb-2">

                Deadline

              </p>

              <h3 className="text-2xl font-black text-[#1d2b53]">

                {
                  selectedTask.due_date
                }

              </h3>

            </div>

          </div>

          {/* STATUS */}

          <div className="bg-[#ffe0f0] border-[4px] border-[#1d2b53] rounded-[28px] p-6 shadow-[4px_4px_0px_#1d2b53]">

            <p className="text-sm font-bold uppercase text-[#5c6b8a] mb-3">

              Current Status

            </p>

            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border-[3px] border-[#1d2b53] bg-white">

              <div className="w-4 h-4 rounded-full bg-pink-500"></div>

              <span className="font-black text-[#1d2b53] capitalize text-lg">

                {
                  selectedTask.status
                }

              </span>

            </div>

          </div>

          {/* WARNING */}

          <div className="bg-[#fff7d6] border-[4px] border-[#1d2b53] rounded-[28px] p-6 shadow-[4px_4px_0px_#1d2b53]">

            <p className="font-black text-[#1d2b53] text-xl mb-3">

              Review Checklist

            </p>

            <ul className="space-y-3 text-[#1d2b53] leading-8">

              <li>
                • Verify task output is complete
              </li>

              <li>
                • Confirm quality & functionality
              </li>

              <li>
                • Ensure no blockers remain
              </li>

              <li>
                • Reject if rework is needed
              </li>

            </ul>

          </div>

        </div>

        {/* FOOTER */}

        <div className="bg-white border-t-[5px] border-[#1d2b53] px-8 py-7 flex flex-col md:flex-row gap-5 justify-end">

          {/* REJECT */}

          <button

            onClick={() =>
              rejectTask(
                selectedTask.id
              )
            }

            className="flex items-center justify-center gap-3 bg-[#ffe0f0] text-red-600 border-[4px] border-red-500 px-8 py-5 rounded-[24px] font-black text-xl shadow-[4px_4px_0px_#ef4444] hover:translate-y-[2px] transition-all"

          >

            <RotateCcw size={24} />

            Send Back

          </button>

          {/* APPROVE */}

          <button

            onClick={() =>
              approveTask(
                selectedTask.id
              )
            }

            className="flex items-center justify-center gap-3 bg-[#22c55e] text-white border-[4px] border-[#1d2b53] px-8 py-5 rounded-[24px] font-black text-xl shadow-[4px_4px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

          >

            <CheckCircle2 size={24} />

            Approve Task

          </button>

        </div>

      </div>

    </div>

  );

}

export default ReviewModal;