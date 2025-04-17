import { LoomAnalysis } from "@/types/loom";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface VideoStatsProps {
  videos: LoomAnalysis[];
  isLoading: boolean;
}

export default function VideoStats({ videos, isLoading }: VideoStatsProps) {
  const stats = useMemo(() => {
    if (!videos || videos.length === 0) {
      return {
        totalVideos: 0,
        totalTasks: 0,
        completedTasks: 0,
        completionPercentage: 0,
        uniqueDevelopers: 0,
        totalDuration: 0,
        projectsCount: 0,
      };
    }

    // Get total and completed tasks across all videos
    let totalTasks = 0;
    let completedTasks = 0;
    const developers = new Set();
    const projects = new Set();
    let totalDurationSeconds = 0;

    videos.forEach((video) => {
      // Count projects
      if (video.project) {
        projects.add(video.project.toLowerCase());
      }

      // Count tasks and developers
      (video.llm_answer?.developers || []).forEach((dev) => {
        if (dev.Dev) {
          developers.add(dev.Dev);
        }

        totalTasks += dev.Tasks?.length || 0;
        completedTasks += (dev.Tasks || []).filter(
          (task) => task.Completed
        ).length;
      });

      // Sum up duration (convert to seconds if needed)
      if (video.duration) {
        if (typeof video.duration === "string") {
          // Parse string durations like "11:30"
          if (video.duration.includes(":")) {
            const [minutes, seconds] = video.duration.split(":");
            totalDurationSeconds += parseInt(minutes) * 60 + parseInt(seconds);
          } else {
            // Try parsing as a number
            const duration = parseFloat(video.duration);
            if (!isNaN(duration)) {
              totalDurationSeconds += duration;
            }
          }
        } else if (typeof video.duration === "number") {
          totalDurationSeconds += video.duration;
        }
      }
    });

    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Format total duration
    const formattedTotalDuration = `${Math.floor(
      totalDurationSeconds / 60
    )}:${String(Math.floor(totalDurationSeconds % 60)).padStart(2, "0")}`;

    return {
      totalVideos: videos.length,
      totalTasks,
      completedTasks,
      completionPercentage,
      uniqueDevelopers: developers.size,
      totalDuration: formattedTotalDuration,
      projectsCount: projects.size,
    };
  }, [videos]);

  if (isLoading) {
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-white/5 p-4 rounded-lg border border-white/5"
            >
              <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse mb-2"></div>
              <div className="h-6 w-1/3 bg-white/10 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-1/3 bg-white/10 rounded animate-pulse"></div>
            <div className="h-3 w-1/6 bg-white/10 rounded animate-pulse"></div>
          </div>
          <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-white/10 rounded-full animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

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
          {stats.totalVideos} Videos
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
          <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
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
          <p className="text-2xl font-bold text-white">
            {stats.completedTasks}
          </p>
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
          <p className="text-2xl font-bold text-white">
            {stats.uniqueDevelopers}
          </p>
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/5">
          <p className="text-xs text-white/60 mb-1 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1 text-indigo-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            Projects
          </p>
          <p className="text-2xl font-bold text-white">{stats.projectsCount}</p>
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-white/80 font-medium">
            Overall Completion Progress
          </p>
          <p className="text-sm text-white/80 font-medium">
            {stats.completionPercentage}%
          </p>
        </div>
        <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            style={{ width: `${stats.completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="text-xs text-white/50 mt-4 text-center">
        Total Content Duration:{" "}
        <span className="text-indigo-400 font-medium">
          {stats.totalDuration}
        </span>
      </div>
    </motion.div>
  );
}
