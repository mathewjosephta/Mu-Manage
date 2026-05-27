import {
  useEffect,
  useState
} from "react";

import {

  Briefcase,
  Download,
  Search,
  ExternalLink,
  CalendarDays,
  Plus

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
      useState(1);

  const [showModal,
    setShowModal] =
      useState(false);

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

      // MEMBERS SEE ONLY THEIR DATA

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

      if (!linkedinUrl) {

        alert(
          "Add linkedin URL"
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

    <div className="min-h-screen bg-white">

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

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-4">

          {/* WEEK */}

          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-5 py-4">

            <CalendarDays
              size={20}
              className="text-gray-500"
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

              className="outline-none bg-transparent text-[15px]"

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

                className="flex items-center gap-3 bg-black text-white px-6 py-4 rounded-2xl text-[15px] font-medium"

              >

                <Download
                  size={18}
                />

                Export

              </button>

            )

          }

          {/* ADD */}

          {

            !isPM && (

              <button

                onClick={() =>
                  setShowModal(
                    true
                  )
                }

                className="flex items-center gap-3 bg-black text-white px-6 py-4 rounded-2xl text-[15px] font-medium"

              >

                <Plus
                  size={18}
                />

                Add Update

              </button>

            )

          }

        </div>

      </div>

      {/* LIST */}

      <div className="grid gap-5">

        {

          filteredUpdates.map(
            (update) => (

              <div

                key={update.id}

                className="border border-gray-200 rounded-3xl p-6"

              >

                <div className="flex items-start justify-between mb-5">

                  <div>

                    <h2 className="text-2xl font-semibold text-black">

                      {
                        update.user_name
                      }

                    </h2>

                    <p className="text-gray-500 mt-1">

                      {
                        update.project_name
                      }

                    </p>

                  </div>

                  <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium">

                    Week {
                      update.week_number
                    }

                  </div>

                </div>

                <div className="space-y-4">

                  <a

                    href={
                      update.linkedin_url
                    }

                    target="_blank"

                    rel="noreferrer"

                    className="flex items-center gap-3 text-black font-medium"

                  >

                    <ExternalLink
                      size={18}
                    />

                    Open Linkedin Post

                  </a>

                  {

                    update.demo_link && (

                      <a

                        href={
                          update.demo_link
                        }

                        target="_blank"

                        rel="noreferrer"

                        className="flex items-center gap-3 text-gray-600"

                      >

                        <Briefcase
                          size={18}
                        />

                        Open Demo

                      </a>

                    )

                  }

                  {

                    update.challenges && (

                      <div>

                        <h3 className="font-medium text-black mb-2">

                          Challenges

                        </h3>

                        <p className="text-gray-600 leading-relaxed">

                          {
                            update.challenges
                          }

                        </p>

                      </div>

                    )

                  }

                </div>

              </div>

            )
          )

        }

      </div>

      {/* MODAL */}

      {

        showModal && (

          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6">

            <div className="bg-white w-full max-w-xl rounded-3xl p-8">

              <h2 className="text-3xl font-semibold text-black mb-8">

                Add Linkedin Update

              </h2>

              <div className="space-y-5">

                <input

                  type="text"

                  placeholder="Linkedin post URL"

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

                  placeholder="Demo/project link"

                  value={demoLink}

                  onChange={(e) =>
                    setDemoLink(
                      e.target.value
                    )
                  }

                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none"

                />

                <textarea

                  placeholder="Challenges faced"

                  value={challenges}

                  onChange={(e) =>
                    setChallenges(
                      e.target.value
                    )
                  }

                  className="w-full h-32 border border-gray-200 rounded-2xl px-5 py-4 outline-none resize-none"

                />

                <div className="flex gap-4">

                  <button

                    onClick={
                      submitUpdate
                    }

                    className="flex-1 bg-black text-white py-4 rounded-2xl font-medium"

                  >

                    Submit

                  </button>

                  <button

                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }

                    className="flex-1 border border-gray-200 py-4 rounded-2xl font-medium"

                  >

                    Cancel

                  </button>

                </div>

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default LinkedinUpdates;