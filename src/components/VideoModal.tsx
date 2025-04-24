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
                  <p className="text-xs text-white/60">{video.project}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white/90 transition-colors flex items-center justify-center"
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
              <div className="text-xs sm:text-sm text-white/60">
                {new Date(video.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
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
