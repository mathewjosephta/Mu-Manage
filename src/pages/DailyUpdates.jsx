import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Flame,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

import { supabase } from "../services/supabase";
import * as XLSX from "xlsx";

function DailyUpdates() {

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isPM = currentUser?.role === "pm";
  const today = new Date().toLocaleDateString("en-CA");

  // ─── SHARED STATES ───────────────────────────────────────────
  const [updates, setUpdates] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // ─── MEMBER STATES ────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(null);
  const [completedToday, setCompletedToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [tomorrowGoals, setTomorrowGoals] = useState("");

  // ─── PM STATES ────────────────────────────────────────────────
  const [pmSelectedDate, setPmSelectedDate] = useState(today);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(today);
  const [exportEndDate, setExportEndDate] = useState(today);
  const [exportLoading, setExportLoading] = useState(false);

  // PM calendar navigation
  const [pmCalMonth, setPmCalMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // ─── FETCH ────────────────────────────────────────────────────
  const fetchUpdates = async () => {
    setLoading(true);
    let query = supabase
      .from("daily_updates")
      .select("*")
      .order("update_date", { ascending: false });

    if (!isPM) {
      query = query.eq("user_email", currentUser.email);
    }

    const { data, error } = await query;
    if (error) console.log(error);
    setUpdates(data || []);
    setLoading(false);
  };

  // Fetch all member users for PM "not updated" list
  const fetchMembers = async () => {
    if (!isPM) return;
    const { data, error } = await supabase
      .from("users")
      .select("email, name")
      .eq("role", "member");
    if (!error && data) setAllMembers(data);
  };

  useEffect(() => {
    fetchUpdates();
    fetchMembers();
  }, []);

  // ─── MEMBER: load form data on date select ────────────────────
  useEffect(() => {
    if (!selectedDate) return;
    const existing = updates.find(u => u.update_date === selectedDate);
    if (existing) {
      setCompletedToday(existing.completed_today || "");
      setBlockers(existing.blockers || "");
      setTomorrowGoals(existing.tomorrow_goals || "");
    } else {
      setCompletedToday("");
      setBlockers("");
      setTomorrowGoals("");
    }
  }, [selectedDate, updates]);

  // ─── MEMBER: CALENDAR ─────────────────────────────────────────
  const memberCalendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year, month, days: Array.from({ length: daysInMonth }, (_, i) => i + 1) };
  }, []);

  // ─── MEMBER: STREAK ───────────────────────────────────────────
  const streak = useMemo(() => {
    const dates = updates.map(u => u.update_date);
    let count = 0;
    let current = new Date();
    while (true) {
      const date = current.toLocaleDateString("en-CA");
      if (dates.includes(date)) {
        count++;
        current.setDate(current.getDate() - 1);
      } else break;
    }
    return count;
  }, [updates]);

  // ─── MEMBER: SUBMIT ───────────────────────────────────────────
  const submitUpdate = async () => {
    if (selectedDate !== today) {
      alert("Only today's update can be edited");
      return;
    }
    try {
      const existingUpdate = updates.find(u => u.update_date === today);
      if (existingUpdate) {
        const { error } = await supabase
          .from("daily_updates")
          .update({ completed_today: completedToday, blockers, tomorrow_goals: tomorrowGoals })
          .eq("id", existingUpdate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("daily_updates")
          .insert([{
            user_email: currentUser.email,
            user_name: currentUser.name,
            completed_today: completedToday,
            blockers,
            tomorrow_goals: tomorrowGoals,
            update_date: today
          }]);
        if (error) throw error;
      }
      await fetchUpdates();
      setSelectedDate(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2200);
    } catch (err) {
      console.log(err);
      alert(err.message || "Submission failed");
    }
  };

  // ─── PM: filtered updates for selected date ───────────────────
  const pmDateUpdates = useMemo(() => {
    return updates.filter(u => u.update_date === pmSelectedDate);
  }, [updates, pmSelectedDate]);

  // Members who have NOT updated on selected PM date
  const notUpdatedMembers = useMemo(() => {
    const updatedEmails = pmDateUpdates.map(u => u.user_email);
    return allMembers.filter(m => !updatedEmails.includes(m.email));
  }, [pmDateUpdates, allMembers]);

  // ─── PM: CALENDAR helpers ─────────────────────────────────────
  const pmDaysInMonth = new Date(pmCalMonth.year, pmCalMonth.month + 1, 0).getDate();
  const pmCalDays = Array.from({ length: pmDaysInMonth }, (_, i) => i + 1);

  const pmMonthHasUpdate = (day) => {
    const date = `${pmCalMonth.year}-${String(pmCalMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return updates.some(u => u.update_date === date);
  };

  const pmDayToDate = (day) =>
    `${pmCalMonth.year}-${String(pmCalMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const monthLabel = new Date(pmCalMonth.year, pmCalMonth.month, 1)
    .toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setPmCalMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    const now = new Date();
    setPmCalMonth(prev => {
      if (prev.year === now.getFullYear() && prev.month === now.getMonth()) return prev;
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  // ─── PM: EXPORT ───────────────────────────────────────────────
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const { data, error } = await supabase
        .from("daily_updates")
        .select("*")
        .gte("update_date", exportStartDate)
        .lte("update_date", exportEndDate)
        .order("update_date", { ascending: true })
        .order("user_name", { ascending: true });

      if (error) throw error;

      const rows = (data || []).map(u => ({
        "Date": u.update_date,
        "Member Name": u.user_name,
        "Email": u.user_email,
        "Completed Today": u.completed_today || "",
        "Blockers": u.blockers || "",
        "Tomorrow Goals": u.tomorrow_goals || ""
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      // Column widths
      ws["!cols"] = [
        { wch: 14 }, { wch: 22 }, { wch: 28 },
        { wch: 40 }, { wch: 30 }, { wch: 35 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Daily Updates");
      XLSX.writeFile(wb, `daily_updates_${exportStartDate}_to_${exportEndDate}.xlsx`);
      setShowExportModal(false);
    } catch (err) {
      alert(err.message || "Export failed");
    }
    setExportLoading(false);
  };

  // ─── LOADING ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // PM VIEW
  // ═══════════════════════════════════════════════════════════════
  if (isPM) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Daily Updates</h1>
            <p className="text-gray-500 mt-1">Track your team's daily progress</p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-medium hover:bg-gray-800 active:scale-95 transition-all"
          >
            <Download size={16} />
            Export to Excel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

          {/* LEFT: PM CALENDAR */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 h-fit">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold text-gray-800">{monthLabel}</span>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>

            {/* Offset for first day */}
            {(() => {
              const firstDow = new Date(pmCalMonth.year, pmCalMonth.month, 1).getDay();
              const cells = Array(firstDow).fill(null).concat(pmCalDays);
              return (
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, idx) => {
                    if (!day) return <div key={`e-${idx}`} />;
                    const date = pmDayToDate(day);
                    const isSelected = date === pmSelectedDate;
                    const hasUpd = pmMonthHasUpdate(day);
                    const isFuture = date > today;
                    const isToday = date === today;
                    return (
                      <button
                        key={day}
                        disabled={isFuture}
                        onClick={() => setPmSelectedDate(date)}
                        className={`
                          relative h-9 w-full rounded-xl text-sm font-medium transition-all
                          ${isFuture ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}
                          ${isSelected ? "bg-black text-white hover:bg-black" : ""}
                          ${isToday && !isSelected ? "ring-2 ring-black ring-offset-1" : ""}
                        `}
                      >
                        {day}
                        {hasUpd && !isSelected && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Has updates
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 border-2 border-black rounded-full" />
                Today
              </span>
            </div>
          </div>

          {/* RIGHT: UPDATES FOR SELECTED DATE */}
          <div>
            {/* Date heading */}
            <div className="flex items-center gap-3 mb-5">
              <Calendar size={18} className="text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-800">
                {pmSelectedDate === today ? "Today — " : ""}{pmSelectedDate}
              </h2>
              <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {pmDateUpdates.length} update{pmDateUpdates.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Status summary: updated vs not updated */}
            {allMembers.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Updated ({pmDateUpdates.length})</span>
                  </div>
                  {pmDateUpdates.length === 0 ? (
                    <p className="text-sm text-green-600 opacity-60">None yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {pmDateUpdates.map(u => (
                        <span key={u.id} className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">
                          {u.user_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={16} className="text-red-500" />
                    <span className="text-sm font-semibold text-red-600">Not Updated ({notUpdatedMembers.length})</span>
                  </div>
                  {notUpdatedMembers.length === 0 ? (
                    <p className="text-sm text-red-500 opacity-60">Everyone's updated!</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {notUpdatedMembers.map(m => (
                        <span key={m.email} className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Update cards */}
            {pmDateUpdates.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
                <p className="text-gray-400 text-lg">No updates submitted for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pmDateUpdates.map(update => (
                  <div key={update.id} className="bg-white border border-gray-200 rounded-3xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{update.user_name}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">{update.user_email}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle size={12} />
                        Submitted
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: "Completed Today", value: update.completed_today },
                        { label: "Blockers", value: update.blockers },
                        { label: "Tomorrow Goals", value: update.tomorrow_goals }
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-2xl p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
                          <p className="text-sm text-gray-800 leading-relaxed">{value || <span className="text-gray-400 italic">—</span>}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* EXPORT MODAL */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-5">
            <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative">
              <button
                onClick={() => setShowExportModal(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center">
                  <Download size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Export Updates</h2>
                  <p className="text-sm text-gray-500">Download as Excel spreadsheet</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Start Date</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    max={today}
                    onChange={e => setExportStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:border-black transition-all text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">End Date</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    max={today}
                    min={exportStartDate}
                    onChange={e => setExportEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:border-black transition-all text-gray-800"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={exportLoading}
                className="mt-7 w-full h-[54px] rounded-2xl bg-black text-white font-medium hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {exportLoading ? "Exporting..." : (
                  <>
                    <Download size={16} />
                    Download Excel
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // MEMBER VIEW (unchanged flow, can view past updates read-only)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-white p-8">

      {/* SUCCESS TOAST */}
      {showSuccess && (
        <div className="fixed top-8 right-8 z-[100] animate-successAppear">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-[28px] px-6 py-5 flex items-center gap-4 min-w-[320px]">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-full bg-green-400/20 animate-wave1" />
              <div className="w-10 h-10 rounded-full bg-green-500 relative flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Progress Saved</h2>
              <p className="text-sm text-gray-500 mt-1">Daily update submitted successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Daily Updates</h1>
          <p className="text-gray-500 mt-2">Track daily team progress</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 text-orange-500 px-5 py-3 rounded-2xl">
          <Flame size={18} />
          {streak} Day Streak
        </div>
      </div>

      {/* MEMBER CALENDAR */}
      <div className="grid grid-cols-7 gap-4">
        {memberCalendar.days.map((day) => {
          const date = `${memberCalendar.year}-${String(memberCalendar.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasUpdate = updates.some(u => u.update_date === date);
          const isToday = date === today;
          const isFuture = date > today;
          const weekDay = new Date(memberCalendar.year, memberCalendar.month, day)
            .toLocaleDateString("en-US", { weekday: "short" });

          return (
            <button
              key={day}
              disabled={isFuture}
              onClick={() => setSelectedDate(date)}
              className={`h-[92px] rounded-xl border transition-all flex flex-col items-center justify-center ${
                isFuture
                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  : hasUpdate
                  ? "bg-green-50 border-green-300"
                  : "bg-white border-gray-300 hover:border-black"
              } ${isToday ? "ring-2 ring-black" : ""}`}
            >
              <p className="text-lg font-medium text-blue-500">{weekDay}</p>
              <p className="text-lg text-blue-500">{day}</p>
              {hasUpdate && <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />}
            </button>
          );
        })}
      </div>

      {/* MEMBER POPUP */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white w-full max-w-xl rounded-[32px] p-7 relative shadow-2xl animate-successAppear">
            <button
              onClick={() => setSelectedDate(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl"
            >
              ×
            </button>

            <div className="mb-7">
              <h2 className="text-3xl font-bold">
                {selectedDate === today ? "Today's Update" : "Previous Update"}
              </h2>
              <p className="text-gray-500 mt-2">{selectedDate}</p>
              {selectedDate !== today && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full inline-block mt-2">
                  View only — past updates cannot be edited
                </p>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Completed Today</label>
                <textarea
                  value={completedToday}
                  disabled={selectedDate !== today}
                  onChange={e => setCompletedToday(e.target.value)}
                  placeholder="What did you complete today?"
                  className="w-full h-24 border border-gray-200 rounded-2xl px-5 py-4 resize-none outline-none focus:border-black transition-all disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Blockers</label>
                <textarea
                  value={blockers}
                  disabled={selectedDate !== today}
                  onChange={e => setBlockers(e.target.value)}
                  placeholder="Mention blockers"
                  className="w-full h-20 border border-gray-200 rounded-2xl px-5 py-4 resize-none outline-none focus:border-black transition-all disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Tomorrow Goals</label>
                <textarea
                  value={tomorrowGoals}
                  disabled={selectedDate !== today}
                  onChange={e => setTomorrowGoals(e.target.value)}
                  placeholder="Tomorrow's plan"
                  className="w-full h-20 border border-gray-200 rounded-2xl px-5 py-4 resize-none outline-none focus:border-black transition-all disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
              {selectedDate === today && (
                <button
                  type="button"
                  onClick={submitUpdate}
                  className="w-full h-[58px] rounded-2xl bg-black text-white font-medium hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Save Update
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyUpdates;