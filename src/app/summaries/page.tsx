"use client";

import { useState, useEffect } from "react";
import { useSummaries } from "@/context/SummaryContext";
import { motion } from "framer-motion";
import SummaryModal from "@/components/SummaryModal";
import { MeetingSummary } from "@/types/summary";
import { Search, Calendar, FileText, Clock, Tag } from "lucide-react";

export default function SummariesPage() {
  const { summaries, loading, error } = useSummaries();
  const [selectedSummary, setSelectedSummary] = useState<MeetingSummary | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [columns, setColumns] = useState(3);

  // Responsive columns based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setView("list"); // Auto-switch to list view on mobile
      } else if (width >= 768 && width < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openSummary = (summary: MeetingSummary) => {
    setSelectedSummary(summary);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Filter summaries based on search term
  const filteredSummaries = loading
    ? []
    : searchTerm.trim() === ""
    ? summaries
    : summaries.filter(
        (summary) =>
          (summary.title?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (summary.filename.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          summary.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Render the skeleton cards while loading
  const renderSkeletonCards = () => {
    return (
      <>
        {view === "grid" ? (
          <div
            className={`grid grid-cols-1 ${
              columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
            } gap-4`}
          >
            {[...Array(6)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden h-64 flex flex-col animate-pulse"
              >
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="bg-slate-700/50 p-2.5 rounded-lg w-10 h-10"></div>
                      <div className="min-w-0 flex-1">
                        <div className="h-6 bg-slate-700/50 rounded-lg w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-700/30 rounded-lg w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-5 bg-slate-700/30 rounded-md w-32 mt-4"></div>
                  <div className="flex-1 flex items-end justify-end mt-4">
                    <div className="h-6 bg-slate-700/30 rounded-md w-28"></div>
                  </div>
                </div>
                <div className="px-5 sm:px-6 py-3 border-t border-slate-700/50 flex justify-end bg-slate-800/70">
                  <div className="h-6 bg-slate-700/40 rounded-lg w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={`skeleton-list-${index}`}
                className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-72 flex-shrink-0">
                    <div className="flex items-center mb-3">
                      <div className="bg-slate-700/50 p-2 rounded-lg w-8 h-8 mr-3"></div>
                      <div className="h-5 bg-slate-700/50 rounded-lg w-40"></div>
                    </div>
                    <div className="h-4 bg-slate-700/30 rounded-lg w-48 mb-3 ml-1"></div>
                    <div className="h-4 bg-slate-700/30 rounded-lg w-32 ml-1"></div>
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div className="flex-1 flex items-center justify-end">
                      <div className="h-6 bg-slate-700/30 rounded-md w-28"></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-700/30 flex justify-end">
                      <div className="h-6 bg-slate-700/40 rounded-lg w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-8 lg:px-20">
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 border border-indigo-800/30 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-300">
            Meeting Summaries
          </span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          View and search through all your meeting summaries
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search summaries..."
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 w-full sm:w-72 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 rounded-lg flex items-center justify-center transition-all flex-1 sm:flex-initial ${
              view === "grid"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                : "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 rounded-lg flex items-center justify-center transition-all flex-1 sm:flex-initial ${
              view === "list"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                : "bg-slate-800/80 text-gray-300 hover:bg-slate-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            List
          </button>
        </div>
      </div>

      {loading ? (
        renderSkeletonCards()
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-200 text-center">
          <h3 className="text-xl font-semibold mb-2">
            Error Loading Summaries
          </h3>
          <p>{error}</p>
        </div>
      ) : filteredSummaries.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
          <p className="text-gray-300">
            No summaries match your search criteria.
          </p>
        </div>
      ) : view === "grid" ? (
        <div
          className={`grid grid-cols-1 ${
            columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
          } gap-4`}
        >
          {filteredSummaries.map((summary) => (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group h-full flex flex-col"
              onClick={() => openSummary(summary)}
            >
              <div className="p-5 sm:p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-2.5 rounded-lg text-indigo-400 flex-shrink-0">
                      <FileText size={18} className="flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {summary.title ? (
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 truncate group-hover:text-indigo-300 transition-colors">
                          {summary.title}
                        </h3>
                      ) : (
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 truncate group-hover:text-indigo-300 transition-colors">
                          Untitled Summary
                        </h3>
                      )}
                      <p className="text-xs sm:text-sm text-gray-400 truncate">
                        {summary.filename}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-4 mb-2 bg-slate-800/80 py-1.5 px-3 rounded-md w-fit">
                  <Calendar size={12} className="mr-1.5 flex-shrink-0" />
                  <span className="truncate">
                    {formatDate(summary.created_at)}
                  </span>
                </div>

                {/* Empty flex space */}
                <div className="flex-1"></div>
              </div>
              <div className="px-5 sm:px-6 py-3 border-t border-slate-700/50 flex justify-end bg-slate-800/70">
                <button
                  className="text-indigo-400 hover:text-indigo-300 text-xs sm:text-sm font-medium group-hover:underline flex items-center bg-gradient-to-r from-indigo-900/0 via-indigo-900/0 to-indigo-900/0 group-hover:from-indigo-900/0 group-hover:via-indigo-900/5 group-hover:to-indigo-900/20 py-1.5 px-3 rounded-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSummary(summary);
                  }}
                >
                  View Details
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1.5 transition-transform group-hover:translate-x-1"
                    key={`arrow-${summary.id}`}
                  >
                    <path d="M5 12h14" key={`path1-${summary.id}`}></path>
                    <path d="m12 5 7 7-7 7" key={`path2-${summary.id}`}></path>
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSummaries.map((summary) => (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group"
              onClick={() => openSummary(summary)}
            >
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4">
                <div className="sm:w-72 flex-shrink-0">
                  <div className="flex items-center mb-3">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-2 rounded-lg text-indigo-400 mr-3 flex-shrink-0">
                      <Tag size={14} className="flex-shrink-0" />
                    </div>
                    <p className="text-sm text-gray-300 truncate font-medium group-hover:text-indigo-300 transition-colors">
                      {summary.title || "Untitled Summary"}
                    </p>
                  </div>
                  <div className="flex items-center mb-3 ml-1 pl-1 border-l border-slate-700">
                    <FileText
                      size={12}
                      className="text-indigo-400/60 mr-2 flex-shrink-0"
                    />
                    <p className="text-xs text-gray-500 truncate">
                      {summary.filename}
                    </p>
                  </div>
                  <div className="flex items-center ml-1 pl-1 border-l border-slate-700">
                    <Clock
                      size={12}
                      className="text-indigo-400/60 mr-2 flex-shrink-0"
                    />
                    <p className="text-xs text-gray-500 truncate">
                      {formatDate(summary.created_at)}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  {/* Empty flex space */}
                  <div className="flex-1"></div>
                  <div className="mt-3 pt-3 border-t border-slate-700/30 flex justify-end">
                    <button
                      className="text-indigo-400 hover:text-indigo-300 text-xs sm:text-sm font-medium group-hover:underline flex items-center bg-gradient-to-r from-indigo-900/0 via-indigo-900/0 to-indigo-900/0 group-hover:from-indigo-900/0 group-hover:via-indigo-900/5 group-hover:to-indigo-900/20 py-1.5 px-3 rounded-lg transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSummary(summary);
                      }}
                    >
                      View Details
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1.5 transition-transform group-hover:translate-x-1"
                        key={`list-arrow-${summary.id}`}
                      >
                        <path
                          d="M5 12h14"
                          key={`list-path1-${summary.id}`}
                        ></path>
                        <path
                          d="m12 5 7 7-7 7"
                          key={`list-path2-${summary.id}`}
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <SummaryModal
        summary={selectedSummary}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
