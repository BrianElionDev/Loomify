"use client";

import { useLoom } from "@/context/LoomContext";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, FolderKanban, Video, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Developer, LoomAnalysis, Task } from "@/types/loom";

interface ProjectData {
  name: string;
  videos: LoomAnalysis[];
  recordingTypes: Set<string>;
}

export default function ProjectsPage() {
  const { loomData, loading, error } = useLoom();
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique projects and their data
  const projects = useMemo(() => {
    if (!loomData || !Array.isArray(loomData) || loomData.length === 0) {
      return [];
    }

    // Group videos by project
    const projectMap = new Map();

    loomData.forEach((video) => {
      // Skip videos without proper project data
      if (!video?.project) return;

      const projectName = video.project.toLowerCase();

      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, {
          name: video.project,
          videos: [],
          recordingTypes: new Set(),
        });
      }

      // Only add videos with valid developer data
      if (
        video?.llm_answer?.developers &&
        Array.isArray(video.llm_answer.developers) &&
        video.llm_answer.developers.length > 0
      ) {
        projectMap.get(projectName).videos.push(video);

        // Track recording types
        if (video.recording_type) {
          projectMap.get(projectName).recordingTypes.add(video.recording_type);
        }
      }
    });

    // Convert map to array and convert recordingTypes Set to Array
    return Array.from(projectMap.values()).map((project) => ({
      ...project,
      recordingTypes: Array.from(project.recordingTypes),
    }));
  }, [loomData]);

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;

    const query = searchQuery.toLowerCase();
    return projects.filter((project) =>
      project.name.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Get project stats
  const getProjectStats = (project: ProjectData) => {
    const videos = project.videos;
    let totalTasks = 0;
    let completedTasks = 0;
    const developers = new Set();
    const recordingTypeCounts: Record<string, number> = {};

    videos.forEach((video: LoomAnalysis) => {
      if (
        !video?.llm_answer?.developers ||
        !Array.isArray(video.llm_answer.developers)
      ) {
        return;
      }

      // Count recording types
      if (video.recording_type) {
        recordingTypeCounts[video.recording_type] =
          (recordingTypeCounts[video.recording_type] || 0) + 1;
      }

      video.llm_answer.developers.forEach((dev: Developer) => {
        developers.add(dev.Dev);

        if (!dev.Tasks || !Array.isArray(dev.Tasks)) {
          return;
        }

        totalTasks += dev.Tasks.length;
        completedTasks += dev.Tasks.filter(
          (task: Task) => task.Completed
        ).length;
      });
    });

    return {
      videoCount: videos.length,
      taskCount: totalTasks,
      completedTaskCount: completedTasks,
      devCount: developers.size,
      recordingTypeCounts,
      completionPercentage:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  };

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

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md">
            <div className="flex items-center mb-4">
              <div className="bg-red-500/20 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-10 pb-10">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/"
            className="inline-flex items-center px-3 py-1.5 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800/80 p-6 rounded-xl border border-slate-700/40 shadow-lg"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white/90 mb-2">
              Projects
            </h2>
            <p className="text-white/60 max-w-lg">
              View and manage your projects and their associated tasks
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-indigo-500/10 text-indigo-300 text-sm font-medium rounded-lg flex items-center">
              <FolderKanban className="h-5 w-5 mr-2" />
              {loading ? (
                <div className="h-4 w-16 bg-indigo-500/20 rounded animate-pulse" />
              ) : (
                `${projects.length} Projects`
              )}
            </div>
          </div>
        </motion.div>

        <div>
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold text-white/90 flex items-center">
              <FolderKanban className="h-5 w-5 mr-2 text-indigo-400" />
              Project Overview
            </h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-5 w-5 text-indigo-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 pl-10 pr-4 bg-indigo-900/40 border-2 border-indigo-500/40 hover:border-indigo-500/60 rounded-lg text-indigo-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 w-48 sm:w-64 backdrop-blur-sm shadow-lg"
              />
            </div>
          </motion.div>

          {loading ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} variants={item}>
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden shadow-md relative">
                    <div className="absolute inset-0 bg-shimmer"></div>
                    <div className="h-40 bg-gradient-to-r from-slate-700/40 via-slate-700/50 to-slate-700/40 flex items-center justify-center relative z-10">
                      <div className="h-20 w-20 bg-slate-700/60 rounded-xl animate-pulse"></div>
                      <div className="absolute right-3 top-3 h-6 w-16 bg-slate-700/60 rounded-full animate-pulse"></div>
                      <div className="absolute left-3 top-3 h-6 w-24 bg-slate-700/60 rounded-full animate-pulse"></div>
                    </div>
                    <div className="p-5 space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-1/3 bg-slate-700/40 rounded animate-pulse"></div>
                        <div className="h-5 w-16 bg-slate-700/40 rounded-full animate-pulse"></div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-700/20 p-3 rounded-lg border border-slate-700/30">
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-slate-700/40 rounded mr-2 animate-pulse"></div>
                            <div>
                              <div className="h-4 w-8 bg-slate-700/40 rounded animate-pulse mb-1"></div>
                              <div className="h-3 w-16 bg-slate-700/30 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-700/20 p-3 rounded-lg border border-slate-700/30">
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-slate-700/40 rounded mr-2 animate-pulse"></div>
                            <div>
                              <div className="h-4 w-8 bg-slate-700/40 rounded animate-pulse mb-1"></div>
                              <div className="h-3 w-14 bg-slate-700/30 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1.5">
                          <div className="h-3 w-14 bg-slate-700/40 rounded animate-pulse"></div>
                          <div className="h-3 w-16 bg-slate-700/40 rounded animate-pulse"></div>
                        </div>
                        <div className="h-2 bg-slate-700/30 rounded-full w-full overflow-hidden">
                          <div className="h-full w-2/3 bg-gradient-to-r from-slate-700/40 via-slate-700/60 to-slate-700/40 rounded-full animate-pulse"></div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <div className="h-3 w-24 bg-slate-700/40 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredProjects.map((project) => {
                const stats = getProjectStats(project);
                return (
                  <motion.div key={project.name} variants={item}>
                    <Link
                      href={`/projects/${encodeURIComponent(project.name)}`}
                      className="block h-full"
                    >
                      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800/80 rounded-xl border border-slate-700/40 h-full">
                        <div className="flex flex-col h-full">
                          <div className="flex items-start justify-between gap-4 mb-6">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white/90 mb-2 truncate">
                                {project.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {stats.videoCount > 0 && (
                                  <div className="inline-flex items-center px-2.5 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-medium rounded">
                                    <Video className="h-3.5 w-3.5 mr-1" />
                                    {stats.videoCount}{" "}
                                    {stats.videoCount === 1
                                      ? "video"
                                      : "videos"}
                                  </div>
                                )}

                                {project.recordingTypes &&
                                  project.recordingTypes.map((type: string) => (
                                    <div
                                      key={type}
                                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded ${
                                        type === "meeting"
                                          ? "bg-blue-500/10 text-blue-300"
                                          : type === "Q&A"
                                          ? "bg-green-500/10 text-green-300"
                                          : "bg-purple-500/10 text-purple-300"
                                      }`}
                                    >
                                      {type === "meeting" ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3.5 w-3.5 mr-1"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                        </svg>
                                      ) : type === "Q&A" ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3.5 w-3.5 mr-1"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3.5 w-3.5 mr-1"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                        </svg>
                                      )}
                                      {type} (
                                      {stats.recordingTypeCounts[type] || 0})
                                    </div>
                                  ))}

                                {stats.devCount > 0 && (
                                  <div className="inline-flex items-center px-2.5 py-1 bg-purple-500/10 text-purple-300 text-xs font-medium rounded">
                                    <Users className="h-3.5 w-3.5 mr-1" />
                                    {stats.devCount}{" "}
                                    {stats.devCount === 1
                                      ? "developer"
                                      : "developers"}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {!loading && filteredProjects.length === 0 && (
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/40 p-8 text-center">
              <FolderKanban className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/80 mb-2">
                No Projects Found
              </h3>
              <p className="text-white/50 max-w-md mx-auto">
                {projects.length === 0
                  ? "No projects have been created yet. Submit a Loom video to create your first project."
                  : "No projects match your search query. Try a different search term."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
