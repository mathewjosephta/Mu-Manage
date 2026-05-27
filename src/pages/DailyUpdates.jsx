import {
  useEffect,
  useMemo,
  useState
} from "react";

import * as XLSX
from "xlsx";

import {

  Flame,
  Check,
  X,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2

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

  const isPM =
    currentUser?.role ===
    "pm";

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const [updates,
    setUpdates] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [selectedDate,
    setSelectedDate] =
      useState(today);

  const [expandedId,
    setExpandedId] =
      useState(null);

  const [filterType,
    setFilterType] =
      useState(null);

  const [comments,
    setComments] =
      useState({});

  const [savedCommentId,
    setSavedCommentId] =
      useState(null);

  // EXPORT

  const [showExport,
    setShowExport] =
      useState(false);

  const [startDate,
    setStartDate] =
      useState(today);

  const [endDate,
    setEndDate] =
      useState(today);

  // MEMBER STATES

  const [currentMonth,
    setCurrentMonth] =
      useState(
        new Date()
      );

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

          .select("*")

          .order(
            "created_at",
            {
              ascending: false
            }
          );

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

      // DUMMY DATA

      const dummyUpdates = [

        {
          id: "1",
          user_name: "Fathima P Ajvad",
          project_name: "Campus Bites",
          update_date: today,
          completed_today:
            "Completed canteen dashboard UI and integrated APIs.",
          blockers:
            "Responsive issue in mobile view.",
          tomorrow_goals:
            "Fix responsiveness and start analytics page.",
          manager_comment:
            "Good work. Improve mobile responsiveness."
        },

        {
          id: "2",
          user_name: "Gayathri M Nair",
          project_name: "Make it Easy",
          update_date: today,
          completed_today:
            "Finished printer queue management module.",
          blockers:
            "Printer API unstable sometimes.",
          tomorrow_goals:
            "Improve queue performance.",
          manager_comment:
            ""
        },

        {
          id: "3",
          user_name: "Yeldo K Varghese",
          project_name: "Codenx",
          update_date:
            "2026-05-24",
          completed_today:
            "Integrated realtime campus event updates.",
          blockers:
            "Socket synchronization issue.",
          tomorrow_goals:
            "Optimize event rendering.",
          manager_comment:
            "Good progress. Fix socket issue first."
        },

        {
          id: "4",
          user_name: "Aksa Thomas",
          project_name: "Make it Easy",
          update_date:
            "2026-05-23",
          completed_today:
            "Improved printer booking workflow.",
          blockers:
            "Need admin approval flow.",
          tomorrow_goals:
            "Add approval management.",
          manager_comment:
            ""
        },

        {
          id: "5",
          user_name: "Noel Sabu",
          project_name: "Codenx",
          update_date:
            "2026-05-22",
          completed_today:
            "Created community feed UI.",
          blockers:
            "Performance lag in large feeds.",
          tomorrow_goals:
            "Implement lazy loading.",
          manager_comment:
            "Focus on optimization."
        }

      ];

      setUpdates([
        ...(data || []),
        ...dummyUpdates
      ]);

      setLoading(false);

    };

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

  // MEMBER CALENDAR

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const totalDays =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const monthName =
    currentMonth.toLocaleString(
      "default",
      {
        month: "long"
      }
    );

  // STATUS

  const getDateStatus =
    (date) => {

      const hasUpdate =
        updates.some(
          (item) =>
            item.update_date ===
            date
        );

      if (hasUpdate)
        return "submitted";

      if (date === today)
        return "today";

      if (date > today)
        return "future";

      return "missed";

    };

  // MEMBER CLICK

  const handleDayClick =
    (date) => {

      const update =
        updates.find(
          (item) =>
            item.update_date ===
            date
        );

      if (
        update
      ) {

        return;

      }

      else if (
        date === today
      ) {

        setShowModal(true);

      }

    };

  // SUBMIT UPDATE

  const submitUpdate =
    async () => {

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

        alert(
          "Already submitted today"
        );

        return;

      }

      setShowModal(false);

      setCompletedToday("");
      setBlockers("");
      setTomorrowGoals("");

      fetchUpdates();

    };

  // PM FILTER

  const selectedDateUpdates =
    updates.filter(
      (item) =>
        item.update_date ===
        selectedDate
    );

  // MEMBERS

  const allMembers = [

    "Fathima P Ajvad",
    "Swaliha C A",
    "Nandana Ramachandran",
    "Gautham Krishna",
    "Gayathri M Nair",
    "Krishnan unni",
    "Aksa Thomas",
    "Aadya Ajayan",
    "Yeldo K Varghese",
    "Sahala Mariyam P S",
    "Noel Sabu",
    "Nimal K G"

  ];

  const updatedUsers =
    selectedDateUpdates.map(
      (item) =>
        item.user_name
    );

  const pendingUsers =
    allMembers.filter(
      (member) =>
        !updatedUsers.includes(
          member
        )
    );

  // COMMENT SAVE

  const handleCommentSave =
    async (id) => {

      const text =
        comments[id];

      if (!text)
        return;

      const {

        error

      } = await supabase

        .from(
          "daily_updates"
        )

        .update({

          manager_comment:
            text

        })

        .eq(
          "id",
          id
        );

      if (error) {

        console.log(error);

        alert(
          "Failed to save comment"
        );

        return;

      }

      setUpdates(

        updates.map(
          (item) =>

            item.id === id

              ? {

                  ...item,

                  manager_comment:
                    text

                }

              : item
        )

      );

      setSavedCommentId(
        id
      );

      setTimeout(() => {

        setSavedCommentId(
          null
        );

      }, 2000);

    };

  // EXPORT

  const exportDailyUpdates =
    () => {

      const filteredData =
        updates.filter(
          (item) =>

            item.update_date >=
            startDate &&

            item.update_date <=
            endDate
        );

      if (
        filteredData.length === 0
      ) {

        alert(
          "No updates found"
        );

        return;

      }

      const exportData =
        filteredData.map(
          (item) => ({

            Name:
              item.user_name,

            Project:
              item.project_name,

            Date:
              item.update_date,

            Completed:
              item.completed_today,

            Blockers:
              item.blockers,

            TomorrowGoals:
              item.tomorrow_goals,

            ManagerComment:
              item.manager_comment || ""

          })
        );

      const worksheet =
        XLSX.utils.json_to_sheet(
          exportData
        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Daily Updates"

      );

      XLSX.writeFile(

        workbook,

        `daily-updates-${startDate}-to-${endDate}.xlsx`

      );

    };

  // LOADING

  if (loading) {

    return (

      <div className="min-h-screen bg-white flex items-center justify-center">

        <p className="text-lg text-gray-500">

          Loading...

        </p>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-white p-8">

      <h1 className="text-4xl font-bold text-black mb-2">

        {

          isPM

            ? "Team Daily Updates"

            : "Daily Updates"

        }

      </h1>

      <p className="text-gray-500 text-lg mb-10">

        {

          isPM

            ? "Track team accountability"

            : currentUser.project_name

        }

      </p>

      {

        isPM ? (

          <div>

            {/* TOP BAR */}

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

              <div className="flex gap-3">

                <input

                  type="date"

                  value={selectedDate}

                  onChange={(e) =>
                    setSelectedDate(
                      e.target.value
                    )
                  }

                  className="border border-gray-200 rounded-2xl px-5 py-3 hover:border-black transition-all"

                />

                <button

                  onClick={() =>
                    setFilterType(
                      "updated"
                    )
                  }

                  className={`

                    px-5 py-3 rounded-2xl transition-all

                    ${
                      filterType === null ||
                      filterType === "updated"

                      ? "bg-black text-white"

                      : "border border-gray-200 hover:border-black"
                    }

                  `}

                >

                  Updated

                </button>

                <button

                  onClick={() =>
                    setFilterType(
                      "pending"
                    )
                  }

                  className={`

                    px-5 py-3 rounded-2xl transition-all

                    ${
                      filterType === "pending"

                      ? "bg-black text-white"

                      : "border border-gray-200 hover:border-black"
                    }

                  `}

                >

                  Not Updated

                </button>

              </div>

              {/* EXPORT */}

              <div className="relative">

                <button

                  onClick={() =>
                    setShowExport(
                      !showExport
                    )
                  }

                  className="bg-black text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all"

                >

                  Export Data

                </button>

                {

                  showExport && (

                    <div className="absolute right-0 top-16 bg-white border border-gray-200 rounded-3xl p-5 shadow-xl w-[340px] z-50">

                      <h2 className="text-lg font-semibold mb-4">

                        Export Daily Updates

                      </h2>

                      <div className="space-y-4">

                        <div>

                          <p className="text-sm text-gray-500 mb-2">

                            Start Date

                          </p>

                          <input

                            type="date"

                            value={startDate}

                            onChange={(e) =>
                              setStartDate(
                                e.target.value
                              )
                            }

                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 hover:border-black transition-all"

                          />

                        </div>

                        <div>

                          <p className="text-sm text-gray-500 mb-2">

                            End Date

                          </p>

                          <input

                            type="date"

                            value={endDate}

                            onChange={(e) =>
                              setEndDate(
                                e.target.value
                              )
                            }

                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 hover:border-black transition-all"

                          />

                        </div>

                        <button

                          onClick={() => {

                            exportDailyUpdates();

                            setShowExport(false);

                          }}

                          className="w-full bg-black text-white py-3 rounded-2xl hover:opacity-90 transition-all"

                        >

                          Download Excel

                        </button>

                      </div>

                    </div>

                  )

                }

              </div>

            </div>

            {/* UPDATED */}

            {

              (
                filterType === null ||

                filterType === "updated"
              ) && (

                <div className="space-y-4">

                  {

                    selectedDateUpdates.map(
                      (update) => (

                        <div

                          key={update.id}

                          className="border border-gray-200 rounded-3xl overflow-hidden hover:border-black transition-all"

                        >

                          <button

                            onClick={() =>

                              setExpandedId(

                                expandedId ===
                                update.id

                                  ? null

                                  : update.id

                              )

                            }

                            className="w-full flex items-center justify-between px-7 py-6 hover:bg-gray-50 transition-all"

                          >

                            <div>

                              <h2 className="text-2xl font-semibold text-left">

                                {
                                  update.user_name
                                }

                              </h2>

                              <p className="text-gray-500 text-left mt-1">

                                {
                                  update.project_name
                                }

                              </p>

                            </div>

                            {

                              expandedId ===
                              update.id

                                ? <ChevronUp />

                                : <ChevronDown />

                            }

                          </button>

                          {

                            expandedId ===
                            update.id && (

                              <div className="px-7 pb-7 border-t border-gray-100">

                                <div className="space-y-6 mt-6">

                                  <div>

                                    <h3 className="font-semibold mb-2">

                                      Completed Today

                                    </h3>

                                    <p className="text-gray-600">

                                      {
                                        update.completed_today
                                      }

                                    </p>

                                  </div>

                                  <div>

                                    <h3 className="font-semibold mb-2">

                                      Blockers

                                    </h3>

                                    <p className="text-gray-600">

                                      {
                                        update.blockers
                                      }

                                    </p>

                                  </div>

                                  <div>

                                    <h3 className="font-semibold mb-2">

                                      Tomorrow Goals

                                    </h3>

                                    <p className="text-gray-600">

                                      {
                                        update.tomorrow_goals
                                      }

                                    </p>

                                  </div>

                                  {/* COMMENT */}

                                  <div>

                                    <h3 className="font-semibold mb-3">

                                      Manager Comment

                                    </h3>

                                    <div className="flex items-center gap-3">

                                      <textarea

                                        value={
                                          comments[
                                            update.id
                                          ] ??

                                          update.manager_comment ??

                                          ""
                                        }

                                        onChange={(e) =>

                                          setComments({

                                            ...comments,

                                            [update.id]:
                                              e.target.value

                                          })

                                        }

                                        placeholder="Write feedback..."

                                        className="flex-1 h-12 border border-gray-200 rounded-2xl px-4 py-3 resize-none outline-none focus:border-black transition-all"

                                      />

                                      <button

                                        onClick={() =>
                                          handleCommentSave(
                                            update.id
                                          )
                                        }

                                        className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 transition-all"

                                      >

                                        {

                                          savedCommentId ===
                                          update.id

                                            ? (

                                              <CheckCircle2
                                                size={18}
                                              />

                                            )

                                            : (

                                              <Send
                                                size={18}
                                              />

                                            )

                                        }

                                      </button>

                                    </div>

                                  </div>

                                </div>

                              </div>

                            )

                          }

                        </div>

                      )
                    )

                  }

                </div>

              )

            }

            {/* PENDING */}

            {

              filterType ===
              "pending" && (

                <div className="space-y-4">

                  {

                    pendingUsers.map(
                      (user, index) => (

                        <div

                          key={index}

                          className="border border-gray-200 rounded-3xl px-7 py-6 hover:border-black transition-all"

                        >

                          <h2 className="text-xl font-medium">

                            {user}

                          </h2>

                          <p className="text-gray-500 mt-1">

                            No update submitted

                          </p>

                        </div>

                      )
                    )

                  }

                </div>

              )

            }

          </div>

        ) : (

          <div className="bg-white border border-gray-200 rounded-3xl p-8">

            {/* MONTH */}

            <div className="flex items-center justify-between mb-8">

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

                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:border-black hover:bg-gray-50 transition-all"

              >

                <ChevronLeft size={20} />

              </button>

              <h2 className="text-3xl font-semibold">

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

                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:border-black hover:bg-gray-50 transition-all"

              >

                <ChevronRight size={20} />

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
                          rounded-2xl
                          border
                          flex
                          flex-col
                          items-center
                          justify-center
                          hover:scale-[1.03]
                          transition-all

                          ${
                            status ===
                            "submitted"

                            ? "bg-green-50 border-green-200"

                            : status ===
                              "today"

                            ? "bg-blue-50 border-blue-200"

                            : status ===
                              "future"

                            ? "bg-gray-50 border-gray-100 text-gray-400"

                            : "bg-red-50 border-red-100"
                          }

                        `}

                      >

                        <h2 className="text-xl font-semibold">

                          {day}

                        </h2>

                        {

                          status ===
                          "submitted"

                          ? <Check size={16} />

                          : status ===
                            "future"

                          ? <Lock size={16} />

                          : status ===
                            "missed"

                          ? <X size={16} />

                          : null

                        }

                      </button>

                    );

                  }
                )

              }

            </div>

          </div>

        )

      }

    </div>

  );

}

export default DailyUpdates;