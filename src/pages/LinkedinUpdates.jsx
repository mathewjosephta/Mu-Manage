import {
  useEffect,
  useState
} from "react";

import {

  Linkedin,
  CalendarDays,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  X,
  ExternalLink

} from "lucide-react";

import { supabase }
from "../services/supabase";

import * as XLSX
from "xlsx";

function LinkedinUpdates() {

  const [updates,
    setUpdates] =
      useState([]);

  const [users,
    setUsers] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [search,
    setSearch] =
      useState("");

  const [selectedWeek,
    setSelectedWeek] =
      useState(1);

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

  const [linkedinUrl,
    setLinkedinUrl] =
      useState("");

  const [demoLink,
    setDemoLink] =
      useState("");

  const [challenges,
    setChallenges] =
      useState("");

  const [tagFoundation,
    setTagFoundation] =
      useState(false);

  const [tagAsiet,
    setTagAsiet] =
      useState(false);

  // FETCH

  useEffect(() => {

    fetchData();

    const channel =
      supabase

        .channel(
          "linkedin-live"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table:
              "linkedin_updates"

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
          "linkedin_updates"
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

  // SUBMIT

  const submitUpdate =
    async () => {

      if (!linkedinUrl)
        return;

      await supabase

        .from(
          "linkedin_updates"
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

          week_number:
            selectedWeek,

          linkedin_url:
            linkedinUrl,

          demo_link:
            demoLink,

          challenges,

          tagged_foundation:
            tagFoundation,

          tagged_asiet:
            tagAsiet

        }]);

      resetForm();

      fetchData();

    };

  // RESET

  const resetForm =
    () => {

      setLinkedinUrl("");

      setDemoLink("");

      setChallenges("");

      setTagFoundation(false);

      setTagAsiet(false);

      setShowModal(false);

    };

  // FILTER

  const filteredUpdates =
    updates.filter(
      (update) => {

        const matchesWeek =

          update.week_number ===
          selectedWeek;

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

          matchesWeek &&
          matchesSearch

        );

      }
    );

  // MISSING USERS

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

            Week:
              update.week_number,

            Linkedin:
              update.linkedin_url,

            Demo:
              update.demo_link,

            Challenges:
              update.challenges,

            Foundation:
              update.tagged_foundation,

            ASIET:
              update.tagged_asiet

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

        "Linkedin Updates"

      );

      XLSX.writeFile(

        workbook,

        `linkedin-week-${selectedWeek}.xlsx`

      );

    };

  // LOADING

  if (loading) {

    return (

      <div className="h-screen bg-[#f7f3ea] flex items-center justify-center">

        <h1 className="text-5xl font-black text-[#1d2b53]">

          Loading Linkedin Updates...

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

            Linkedin Updates

          </h1>

          <p className="text-[#5c6b8a] mt-3 text-xl">

            Weekly public accountability tracking

          </p>

        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-4">

          {/* WEEK */}

          <div className="flex items-center gap-3 bg-white border-[4px] border-[#1d2b53] rounded-[24px] px-5 py-4 shadow-[4px_4px_0px_#1d2b53]">

            <CalendarDays
              size={22}
              className="text-[#5c6b8a]"
            />

            <select

              value={
                selectedWeek
              }

              onChange={(e) =>
                setSelectedWeek(
                  Number(
                    e.target.value
                  )
                )
              }

              className="bg-transparent outline-none font-semibold text-[#1d2b53]"

            >

              <option value={1}>
                Week 1
              </option>

              <option value={2}>
                Week 2
              </option>

              <option value={3}>
                Week 3
              </option>

              <option value={4}>
                Week 4
              </option>

            </select>

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

            className="flex items-center gap-3 bg-[#2563eb] text-white px-6 py-4 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[4px_4px_0px_#1d2b53] font-black hover:translate-y-[2px] transition-all"

          >

            <Linkedin
              size={22}
            />

            Add Update

          </button>

        </div>

      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <div className="bg-[#dcecff] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[5px_5px_0px_#1d2b53]">

          <p className="text-[#5c6b8a] font-bold">

            Submitted

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-4">

            {
              filteredUpdates.length
            }

          </h2>

        </div>

        <div className="bg-[#ffe0f0] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[5px_5px_0px_#1d2b53]">

          <p className="text-[#5c6b8a] font-bold">

            Missing

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-4">

            {
              missingUsers.length
            }

          </h2>

        </div>

        <div className="bg-[#d8f7df] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[5px_5px_0px_#1d2b53]">

          <p className="text-[#5c6b8a] font-bold">

            Completion %

          </p>

          <h2 className="text-6xl font-black text-[#1d2b53] mt-4">

            {

              users.length > 0

                ? Math.round(
                    (
                      filteredUpdates.length /
                      users.length
                    ) * 100
                  )

                : 0

            }%

          </h2>

        </div>

      </div>

      {/* CONTENT */}

      <div className="grid xl:grid-cols-[1fr_350px] gap-8">

        {/* UPDATES */}

        <div className="space-y-6">

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

                    <div className="bg-[#d8f7df] border-[3px] border-[#1d2b53] rounded-full px-5 py-3 font-black text-[#1d2b53]">

                      Week {
                        update.week_number
                      }

                    </div>

                  </div>

                  {/* LINKS */}

                  <div className="space-y-5">

                    {/* LINKEDIN */}

                    <a

                      href={
                        update.linkedin_url
                      }

                      target="_blank"

                      rel="noreferrer"

                      className="flex items-center justify-between bg-[#dcecff] border-[3px] border-[#1d2b53] rounded-[24px] p-5 hover:translate-y-[2px] transition-all"

                    >

                      <div>

                        <h3 className="font-black text-[#1d2b53] text-xl">

                          Linkedin Post

                        </h3>

                        <p className="text-[#5c6b8a] mt-2 truncate max-w-[600px]">

                          {
                            update.linkedin_url
                          }

                        </p>

                      </div>

                      <ExternalLink
                        size={24}
                        className="text-[#1d2b53]"
                      />

                    </a>

                    {/* DEMO */}

                    {

                      update.demo_link && (

                        <a

                          href={
                            update.demo_link
                          }

                          target="_blank"

                          rel="noreferrer"

                          className="flex items-center justify-between bg-[#fff5b8] border-[3px] border-[#1d2b53] rounded-[24px] p-5 hover:translate-y-[2px] transition-all"

                        >

                          <div>

                            <h3 className="font-black text-[#1d2b53] text-xl">

                              Demo Link

                            </h3>

                            <p className="text-[#5c6b8a] mt-2 truncate max-w-[600px]">

                              {
                                update.demo_link
                              }

                            </p>

                          </div>

                          <ExternalLink
                            size={24}
                            className="text-[#1d2b53]"
                          />

                        </a>

                      )

                    }

                    {/* CHALLENGES */}

                    <div className="bg-[#ffe0f0] border-[3px] border-[#1d2b53] rounded-[24px] p-5">

                      <div className="flex items-center gap-3 mb-3">

                        <AlertTriangle
                          size={22}
                          className="text-red-500"
                        />

                        <h3 className="font-black text-[#1d2b53] text-xl">

                          Challenges Faced

                        </h3>

                      </div>

                      <p className="text-[#1d2b53] leading-8">

                        {

                          update.challenges ||

                          "No challenges added"

                        }

                      </p>

                    </div>

                    {/* TAGS */}

                    <div className="flex flex-wrap gap-4">

                      <div className={`

                        flex items-center gap-3
                        px-5 py-4 rounded-[22px]
                        border-[3px] border-[#1d2b53]

                        ${
                          update.tagged_foundation

                          ? "bg-[#d8f7df]"

                          : "bg-[#ffe0f0]"
                        }

                      `}>

                        {

                          update.tagged_foundation

                          ? <CheckCircle2 size={20} />

                          : <X size={20} />

                        }

                        <span className="font-black text-[#1d2b53]">

                          μLearn Foundation

                        </span>

                      </div>

                      <div className={`

                        flex items-center gap-3
                        px-5 py-4 rounded-[22px]
                        border-[3px] border-[#1d2b53]

                        ${
                          update.tagged_asiet

                          ? "bg-[#d8f7df]"

                          : "bg-[#ffe0f0]"
                        }

                      `}>

                        {

                          update.tagged_asiet

                          ? <CheckCircle2 size={20} />

                          : <X size={20} />

                        }

                        <span className="font-black text-[#1d2b53]">

                          μLearn ASIET

                        </span>

                      </div>

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

            Missing Submissions

          </h2>

          <div className="space-y-4">

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

            {

              missingUsers.length === 0 && (

                <div className="bg-[#d8f7df] border-[3px] border-[#1d2b53] rounded-[22px] p-5">

                  <p className="font-black text-[#1d2b53]">

                    Everyone submitted 🎉

                  </p>

                </div>

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

                    Weekly Linkedin Update

                  </h1>

                  <p className="text-[#5c6b8a] mt-2">

                    Submit weekly accountability report

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

                <input

                  type="text"

                  placeholder="Linkedin Post URL"

                  value={
                    linkedinUrl
                  }

                  onChange={(e) =>
                    setLinkedinUrl(
                      e.target.value
                    )
                  }

                  className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none"

                />

                <input

                  type="text"

                  placeholder="Demo Link (Optional)"

                  value={demoLink}

                  onChange={(e) =>
                    setDemoLink(
                      e.target.value
                    )
                  }

                  className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none"

                />

                <textarea

                  rows={4}

                  placeholder="Challenges Faced"

                  value={
                    challenges
                  }

                  onChange={(e) =>
                    setChallenges(
                      e.target.value
                    )
                  }

                  className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 resize-none outline-none"

                />

                {/* CHECKBOX */}

                <div className="space-y-4">

                  <label className="flex items-center gap-4 bg-white border-[3px] border-[#1d2b53] rounded-[22px] px-5 py-4">

                    <input

                      type="checkbox"

                      checked={
                        tagFoundation
                      }

                      onChange={(e) =>
                        setTagFoundation(
                          e.target.checked
                        )
                      }

                      className="w-6 h-6"

                    />

                    <span className="font-black text-[#1d2b53]">

                      Tagged μLearn Foundation

                    </span>

                  </label>

                  <label className="flex items-center gap-4 bg-white border-[3px] border-[#1d2b53] rounded-[22px] px-5 py-4">

                    <input

                      type="checkbox"

                      checked={
                        tagAsiet
                      }

                      onChange={(e) =>
                        setTagAsiet(
                          e.target.checked
                        )
                      }

                      className="w-6 h-6"

                    />

                    <span className="font-black text-[#1d2b53]">

                      Tagged μLearn ASIET

                    </span>

                  </label>

                </div>

                {/* BUTTON */}

                <button

                  onClick={
                    submitUpdate
                  }

                  className="w-full bg-[#2563eb] text-white py-5 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[5px_5px_0px_#1d2b53] font-black text-2xl"

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

export default LinkedinUpdates;