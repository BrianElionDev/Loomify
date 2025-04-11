"use client";

import { useLoom } from "@/context/LoomContext";
import LoomVideoCard from "@/components/LoomVideoCard";
import TaskModal from "@/components/TaskModal";
import VideoStats from "@/components/VideoStats";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Video, Users } from "lucide-react";

export default function Home() {
  const { loomData, loading, error } = useLoom();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter videos based on search query
  const filteredVideos = useMemo(() => {
    if (!searchQuery) return loomData;

    const query = searchQuery.toLowerCase();
    return loomData.filter(
      (video) =>
        video.title?.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query) ||
        video.llm_answer?.developers?.some((dev) =>
          dev.Dev.toLowerCase().includes(query)
        )
    );
  }, [loomData, searchQuery]);

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
      <div className="space-y-10 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800/80 p-6 rounded-xl border border-slate-700/40 shadow-lg"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white/90 mb-2">
              Loom Analysis Dashboard
            </h2>
            <p className="text-white/60 max-w-lg">
              Analyze your Loom videos, extract tasks and track progress across
              your development team.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-indigo-500/10 text-indigo-300 text-sm font-medium rounded-lg flex items-center">
              <Video className="h-5 w-5 mr-2" />
              {loading ? (
                <div className="h-4 w-16 bg-indigo-500/20 rounded animate-pulse" />
              ) : (
                `${loomData.length} Videos Analyzed`
              )}
            </div>
            <div className="px-4 py-2 bg-purple-500/10 text-purple-300 text-sm font-medium rounded-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {loading ? (
                <div className="h-4 w-16 bg-purple-500/20 rounded animate-pulse" />
              ) : (
                `${
                  new Set(
                    loomData.flatMap(
                      (video) =>
                        video.llm_answer?.developers?.map((dev) => dev.Dev) ||
                        []
                    )
                  ).size
                } Developers`
              )}
            </div>
          </div>
        </motion.div>

        {!loading && loomData.length > 0 && <VideoStats video={loomData[0]} />}

        <div>
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold text-white/90 flex items-center">
              <Video className="h-5 w-5 mr-2 text-indigo-400" />
              Video Library
            </h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48 sm:w-64"
              />
            </div>
          </motion.div>

          {error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
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
          ) : loading ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} variants={item}>
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 p-4 animate-pulse">
                    <div className="h-40 bg-slate-700/40 rounded-lg mb-4" />
                    <div className="h-4 bg-slate-700/40 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-700/40 rounded w-1/2" />
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
          video={loomData.find((v) => v.id === selectedVideo)!}
          isOpen={true}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
