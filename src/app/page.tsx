"use client";

import { useLoom } from "@/context/LoomContext";
import LoomVideoCard from "@/components/LoomVideoCard";
import TaskModal from "@/components/TaskModal";
import VideoStats from "@/components/VideoStats";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { loomData, loading, error } = useLoom();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-purple-500 animate-spin animate-reverse"></div>
            </div>
            <p className="mt-4 text-white/70 text-sm">
              Loading analysis data...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              {loomData.length} Videos Analyzed
            </div>
            <div className="px-4 py-2 bg-purple-500/10 text-purple-300 text-sm font-medium rounded-lg flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              {
                new Set(
                  loomData.flatMap(
                    (video) =>
                      video.llm_answer?.developers?.map((dev) => dev.Dev) || []
                  )
                ).size
              }{" "}
              Developers
            </div>
          </div>
        </motion.div>

        {loomData.length > 0 && <VideoStats video={loomData[0]} />}

        <div>
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold text-white/90 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-indigo-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              Video Library
            </h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search videos..."
                className="py-2 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48 sm:w-64"
              />
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {loomData.map((video) => (
              <motion.div key={video.id} variants={item}>
                <LoomVideoCard
                  video={video}
                  onClick={() => setSelectedVideo(video.id)}
                />
              </motion.div>
            ))}
          </motion.div>
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
