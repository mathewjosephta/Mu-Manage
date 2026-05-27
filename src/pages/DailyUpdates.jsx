import {
  useEffect,
  useMemo,
  useState
} from "react";

import {

  ChevronLeft,
  ChevronRight,
  Flame,
  Lock,
  CheckCircle2,
  XCircle,
  CalendarDays

} from "lucide-react";

import { supabase }
from "../services/supabase";

function DailyUpdates() {

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const [currentMonth,
    setCurrentMonth] =
      useState(
        new Date()
      );

  const [updates,
    setUpdates] =
      useState([]);

  const [selectedUpdate,
    setSelectedUpdate] =
      useState(null);

  const [loading,
    setLoading] =
      useState(true);

  const [showModal,
    setShowModal] =
      useState(false);

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

  useEffect(() => {

    fetchUpdates();

  }, []);

  const fetchUpdates =
    async () => {

      setLoading(true);

      let query =
        supabase
          .from(
            "daily_updates"
          )
          .select("*");

      // PM CAN SEE ALL

      if (
        currentUser.role !==
        "pm"
      ) {

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

  // CALENDAR

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const totalDays =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const monthName =
    currentMonth.toLocaleString(
      "default",
      {
        month: "long"
      }
    );

  // STREAK

  const streak =
    useMemo(() => {

      const userDates =
        updates

          .filter(
            (item) =>
              item.user_email ===
              currentUser.email
          )

          .map(
            (item) =>
              item.update_date
          );

      let count = 0;

      let check =
        new Date();

      while (true) {

        const formatted =
          check
            .toISOString()
            .split("T")[0];

        if (
          userDates.includes(
            formatted
          )
        ) {

          count++;

          check.setDate(
            check.getDate() - 1
          );

        }

        else {

          break;

        }

      }

      return count;

    }, [
      updates,
      currentUser.email
    ]);

  // STATUS

  const getDateStatus =
    (date) => {

      const hasUpdate =
        updates.some(
          (item) =>
            item.update_date ===
            date
        );

      if (hasUpdate) {

        return "submitted";

      }

      if (date === today) {

        return "today";

      }

      if (date > today) {

        return "future";

      }

      return "missed";

    };

  // DAY CLICK

  const handleDayClick =
    (date) => {

      const update =
        updates.find(
          (item) =>
            item.update_date ===
            date
        );

      if (update) {

        setSelectedUpdate(
          update
        );

        return;

      }

      if (date === today) {

        setShowModal(true);

      }

    };

  // SUBMIT

  const submitUpdate =
    async () => {

      if (
        !completedToday
      ) {

        alert(
          "Fill completed today"
        );

        return;

      }

      const {

        error

      } = await supabase

        .from(
          "daily_updates"
        )

        .insert([{

          user_email:
            currentUser.email,

          user_name:
            currentUser.name,

          role:
            currentUser.role,

          project_name:
            currentUser.project_name,

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

        alert(
          "Already submitted today"
        );

        return;

      }

      setCompletedToday("");
      setBlockers("");
      setTomorrowGoals("");

      setShowModal(false);

      fetchUpdates();

    };

  if (loading) {

    return (

      <div className="h-screen flex items-center justify-center">

        Loading...

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#f7f3ea] p-8">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-6xl font-black text-[#1d2b53]">

            Daily Updates

          </h1>

          <p className="text-xl text-gray-500 mt-2">

            {
              currentUser.project_name
            }

          </p>

        </div>

        <div className="bg-[#fff5b8] border-[4px] border-[#1d2b53] rounded-[28px] px-8 py-5 flex items-center gap-4">

          <Flame
            size={40}
            className="text-orange-500"
          />

          <div>

            <h2 className="text-4xl font-black">

              {streak}

            </h2>

            <p>

              Day Streak

            </p>

          </div>

        </div>

      </div>

      {/* CALENDAR */}

      <div className="bg-white rounded-[36px] border-[4px] border-[#1d2b53] p-8">

        {/* MONTH */}

        <div className="flex justify-between items-center mb-8">

          <button

            onClick={() =>
              setCurrentMonth(
                new Date(
                  year,
                  month - 1,
                  1
                )
              )
            }

          >

            <ChevronLeft />

          </button>

          <h2 className="text-5xl font-black">

            {monthName} {year}

          </h2>

          <button

            onClick={() =>
              setCurrentMonth(
                new Date(
                  year,
                  month + 1,
                  1
                )
              )
            }

          >

            <ChevronRight />

          </button>

        </div>

        {/* DAYS */}

        <div className="grid grid-cols-7 gap-4">

          {

            Array.from({
              length: firstDay
            }).map(
              (_, i) => (
                <div key={i} />
              )
            )

          }

          {

            Array.from({
              length: totalDays
            }).map(
              (_, i) => {

                const day =
                  i + 1;

                const date =
                  new Date(
                    year,
                    month,
                    day
                  )

                    .toISOString()
                    .split("T")[0];

                const status =
                  getDateStatus(
                    date
                  );

                return (

                  <button

                    key={date}

                    onClick={() =>
                      handleDayClick(
                        date
                      )
                    }

                    className={`

                      aspect-square
                      rounded-[24px]
                      border-[4px]
                      flex
                      flex-col
                      items-center
                      justify-center

                      ${
                        status ===
                        "submitted"

                        ? "bg-green-200"

                        : status ===
                          "today"

                        ? "bg-blue-200"

                        : status ===
                          "future"

                        ? "bg-gray-100"

                        : "bg-red-200"
                      }

                    `}

                  >

                    <h2 className="text-2xl font-black">

                      {day}

                    </h2>

                    {

                      status ===
                      "submitted"

                      ? <CheckCircle2 size={18} />

                      : status ===
                        "future"

                      ? <Lock size={18} />

                      : status ===
                        "missed"

                      ? <XCircle size={18} />

                      : <CalendarDays size={18} />

                    }

                  </button>

                );

              }
            )

          }

        </div>

      </div>

      {/* VIEW UPDATE */}

      {

        selectedUpdate && (

          <div className="mt-8 bg-white border-[4px] border-[#1d2b53] rounded-[30px] p-8">

            <h2 className="text-4xl font-black mb-6">

              Update Details

            </h2>

            <div className="space-y-5">

              <div>

                <h3 className="font-black">

                  Completed Today

                </h3>

                <p>

                  {
                    selectedUpdate.completed_today
                  }

                </p>

              </div>

              <div>

                <h3 className="font-black">

                  Blockers

                </h3>

                <p>

                  {
                    selectedUpdate.blockers
                  }

                </p>

              </div>

              <div>

                <h3 className="font-black">

                  Tomorrow Goals

                </h3>

                <p>

                  {
                    selectedUpdate.tomorrow_goals
                  }

                </p>

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default DailyUpdates;