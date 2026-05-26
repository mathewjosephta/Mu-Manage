import {
  Clock3,
  CheckCheck,
  Check
} from "lucide-react";

function ChatBubble({

  message,
  currentUser

}) {

  // OWN MESSAGE

  const isMine =

    message.sender_email ===
    currentUser?.email;

  // TIME

  const formatTime =
    (timestamp) => {

      if (!timestamp)
        return "";

      const date =
        new Date(timestamp);

      return date.toLocaleTimeString(
        "en-IN",

        {

          hour: "numeric",

          minute: "2-digit"

        }

      );

    };

  // ROLE COLORS

  const roleColors = {

    pm: "bg-[#ffe0f0]",

    lead: "bg-[#fff5b8]",

    member: "bg-[#dcecff]"

  };

  return (

    <div className={`

      flex w-full

      ${
        isMine

        ? "justify-end"

        : "justify-start"
      }

    `}>

      <div className="max-w-[72%]">

        {/* USER INFO */}

        <div className={`

          flex items-center gap-3 mb-3

          ${
            isMine

            ? "justify-end"

            : "justify-start"
          }

        `}>

          {/* LEFT AVATAR */}

          {

            !isMine && (

              <div className={`

                w-12 h-12 rounded-2xl
                border-[3px]
                border-[#1d2b53]
                flex items-center justify-center
                font-black text-lg
                text-[#1d2b53]

                ${
                  roleColors[
                    message.sender_role
                  ] ||

                  "bg-white"
                }

              `}>

                {

                  message.sender_name?.[0]

                }

              </div>

            )

          }

          {/* NAME */}

          <div className={

            isMine
            ? "text-right"
            : ""

          }>

            <div className="flex items-center gap-3">

              <h3 className="font-black text-[#1d2b53] text-lg">

                {
                  message.sender_name
                }

              </h3>

              {/* ROLE */}

              <div className={`

                px-3 py-1 rounded-full
                border-[2px]
                border-[#1d2b53]
                text-xs font-black capitalize
                text-[#1d2b53]

                ${
                  roleColors[
                    message.sender_role
                  ] ||

                  "bg-white"
                }

              `}>

                {
                  message.sender_role
                }

              </div>

            </div>

            <div className={`

              flex items-center gap-2
              text-[#5c6b8a]
              text-sm mt-1

              ${
                isMine

                ? "justify-end"

                : ""
              }

            `}>

              <span className="capitalize">

                {
                  message.team_name
                }

              </span>

              <span>

                •

              </span>

              <div className="flex items-center gap-1">

                <Clock3
                  size={14}
                />

                <span>

                  {

                    formatTime(
                      message.created_at
                    )

                  }

                </span>

              </div>

            </div>

          </div>

          {/* RIGHT AVATAR */}

          {

            isMine && (

              <div className={`

                w-12 h-12 rounded-2xl
                border-[3px]
                border-[#1d2b53]
                flex items-center justify-center
                font-black text-lg
                text-[#1d2b53]

                ${
                  roleColors[
                    message.sender_role
                  ] ||

                  "bg-white"
                }

              `}>

                {

                  message.sender_name?.[0]

                }

              </div>

            )

          }

        </div>

        {/* MESSAGE */}

        <div className={`

          rounded-[30px]
          border-[4px]
          border-[#1d2b53]
          px-7 py-6
          shadow-[5px_5px_0px_#1d2b53]
          break-words
          relative

          ${
            isMine

            ? "bg-[#3b82f6] text-white"

            : "bg-white text-[#1d2b53]"
          }

        `}>

          {/* MESSAGE TEXT */}

          <p className="leading-8 text-[16px] whitespace-pre-wrap">

            {
              message.message
            }

          </p>

          {/* IMAGE */}

          {

            message.image_url && (

              <img

                src={
                  message.image_url
                }

                alt="chat"

                className="mt-5 rounded-[22px] border-[3px] border-[#1d2b53] max-h-[350px] object-cover"

              />

            )

          }

          {/* FILE */}

          {

            message.file_url && (

              <a

                href={
                  message.file_url
                }

                target="_blank"

                rel="noreferrer"

                className={`

                  mt-5 flex items-center gap-3
                  rounded-[22px]
                  border-[3px]
                  px-5 py-4
                  font-bold

                  ${
                    isMine

                    ? "bg-white text-[#1d2b53] border-white"

                    : "bg-[#dcecff] text-[#1d2b53] border-[#1d2b53]"
                  }

                `}

              >

                📎 Download File

              </a>

            )

          }

          {/* STATUS */}

          {

            isMine && (

              <div className="flex justify-end mt-4">

                <div className="flex items-center gap-2 text-sm">

                  {

                    message.is_read

                    ? (

                      <>

                        <CheckCheck
                          size={16}
                        />

                        <span>

                          Seen

                        </span>

                      </>

                    )

                    : (

                      <>

                        <Check
                          size={16}
                        />

                        <span>

                          Sent

                        </span>

                      </>

                    )

                  }

                </div>

              </div>

            )

          }

        </div>

      </div>

    </div>

  );

}

export default ChatBubble;