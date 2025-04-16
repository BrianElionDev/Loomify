"use client";

import { useLoom } from "@/context/LoomContext";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Video, Users, ArrowLeft } from "lucide-react";
import LoomVideoCard from "@/components/LoomVideoCard";
import TaskModal from "@/components/TaskModal";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProjectPage() {
  const params = useParams();
  const { loomData, loading, error } = useLoom();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const projectName = decodeURIComponent(params.project as string);

  // Filter videos for this project
  const projectVideos = useMemo(() => {
    if (!loomData || !Array.isArray(loomData)) {
      return [];
    }
    return loomData.filter((video) => video?.project === projectName);
  }, [loomData, projectName]);

  // Calculate project stats
  const projectStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    const developers = new Set<string>();

    projectVideos.forEach((video) => {
      if (
        !video?.llm_answer ||
        !video.llm_answer.developers ||
        !Array.isArray(video.llm_answer.developers)
      ) {
        return;
      }

      video.llm_answer.developers.forEach((dev) => {
        developers.add(dev.Dev);

        if (!dev.Tasks || !Array.isArray(dev.Tasks)) {
          return;
        }

        totalTasks += dev.Tasks.length;
        completedTasks += dev.Tasks.filter((task) => task.Completed).length;
      });
    });

    return {
      totalVideos: projectVideos.length,
      totalTasks,
      completedTasks,
      developersCount: developers.size,
      developers: Array.from(developers),
      completionPercentage:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }, [projectVideos]);

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
            href="/projects"
            className="inline-flex items-center px-3 py-1.5 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/90 p-6 rounded-xl border border-slate-700/40 shadow-lg backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-xl"></div>
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl font-bold text-white/95 mb-2 flex items-center"
            >
              <span className="mr-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                {projectName}
              </span>
              <span className="px-2 py-1 bg-indigo-500/20 rounded-md text-indigo-300 text-sm">
                Project
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 max-w-lg"
            >
              Project overview and task management
            </motion.p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-indigo-500/10 text-indigo-300 text-sm font-medium rounded-lg flex items-center">
              <Video className="h-5 w-5 mr-2" />
              {loading ? (
                <div className="h-4 w-16 bg-indigo-500/20 rounded animate-pulse" />
              ) : (
                `${projectVideos.length} Videos`
              )}
            </div>
            <div className="px-4 py-2 bg-purple-500/10 text-purple-300 text-sm font-medium rounded-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {loading ? (
                <div className="h-4 w-16 bg-purple-500/20 rounded animate-pulse" />
              ) : (
                `${projectStats.developersCount} Developers`
              )}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-xl border border-slate-700/40 p-6 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-shimmer"></div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-slate-700/40 rounded-lg mr-3 animate-pulse"></div>
                <div className="h-5 w-32 bg-slate-700/40 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <div className="h-4 w-28 bg-slate-700/40 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-slate-700/40 rounded animate-pulse"></div>
                  </div>
                  <div className="h-2.5 bg-slate-700/40 rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-gradient-to-r from-slate-700/40 via-slate-700/60 to-slate-700/40 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex flex-col items-center mt-6">
                  <div className="h-8 w-16 bg-slate-700/40 rounded animate-pulse mb-1"></div>
                  <div className="h-4 w-32 bg-slate-700/40 rounded animate-pulse"></div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-xl border border-slate-700/40 p-6 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-shimmer"></div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-slate-700/40 rounded-lg mr-3 animate-pulse"></div>
                <div className="h-5 w-32 bg-slate-700/40 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4 relative z-10">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-700/40 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-slate-700/40 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-1/2 bg-slate-700/40 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-xl border border-slate-700/40 p-6 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-shimmer"></div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-slate-700/40 rounded-lg mr-3 animate-pulse"></div>
                <div className="h-5 w-32 bg-slate-700/40 rounded animate-pulse"></div>
              </div>
              <div className="space-y-3 relative z-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-700/40 rounded-full animate-pulse"></div>
                    <div className="h-4 w-24 bg-slate-700/40 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-xl border border-slate-700/40 p-6 backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-indigo-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                </div>
                Task Progress
              </h3>
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span className="font-medium">Completed Tasks</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-white/80">
                      {projectStats.completedTasks} / {projectStats.totalTasks}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-700/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${projectStats.completionPercentage}%`,
                      }}
                      transition={{
                        duration: 1,
                        delay: 0.5,
                        type: "spring",
                        stiffness: 50,
                      }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-400">
                    {projectStats.completionPercentage}%
                  </div>
                  <div className="text-sm text-white/60">
                    Overall Completion
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {projectVideos.slice(0, 3).map((video) => (
                  <div key={video.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-700/40 rounded-lg flex items-center justify-center">
                      <Video className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/90">
                        {video.title}
                      </div>
                      <div className="text-xs text-white/60">
                        {new Date(
                          video.created_at || video.date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-4">
                Team Members
              </h3>
              <div className="space-y-3">
                {projectStats.developers.map((dev) => (
                  <div key={dev} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      {dev}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold text-white/90 flex items-center">
              <Video className="h-5 w-5 mr-2 text-indigo-400" />
              Project Videos
            </h3>
          </motion.div>

          {loading ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden shadow-md"
                >
                  <div className="relative">
                    <div className="w-full aspect-video bg-gradient-to-r from-slate-700/40 via-slate-700/60 to-slate-700/40 rounded-t-lg animate-pulse overflow-hidden">
                      <div className="absolute inset-0 bg-shimmer"></div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="h-5 w-20 bg-slate-700/60 rounded-full animate-pulse"></div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <div className="h-5 w-16 bg-slate-700/60 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <div className="h-5 w-12 bg-slate-700/60 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-slate-700/40 rounded animate-pulse"></div>
                      <div className="h-5 w-16 bg-slate-700/40 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-slate-700/40 rounded animate-pulse"></div>
                    <div className="flex justify-between items-center">
                      <div className="flex">
                        <div className="w-7 h-7 rounded-full bg-slate-700/60 animate-pulse mr-1"></div>
                        <div className="w-7 h-7 rounded-full bg-slate-700/60 animate-pulse -ml-2"></div>
                        <div className="h-6 w-20 bg-slate-700/40 rounded ml-1 my-auto animate-pulse"></div>
                      </div>
                      <div className="h-4 w-16 bg-slate-700/40 rounded animate-pulse"></div>
                    </div>
                    <div className="h-2 bg-slate-700/30 rounded-full w-full mt-2 overflow-hidden">
                      <div className="h-full w-1/3 bg-slate-700/60 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {projectVideos.map((video) => (
                <motion.div
                  key={video.id}
                  variants={item}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
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
          video={
            projectVideos.find((v) => v.id === selectedVideo) ||
            projectVideos[0]
          }
          isOpen={true}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
