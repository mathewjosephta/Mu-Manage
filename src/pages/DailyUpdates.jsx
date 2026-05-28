import {
  useEffect,
  useMemo,
  useState
} from "react";

import {

  Flame,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Download

} from "lucide-react";

import * as XLSX
from "xlsx";

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

  const [currentMonth,
    setCurrentMonth] =
      useState(
        new Date()
      );

  const [showModal,
    setShowModal] =
      useState(false);

  const [selectedDate,
    setSelectedDate] =
      useState(today);

  const [completedToday,
    setCompletedToday] =
      useState("");

  const [blockers,
    setBlockers] =
      useState("");

  const [tomorrowGoals,
    setTomorrowGoals] =
      useState("");

  const [showSuccess,
    setShowSuccess] =
      useState(false);

  // PM STATES

  const [expandedId,
    setExpandedId] =
      useState(null);

  const [filterType,
    setFilterType] =
      useState("updated");

  const [comments,
    setComments] =
      useState({});

  const [savedCommentId,
    setSavedCommentId] =
      useState(null);

  const [showExport,
    setShowExport] =
      useState(false);

  const [startDate,
    setStartDate] =
      useState(today);

  const [endDate,
    setEndDate] =
      useState(today);

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

      setUpdates(
        data || []
      );

      setLoading(false);

    };

  // STREAK

  const streak =
    useMemo(() => {

      const userDates =
        updates.map(
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

    }, [updates]);

  // CALENDAR

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

  // PM DATA

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

  const selectedDateUpdates =
    updates.filter(
      (item) =>
        item.update_date ===
        selectedDate
    );

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

  // SAVE UPDATE

  const submitUpdate =
    async () => {

      const existingUpdate =
        updates.find(
          (item) =>

            item.update_date ===
            selectedDate
        );

      // UPDATE

      if (
        existingUpdate
      ) {

        const {

          error

        } = await supabase

          .from(
            "daily_updates"
          )

          .update({

            completed_today:
              completedToday,

            blockers:
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

          alert(
            "Failed to update"
          );

          return;

        }

      }

      // CREATE

      else {

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

            project_name:
              currentUser.project_name,

            completed_today:
              completedToday,

            blockers:
              blockers,

            tomorrow_goals:
              tomorrowGoals,

            update_date:
              selectedDate

          }]);

        if (error) {

          console.log(error);

          alert(
            "Failed to save"
          );

          return;

        }

      }

      setShowModal(false);

      setCompletedToday("");
      setBlockers("");
      setTomorrowGoals("");

      fetchUpdates();

      // SUCCESS

      setShowSuccess(
        true
      );

      setTimeout(() => {

        setShowSuccess(
          false
        );

      }, 2500);

    };

  // COMMENT SAVE

  const handleCommentSave =
    async (id) => {

      const text =
        comments[id];

      if (
        !text ||
        text.trim() === ""
      ) {

        return;

      }

      const {

        error

      } = await supabase

        .from(
          "daily_updates"
        )

        .update({

          manager_comment:
            text.trim()

        })

        .eq(
          "id",
          id
        );

      if (error) {

        console.log(error);

        alert(
          "Failed to send comment"
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
                    text.trim()

                }

              : item
        )

      );

      setSavedCommentId(
        id
      );

      // SMALL SUCCESS FEEL

      setTimeout(() => {

        setSavedCommentId(
          null
        );

      }, 1800);

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

            Comment:
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

        `daily-updates.xlsx`

      );

    };

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-lg">

        Loading...

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-white">

      {/* SUCCESS */}

      {

        showSuccess && (

          <div className="fixed top-8 right-8 z-50">

            <div className="bg-black text-white px-6 py-5 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[320px]">

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">

                <Sparkles
                  size={24}
                />

              </div>

              <div>

                <h2 className="font-semibold text-lg">

                  Update Saved

                </h2>

                <p className="text-sm text-gray-300 mt-1">

                  Daily update submitted successfully

                </p>

              </div>

            </div>

          </div>

        )

      }

      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-4xl font-bold text-black">

            {

              isPM

                ? "Team Daily Updates"

                : "Daily Updates"

            }

          </h1>

          <p className="text-gray-500 mt-2">

            {
              currentUser.project_name
            }

          </p>

        </div>

        {

          !isPM && (

            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 px-5 py-3 rounded-2xl">

              <Flame
                size={22}
                className="text-orange-500"
              />

              <div>

                <h2 className="text-2xl font-bold">

                  {streak}

                </h2>

                <p className="text-sm text-gray-500">

                  Day Streak

                </p>

              </div>

            </div>

          )

        }

      </div>

      {/* PM VIEW */}

      {

        isPM && (

          <>
            <div className="flex items-center justify-between mb-6">

              <div className="flex gap-3">

                <input

                  type="date"

                  value={selectedDate}

                  onChange={(e) =>
                    setSelectedDate(
                      e.target.value
                    )
                  }

                  className="border border-gray-200 rounded-2xl px-5 py-3"

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
                      filterType === "updated"

                      ? "bg-black text-white"

                      : "border border-gray-200"
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

                      : "border border-gray-200"
                    }

                  `}

                >

                  Not Updated

                </button>

              </div>
            </div>

            {/* UPDATED */}

            {

              filterType ===
              "updated" && (

                <div className="space-y-4">

                  {

                    selectedDateUpdates.map(
                      (update) => (

                        <div

                          key={update.id}

                          className="border border-gray-200 rounded-3xl overflow-hidden"

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

                              <p className="text-gray-500 mt-1 text-left">

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

                                        className="flex-1 h-12 border border-gray-200 rounded-2xl px-4 py-3 resize-none outline-none"

                                      />

                                      <button

                                        onClick={() =>
                                          handleCommentSave(
                                            update.id
                                          )
                                        }

                                        className={`

                                          w-12 h-12
                                          rounded-2xl
                                          flex items-center justify-center
                                          transition-all duration-300
                                          hover:scale-105 active:scale-95

                                          ${
                                            savedCommentId ===
                                            update.id

                                            ? "bg-green-500 text-white"

                                            : "bg-black text-white hover:bg-gray-800"
                                          }

                                        `}

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

                                    {

                                      savedCommentId ===
                                      update.id && (

                                        <p className="text-green-600 text-sm mt-3 font-medium animate-pulse">

                                          Comment sent successfully

                                        </p>

                                      )

                                    }

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

                          className="border border-gray-200 rounded-3xl px-7 py-6"

                        >

                          <h2 className="text-xl font-medium">

                            {user}

                          </h2>

                          <p className="text-gray-500 mt-1">

                            Daily update not submitted

                          </p>

                        </div>

                      )
                    )

                  }

                </div>

              )

            }

          </>

        )

      }

    </div>

  );

}

export default DailyUpdates;