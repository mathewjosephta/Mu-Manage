import {
  useEffect,
  useState
} from "react";

import {

  Briefcase,
  CalendarDays,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
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
    ) || {

      name: "Guest",
      email: "guest@test.com",
      role: "member",
      team_name: "core"

    };

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

  }, []);

  const fetchData =
    async () => {

      setLoading(true);

      const {

        data: updateData,
        error: updateError

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

      if (updateError) {

        console.log(
          updateError
        );

      }

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
              update.challenges

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

          Loading...

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

            Weekly accountability tracking

          </p>

        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-4">

          {/* WEEK */}

          <div className="flex items-center gap-3 bg-white border-[4px] border-[#1d2b53] rounded-[24px] px-5 py-4">

            <CalendarDays
              size={22}
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

              className="bg-transparent outline-none"

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

          <div className="flex items-center gap-3 bg-white border-[4px] border-[#1d2b53] rounded-[24px] px-5 py-4">

            <Search
              size={22}
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

              className="bg-transparent outline-none"

            />

          </div>

          {/* EXPORT */}

          <button

            onClick={
              exportExcel
            }

            className="flex items-center gap-3 bg-[#d8f7df] px-6 py-4 rounded-[24px] border-[4px] border-[#1d2b53] font-black"

          >

            <Download
              size={22}
            />

            Export

          </button>

          {/* ADD */}

          <button

            onClick={() =>
              setShowModal(
                true
              )
            }

            className="flex items-center gap-3 bg-[#2563eb] text-white px-6 py-4 rounded-[24px] border-[4px] border-[#1d2b53] font-black"

          >

            <Briefcase
              size={22}
            />

            Add Update

          </button>

        </div>

      </div>

      {/* LIST */}

      <div className="grid gap-6">

        {

          filteredUpdates.map(
            (update) => (

              <div

                key={update.id}

                className="bg-white border-[4px] border-[#1d2b53] rounded-[30px] p-7"

              >

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h2 className="text-3xl font-black text-[#1d2b53]">

                      {
                        update.user_name
                      }

                    </h2>

                    <p className="text-[#5c6b8a] mt-2">

                      {
                        update.team_name
                      }

                    </p>

                  </div>

                  <div className="bg-[#dcecff] border-[3px] border-[#1d2b53] rounded-full px-5 py-3 font-black">

                    Week {
                      update.week_number
                    }

                  </div>

                </div>

                <a

                  href={
                    update.linkedin_url
                  }

                  target="_blank"

                  rel="noreferrer"

                  className="flex items-center gap-3 text-blue-600 font-bold"

                >

                  <ExternalLink
                    size={20}
                  />

                  Open Linkedin Post

                </a>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default LinkedinUpdates;