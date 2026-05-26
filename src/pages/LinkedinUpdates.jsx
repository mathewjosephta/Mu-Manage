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
    );

  // FORM

  const [LinkedinUrl,
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
          "Linkedin-live"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table:
              "Linkedin_updates"

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
          "Linkedin_updates"
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

      if (!LinkedinUrl)
        return;

      await supabase

        .from(
          "Linkedin_updates"
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

          Linkedin_url:
            LinkedinUrl,

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

  // MISSING

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
              update.Linkedin_url,

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

        `Linkedin-week-${selectedWeek}.xlsx`

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

    </div>

  );

}

export default LinkedinUpdates;