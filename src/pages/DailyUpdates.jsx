import {
  useEffect,
  useState
} from "react";

import {

  CalendarDays,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Download,
  Sparkles

} from "lucide-react";

import { supabase }
from "../services/supabase";

import * as XLSX
from "xlsx";

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

  // TODAY

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  // STATES

  const [selectedDate,
    setSelectedDate] =
      useState(today);

  const [updates,
    setUpdates] =
      useState([]);

  const [allMembers,
    setAllMembers] =
      useState([]);

  const [expandedId,
    setExpandedId] =
      useState(null);

  const [loading,
    setLoading] =
      useState(true);

  const [filterType,
    setFilterType] =
      useState("updated");

  const [comments,
    setComments] =
      useState({});

  const [savedCommentId,
    setSavedCommentId] =
      useState(null);

  const [showSuccess,
    setShowSuccess] =
      useState(false);

  const [showExport,
    setShowExport] =
      useState(false);

  const [startDate,
    setStartDate] =
      useState(today);

  const [endDate,
    setEndDate] =
      useState(today);

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

  // FETCH MEMBERS

  const fetchMembers =
    async () => {

      const {

        data,
        error

      } = await supabase

        .from("users")

        .select("*");

      if (error) {

        console.log(error);

        return;

      }

      setAllMembers(
        data || []
      );

    };

  // FETCH UPDATES

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

      // MEMBERS ONLY SEE THEIR DATA

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

  // LOAD

  useEffect(() => {

    fetchUpdates();
    fetchMembers();

  }, []);

  // FILTERED DATA

  const selectedDateUpdates =
    updates.filter(
      (item) =>
        item.update_date ===
        selectedDate
    );

  // UPDATED USERS

  const updatedUsers =
    selectedDateUpdates.map(
      (item) =>
        item.user_name
    );

  // NOT UPDATED USERS

  const pendingUsers =
    allMembers.filter(
      (member) =>

        !updatedUsers.includes(
          member.name
        )
    );

  // SUBMIT

  const submitUpdate =
    async () => {

      // ONLY TODAY EDITABLE

      if (
        selectedDate !==
        today
      ) {

        alert(
          "Only today's update can be edited"
        );

        return;

      }

      const existingUpdate =
        updates.find(
          (item) =>

            item.user_name ===
            currentUser.name &&

            item.update_date ===
            today
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

          .from(
            "daily_updates"
          )

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

      setShowSuccess(
        true
      );

      setTimeout(() => {

        setShowSuccess(
          false
        );

      }, 2000);

    };

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

        return;

      }

      setSavedCommentId(
        id
      );

      setTimeout(() => {

        setSavedCommentId(
          null
        );

      }, 1500);

    };

  // EXPORT

  const exportDailyUpdates =
    () => {

      const filtered =
        updates.filter(
          (item) =>

            item.update_date >=
            startDate &&

            item.update_date <=
            endDate
        );

      const exportData =
        filtered.map(
          (item) => ({

            Name:
              item.user_name,

            Project:
              item.project_name,

            Completed:
              item.completed_today,

            Blockers:
              item.blockers,

            Goals:
              item.tomorrow_goals,

            Date:
              item.update_date

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

        "daily-updates.xlsx"

      );

    };

  // LOADING

  if (loading) {

    return (

      <div className="min-h-screen bg-white flex items-center justify-center">

        Loading...

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-white p-8">

      {/* SUCCESS */}

      {

        showSuccess && (

          <div className="fixed top-8 right-8 bg-black text-white px-6 py-5 rounded-3xl flex items-center gap-3 z-50 shadow-2xl">

            <Sparkles size={20} />

            Update Saved Successfully

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

        {

          isPM && (

            <button

              onClick={() =>
                setShowExport(
                  !showExport
                )
              }

              className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl"

            >

              <Download size={18} />

              Export

            </button>

          )

        }

      </div>

      {/* MEMBER VIEW */}

      {

        !isPM && (

          <div className="border border-gray-200 rounded-3xl p-8 mb-8">

            <div className="flex items-center gap-3 mb-6">

              <CalendarDays size={24} />

              <input

                type="date"

                value={selectedDate}

                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                  )
                }

                max={today}

                className="border border-gray-200 rounded-2xl px-4 py-3"

              />

            </div>

            <div className="space-y-5">

              <input

                type="text"

                placeholder="Project Name"

                value={projectName}

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

                onChange={(e) =>
                  setCompletedToday(
                    e.target.value
                  )
                }

                className="w-full h-28 border border-gray-200 rounded-2xl px-5 py-4 resize-none"

              />

              <textarea

                placeholder="Blockers"

                value={blockers}

                onChange={(e) =>
                  setBlockers(
                    e.target.value
                  )
                }

                className="w-full h-24 border border-gray-200 rounded-2xl px-5 py-4 resize-none"

              />

              <textarea

                placeholder="Tomorrow Goals"

                value={tomorrowGoals}

                onChange={(e) =>
                  setTomorrowGoals(
                    e.target.value
                  )
                }

                className="w-full h-24 border border-gray-200 rounded-2xl px-5 py-4 resize-none"

              />

              <button

                onClick={
                  submitUpdate
                }

                className="bg-black text-white px-6 py-4 rounded-2xl"

              >

                Save Update

              </button>

            </div>

          </div>

        )

      }

      {/* PM VIEW */}

      {

        isPM && (

          <div>

            <div className="flex gap-3 mb-6">

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

                  px-5 py-3 rounded-2xl

                  ${
                    filterType ===
                    "updated"

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

                  px-5 py-3 rounded-2xl

                  ${
                    filterType ===
                    "pending"

                    ? "bg-black text-white"

                    : "border border-gray-200"
                  }

                `}

              >

                Not Updated

              </button>

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

                            className="w-full flex items-center justify-between px-7 py-6 hover:bg-gray-50"

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

                                <div className="space-y-5 mt-6">

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

                                        className="flex-1 h-12 border border-gray-200 rounded-2xl px-4 py-3 resize-none"

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

                                          ${
                                            savedCommentId ===
                                            update.id

                                            ? "bg-green-500 text-white"

                                            : "bg-black text-white"
                                          }

                                        `}

                                      >

                                        {

                                          savedCommentId ===
                                          update.id

                                            ? (

                                              <CheckCircle2 size={18} />

                                            )

                                            : (

                                              <Send size={18} />

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

            {/* NOT UPDATED */}

            {

              filterType ===
              "pending" && (

                <div className="space-y-4">

                  {

                    pendingUsers.map(
                      (user, index) => (

                        <div

                          key={index}

                          className="border border-red-100 bg-red-50 rounded-3xl px-7 py-6"

                        >

                          <h2 className="text-xl font-medium text-red-600">

                            {user.name}

                          </h2>

                          <p className="text-red-400 mt-1">

                            Daily update not submitted

                          </p>

                        </div>

                      )
                    )

                  }

                </div>

              )

            }

          </div>

        )

      }

    </div>

  );

}

export default DailyUpdates;