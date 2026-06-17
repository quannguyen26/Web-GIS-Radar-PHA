import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  ChevronDown,
} from "lucide-react";
import formatTime from "../../lib/formatTime.js";

const AnimationControl = ({ timeline, setTimeline }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const dropdownRef = useRef(null);
  const animationRef = useRef(null);

  // Logic chạy Animation
  useEffect(() => {
    if (isPlaying && timeline.list.length > 0) {
      animationRef.current = setInterval(() => {
        setTimeline((prev) => ({
          ...prev,
          index: prev.index >= prev.list.length - 1 ? 0 : prev.index + 1,
        }));
      }, 800);
    } else {
      clearInterval(animationRef.current);
    }
    return () => clearInterval(animationRef.current);
  }, [isPlaying, timeline.list]);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNext = () => {
    setIsPlaying(false);
    setTimeline((prev) => ({
      ...prev,
      index: (prev.index + 1) % prev.list.length,
    }));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setTimeline((prev) => ({
      ...prev,
      index: (prev.index - 1 + prev.list.length) % prev.list.length,
    }));
  };
  return (
    <div className="absolute top-3 left-3 right-3 z-1000 md:top-4 md:right-4 md:left-auto md:w-80">
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md md:rounded-3xl md:p-4 dark:border-slate-700 dark:bg-slate-900/90">
        {/* Dropdown chọn thời gian */}
        <div className="relative mb-3 md:mb-4" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 transition-all hover:bg-slate-200 md:gap-3 md:rounded-2xl md:p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80"
          >
            <div className="shrink-0 text-indigo-600 dark:text-indigo-400">
              <Clock size={18} />
            </div>
            <span className="flex-1 text-left text-[13px] font-bold text-slate-700 dark:text-slate-200">
              {formatTime(timeline.list[timeline.index])}
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Menu sổ xuống (Custom List) */}
          {isDropdownOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute top-full left-0 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-indigo-500/10 duration-200 md:max-h-60 dark:border-slate-700 dark:bg-slate-900">
              {timeline.list.map((time, idx) => (
                <button
                  key={time}
                  onClick={() => {
                    setTimeline((prev) => ({ ...prev, index: idx }));
                    setIsPlaying(false);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                    timeline.index === idx
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={
                      timeline.index === idx
                        ? "font-bold text-indigo-600 dark:text-indigo-400"
                        : "font-medium"
                    }
                  >
                    {formatTime(time)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nút điều khiển */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            className="flex flex-1 items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 md:rounded-2xl md:p-2.5 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Về trước"
          >
            <SkipBack size={16} className="md:size-4.5" fill="currentColor" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex flex-2 items-center justify-center gap-2 rounded-xl p-2 font-bold shadow-lg transition-all md:rounded-2xl md:p-2.5 ${
              isPlaying
                ? "bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600 active:scale-95"
                : "bg-indigo-600 text-white shadow-indigo-600/10 hover:bg-indigo-700 active:scale-95"
            }`}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
            <span className="text-sm">{isPlaying ? "Dừng" : "Phát"}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex flex-1 items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 md:rounded-2xl md:p-2.5 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Tiếp theo"
          >
            <SkipForward size={16} className="md:size-4.5" fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimationControl;
