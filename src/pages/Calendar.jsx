import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../services/supabase";

function CalendarPage() {

  const [selectedDay,
    setSelectedDay] =
      useState(null);

  const [taskSummary,
    setTaskSummary] =
      useState("");

  const [submissions,
    setSubmissions] =
      useState([]);

  const [loading,
    setLoading] =
      useState(false);

  const [showSuccess,
    setShowSuccess] =
      useState(false);

  // JUNE 2026

  const days =
    Array.from(
      { length: 30 },
      (_, i) => i + 1
    );

  const currentYear = 2026;
  const currentMonth = 5;

  // TEST DAY

  const testCurrentDay = 1;

  // FETCH SUBMISSIONS

  useEffect(() => {

    fetchSubmissions();

  }, []);

  const fetchSubmissions =
    async () => {

      const { data } =
        await supabase
          .from("daily_updates")
          .select("*");

      if (data) {

        setSubmissions(data);

      }

    };

  // FORMAT DATE

  const formatDate =
    (day) => {

      return `${currentYear}-${String(
        currentMonth + 1
      ).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

    };

  // GET SUBMISSION

  const getSubmission =
    (day) => {

      const formatted =
        formatDate(day);

      return submissions.find(

        (item) =>

          item.update_date ===
          formatted

      );

    };

  // SUBMITTED

  const isSubmitted =
    (day) => {

      return !!getSubmission(day);

    };

  // FUTURE

  const isFuture =
    (day) => {

      return day > testCurrentDay;

    };

  // MISSED

  const isMissed =
    (day) => {

      return (
        !isFuture(day) &&
        !isSubmitted(day) &&
        day !== testCurrentDay
      );

    };

  // CLICK DAY

  const handleDayClick =
    (day) => {

      if (isFuture(day)) return;

      setSelectedDay(day);

      const existing =
        getSubmission(day);

      if (existing) {

        setTaskSummary(
          existing.task_summary
        );

      }

      else {

        setTaskSummary("");

      }

    };

  // SAVE UPDATE

  const handleSave =
    async () => {

      if (!taskSummary) return;

      setLoading(true);

      const {

        data: sessionData

      } = await supabase.auth
        .getUser();

      const email =
        sessionData.user.email;

      const {

        data: userData

      } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .limit(1);

      const teamName =
        userData[0].team_name;

      const existing =
        getSubmission(selectedDay);

      // CLOSE MODAL INSTANTLY

      setSelectedDay(null);

      // EDIT TODAY

      if (
        existing &&
        selectedDay ===
        testCurrentDay
      ) {

        const {

          error

        } = await supabase
          .from("daily_updates")
          .update({

            task_summary:
              taskSummary

          })
          .eq(
            "id",
            existing.id
          );

        if (!error) {

          fetchSubmissions();

          setShowSuccess(true);

          setTimeout(() => {

            setShowSuccess(false);

          }, 1200);

        }

      }

      // NEW UPDATE

      else if (!existing) {

        const {

          error

        } = await supabase
          .from("daily_updates")
          .insert([{

            user_email:
              email,

            team_name:
              teamName,

            update_date:
              formatDate(
                selectedDay
              ),

            task_summary:
              taskSummary

          }]);

        if (!error) {

          fetchSubmissions();

          setShowSuccess(true);

          setTimeout(() => {

            setShowSuccess(false);

          }, 2000);

        }

      }

      setLoading(false);

    };

  return (

    <div className="min-h-screen bg-[#f5f7fb] p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold mb-2">

            June 2026 Sprint

          </h1>

          <p className="text-gray-500">

            Daily progress tracker

          </p>

        </div>

        {/* CALENDAR */}

        <div className="grid grid-cols-7 gap-3">

          {

            days.map((day) => {

              const submitted =
                isSubmitted(day);

              const future =
                isFuture(day);

              const missed =
                isMissed(day);

              return (

                <button

                  key={day}

                  disabled={future}

                  onClick={() =>
                    handleDayClick(day)
                  }

                  className={`

                    h-20 rounded-2xl border p-2.5 transition-all text-left relative

                    ${submitted
                      ? "bg-green-100 border-green-400"
                      : ""
                    }

                    ${missed
                      ? "bg-red-100 border-red-300"
                      : ""
                    }

                    ${future
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : ""
                    }

                    ${
                      day ===
                      testCurrentDay

                      ? "border-blue-500"

                      : ""
                    }

                    hover:scale-[1.02]

                  `}
                >

                  <div className="flex flex-col h-full justify-between">

                    <div>

                      <p className="text-gray-500 text-[10px]">

                        {
                          ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][
                            new Date(
                              2026,
                              5,
                              day
                            ).getDay()
                          ]
                        }

                      </p>

                      <h2 className="text-lg font-semibold mt-1">

                        {day}

                      </h2>

                    </div>

                    {

                      submitted && (

                        <div className="w-2 h-2 rounded-full bg-green-600"></div>

                      )

                    }

                  </div>

                </button>

              );

            })

          }

        </div>

      </div>

      {/* SUCCESS FULLSCREEN */}

     {/* SUCCESS FULLSCREEN */}

{

  showSuccess && (

    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/30 backdrop-blur-sm overflow-hidden">

      {/* OUTER RIPPLE */}

      <div className="absolute w-[420px] h-[420px] rounded-full bg-green-200/30 animate-[ping_1.2s_ease-out]"></div>

      {/* MID RIPPLE */}

      <div className="absolute w-[320px] h-[320px] rounded-full bg-green-300/30 animate-[ping_1.2s_ease-out]"></div>

      {/* INNER RIPPLE */}

      <div className="absolute w-[220px] h-[220px] rounded-full bg-green-400/20 animate-[ping_1.2s_ease-out]"></div>

      {/* MAIN ICON */}

      <div className="relative z-10">

        <div className="w-36 h-36 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_80px_rgba(34,197,94,0.5)] animate-none scale-100">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />

          </svg>

        </div>

      </div>

    </div>

  )

}

      {/* MODAL */}

      {

        selectedDay && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-[550px] rounded-3xl p-8 shadow-2xl">

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-2xl font-bold">

                  Day {selectedDay} Update

                </h2>

                <button

                  onClick={() =>
                    setSelectedDay(null)
                  }

                  className="text-2xl"

                >

                  ×

                </button>

              </div>

              <textarea

                value={taskSummary}

                onChange={(e) =>
                  setTaskSummary(
                    e.target.value
                  )
                }

                readOnly={
                  selectedDay !==
                  testCurrentDay
                }

                placeholder="Daily update"

                className={`

                  w-full border rounded-2xl p-5 h-44 outline-none

                  ${
                    selectedDay !==
                    testCurrentDay

                    ? "bg-gray-100"

                    : ""
                  }

                `}
              />

              <div className="flex gap-4 mt-6">

                {

                  selectedDay ===
                  testCurrentDay && (

                    <button

                      onClick={
                        handleSave
                      }

                      disabled={loading}

                      className="bg-blue-600 text-white px-6 py-3 rounded-2xl"

                    >

                      {
                        loading
                          ? "Saving..."
                          : "Save Update"
                      }

                    </button>

                  )

                }

                <button

                  onClick={() =>
                    setSelectedDay(null)
                  }

                  className="border px-6 py-3 rounded-2xl"

                >

                  Close

                </button>

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default CalendarPage;