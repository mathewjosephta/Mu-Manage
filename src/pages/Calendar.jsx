import { useEffect, useState }
from "react";

import Calendar
from "react-calendar";

import "react-calendar/dist/Calendar.css";

function CalendarPage() {

  const [date, setDate] =
    useState(new Date());

  const [today, setToday] =
    useState(new Date());

  const [selectedDate, setSelectedDate] =
    useState(null);

  useEffect(() => {

    setToday(new Date());

  }, []);

  // CHECK IF FUTURE DATE

  const isFutureDate = (date) => {

    return (
      date >
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
    );

  };

  // HANDLE DAY CLICK

  const handleDateClick = (value) => {

    if (isFutureDate(value)) {

      alert(
        "Future dates are locked"
      );

      return;

    }

    setSelectedDate(value);

  };

  return (

    <div className="min-h-screen bg-[#f5f7fb] p-10">

      <div className="max-w-5xl mx-auto">

        <div className="mb-8">

          <h1 className="text-4xl font-bold mb-2">
            Daily Progress Calendar
          </h1>

          <p className="text-gray-500">
            Submit daily sprint updates
          </p>

        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">

          <Calendar

            onClickDay={
              handleDateClick
            }

            value={date}

            className="w-full border-none"

            tileDisabled={({
              date
            }) =>
              isFutureDate(date)
            }

          />

        </div>

        {

          selectedDate && (

            <div className="bg-white mt-8 rounded-3xl shadow-lg p-8">

              <h2 className="text-2xl font-bold mb-6">

                Submit Progress

              </h2>

              <p className="mb-6 text-gray-500">

                Selected Date:

                {" "}

                {
                  selectedDate
                    .toDateString()
                }

              </p>

              <textarea

                placeholder="What did you complete today?"

                className="w-full border rounded-2xl p-4 h-40"

              />

              <button
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl"
              >

                Submit Update

              </button>

            </div>

          )

        }

      </div>

    </div>

  );

}

export default CalendarPage;