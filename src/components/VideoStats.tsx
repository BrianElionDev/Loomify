import { LoomAnalysis } from "@/types/loom";
import { motion } from "framer-motion";

interface VideoStatsProps {
  video: LoomAnalysis | null;
}

export default function VideoStats({ video }: VideoStatsProps) {
  if (!video) return null;

  const totalTasks = video.llm_answer.developers.reduce(
    (sum, dev) => sum + dev.Tasks.length,
    0
  );

  const completedTasks = video.llm_answer.developers.reduce(
    (sum, dev) =>
      sum + (dev.Tasks.filter((task) => task.completed).length || 0),
    0
  );

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const uniqueDevelopers = new Set(
    video.llm_answer.developers.map((dev) => dev.Dev)
  ).size;

  const formattedDuration =
    typeof video.duration === "number"
      ? `${Math.floor(video.duration / 60)}:${String(
          Math.floor(video.duration % 60)
        ).padStart(2, "0")}`
      : video.duration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-slate-900 to-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/40 overflow-hidden shadow-lg relative"
    >
      <div className="absolute top-0 left-0 w-full h-1">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl"></div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Dashboard Overview
        </h3>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300">
          {new Date(video.date).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
          <p className="text-xs text-white/60 mb-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1 text-indigo-400"
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
            Total Tasks
          </p>
          <p className="text-2xl font-bold text-white">{totalTasks}</p>
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
          <p className="text-xs text-white/60 mb-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1 text-indigo-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Completed
          </p>
          <p className="text-2xl font-bold text-white">{completedTasks}</p>
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
          <p className="text-xs text-white/60 mb-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1 text-indigo-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Developers
          </p>
          <p className="text-2xl font-bold text-white">{uniqueDevelopers}</p>
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
          <p className="text-xs text-white/60 mb-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1 text-indigo-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Duration
          </p>
          <p className="text-2xl font-bold text-white">{formattedDuration}</p>
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-white/80 font-medium">
            Completion Progress
          </p>
          <p className="text-sm text-white/80 font-medium">
            {completionPercentage}%
          </p>
        </div>
        <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="text-xs text-white/50 mt-4 text-center">
        Analysis by{" "}
        <span className="text-indigo-400 font-medium">{video.model}</span> model
      </div>
    </motion.div>
  );
}
