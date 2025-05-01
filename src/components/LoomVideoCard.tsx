"use client";

import { Developer, LoomAnalysis } from "@/types/loom";
import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";

interface LoomVideoCardProps {
  video: LoomAnalysis;
  onClick: () => void;
}

export default function LoomVideoCard({ video, onClick }: LoomVideoCardProps) {
  // Count total tasks and completed tasks
  const totalTasks = useMemo(() => {
    if (
      !video.llm_answer?.developers ||
      !Array.isArray(video.llm_answer.developers)
    ) {
      return 0;
    }
    return video.llm_answer.developers.reduce(
      (sum, dev) => sum + (dev.Tasks?.length || 0),
      0
    );
  }, [video.llm_answer?.developers]);

  const completedTasks = useMemo(() => {
    if (
      !video.llm_answer?.developers ||
      !Array.isArray(video.llm_answer.developers)
    ) {
      return 0;
    }
    return video.llm_answer.developers.reduce(
      (sum, dev) =>
        sum + ((dev.Tasks || []).filter((task) => task.Completed).length || 0),
      0
    );
  }, [video.llm_answer?.developers]);

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format duration from seconds to min:sec (MM:SS)
  const formatDuration = (duration: number | string): string => {
    // Convert to number if it's a string
    const seconds =
      typeof duration === "string" ? parseFloat(duration) : duration;

    // If parsing failed, return original string
    if (isNaN(seconds)) {
      return String(duration);
    }

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format as MM:SS
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/40 overflow-hidden shadow-lg hover:shadow-xl h-full flex flex-col touch-manipulation"
    >
      <div
        className="relative group cursor-pointer flex-shrink-0"
        onClick={onClick}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={640}
          height={360}
          className="w-full aspect-video object-cover brightness-90 group-hover:brightness-100 transition-all"
          priority
        />

        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <div className="flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] sm:text-xs text-white/90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{video.model}</span>
          </div>
        </div>
        {video.project && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <div className="flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] sm:text-xs text-white/90 border border-slate-700/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400 mr-0.5 sm:mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="truncate max-w-[100px]">{video.project}</span>
            </div>
          </div>
        )}

        <a
          href={video.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/70 backdrop-blur-md text-white/90 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex items-center space-x-1 hover:bg-indigo-600/80 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
              clipRule="evenodd"
            />
          </svg>
          <span>Loom</span>
        </a>

        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/70 backdrop-blur-md text-white/90 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex items-center space-x-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400 mr-0.5 sm:mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span>{formatDuration(video.duration)}</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/60 via-black/40 to-black/70 backdrop-blur-sm">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-indigo-600 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-7 sm:w-7 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        className="p-2.5 sm:p-5 cursor-pointer flex-grow overflow-y-auto"
        onClick={onClick}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1.5">
            <div className="text-[10px] sm:text-xs font-medium text-indigo-400/90 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {new Date(video.date).toLocaleDateString()}
            </div>

            {video.recording_type && (
              <div
                className={`flex items-center text-[10px] sm:text-xs rounded-full px-1.5 py-0.5 ${
                  video.recording_type === "meeting"
                    ? "bg-orange-500/20 text-orange-300"
                    : video.recording_type === "Q&A"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  {video.recording_type === "meeting" ? (
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  ) : video.recording_type === "Q&A" ? (
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  )}
                </svg>
                {video.recording_type}
              </div>
            )}
          </div>

          <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-indigo-500/10 text-indigo-300">
            {completionPercentage}% Done
          </div>
        </div>

        <h3 className="text-white/90 font-semibold mb-1.5 sm:mb-3 line-clamp-1 text-base sm:text-lg">
          {video.title}
        </h3>

        {video.project && (
          <div className="mb-1.5 sm:mb-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400 mr-1 sm:mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <span className="text-xs sm:text-sm text-indigo-300 font-medium truncate">
              {video.project}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between mb-2.5 sm:mb-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center flex-shrink-0">
              {(video.llm_answer?.developers || [])
                .slice(0, 3)
                .map((dev: Developer, index: number) => (
                  <div
                    key={`${video.id}-${dev.Dev}-${index}`}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-medium shadow-md"
                    style={{
                      marginLeft: index > 0 ? "-0.5rem" : 0,
                      zIndex: 10 - index,
                      border: "2px solid rgba(30, 41, 59, 0.5)",
                    }}
                  >
                    {dev.Dev?.substring(0, 2).toUpperCase()}
                  </div>
                ))}

              {(video.llm_answer?.developers || []).length > 3 && (
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-700/60 flex items-center justify-center text-white text-[10px] sm:text-xs font-medium shadow-md"
                  style={{
                    marginLeft: "-0.5rem",
                    zIndex: 1,
                    border: "2px solid rgba(30, 41, 59, 0.5)",
                  }}
                >
                  +{(video.llm_answer?.developers || []).length - 3}
                </div>
              )}
            </div>

            <span className="text-[10px] sm:text-xs text-white/70 ml-1 font-medium">
              {(video.llm_answer?.developers || []).length || 0}{" "}
              {((video.llm_answer?.developers || []).length || 0) === 1
                ? "developer"
                : "developers"}
            </span>
          </div>

          <span className="text-[10px] sm:text-xs text-white/70 font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-indigo-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            {completedTasks}/{totalTasks} tasks
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="h-1.5 sm:h-2 bg-slate-700/50 rounded-full flex-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
