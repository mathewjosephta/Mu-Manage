import {
  useEffect,
  useState
} from "react";

import {

  Download,
  Search,
  ExternalLink,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Lock

} from "lucide-react";

import { supabase }
from "../services/supabase";

import * as XLSX
from "xlsx";

function LinkedinUpdates() {

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "user"
      )
    );

  const isPM =
    currentUser?.role ===
    "pm";

  // CURRENT WEEK

  const getCurrentWeek =
    () => {

      const now =
        new Date();

      const start =
        new Date(
          now.getFullYear(),
          0,
          1
        );

      const days =
        Math.floor(

          (
            now - start
          ) /

          (
            24 * 60 * 60 * 1000
          )
        );

      return Math.ceil(
        (
          days +
          start.getDay() +
          1
        ) / 7
      );

    };

  // LIMIT TO 4 WEEKS

  const actualWeek =
    getCurrentWeek();

  const currentWeek =
    actualWeek > 4
      ? 4
      : actualWeek;

  // TIMER

  const getWeekCountdown =
    () => {

      const now =
        new Date();

      const endOfWeek =
        new Date(now);

      endOfWeek.setDate(
        now.getDate() +
        (
          7 - now.getDay()
        )
      );

      endOfWeek.setHours(
        23,
        59,
        59,
        999
      );

      const diff =
        endOfWeek - now;

      const days =
        Math.floor(
          diff /
          (
            1000 * 60 * 60 * 24
          )
        );

      const hours =
        Math.floor(

          (
            diff %

            (
              1000 * 60 * 60 * 24
            )
          ) /

          (
            1000 * 60 * 60
          )
        );

      const minutes =
        Math.floor(

          (
            diff %

            (
              1000 * 60 * 60
            )
          ) /

          (
            1000 * 60
          )
        );

      return `${days}d ${hours}h ${minutes}m`;

    };

  // STATES

  const [updates,
    setUpdates] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [search,
    setSearch] =
      useState("");

  const [selectedWeek,
    setSelectedWeek] =
      useState(
        currentWeek
      );

  const [showModal,
    setShowModal] =
      useState(false);

  const [expandedId,
    setExpandedId] =
      useState(null);

  const [showSuccess,
    setShowSuccess] =
      useState(false);

  const [countdown,
    setCountdown] =
      useState(
        getWeekCountdown()
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

  // LIVE TIMER

  useEffect(() => {

    const interval =
      setInterval(() => {

        setCountdown(
          getWeekCountdown()
        );

      }, 60000);

    return () =>
      clearInterval(
        interval
      );

  }, []);

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
            "linkedin_updates"
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

      const dummyLinkedinPosts = [

        {
          id: 101,

          user_email:
            "mathew@mumange.com",

          user_name:
            "Mathew Joseph",

          role:
            "member",

          project_name:
            "μManage",

          week_number: 1,

          linkedin_url:
            "https://linkedin.com",

          demo_link:
            "https://mu-manage.vercel.app",

          challenges:
            "Implemented role based routing and fixed Supabase authentication flow."
        },

        {
          id: 102,

          user_email:
            "gayathri@mumange.com",

          user_name:
            "Gayathri M Nair",

          role:
            "member",

          project_name:
            "Make it Easy",

          week_number: 2,

          linkedin_url:
            "https://linkedin.com",

          demo_link:
            "https://github.com",

          challenges:
            "Responsive issue in mobile layouts."
        },

        {
          id: 103,

          user_email:
            "yeldo@mumange.com",

          user_name:
            "Yeldo K Varghese",

          role:
            "member",

          project_name:
            "Codenx",

          week_number: 3,

          linkedin_url:
            "https://linkedin.com",

          demo_link:
            "https://figma.com",

          challenges:
            "Realtime synchronization issues."
        }

      ];

      setUpdates([
        ...(data || []),
        ...dummyLinkedinPosts
      ]);

      setLoading(false);

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

          update.project_name
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

  // SUBMIT

  const submitUpdate =
    async () => {

      // ONLY CURRENT WEEK

      if (
        selectedWeek !==
        currentWeek
      ) {

        alert(
          "You can only submit progress for current week"
        );

        return;

      }

      if (!linkedinUrl) {

        alert(
          "Add Linkedin URL"
        );

        return;

      }

      const {

        error

      } = await supabase

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

          project_name:
            currentUser.project_name,

          week_number:
            selectedWeek,

          linkedin_url:
            linkedinUrl,

          demo_link:
            demoLink,

          challenges

        }]);

      if (error) {

        console.log(error);

        return;

      }

      setLinkedinUrl("");
      setDemoLink("");
      setChallenges("");

      setShowModal(false);

      fetchUpdates();

      setShowSuccess(
        true
      );

      setTimeout(() => {

        setShowSuccess(
          false
        );

      }, 2200);

    };

  // EXPORT

  const exportExcel =
    () => {

      const exportData =
        filteredUpdates.map(
          (item) => ({

            Name:
              item.user_name,

            Project:
              item.project_name,

            Week:
              item.week_number,

            Linkedin:
              item.linkedin_url,

            Demo:
              item.demo_link,

            Challenges:
              item.challenges

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

      {/* SUCCESS */}

      {

        showSuccess && (

          <div className="fixed top-8 right-8 z-50">

            <div className="bg-black text-white px-6 py-5 rounded-3xl shadow-2xl flex items-center gap-4">

              <Sparkles size={22} />

              <div>

                <h2 className="font-semibold text-lg">

                  Update Submitted

                </h2>

                <p className="text-sm text-gray-300">

                  Weekly Linkedin update saved

                </p>

              </div>

            </div>

          </div>

        )

      }

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

        <div>

          <h1 className="text-4xl font-bold text-black">

            {

              isPM

                ? "Team Linkedin Updates"

                : "Linkedin Updates"

            }

          </h1>

          <p className="text-gray-500 mt-2 text-lg">

            Weekly progress tracking

          </p>

        </div>

        <div className="flex flex-wrap gap-4">

          {/* SEARCH */}

          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-5 py-4">

            <Search
              size={20}
              className="text-gray-500"
            />

            <input

              type="text"

              placeholder="Search"

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

              className="outline-none text-[15px]"

            />

          </div>

          {/* EXPORT */}

          {

            isPM && (

              <button

                onClick={
                  exportExcel
                }

                className="flex items-center gap-3 bg-black text-white px-6 py-4 rounded-2xl"

              >

                <Download
                  size={18}
                />

                Export

              </button>

            )

          }

          {/* SUBMIT BUTTON */}

          {

            !isPM && (

              <button

                onClick={() =>
                  setShowModal(
                    true
                  )
                }

                className="flex items-center gap-3 bg-black text-white px-6 py-4 rounded-2xl"

              >

                <Plus
                  size={18}
                />

                Submit Progress

              </button>

            )

          }

        </div>

      </div>

      {/* WEEK SELECTOR */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        {

          [1, 2, 3, 4].map(
            (week) => {

              const isCurrent =
                week ===
                currentWeek;

              return (

                <button

                  key={week}

                  onClick={() => {

                    // VIEW ANY WEEK

                    setSelectedWeek(
                      week
                    );

                  }}

                  className={`

                    h-[100px]
                    rounded-3xl
                    border
                    transition-all
                    font-semibold
                    text-lg
                    cursor-pointer

                    ${
                      selectedWeek ===
                      week

                      ? "bg-black text-white border-black"

                      : "bg-white border-gray-200 hover:border-black hover:scale-[1.02]"
                    }

                  `}

                >

                  <div className="flex flex-col items-center justify-center">

                    <span>

                      Week {week}

                    </span>

                    {

                      isCurrent ? (

                        <p className="text-xs mt-2 opacity-80">

                          Ends in {countdown}

                        </p>

                      ) : (

                        <div className="flex items-center gap-1 mt-2 text-xs opacity-60">

                          <Lock size={12} />

                          View Only

                        </div>

                      )

                    }

                  </div>

                </button>

              );

            }
          )

        }

      </div>

      {/* DATA */}

      <div className="space-y-4">

        {

          filteredUpdates.map(
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

                  className="w-full flex items-center justify-between px-7 py-6 hover:bg-gray-50 transition-all cursor-pointer"

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

                            Linkedin Post

                          </h3>

                          <a

                            href={
                              update.linkedin_url
                            }

                            target="_blank"

                            rel="noreferrer"

                            className="text-blue-600 flex items-center gap-2 hover:underline"

                          >

                            Open Link

                            <ExternalLink
                              size={16}
                            />

                          </a>

                        </div>

                        <div>

                          <h3 className="font-semibold mb-2">

                            Demo Link

                          </h3>

                          <a

                            href={
                              update.demo_link
                            }

                            target="_blank"

                            rel="noreferrer"

                            className="text-blue-600 flex items-center gap-2 hover:underline"

                          >

                            Open Link

                            <ExternalLink
                              size={16}
                            />

                          </a>

                        </div>

                        <div>

                          <h3 className="font-semibold mb-2">

                            Challenges

                          </h3>

                          <p className="text-gray-600">

                            {
                              update.challenges
                            }

                          </p>

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

      {/* MODAL */}

      {

        showModal && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-3xl w-full max-w-2xl p-8 relative">

              <button

                onClick={() =>
                  setShowModal(
                    false
                  )
                }

                className="absolute top-6 right-6 w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"

              >

                <X size={18} />

              </button>

              <h2 className="text-3xl font-bold mb-2">

                Weekly Linkedin Update

              </h2>

              <p className="text-gray-500 mb-8">

                Week {selectedWeek}

              </p>

              <div className="space-y-5">

                <input

                  type="text"

                  placeholder="Linkedin Post URL"

                  value={linkedinUrl}

                  onChange={(e) =>
                    setLinkedinUrl(
                      e.target.value
                    )
                  }

                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none"

                />

                <input

                  type="text"

                  placeholder="Demo / GitHub Link"

                  value={demoLink}

                  onChange={(e) =>
                    setDemoLink(
                      e.target.value
                    )
                  }

                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none"

                />

                <textarea

                  placeholder="Challenges faced this week"

                  value={challenges}

                  onChange={(e) =>
                    setChallenges(
                      e.target.value
                    )
                  }

                  className="w-full h-32 border border-gray-200 rounded-2xl px-5 py-4 resize-none outline-none"

                />

                <button

                  onClick={
                    submitUpdate
                  }

                  className="w-full bg-black text-white py-4 rounded-2xl font-medium hover:opacity-90 transition-all"

                >

                  Submit Weekly Update

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