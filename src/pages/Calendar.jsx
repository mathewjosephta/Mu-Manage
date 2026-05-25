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

  const today =
    new Date();

  const currentMonth =
    today.getMonth();

  const currentYear =
    today.getFullYear();

  // FETCH SUBMISSIONS

  useEffect(() => {

    fetchSubmissions();

  }, []);

  const fetchSubmissions =
    async () => {

      const {

        data

      } = await supabase
        .from("daily_updates")
        .select("*");

      if (data) {

        setSubmissions(data);

      }

    };

  // DAYS ARRAY

  const daysInMonth =
    new Date(

      currentYear,

      currentMonth + 1,

      0

    ).getDate();

  const days =
    Array.from(

      { length: daysInMonth },

      (_, i) => i + 1

    );

  // DATE FORMAT

  const formatDate =
    (day) => {

      return `${currentYear}-${String(
        currentMonth + 1
      ).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

    };

  // CHECK SUBMITTED

  const isSubmitted =
    (day) => {

      const formatted =
        formatDate(day);

      return submissions.find(

        (item) =>

          item.update_date ===
          formatted

      );

    };

  // FUTURE CHECK

  const isFuture =
    (day) => {

      return (
        day >
        today.getDate()
      );

    };

  // MISSED CHECK

  const isMissed =
    (day) => {

      return (

        day < today.getDate() &&

        !isSubmitted(day)

      );

    };

  // SAVE UPDATE

  const handleSave =
    async () => {

      if (!taskSummary) {

        alert(
          "Enter update"
        );

        return;

      }

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

      if (error) {

        console.log(error);

        alert(
          "Submission failed"
        );

      }

      else {

        alert(
          "Update submitted"
        );

        setTaskSummary("");

        fetchSubmissions();

      }

    };

  return (

    <div className="min-h-screen bg-[#f5f7fb] p-10">

      <div className="max-w-7xl mx-auto">

        <div className="mb-10">

          <h1 className="text-4xl font-bold mb-2">
            Sprint Calendar
          </h1>

          <p className="text-gray-500">
            Track daily updates
          </p>

        </div>

        {/* GRID */}

        <div className="grid grid-cols-7 gap-4">

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
                    setSelectedDay(day)
                  }

                  className={`

                    h-32 rounded-2xl border-2 transition-all p-4 text-left

                    ${submitted
                      ? "bg-green-100 border-green-400"
                      : ""
                    }

                    ${missed
                      ? "bg-red-100 border-red-400"
                      : ""
                    }

                    ${future
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : ""
                    }

                    ${
                      day ===
                      today.getDate()

                      ? "border-blue-500"

                      : ""
                    }

                    hover:scale-[1.02]

                  `}
                >

                  <div className="flex flex-col h-full justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        {
                          ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][
                            new Date(
                              currentYear,
                              currentMonth,
                              day
                            ).getDay()
                          ]
                        }
                      </p>

                      <h2 className="text-3xl font-bold">
                        {day}
                      </h2>

                    </div>

                    <div>

                      {

                        submitted && (

                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>

                        )

                      }

                    </div>

                  </div>

                </button>

              );

            })

          }

        </div>

        {/* FORM */}

        {

          selectedDay && (

            <div className="bg-white rounded-3xl shadow-lg p-8 mt-10">

              <h2 className="text-2xl font-bold mb-6">

                Day {selectedDay} Update

              </h2>

              <textarea

                value={taskSummary}

                onChange={(e) =>
                  setTaskSummary(
                    e.target.value
                  )
                }

                placeholder="What did you complete today?"

                className="w-full border rounded-2xl p-4 h-40"

              />

              <div className="flex gap-4 mt-6">

                <button

                  onClick={handleSave}

                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl"

                >

                  Save

                </button>

                <button

                  onClick={() =>
                    setTaskSummary("")
                  }

                  className="border px-6 py-3 rounded-2xl"

                >

                  Clear

                </button>

              </div>

            </div>

          )

        }

      </div>

    </div>

  );

}

export default CalendarPage;