import {

  useEffect,
  useState

} from "react";

import Calendar
from "react-calendar";

import "react-calendar/dist/Calendar.css";

import { supabase }
from "../services/supabase";

function CalendarPage() {

  const [selectedDate,
    setSelectedDate] =
      useState(null);

  const [taskSummary,
    setTaskSummary] =
      useState("");

  const [blockers,
    setBlockers] =
      useState("");

  const [progress,
    setProgress] =
      useState("");

  const [submissions,
    setSubmissions] =
      useState([]);

  // FETCH ALL SUBMISSIONS

  useEffect(() => {

    fetchSubmissions();

  }, []);

  const fetchSubmissions =
    async () => {

      const {

        data,
        error

      } = await supabase
        .from("daily_updates")
        .select("*");

      if (error) {

        console.log(error);

      }

      else {

        setSubmissions(data);

      }

    };

  // DATE FORMAT

  const formatDate =
    (date) => {

      return date
        .toISOString()
        .split("T")[0];

    };

  // FUTURE LOCK

  const isFutureDate =
    (date) => {

      const today =
        new Date();

      return (

        date >

        new Date(

          today.getFullYear(),

          today.getMonth(),

          today.getDate()

        )

      );

    };

  // DAY CLICK

  const handleDateClick =
    (value) => {

      if (
        isFutureDate(value)
      ) {

        alert(
          "Future dates are locked"
        );

        return;

      }

      setSelectedDate(value);

    };

  // SUBMIT UPDATE

  const handleSubmit =
    async () => {

      if (
        !taskSummary ||
        !progress
      ) {

        alert(
          "Fill all required fields"
        );

        return;

      }

      // GET USER

      const {

        data: sessionData

      } = await supabase.auth
        .getUser();

      const email =
        sessionData.user.email;

      // GET TEAM

      const {

        data: userData

      } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .limit(1);

      const teamName =
        userData[0].team_name;

      // CHECK ALREADY SUBMITTED

      const {

        data: existing

      } = await supabase
        .from("daily_updates")
        .select("*")
        .eq(
          "update_date",

          formatDate(
            selectedDate
          )
        )
        .eq(
          "user_email",
          email
        );

      if (
        existing &&
        existing.length > 0
      ) {

        alert(
          "Update already submitted"
        );

        return;

      }

      // INSERT UPDATE

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
              selectedDate
            ),

          task_summary:
            taskSummary,

          blockers_summary:
            blockers,

          progress:
            Number(progress)

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
        setBlockers("");
        setProgress("");

        fetchSubmissions();

      }

    };

  // CALENDAR COLORS

  const tileClassName =
    ({ date }) => {

      const formatted =
        formatDate(date);

      const exists =
        submissions.find(

          (item) =>

            item.update_date ===
            formatted

        );

      if (exists) {

        return
          "bg-green-200 rounded-xl";

      }

      if (
        isFutureDate(date)
      ) {

        return
          "bg-gray-100 text-gray-400 rounded-xl";

      }

      return "";

    };

  return (

    <div className="min-h-screen">

      <div className="max-w-6xl mx-auto">

        <div className="mb-8">

          <h1 className="text-4xl font-bold mb-2">
            Sprint Calendar
          </h1>

          <p className="text-gray-500">
            Submit your daily progress
          </p>

        </div>

        {/* CALENDAR */}

        <div className="bg-white rounded-3xl shadow-lg p-8">

          <Calendar

            onClickDay={
              handleDateClick
            }

            tileDisabled={({
              date
            }) =>
              isFutureDate(date)
            }

            tileClassName={
              tileClassName
            }

          />

        </div>

        {/* FORM */}

        {

          selectedDate && (

            <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">

              <h2 className="text-2xl font-bold mb-6">

                Daily Update

              </h2>

              <p className="mb-6 text-gray-500">

                Selected Date:

                {" "}

                {
                  selectedDate
                    .toDateString()
                }

              </p>

              <div className="space-y-5">

                <textarea
                  placeholder="Tasks completed today"
                  value={taskSummary}
                  onChange={(e) =>
                    setTaskSummary(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-2xl p-4 h-32"
                />

                <textarea
                  placeholder="Blockers/issues"
                  value={blockers}
                  onChange={(e) =>
                    setBlockers(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-2xl p-4 h-32"
                />

                <input
                  type="number"
                  placeholder="Progress %"
                  value={progress}
                  onChange={(e) =>
                    setProgress(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-2xl p-4"
                />

                <button
                  onClick={
                    handleSubmit
                  }
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl"
                >

                  Submit Update

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