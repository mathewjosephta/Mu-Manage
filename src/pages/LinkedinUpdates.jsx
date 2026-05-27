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
  Plus,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2

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

  const [expandedId,
    setExpandedId] =
      useState(null);

  const [comments,
    setComments] =
      useState({});

  const [savedCommentId,
    setSavedCommentId] =
      useState(null);

  const [filterType,
    setFilterType] =
      useState(null);

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

      // DUMMY DATA

      const dummyLinkedinPosts = [

        {
          id: 1,

          user_name:
            "Fathima P Ajvad",

          project_name:
            "Campus Bites",

          week_number: 1,

          linkedin_url:
            "https://linkedin.com",

          demo_link:
            "https://vercel.com",

          challenges:
            "Responsive issue in analytics dashboard.",

          manager_comment:
            "Good consistency. Improve visual hierarchy.",

          post_status:
            "posted"
        },

        {
          id: 2,

          user_name:
            "Gayathri M Nair",

          project_name:
            "Make it Easy",

          week_number: 1,

          linkedin_url:
            "https://linkedin.com",

          demo_link:
            "https://github.com",

          challenges:
            "Printer API instability.",

          manager_comment:
            "",

          post_status:
            "posted"
        },

        {
          id: 3,

          user_name:
            "Yeldo K Varghese",

          project_name:
            "Codenx",

          week_number: 2,

          linkedin_url:
            "https://linkedin.com",

          demo_link:
            "https://figma.com",

          challenges:
            "Realtime sync issue.",

          manager_comment:
            "Add screenshots next time.",

          post_status:
            "posted"
        },

        {
          id: 4,

          user_name:
            "Noel Sabu",

          project_name:
            "Codenx",

          week_number: 3,

          linkedin_url:
            "https://linkedin.com",

          demo_link:
            "",

          challenges:
            "Performance lag in feeds.",

          manager_comment:
            "",

          post_status:
            "draft"
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

  const submittedUsers =
    filteredUpdates.map(
      (item) =>
        item.user_name
    );

  const pendingUsers =
    allMembers.filter(
      (member) =>
        !submittedUsers.includes(
          member
        )
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
          "linkedin_updates"
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
              item.challenges,

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

    <div className="min-h-screen bg-white p-8">

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

          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-5 py-4 hover:border-black transition-all">

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

              className="outline-none bg-transparent text-[15px] cursor-pointer"

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

          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-5 py-4 hover:border-black transition-all">

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

                className="flex items-center gap-3 bg-black text-white px-6 py-4 rounded-2xl text-[15px] font-medium hover:opacity-90 transition-all"

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

                className="flex items-center gap-3 bg-black text-white px-6 py-4 rounded-2xl text-[15px] font-medium hover:opacity-90 transition-all"

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

      {/* FILTER BUTTONS */}

      {

        isPM && (

          <div className="flex gap-3 mb-6">

            <button

              onClick={() =>
                setFilterType(
                  "submitted"
                )
              }

              className={`

                px-5 py-3 rounded-2xl transition-all

                ${
                  filterType === null ||
                  filterType === "submitted"

                  ? "bg-black text-white"

                  : "border border-gray-200 hover:border-black"
                }

              `}

            >

              Submitted

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

              Not Submitted

            </button>

          </div>

        )

      }

      {/* SUBMITTED */}

      {

        (
          filterType === null ||

          filterType === "submitted"
        ) && (

          <div className="space-y-4">

            {

              filteredUpdates.map(
                (update) => (

                  <div

                    key={update.id}

                    className="border border-gray-200 rounded-3xl overflow-hidden hover:border-black transition-all"

                  >

                    {/* HEADER */}

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

                        <h2 className="text-2xl font-semibold text-left text-black">

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

                      <div className="flex items-center gap-4">

                        <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium">

                          Week {
                            update.week_number
                          }

                        </div>

                        {

                          expandedId ===
                          update.id

                            ? <ChevronUp />

                            : <ChevronDown />

                        }

                      </div>

                    </button>

                    {/* CONTENT */}

                    {

                      expandedId ===
                      update.id && (

                        <div className="px-7 pb-7 border-t border-gray-100">

                          <div className="space-y-6 mt-6">

                            <a

                              href={
                                update.linkedin_url
                              }

                              target="_blank"

                              rel="noreferrer"

                              className="flex items-center gap-3 text-black font-medium hover:opacity-70 transition-all"

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

                                  className="flex items-center gap-3 text-gray-600 hover:text-black transition-all"

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

                                  <h3 className="font-semibold text-black mb-2">

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

                            {/* COMMENT */}

                            {

                              isPM && (

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

                              )

                            }

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

                      Linkedin update not submitted

                    </p>

                  </div>

                )
              )

            }

          </div>

        )

      }

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

                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none hover:border-black focus:border-black transition-all"

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

                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none hover:border-black focus:border-black transition-all"

                />

                <textarea

                  placeholder="Challenges faced"

                  value={challenges}

                  onChange={(e) =>
                    setChallenges(
                      e.target.value
                    )
                  }

                  className="w-full h-32 border border-gray-200 rounded-2xl px-5 py-4 outline-none resize-none hover:border-black focus:border-black transition-all"

                />

                <div className="flex gap-4">

                  <button

                    onClick={
                      submitUpdate
                    }

                    className="flex-1 bg-black text-white py-4 rounded-2xl font-medium hover:opacity-90 transition-all"

                  >

                    Submit

                  </button>

                  <button

                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }

                    className="flex-1 border border-gray-200 py-4 rounded-2xl font-medium hover:border-black transition-all"

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