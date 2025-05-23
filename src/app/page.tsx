"use client";

import { useLoom } from "@/context/LoomContext";
import LoomVideoCard from "@/components/LoomVideoCard";
import TaskModal from "@/components/TaskModal";
import VideoStats from "@/components/VideoStats";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Video,
  Users,
  FolderKanban,
  Filter,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { loomData, loading, error } = useLoom();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedRecordingType, setSelectedRecordingType] = useState<
    string | null
  >(null);

  // Get unique projects from videos
  const projects = useMemo(() => {
    if (!loomData || !Array.isArray(loomData)) return [];

    const projectSet = new Set<string>();
    loomData.forEach((video) => {
      if (video?.project) {
        projectSet.add(video.project.toLowerCase());
      }
    });

    return Array.from(projectSet).sort();
  }, [loomData]);

  // Get unique recording types from videos
  const recordingTypes = useMemo(() => {
    if (!loomData || !Array.isArray(loomData)) return [];

    const recordingTypeSet = new Set<string>();
    loomData.forEach((video) => {
      if (video?.recording_type) {
        recordingTypeSet.add(video.recording_type);
      }
    });

    return Array.from(recordingTypeSet).sort();
  }, [loomData]);

  // Filter videos based on search query, selected project and recording type
  const filteredVideos = useMemo(() => {
    if (!loomData) return [];

    let filtered = [...loomData];

    // Filter by project if one is selected
    if (selectedProject) {
      filtered = filtered.filter(
        (video) =>
          video?.project?.toLowerCase() === selectedProject.toLowerCase()
      );
    }

    // Filter by recording type if one is selected
    if (selectedRecordingType) {
      filtered = filtered.filter(
        (video) => video?.recording_type === selectedRecordingType
      );
    }

    // Filter by search query if one exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (video) =>
          video?.title?.toLowerCase().includes(query) ||
          video?.description?.toLowerCase().includes(query) ||
          (video?.llm_answer?.developers || []).some((dev) =>
            dev?.Dev?.toLowerCase?.().includes(query)
          )
      );
    }

    return filtered;
  }, [loomData, searchQuery, selectedProject, selectedRecordingType]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6 sm:space-y-10 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800/80 p-4 sm:p-6 rounded-xl border border-slate-700/40 shadow-lg"
        >
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90 mb-2">
              Loom Analysis Dashboard
            </h2>
            <p className="text-sm sm:text-base text-white/60 max-w-lg">
              Analyze your Loom videos, extract tasks and track progress across
              your development team.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-500/10 text-indigo-300 text-xs sm:text-sm font-medium rounded-lg flex items-center">
              <Video className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {loading ? (
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-indigo-500/20 rounded animate-pulse" />
              ) : (
                `${loomData.length} Videos Analyzed`
              )}
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/10 text-purple-300 text-xs sm:text-sm font-medium rounded-lg flex items-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {loading ? (
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-purple-500/20 rounded animate-pulse" />
              ) : (
                `${
                  new Set(
                    loomData.flatMap((video) =>
                      (video.llm_answer?.developers || []).map((dev) => dev.Dev)
                    )
                  ).size
                } Developers`
              )}
            </div>
          </div>
        </motion.div>

        <VideoStats videos={loomData} isLoading={loading} />

        {/* Developers section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-slate-900 to-slate-800/80 p-4 sm:p-6 rounded-xl border border-slate-700/40 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-500/20 rounded-md flex items-center justify-center mr-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white/90">
                Developers
              </h3>
            </div>
            <Link
              href="/developers"
              className="inline-flex items-center px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              View All Developers
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 rounded-lg border border-slate-700/30 p-3 animate-pulse"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 bg-purple-500/20 rounded-full" />
                    <div className="h-4 bg-slate-700/50 w-24 rounded" />
                  </div>
                  <div className="h-2 bg-slate-700/30 rounded-full mb-2" />
                  <div className="flex justify-between mb-1">
                    <div className="h-3 bg-slate-700/40 w-16 rounded" />
                    <div className="h-3 bg-slate-700/40 w-10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4 text-white/60">
              Unable to load developer data
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from(
                new Set(
                  loomData.flatMap((video) =>
                    (video.llm_answer?.developers || []).map((dev) => dev.Dev)
                  )
                )
              )
                .filter(Boolean)
                .sort()
                .slice(0, 4)
                .map((devName, index) => {
                  // Calculate stats for this developer
                  const tasks = [];
                  let completedTasks = 0;

                  for (const video of loomData) {
                    if (!video.llm_answer?.developers) continue;

                    const dev = video.llm_answer.developers.find(
                      (d) => d.Dev === devName
                    );
                    if (dev && dev.Tasks) {
                      tasks.push(...dev.Tasks);
                      completedTasks += dev.Tasks.filter(
                        (t) => t.Completed
                      ).length;
                    }
                  }

                  const completionRate =
                    tasks.length > 0
                      ? Math.round((completedTasks / tasks.length) * 100)
                      : 0;

                  return (
                    <Link
                      key={index}
                      href={`/developers/${encodeURIComponent(devName)}`}
                      className="bg-white/5 hover:bg-white/10 rounded-lg border border-slate-700/30 p-3 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <UserCircle2 className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                        <div className="font-medium text-white/90 truncate">
                          {devName}
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <div className="text-white/60">
                          {tasks.length} tasks
                        </div>
                        <div className="text-purple-300">
                          {completionRate}% complete
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </motion.div>

        <div>
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white/90 flex items-center">
              <Video className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-400" />
              Video Library
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {projects.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                  </div>
                  <select
                    value={selectedProject || ""}
                    onChange={(e) => setSelectedProject(e.target.value || null)}
                    className="py-2 sm:py-3 pl-8 sm:pl-10 pr-8 sm:pr-10 bg-purple-900/40 border-2 border-purple-500/40 hover:border-purple-500/60 rounded-lg text-purple-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 appearance-none backdrop-blur-sm shadow-lg w-full sm:w-auto"
                    style={{ WebkitAppearance: "none" }}
                  >
                    <option
                      value=""
                      className="bg-slate-800 text-purple-300 font-medium"
                    >
                      All Projects
                    </option>
                    {projects.map((project) => (
                      <option
                        key={project}
                        value={project}
                        className="bg-slate-800 text-purple-300 font-medium"
                      >
                        {project}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                  </div>
                </div>
              )}

              {recordingTypes.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Video className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                  </div>
                  <select
                    value={selectedRecordingType || ""}
                    onChange={(e) =>
                      setSelectedRecordingType(e.target.value || null)
                    }
                    className="py-2 sm:py-3 pl-8 sm:pl-10 pr-8 sm:pr-10 bg-indigo-900/40 border-2 border-indigo-500/40 hover:border-indigo-500/60 rounded-lg text-indigo-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 appearance-none backdrop-blur-sm shadow-lg w-full sm:w-auto"
                    style={{ WebkitAppearance: "none" }}
                  >
                    <option
                      value=""
                      className="bg-slate-800 text-indigo-300 font-medium"
                    >
                      All Types
                    </option>
                    {recordingTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                        className="bg-slate-800 text-indigo-300 font-medium"
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
                  </div>
                </div>
              )}
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="py-2 sm:py-3 pl-8 sm:pl-10 pr-4 bg-indigo-900/40 border-2 border-indigo-500/40 hover:border-indigo-500/60 rounded-lg text-indigo-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 w-full sm:w-64 backdrop-blur-sm shadow-lg"
                />
              </div>
            </div>
          </motion.div>

          {error ? (
            <div className="p-4 sm:p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="bg-red-500/20 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-500">
                  Error Loading Data
                </h3>
              </div>
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} variants={item}>
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 p-4 animate-pulse">
                    <div className="h-32 sm:h-40 bg-slate-700/40 rounded-lg mb-4" />
                    <div className="h-3 sm:h-4 bg-slate-700/40 rounded w-3/4 mb-2" />
                    <div className="h-3 sm:h-4 bg-slate-700/40 rounded w-1/2" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : filteredVideos.length === 0 ? (
            <div className="p-6 sm:p-8 text-center bg-slate-800/30 rounded-xl border border-slate-700/40">
              <FolderKanban className="h-10 sm:h-12 w-10 sm:w-12 text-indigo-400/50 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-white/90 mb-2">
                No Videos Found
              </h3>
              <p className="text-sm sm:text-base text-indigo-300/80 max-w-md mx-auto">
                {selectedProject
                  ? `No videos found for project "${selectedProject}"${
                      searchQuery ? " with your search criteria" : ""
                    }.`
                  : `No videos match your search criteria.`}
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredVideos.map((video) => (
                <motion.div key={video.id} variants={item}>
                  <LoomVideoCard
                    video={video}
                    onClick={() => setSelectedVideo(video.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {selectedVideo && (
        <TaskModal
          video={loomData.find((v) => v.id === selectedVideo) || loomData[0]}
          isOpen={true}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
