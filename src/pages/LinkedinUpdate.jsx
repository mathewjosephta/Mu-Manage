import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../services/supabase";

function LinkedinUpdate() {

  const [selectedWeek,
    setSelectedWeek] =
      useState(1);

  const [linkedinUrl,
    setLinkedinUrl] =
      useState("");

  const [tagFoundation,
    setTagFoundation] =
      useState(false);

  const [tagAsiet,
    setTagAsiet] =
      useState(false);

  const [submitted,
    setSubmitted] =
      useState(false);

  const [loading,
    setLoading] =
      useState(false);

  const [showSuccess,
    setShowSuccess] =
      useState(false);

  const weeks = [1, 2, 3, 4];

  // CHECK EXISTING

  useEffect(() => {

    checkExistingSubmission();

  }, [selectedWeek]);

  const checkExistingSubmission =
    async () => {

      setSubmitted(false);

      setLinkedinUrl("");

      setTagFoundation(false);

      setTagAsiet(false);

      const {

        data: sessionData

      } = await supabase.auth
        .getUser();

      const email =
        sessionData.user.email;

      const {

        data

      } = await supabase
        .from("linkedin_updates")
        .select("*")
        .eq(
          "user_email",
          email
        )
        .eq(
          "week_number",
          selectedWeek
        );

      if (
        data &&
        data.length > 0
      ) {

        const existing =
          data[0];

        setSubmitted(true);

        setLinkedinUrl(
          existing.linkedin_url
        );

        setTagFoundation(
          existing.tagged_mulearn_foundation
        );

        setTagAsiet(
          existing.tagged_mulearn_asiet
        );

      }

    };

  // SUBMIT

  const handleSubmit =
    async () => {

      if (!linkedinUrl) return;

      setLoading(true);

      const {

        data: sessionData

      } = await supabase.auth
        .getUser();

      const email =
        sessionData.user.email;

      const {

        data: userData

      } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .limit(1);

      const teamName =
        userData[0].team_name;

      const {

        error

      } = await supabase
        .from("linkedin_updates")
        .insert([{

          user_email:
            email,

          team_name:
            teamName,

          week_number:
            selectedWeek,

          linkedin_url:
            linkedinUrl,

          tagged_mulearn_foundation:
            tagFoundation,

          tagged_mulearn_asiet:
            tagAsiet

        }]);

      if (!error) {

        setSubmitted(true);

        setShowSuccess(true);

        setTimeout(() => {

          setShowSuccess(false);

        }, 1200);

      }

      setLoading(false);

    };

  return (

    <div className="min-h-screen bg-[#f5f7fb] p-10">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold mb-3">

            Weekly LinkedIn Updates

          </h1>

          <p className="text-gray-500">

            Submit your public weekly progress posts

          </p>

        </div>

        {/* WEEK SELECTOR */}

        <div className="grid grid-cols-4 gap-4 mb-8">

          {

            weeks.map((week) => (

              <button

                key={week}

                onClick={() =>
                  setSelectedWeek(week)
                }

                className={`

                  rounded-2xl p-5 border text-left transition-all

                  ${
                    selectedWeek ===
                    week

                    ? "bg-blue-600 text-white border-blue-600"

                    : "bg-white border-gray-200"

                  }

                `}
              >

                <p className="text-sm opacity-70 mb-2">

                  Sprint

                </p>

                <h2 className="text-2xl font-bold">

                  Week {week}

                </h2>

              </button>

            ))

          }

        </div>

        {/* FORM */}

        <div className="bg-white rounded-3xl p-10 shadow-sm">

          <h2 className="text-3xl font-bold mb-8">

            Week {selectedWeek} Submission

          </h2>

          <div className="space-y-8">

            {/* URL */}

            <div>

              <label className="block mb-3 font-medium">

                LinkedIn Post URL

              </label>

              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) =>
                  setLinkedinUrl(
                    e.target.value
                  )
                }
                readOnly={submitted}
                placeholder="Paste LinkedIn post link"
                className="w-full border rounded-2xl px-5 py-4 outline-none"
              />

            </div>

            {/* CHECKBOXES */}

            <div className="space-y-5">

              <label className="flex items-center gap-4">

                <input
                  type="checkbox"
                  checked={tagFoundation}
                  onChange={(e) =>
                    setTagFoundation(
                      e.target.checked
                    )
                  }
                  disabled={submitted}
                  className="w-5 h-5"
                />

                <span>

                  Tagged μLearn Foundation

                </span>

              </label>

              <label className="flex items-center gap-4">

                <input
                  type="checkbox"
                  checked={tagAsiet}
                  onChange={(e) =>
                    setTagAsiet(
                      e.target.checked
                    )
                  }
                  disabled={submitted}
                  className="w-5 h-5"
                />

                <span>

                  Tagged μLearn ASIET

                </span>

              </label>

            </div>

            {/* STATUS */}

            {

              submitted && (

                <div className="bg-green-100 text-green-700 px-5 py-4 rounded-2xl">

                  Week {selectedWeek} submitted successfully

                </div>

              )

            }

            {/* BUTTON */}

            {

              !submitted && (

                <button

                  onClick={handleSubmit}

                  disabled={loading}

                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl"

                >

                  {
                    loading
                      ? "Submitting..."
                      : `Submit Week ${selectedWeek}`
                  }

                </button>

              )

            }

          </div>

        </div>

      </div>

      {/* SUCCESS */}

      {

        showSuccess && (

          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/30 backdrop-blur-sm overflow-hidden">

            <div className="absolute w-[420px] h-[420px] rounded-full bg-green-200/30 animate-[ping_1.2s_ease-out]"></div>

            <div className="absolute w-[320px] h-[320px] rounded-full bg-green-300/30 animate-[ping_1.2s_ease-out]"></div>

            <div className="absolute w-[220px] h-[220px] rounded-full bg-green-400/20 animate-[ping_1.2s_ease-out]"></div>

            <div className="relative z-10">

              <div className="w-36 h-36 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_80px_rgba(34,197,94,0.5)]">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-20 h-20 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />

                </svg>

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default LinkedinUpdate;