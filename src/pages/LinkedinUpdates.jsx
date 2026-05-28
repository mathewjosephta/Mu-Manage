import { useEffect, useState } from "react";

import {
  Search,
  Download,
  Plus,
  Lock,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import { supabase } from "../services/supabase";

import * as XLSX from "xlsx";

function LinkedinUpdates() {

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const isPM =
    currentUser?.role === "pm";

  // CURRENT WEEK

  const getCurrentWeek = () => {

    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      0,
      1
    );

    const days = Math.floor(
      (now - start) /
      (1000 * 60 * 60 * 24)
    );

    return Math.ceil(
      (days + start.getDay() + 1) / 7
    );

  };

  const currentWeek =
    Math.min(
      getCurrentWeek(),
      4
    );

  // TIMER

  const getWeekCountdown = () => {

    const now = new Date();

    const end = new Date(now);

    end.setDate(
      now.getDate() +
      (7 - now.getDay())
    );

    end.setHours(
      23,
      59,
      59,
      999
    );

    const diff = end - now;

    const days = Math.floor(
      diff /
      (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
      (
        diff %
        (1000 * 60 * 60 * 24)
      ) /
      (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (
        diff %
        (1000 * 60 * 60)
      ) /
      (1000 * 60)
    );

    return `${days}d ${hours}h ${minutes}m`;

  };

  // STATES

  const [updates, setUpdates] =
    useState([]);

  const [allMembers, setAllMembers] =
    useState([]);

  const [selectedWeek, setSelectedWeek] =
    useState(currentWeek);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filterType, setFilterType] =
    useState("updated");

  const [showModal, setShowModal] =
    useState(false);

  const [expandedId, setExpandedId] =
    useState(null);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [countdown, setCountdown] =
    useState(
      getWeekCountdown()
    );

  // FORM

  const [linkedinUrl, setLinkedinUrl] =
    useState("");

  const [demoLink, setDemoLink] =
    useState("");

  const [challenges, setChallenges] =
    useState("");

  // TIMER

  useEffect(() => {

    const interval =
      setInterval(() => {

        setCountdown(
          getWeekCountdown()
        );

      }, 60000);

    return () =>
      clearInterval(interval);

  }, []);

  // FETCH MEMBERS

  const fetchMembers = async () => {

    const { data, error } =
      await supabase
        .from("users")
        .select("*");

    if (error) {
      console.log(error);
      return;
    }

    setAllMembers(data || []);

  };

  // FETCH UPDATES

  const fetchUpdates = async () => {

    setLoading(true);

    let query =
      supabase
        .from("linkedin_updates")
        .select("*")
        .order(
          "created_at",
          { ascending: false }
        );

    if (!isPM) {

      query =
        query.eq(
          "user_email",
          currentUser.email
        );

    }

    const { data, error } =
      await query;

    if (error) {
      console.log(error);
    }

    setUpdates(data || []);

    setLoading(false);

  };

  useEffect(() => {

    fetchUpdates();
    fetchMembers();

  }, []);

  // FILTERED

  const filteredUpdates =
    updates.filter((item) => {

      const weekMatch =
        Number(item.week_number) ===
        Number(selectedWeek);

      const searchMatch =

        item.user_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        item.project_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        weekMatch &&
        searchMatch
      );

    });

  // UPDATED USERS

  const updatedUsers =
    filteredUpdates.map(
      (item) =>

        item.user_name
          ?.trim()
          ?.toLowerCase()
    );

  // PENDING USERS

  const pendingUsers =
    allMembers.filter(
      (member) =>

        !updatedUsers.includes(
          member.full_name
            ?.trim()
            ?.toLowerCase()
        )
    );

  // SUBMIT

  const submitUpdate = async () => {

    if (
      selectedWeek !== currentWeek
    ) {

      alert(
        "Only current week submission allowed"
      );

      return;

    }

    const existing =
      updates.find(
        (item) =>

          item.user_email ===
          currentUser.email &&

          Number(item.week_number) ===
          Number(selectedWeek)
      );

    // UPDATE

    if (existing) {

      const { error } =
        await supabase

          .from("linkedin_updates")

          .update({

            linkedin_url:
              linkedinUrl,

            demo_link:
              demoLink,

            challenges

          })

          .eq(
            "id",
            existing.id
          );

      if (error) {
        console.log(error);
        return;
      }

    }

    // CREATE

    else {

      const { error } =
        await supabase

          .from("linkedin_updates")

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

    }

    setShowModal(false);

    setLinkedinUrl("");
    setDemoLink("");
    setChallenges("");

    fetchUpdates();

    setShowSuccess(true);

    setTimeout(() => {

      setShowSuccess(false);

    }, 2000);

  };

  // EXPORT

  const exportExcel = () => {

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
      `week-${selectedWeek}.xlsx`
    );

  };

  if (loading) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );

  }

  return (

    <div className="p-8 min-h-screen bg-white">

      {/* SUCCESS */}

      {

        showSuccess && (

          <div className="fixed top-8 right-8 bg-black text-white px-6 py-5 rounded-3xl shadow-2xl z-50 flex items-center gap-3">

            <Sparkles size={20} />

            Update Submitted

          </div>

        )

      }

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">

        <div>

          <h1 className="text-4xl font-bold">

            Linkedin Updates

          </h1>

          <p className="text-gray-500 mt-2">

            Weekly team progress

          </p>

        </div>

        <div className="flex gap-3 flex-wrap">

          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="outline-none"
            />

          </div>

          {

            isPM && (

              <button
                onClick={exportExcel}
                className="bg-black text-white px-5 py-3 rounded-2xl"
              >
                <Download size={18} />
              </button>

            )

          }

          {

            !isPM && (

              <button
                onClick={() =>
                  setShowModal(true)
                }
                className="bg-black text-white px-5 py-3 rounded-2xl flex items-center gap-2"
              >

                <Plus size={18} />

                Submit

              </button>

            )

          }

        </div>

      </div>

      {/* WEEK */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        {

          [1,2,3,4].map((week) => {

            const current =
              week === currentWeek;

            return (

              <button

                key={week}

                onClick={() =>
                  setSelectedWeek(week)
                }

                className={`

                  h-[100px]
                  rounded-3xl
                  border
                  transition-all

                  ${
                    selectedWeek === week

                    ? "bg-black text-white border-black"

                    : "border-gray-200"
                  }

                `}

              >

                <div className="flex flex-col items-center justify-center">

                  <span className="font-semibold">

                    Week {week}

                  </span>

                  {

                    current ? (

                      <p className="text-xs mt-2 opacity-80">

                        Ends in {countdown}

                      </p>

                    ) : (

                      <div className="flex items-center gap-1 text-xs mt-2 opacity-60">

                        <Lock size={12} />

                        View Only

                      </div>

                    )

                  }

                </div>

              </button>

            );

          })

        }

      </div>

      {/* FILTERS */}

      {

        isPM && (

          <div className="flex gap-3 mb-8">

            <button

              onClick={() =>
                setFilterType("updated")
              }

              className={`

                px-5 py-3 rounded-2xl

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
                setFilterType("pending")
              }

              className={`

                px-5 py-3 rounded-2xl

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

        )

      }

      {/* UPDATED */}

      {

        filterType === "updated" && (

          <div className="space-y-4">

            {

              filteredUpdates.map((update) => (

                <div
                  key={update.id}
                  className="border border-gray-200 rounded-3xl overflow-hidden"
                >

                  <button

                    onClick={() =>

                      setExpandedId(

                        expandedId === update.id
                          ? null
                          : update.id

                      )

                    }

                    className="w-full px-7 py-6 flex items-center justify-between hover:bg-gray-50"

                  >

                    <div>

                      <h2 className="text-2xl font-semibold text-left">

                        {update.user_name}

                      </h2>

                      <p className="text-gray-500 text-left mt-1">

                        {update.project_name}

                      </p>

                    </div>

                    {

                      expandedId === update.id

                      ? <ChevronUp />

                      : <ChevronDown />

                    }

                  </button>

                </div>

              ))

            }

          </div>

        )

      }

      {/* NOT UPDATED */}

      {

        filterType === "pending" && (

          <div className="space-y-4">

            {

              pendingUsers.map((user,index) => (

                <div
                  key={index}
                  className="border border-red-100 bg-red-50 rounded-3xl px-7 py-6"
                >

                  <h2 className="text-xl text-red-600 font-medium">

                    {user.full_name}

                  </h2>

                  <p className="text-red-400 mt-1">

                    Linkedin update not submitted

                  </p>

                </div>

              ))

            }

          </div>

        )

      }

    </div>

  );

}

export default LinkedinUpdates;