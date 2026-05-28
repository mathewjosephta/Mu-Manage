  import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Flame
} from "lucide-react";

import { supabase }
from "../services/supabase";

function DailyUpdates() {

  const currentUser =
    JSON.parse(
      localStorage.getItem("user")
    );

  const isPM =
    currentUser?.role === "pm";

  const today =
    new Date()
      .toLocaleDateString(
        "en-CA"
      );

  // STATES

  const [selectedDate,
    setSelectedDate] =
      useState(null);

  const [updates,
    setUpdates] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [showSuccess,
    setShowSuccess] =
      useState(false);

  // FORM

  const [projectName,
    setProjectName] =
      useState("");

  const [completedToday,
    setCompletedToday] =
      useState("");

  const [blockers,
    setBlockers] =
      useState("");

  const [tomorrowGoals,
    setTomorrowGoals] =
      useState("");

  // FETCH

  const fetchUpdates =
    async () => {

      setLoading(true);

      let query =
        supabase

          .from("daily_updates")

          .select("*")

          .order(
            "update_date",
            {
              ascending: false
            }
          );

      // MEMBER ONLY SEES OWN DATA

      if (!isPM) {

        query =
          query.eq(
            "user_email",
            currentUser.email
          );

      }

      const {
        data,
        error
      } = await query;

      if (error) {

        console.log(error);

      }

      setUpdates(
        data || []
      );

      setLoading(false);

    };

  useEffect(() => {

    fetchUpdates();

  }, []);

  // LOAD FORM DATA

  useEffect(() => {

    if (
      !selectedDate
    )
      return;

    const existing =
      updates.find(
        (item) =>
          item.update_date ===
          selectedDate
      );

    if (existing) {

      setProjectName(
        existing.project_name || ""
      );

      setCompletedToday(
        existing.completed_today || ""
      );

      setBlockers(
        existing.blockers || ""
      );

      setTomorrowGoals(
        existing.tomorrow_goals || ""
      );

    }

    else {

      setProjectName("");
      setCompletedToday("");
      setBlockers("");
      setTomorrowGoals("");

    }

  }, [
    selectedDate,
    updates
  ]);

  // CALENDAR

  const currentMonth =
    new Date();

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const calendarDays =
    Array.from(
      {
        length:
          daysInMonth
      },
      (_, i) => i + 1
    );

  // STREAK

  const streak =
    useMemo(() => {

      const dates =
        updates.map(
          (u) =>
            u.update_date
        );

      let count = 0;

      let current =
        new Date();

      while (true) {

        const date =
          current.toLocaleDateString(
            "en-CA"
          );

        if (
          dates.includes(date)
        ) {

          count++;

          current.setDate(
            current.getDate() - 1
          );

        }

        else {

          break;

        }

      }

      return count;

    }, [updates]);

  // SUBMIT

  const submitUpdate =
    async () => {

      if (
        selectedDate !== today
      ) {

        alert(
          "Only today's update can be edited"
        );

        return;

      }

      const existingUpdate =
        updates.find(
          (item) =>
            item.update_date ===
            today
        );

      // UPDATE

      if (existingUpdate) {

        const {
          error
        } = await supabase

          .from("daily_updates")

          .update({

            project_name:
              projectName,

            completed_today:
              completedToday,

            blockers,

            tomorrow_goals:
              tomorrowGoals

          })

          .eq(
            "id",
            existingUpdate.id
          );

        if (error) {

          console.log(error);
          return;

        }

      }

      // CREATE

      else {

        const {
          error
        } = await supabase

          .from("daily_updates")

          .insert([{

            user_email:
              currentUser.email,

            user_name:
              currentUser.name,

            project_name:
              projectName,

            completed_today:
              completedToday,

            blockers,

            tomorrow_goals:
              tomorrowGoals,

            update_date:
              today

          }]);

        if (error) {

          console.log(error);
          return;

        }

      }

      fetchUpdates();

      // CLOSE POPUP

      setSelectedDate(null);

      // SUCCESS

      setShowSuccess(true);

      setTimeout(() => {

        setShowSuccess(false);

      }, 2200);

    };

  // LOADING

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        Loading...

      </div>

    );

  }

  // PM VIEW

  if (isPM) {

    return (

      <div className="p-8">

        <h1 className="text-4xl font-bold mb-8">

          Daily Updates

        </h1>

        <div className="space-y-5">

          {

            updates.map(
              (update) => (

                <div

                  key={update.id}

                  className="border border-gray-200 rounded-3xl p-6"

                >

                  <h2 className="text-2xl font-semibold">

                    {update.user_name}

                  </h2>

                  <p className="text-gray-500 mt-1">

                    {update.update_date}

                  </p>

                  <div className="mt-5 space-y-4">

                    <div>

                      <h3 className="font-semibold mb-1">

                        Project

                      </h3>

                      <p>

                        {update.project_name}

                      </p>

                    </div>

                    <div>

                      <h3 className="font-semibold mb-1">

                        Completed Today

                      </h3>

                      <p>

                        {update.completed_today}

                      </p>

                    </div>

                    <div>

                      <h3 className="font-semibold mb-1">

                        Blockers

                      </h3>

                      <p>

                        {update.blockers}

                      </p>

                    </div>

                    <div>

                      <h3 className="font-semibold mb-1">

                        Tomorrow Goals

                      </h3>

                      <p>

                        {update.tomorrow_goals}

                      </p>

                    </div>

                  </div>

                </div>

              )
            )

          }

        </div>

      </div>

    );

  }

  // MEMBER VIEW

  return (

    <div className="min-h-screen bg-white p-8">

      {/* SUCCESS MODAL */}

      {

        showSuccess && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">

            {/* OUTER */}

            <div className="relative flex items-center justify-center">

              {/* WAVE 1 */}

              <div className="absolute w-[220px] h-[220px] rounded-full bg-green-400/20 animate-wave1" />

              {/* WAVE 2 */}

              <div className="absolute w-[170px] h-[170px] rounded-full bg-green-400/25 animate-wave2" />

              {/* CARD */}

              <div className="relative bg-white px-14 py-12 rounded-[36px] shadow-2xl flex flex-col items-center animate-successAppear">

                {/* TICK */}

                <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center shadow-lg">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-14 h-14 text-white"
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

                <h2 className="text-3xl font-bold mt-7">

                  Update Saved

                </h2>

                <p className="text-gray-500 mt-2 text-center">

                  Daily progress submitted successfully

                </p>

              </div>

            </div>

          </div>

        )

      }

      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-4xl font-bold">

            Daily Updates

          </h1>

          <p className="text-gray-500 mt-2">

            Track daily team progress

          </p>

        </div>

        <div className="flex items-center gap-2 bg-orange-50 text-orange-500 px-5 py-3 rounded-2xl">

          <Flame size={18} />

          {streak} Day Streak

        </div>

      </div>

      {/* CALENDAR */}

      <div className="grid grid-cols-7 gap-4">

        {

          calendarDays.map(
            (day) => {

              const date =
                `${year}-${
                  String(month + 1).padStart(2, "0")
                }-${
                  String(day).padStart(2, "0")
                }`;

              const hasUpdate =
                updates.some(
                  (u) =>
                    u.update_date ===
                    date
                );

              const isToday =
                date === today;

              const isFuture =
                date > today;

              const weekDay =
                new Date(
                  year,
                  month,
                  day
                )

                  .toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short"
                    }
                  );

              return (

                <button

                  key={day}

                  disabled={isFuture}

                  onClick={() =>
                    setSelectedDate(date)
                  }

                  className={`h-[92px] rounded-xl border transition-all flex flex-col items-center justify-center ${
                    isFuture
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : hasUpdate
                      ? "bg-green-50 border-green-300"
                      : "bg-white border-gray-300 hover:border-black"
                  } ${
                    isToday
                      ? "ring-2 ring-black"
                      : ""
                  }`}

                >

                  <p className="text-lg font-medium text-blue-500">

                    {weekDay}

                  </p>

                  <p className="text-lg text-blue-500">

                    {day}

                  </p>

                  {

                    hasUpdate && (

                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />

                    )

                  }

                </button>

              );

            }
          )

        }

      </div>

      {/* POPUP */}

      {

        selectedDate && (

          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">

            <div className="bg-white w-full max-w-3xl rounded-3xl p-8 relative max-h-[90vh] overflow-y-auto">

              {/* CLOSE */}

              <button

                onClick={() =>
                  setSelectedDate(null)
                }

                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-xl"

              >

                ×

              </button>

              {/* HEADER */}

              <div className="mb-6">

                <h2 className="text-2xl font-bold">

                  {

                    selectedDate === today

                    ? "Today's Update"

                    : "Previous Update"

                  }

                </h2>

                <p className="text-gray-500 mt-1">

                  {selectedDate}

                </p>

              </div>

              {/* FORM */}

              <div className="space-y-5">

                <input
                  type="text"
                  placeholder="Project Name"
                  value={projectName}
                  disabled={
                    selectedDate !== today
                  }
                  onChange={(e) =>
                    setProjectName(
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4"
                />

                <textarea
                  placeholder="Completed Today"
                  value={completedToday}
                  disabled={
                    selectedDate !== today
                  }
                  onChange={(e) =>
                    setCompletedToday(
                      e.target.value
                    )
                  }
                  className="w-full h-32 border border-gray-200 rounded-2xl px-5 py-4 resize-none"
                />

                <textarea
                  placeholder="Blockers"
                  value={blockers}
                  disabled={
                    selectedDate !== today
                  }
                  onChange={(e) =>
                    setBlockers(
                      e.target.value
                    )
                  }
                  className="w-full h-28 border border-gray-200 rounded-2xl px-5 py-4 resize-none"
                />

                <textarea
                  placeholder="Tomorrow Goals"
                  value={tomorrowGoals}
                  disabled={
                    selectedDate !== today
                  }
                  onChange={(e) =>
                    setTomorrowGoals(
                      e.target.value
                    )
                  }
                  className="w-full h-28 border border-gray-200 rounded-2xl px-5 py-4 resize-none"
                />

                {

                  selectedDate === today && (

                    <button

                      onClick={
                        submitUpdate
                      }

                      className="bg-black text-white px-6 py-4 rounded-2xl hover:scale-[1.02] transition-all"

                    >

                      Save Update

                    </button>

                  )

                }

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default DailyUpdates;