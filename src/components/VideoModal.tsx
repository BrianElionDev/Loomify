"use client";

import { useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useLoom } from "@/context/LoomContext";
import { X } from "lucide-react";

interface VideoModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({
  videoId,
  isOpen,
  onClose,
}: VideoModalProps) {
  const { loomData } = useLoom();

  // Find the video in the loomData
  const video = loomData.find((v) => v.id === videoId);

  // Create motion values for background opacity and blur
  const backgroundOpacity = useMotionValue(isOpen ? 1 : 0);
  const blurValue = useTransform(backgroundOpacity, [0, 1], [0, 5]);

  // Update motion values when modal opens/closes
  useEffect(() => {
    backgroundOpacity.set(isOpen ? 1 : 0);
  }, [isOpen, backgroundOpacity]);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // If no video found, don't render
  if (!video) return null;

  // Create URL for embedded Loom video
  const embedUrl = video.link.replace("share/", "embed/");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.3 },
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.2 },
          }}
          style={{ backdropFilter: `blur(${blurValue.get()}px)` }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                opacity: { duration: 0.3 },
              },
            }}
            exit={{
              scale: 0.98,
              opacity: 0,
              y: 10,
              transition: { duration: 0.2 },
            }}
            className="w-full max-w-4xl bg-gradient-to-b from-slate-900/95 to-slate-800/95 rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-8 w-8 bg-indigo-500/20 rounded-md flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-indigo-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-white/90 line-clamp-1">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-white/60">
                    {video.project && (
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1 text-indigo-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                        {video.project}
                      </div>
                    )}

                    {video.recording_type && (
                      <div
                        className={`flex items-center ${
                          video.recording_type === "meeting"
                            ? "text-blue-400"
                            : video.recording_type === "Q&A"
                            ? "text-green-400"
                            : "text-indigo-400"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
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
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90 transition-colors flex items-center justify-center flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video container */}
            <div className="aspect-video bg-black">
              <iframe
                src={embedUrl}
                frameBorder="0"
                allowFullScreen
                className="w-full h-full"
                loading="lazy"
              ></iframe>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="text-xs sm:text-sm text-white/60 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-1.5 text-indigo-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {new Date(video.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                {video.usage !== undefined && (
                  <div className="text-xs sm:text-sm text-emerald-300 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 mr-1.5 text-emerald-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.5-5a.5.5 0 01.5.5V15h2a.5.5 0 010 1h-6a.5.5 0 010-1h2v-1.5a.5.5 0 01.5-.5h1zm5.5-7h-1.5a.5.5 0 01-.5-.5v-1h-.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5H16v-.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5V4h.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H18v.5a.5.5 0 01-.5.5h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {video.usage} tokens
                  </div>
                )}
              </div>

              <a
                href={video.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-lg transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Open in Loom
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
