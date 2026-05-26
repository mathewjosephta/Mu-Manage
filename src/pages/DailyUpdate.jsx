import {
  useEffect,
  useState
} from "react";

import {

  Activity,
  CalendarDays,
  Download,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  X

} from "lucide-react";

import { supabase }
from "../services/supabase";

import * as XLSX
from "xlsx";

function DailyUpdates() {

  const [updates,
    setUpdates] =
      useState([]);

  const [users,
    setUsers] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [selectedDate,
    setSelectedDate] =
      useState(

        new Date()
          .toISOString()
          .split("T")[0]

      );

  const [search,
    setSearch] =
      useState("");

  const [showModal,
    setShowModal] =
      useState(false);

  // USER

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  // FORM

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

    fetchData();

    const channel =
      supabase

        .channel(
          "daily-updates-live"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table:
              "daily_updates"

          },

          () => {

            fetchData();

          }

        )

        .subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );

    };

  }, []);

  const fetchData =
    async () => {

      setLoading(true);

      const {

        data: updateData

      } = await supabase

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

      const {

        data: userData

      } = await supabase

        .from("users")

        .select("*");

      setUpdates(
        updateData || []
      );

      setUsers(
        userData || []
      );

      setLoading(false);

    };

  // SUBMIT UPDATE

  const submitUpdate =
    async () => {

      if (
        !completedToday ||
        !tomorrowGoals
      ) return;

      await supabase

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

          team_name:
            currentUser.team_name,

          completed_today:
            completedToday,

          blockers,

          tomorrow_goals:
            tomorrowGoals

        }]);

      resetForm();

      fetchData();

    };

  // RESET

  const resetForm =
    () => {

      setCompletedToday("");

      setBlockers("");

      setTomorrowGoals("");

      setShowModal(false);

    };

  // FILTER

  const filteredUpdates =
    updates.filter(
      (update) => {

        const date =
          new Date(
            update.created_at
          )

            .toISOString()
            .split("T")[0];

        const matchesDate =
          date ===
          selectedDate;

        const matchesSearch =

          update.user_name
            ?.toLowerCase()

            .includes(
              search.toLowerCase()
            ) ||

          update.team_name
            ?.toLowerCase()

            .includes(
              search.toLowerCase()
            );

        return (

          matchesDate &&
          matchesSearch

        );

      }
    );

  // MISSING MEMBERS

  const submittedEmails =
    filteredUpdates.map(
      (update) =>
        update.user_email
    );

  const missingUsers =
    users.filter(
      (user) =>

        !submittedEmails.includes(
          user.email
        )
    );

  // EXPORT

  const exportExcel =
    () => {

      const exportData =
        filteredUpdates.map(
          (update) => ({

            Name:
              update.user_name,

            Role:
              update.role,

            Team:
              update.team_name,

            Completed:
              update.completed_today,

            Blockers:
              update.blockers,

            Tomorrow:
              update.tomorrow_goals,

            Date:
              new Date(
                update.created_at
              ).toLocaleDateString()

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

        `daily-updates-${selectedDate}.xlsx`

      );

    };

  // LOADING

  if (loading) {

    return (

      <div className="h-screen bg-[#f7f3ea] flex items-center justify-center">

        <h1 className="text-5xl font-black text-[#1d2b53]">

          Loading Updates...

        </h1>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#f7f3ea] p-8">

      {/* HEADER */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">

        <div>

          <h1 className="text-6xl font-black text-[#1d2b53]">

            Daily Updates

          </h1>

          <p className="text-[#5c6b8a] mt-3 text-xl">

            Team standups & sprint progress tracking

          </p>

        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-4">

          {/* DATE */}

          <div className="flex items-center gap-3 bg-white border-[4px] border-[#1d2b53] rounded-[24px] px-5 py-4 shadow-[4px_4px_0px_#1d2b53]">

            <CalendarDays
              size={22}
              className="text-[#5c6b8a]"
            />

            <input

              type="date"

              value={
                selectedDate
              }

              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }

              className="bg-transparent outline-none font-semibold text-[#1d2b53]"

            />

          </div>

          {/* SEARCH */}

          <div className="flex items-center gap-3 bg-white border-[4px] border-[#1d2b53] rounded-[24px] px-5 py-4 shadow-[4px_4px_0px_#1d2b53]">

            <Search
              size={22}
              className="text-[#5c6b8a]"
            />

            <input

              type="text"

              placeholder="Search..."

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

              className="bg-transparent outline-none text-[#1d2b53] font-semibold"

            />

          </div>

          {/* EXPORT */}

          <button

            onClick={
              exportExcel
            }

            className="flex items-center gap-3 bg-[#d8f7df] text-[#1d2b53] px-6 py-4 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53] font-black hover:translate-y-[2px] transition-all"

          >

            <Download size={22} />

            Export

          </button>

          {/* ADD */}

          <button

            onClick={() =>
              setShowModal(
                true
              )
            }

            className="flex items-center gap-3 bg-[#3b82f6] text-white px-6 py-4 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53] font-black hover:translate-y-[2px] transition-all"

          >

            <Activity size={22} />

            Add Update

          </button>

        </div>

      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        {/* TOTAL */}

        <div className="bg-[#dcecff] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[5px_5px_0px_#1d2b53]">

          <p className="text-[#5c6b8a] font-bold">

            Submitted Updates

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-4">

            {
              filteredUpdates.length
            }

          </h2>

        </div>

        {/* MISSING */}

        <div className="bg-[#ffe0f0] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[5px_5px_0px_#1d2b53]">

          <p className="text-[#5c6b8a] font-bold">

            Missing Updates

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-4">

            {
              missingUsers.length
            }

          </h2>

        </div>

        {/* MEMBERS */}

        <div className="bg-[#d8f7df] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[5px_5px_0px_#1d2b53]">

          <p className="text-[#5c6b8a] font-bold">

            Team Members

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-4">

            {
              users.length
            }

          </h2>

        </div>

      </div>

      {/* CONTENT */}

      <div className="grid xl:grid-cols-[1fr_350px] gap-8">

        {/* UPDATES */}

        <div className="space-y-6">

          {

            filteredUpdates.length === 0 && (

              <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] p-12 text-center shadow-[6px_6px_0px_#1d2b53]">

                <Clock3
                  size={50}
                  className="mx-auto text-[#5c6b8a]"
                />

                <h2 className="text-4xl font-black text-[#1d2b53] mt-6">

                  No Updates Found

                </h2>

              </div>

            )

          }

          {

            filteredUpdates.map(
              (update) => (

                <div

                  key={update.id}

                  className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] p-7 shadow-[6px_6px_0px_#1d2b53]"

                >

                  {/* TOP */}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                    <div>

                      <h2 className="text-3xl font-black text-[#1d2b53]">

                        {
                          update.user_name
                        }

                      </h2>

                      <div className="flex items-center gap-3 mt-2">

                        <div className="px-4 py-2 rounded-full bg-[#dcecff] border-[2px] border-[#1d2b53] text-sm font-black capitalize">

                          {
                            update.role
                          }

                        </div>

                        <div className="px-4 py-2 rounded-full bg-[#fff5b8] border-[2px] border-[#1d2b53] text-sm font-black capitalize">

                          {
                            update.team_name
                          }

                        </div>

                      </div>

                    </div>

                    <div className="text-[#5c6b8a] font-bold">

                      {

                        new Date(
                          update.created_at
                        ).toLocaleString()

                      }

                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="space-y-5">

                    {/* COMPLETED */}

                    <div className="bg-[#d8f7df] border-[3px] border-[#1d2b53] rounded-[24px] p-5">

                      <div className="flex items-center gap-3 mb-3">

                        <CheckCircle2
                          size={22}
                          className="text-[#22c55e]"
                        />

                        <h3 className="font-black text-[#1d2b53] text-xl">

                          Completed Today

                        </h3>

                      </div>

                      <p className="text-[#1d2b53] leading-8">

                        {
                          update.completed_today
                        }

                      </p>

                    </div>

                    {/* BLOCKERS */}

                    <div className="bg-[#ffe0f0] border-[3px] border-[#1d2b53] rounded-[24px] p-5">

                      <div className="flex items-center gap-3 mb-3">

                        <AlertTriangle
                          size={22}
                          className="text-red-500"
                        />

                        <h3 className="font-black text-[#1d2b53] text-xl">

                          Blockers & Issues

                        </h3>

                      </div>

                      <p className="text-[#1d2b53] leading-8">

                        {

                          update.blockers ||

                          "No blockers"

                        }

                      </p>

                    </div>

                    {/* GOALS */}

                    <div className="bg-[#dcecff] border-[3px] border-[#1d2b53] rounded-[24px] p-5">

                      <div className="flex items-center gap-3 mb-3">

                        <Clock3
                          size={22}
                          className="text-[#3b82f6]"
                        />

                        <h3 className="font-black text-[#1d2b53] text-xl">

                          Tomorrow's Goals

                        </h3>

                      </div>

                      <p className="text-[#1d2b53] leading-8">

                        {
                          update.tomorrow_goals
                        }

                      </p>

                    </div>

                  </div>

                </div>

              )
            )

          }

        </div>

        {/* MISSING */}

        <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] p-7 shadow-[6px_6px_0px_#1d2b53] h-fit sticky top-6">

          <h2 className="text-4xl font-black text-[#1d2b53] mb-6">

            Missing Updates

          </h2>

          <div className="space-y-4">

            {

              missingUsers.length === 0 && (

                <div className="bg-[#d8f7df] border-[3px] border-[#1d2b53] rounded-[22px] p-5">

                  <p className="font-black text-[#1d2b53]">

                    Everyone submitted updates 🎉

                  </p>

                </div>

              )

            }

            {

              missingUsers.map(
                (user) => (

                  <div

                    key={user.id}

                    className="bg-[#ffe0f0] border-[3px] border-red-500 rounded-[22px] p-5"

                  >

                    <h3 className="font-black text-red-600 text-lg">

                      {
                        user.name
                      }

                    </h3>

                    <p className="text-red-500 text-sm mt-1 capitalize">

                      {
                        user.team_name
                      }

                    </p>

                  </div>

                )
              )

            }

          </div>

        </div>

      </div>

      {/* MODAL */}

      {

        showModal && (

          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">

            <div className="w-full max-w-2xl bg-[#f7f3ea] border-[5px] border-[#1d2b53] rounded-[38px] overflow-hidden shadow-[10px_10px_0px_#1d2b53]">

              {/* HEADER */}

              <div className="bg-[#fff7d6] border-b-[5px] border-[#1d2b53] px-8 py-7 flex items-center justify-between">

                <div>

                  <h1 className="text-4xl font-black text-[#1d2b53]">

                    Today's Standup

                  </h1>

                  <p className="text-[#5c6b8a] mt-2">

                    Submit daily sprint update

                  </p>

                </div>

                <button

                  onClick={
                    resetForm
                  }

                  className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center"

                >

                  <X
                    size={24}
                    className="text-[#1d2b53]"
                  />

                </button>

              </div>

              {/* FORM */}

              <div className="p-8 space-y-6">

                {/* COMPLETED */}

                <div>

                  <label className="block font-black text-[#1d2b53] mb-3">

                    Completed Today

                  </label>

                  <textarea

                    rows={4}

                    value={
                      completedToday
                    }

                    onChange={(e) =>
                      setCompletedToday(
                        e.target.value
                      )
                    }

                    className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 resize-none outline-none"

                  />

                </div>

                {/* BLOCKERS */}

                <div>

                  <label className="block font-black text-[#1d2b53] mb-3">

                    Blockers & Issues

                  </label>

                  <textarea

                    rows={3}

                    value={
                      blockers
                    }

                    onChange={(e) =>
                      setBlockers(
                        e.target.value
                      )
                    }

                    className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 resize-none outline-none"

                  />

                </div>

                {/* GOALS */}

                <div>

                  <label className="block font-black text-[#1d2b53] mb-3">

                    Tomorrow's Goals

                  </label>

                  <textarea

                    rows={4}

                    value={
                      tomorrowGoals
                    }

                    onChange={(e) =>
                      setTomorrowGoals(
                        e.target.value
                      )
                    }

                    className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 resize-none outline-none"

                  />

                </div>

                {/* BUTTON */}

                <button

                  onClick={
                    submitUpdate
                  }

                  className="w-full bg-[#3b82f6] text-white py-5 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[5px_5px_0px_#1d2b53] font-black text-2xl"

                >

                  Submit Update

                </button>

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default DailyUpdates;