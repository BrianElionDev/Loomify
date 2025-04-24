"use client";

import { useState, useMemo } from "react";
import { useLoom } from "@/context/LoomContext";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Search,
  UserCircle2,
  Users,
} from "lucide-react";

export default function DevelopersPage() {
  const { loomData, loading, error } = useLoom();
  const [searchQuery, setSearchQuery] = useState("");

  // Get all unique developers with their tasks
  const developers = useMemo(() => {
    if (!loomData || loading) return [];

    const devMap = new Map();

    for (const video of loomData) {
      if (!video.llm_answer?.developers) continue;

      for (const dev of video.llm_answer.developers) {
        if (!dev.Dev) continue;

        const devName = dev.Dev;

        if (!devMap.has(devName)) {
          devMap.set(devName, {
            name: devName,
            tasks: [],
            completedTasks: 0,
            projects: new Set(),
          });
        }

        const devData = devMap.get(devName);

        // Add tasks
        if (dev.Tasks) {
          dev.Tasks.forEach((task, index) => {
            devData.tasks.push({
              ...task,
              videoId: video.id,
              project: video.project,
              taskIndex: index,
            });

            if (task.Completed) {
              devData.completedTasks++;
            }

            if (video.project) {
              devData.projects.add(video.project);
            }
          });
        }
      }
    }

    // Convert map to array and calculate completion rates
    return Array.from(devMap.values())
      .map((dev) => ({
        ...dev,
        completionRate:
          dev.tasks.length > 0
            ? Math.round((dev.completedTasks / dev.tasks.length) * 100)
            : 0,
        projects: Array.from(dev.projects),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [loomData, loading]);

  // Filter developers based on search
  const filteredDevelopers = useMemo(() => {
    if (!searchQuery.trim()) return developers;

    const query = searchQuery.toLowerCase();
    return developers.filter(
      (dev) =>
        dev.name.toLowerCase().includes(query) ||
        dev.projects.some((project: string) =>
          project.toLowerCase().includes(query)
        )
    );
  }, [developers, searchQuery]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="pt-4 pb-2"
      >
        <Link
          href="/"
          className="inline-flex items-center px-3 py-1.5 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800/80 p-4 sm:p-6 rounded-xl border border-slate-700/40 shadow-lg mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90 mb-2">
              Developers
            </h1>
            <p className="text-sm sm:text-base text-white/60">
              View task progress and manage assignments by developer
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-500/10 text-indigo-300 text-xs sm:text-sm font-medium rounded-lg flex items-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {loading ? (
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-indigo-500/20 rounded animate-pulse" />
              ) : (
                `${developers.length} Developers`
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Search className="h-4 w-4 text-indigo-400" />
          </div>
          <input
            type="text"
            placeholder="Search developers or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2 pl-9 pr-4 bg-indigo-900/40 border-2 border-indigo-500/40 hover:border-indigo-500/60 rounded-lg text-indigo-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 w-full backdrop-blur-sm shadow-lg"
          />
        </div>
      </motion.div>

      {/* Developers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-xl border border-slate-700/40 p-4 animate-pulse"
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-slate-700/70 rounded-full mr-3"></div>
                <div className="h-6 bg-slate-700/50 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-slate-700/30 rounded w-full mb-3"></div>
              <div className="h-2 bg-slate-700/40 rounded w-full mb-3"></div>
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-slate-700/40 rounded"></div>
                <div className="h-4 w-20 bg-slate-700/40 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <h3 className="text-lg font-semibold text-red-500 mb-2">
            Error Loading Data
          </h3>
          <p>{error}</p>
        </div>
      ) : filteredDevelopers.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/40 rounded-xl text-center">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-slate-700/30 rounded-full mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white/80 mb-2">
            No Developers Found
          </h3>
          <p className="text-white/60 text-sm">
            {developers.length === 0
              ? "No developers have been assigned to any tasks yet."
              : "No developers match your current search criteria."}
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {filteredDevelopers.map((dev) => (
            <motion.div
              key={dev.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Link href={`/developers/${encodeURIComponent(dev.name)}`}>
                <div className="bg-gradient-to-r from-slate-900 to-slate-800/80 p-4 sm:p-5 rounded-xl border border-slate-700/40 hover:border-indigo-500/30 transition-colors shadow-md h-full flex flex-col">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 bg-indigo-500/20 rounded-full flex items-center justify-center mr-3">
                      <UserCircle2 className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white/90 truncate">
                      {dev.name}
                    </h2>
                  </div>

                  {/* Projects */}
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {dev.projects
                      .slice(0, 3)
                      .map((project: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded text-xs"
                        >
                          {project}
                        </span>
                      ))}
                    {dev.projects.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-500/10 text-slate-300 rounded text-xs">
                        +{dev.projects.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${dev.completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between text-sm">
                    <div className="flex items-center text-white/70">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      {dev.tasks.length} tasks
                    </div>

                    <div className="flex items-center text-emerald-400/90">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      {dev.completionRate}% complete
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
