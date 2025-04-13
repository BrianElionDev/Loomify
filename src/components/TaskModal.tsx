"use client";

import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { LoomAnalysis, Task } from "@/types/loom";
import { useLoom } from "@/context/LoomContext";
import { useNotification } from "@/hooks/useNotification";

interface TaskModalProps {
  video: LoomAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskModal({ video, isOpen, onClose }: TaskModalProps) {
  const { updateTaskCompletionStatus, taskIsSaving } = useLoom();
  const notification = useNotification();
  const [activeDevTab, setActiveDevTab] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [videoHidden, setVideoHidden] = useState<boolean>(false);
  const [taskCompletionStates, setTaskCompletionStates] = useState<
    Record<string, boolean>
  >({});
  const [initialTaskStates, setInitialTaskStates] = useState<
    Record<string, boolean>
  >({});
  const [taskTextStates, setTaskTextStates] = useState<Record<string, string>>(
    {}
  );
  const [initialTaskTextStates, setInitialTaskTextStates] = useState<
    Record<string, string>
  >({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Create motion values properly
  const backgroundOpacity = useMotionValue(isOpen ? 1 : 0);
  const blurValue = useTransform(backgroundOpacity, [0, 1], [0, 5]);

  // Update motion values when modal opens/closes
  useEffect(() => {
    backgroundOpacity.set(isOpen ? 1 : 0);
  }, [isOpen, backgroundOpacity]);

  // Set the first developer as active by default and initialize task states
  useEffect(() => {
    // Initialize video hidden state based on screen size
    if (typeof window !== "undefined") {
      setVideoHidden(window.innerWidth < 1024);
    }

    if (
      video?.llm_answer?.developers &&
      video.llm_answer.developers.length > 0
    ) {
      setActiveDevTab(video.llm_answer.developers[0].Dev);

      // Initialize task completion states
      const initialStates: Record<string, boolean> = {};
      const initialTextStates: Record<string, string> = {};
      video.llm_answer.developers.forEach((dev) => {
        if (dev.Tasks) {
          dev.Tasks.forEach((task, index) => {
            const taskKey = `${dev.Dev}-${index}`;
            initialStates[taskKey] = task.Completed || false;
            initialTextStates[taskKey] = task.Task || "";
          });
        }
      });
      setTaskCompletionStates(initialStates);
      setInitialTaskStates(initialStates);
      setTaskTextStates(initialTextStates);
      setInitialTaskTextStates(initialTextStates);
    }
  }, [video]);

  // Check for unsaved changes whenever task states change
  useEffect(() => {
    // Compare current states with initial states to detect changes
    const hasCompletionChanges = Object.keys(taskCompletionStates).some(
      (key) => taskCompletionStates[key] !== initialTaskStates[key]
    );

    const hasTextChanges = Object.keys(taskTextStates).some(
      (key) => taskTextStates[key] !== initialTaskTextStates[key]
    );

    setHasUnsavedChanges(hasCompletionChanges || hasTextChanges);
  }, [
    taskCompletionStates,
    initialTaskStates,
    taskTextStates,
    initialTaskTextStates,
  ]);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Format duration for display
  const formatDuration = (duration: number | string): string => {
    if (typeof duration === "string") return duration;

    // If duration is in milliseconds, convert to seconds first
    const totalSeconds =
      duration > 1000 ? Math.floor(duration / 1000) : duration;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Toggle task completion
  const toggleTaskCompletion = (devName: string, taskIndex: number) => {
    const taskId = `${devName}-${taskIndex}`;
    setTaskCompletionStates((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Start editing a task
  const startEditingTask = (
    devName: string,
    taskIndex: number,
    taskText: string
  ) => {
    const taskId = `${devName}-${taskIndex}`;
    setTaskTextStates((prev) => ({
      ...prev,
      [taskId]: taskText,
    }));
  };

  // Save task text edit
  const saveTaskTextEdit = () => {
    if (
      selectedTask &&
      taskTextStates[`${selectedTask.Dev}-${selectedTask.index}`] !==
        selectedTask.Task
    ) {
      setTaskTextStates((prev) => ({
        ...prev,
        [`${selectedTask.Dev}-${selectedTask.index}`]: selectedTask.Task,
      }));
      setSelectedTask(null);
    }
  };

  // Cancel task text edit
  const cancelTaskTextEdit = () => {
    setSelectedTask(null);
  };

  // Save changes to Supabase
  const saveChanges = async () => {
    if (!hasUnsavedChanges) return;

    // Create array of task updates
    const taskCompletionUpdates = Object.keys(taskCompletionStates)
      .filter((key) => taskCompletionStates[key] !== initialTaskStates[key])
      .map((key) => {
        const [devName, indexStr] = key.split("-");
        return {
          devName,
          taskIndex: parseInt(indexStr),
          completed: taskCompletionStates[key],
        };
      });

    // Create array of task text updates
    const taskTextUpdates = Object.keys(taskTextStates)
      .filter((key) => taskTextStates[key] !== initialTaskTextStates[key])
      .map((key) => {
        const [devName, indexStr] = key.split("-");
        return {
          devName,
          taskIndex: parseInt(indexStr),
          text: taskTextStates[key],
        };
      });

    try {
      // Call context method to update in Supabase
      const success = await updateTaskCompletionStatus(
        video.id,
        taskCompletionUpdates,
        taskTextUpdates
      );

      if (success) {
        // Update initial states to match current states
        setInitialTaskStates({ ...taskCompletionStates });
        setInitialTaskTextStates({ ...taskTextStates });
        setHasUnsavedChanges(false);
        notification.success("Tasks updated successfully!");
      } else {
        notification.error("Failed to update tasks, please try again.");
      }
    } catch (error) {
      notification.error("An error occurred while saving changes.");
      console.error("Task update error:", error);
    }
  };

  // Calculate completion stats
  const getCompletionStats = () => {
    const totalTasks = Object.keys(taskCompletionStates).length;
    const completedTasks =
      Object.values(taskCompletionStates).filter(Boolean).length;
    const percentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, percentage };
  };

  // Create URL for embedded Loom video
  const embedUrl = video.link.replace("share/", "embed/");

  const { completedTasks, totalTasks, percentage } = getCompletionStats();

  // Add styles for custom scrollbar to make sure highlight is visible
  useEffect(() => {
    // Add custom scrollbar styles to ensure padding for highlighted items
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .task-item-selected {
        box-shadow: 0 0 0 2px rgb(129, 140, 248), 0 4px 12px rgba(79, 70, 229, 0.3) !important;
        background: rgba(255, 255, 255, 0.08) !important;
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
            transition: { duration: 0.2, delay: 0.1 },
          }}
          style={{ backdropFilter: `blur(${blurValue.get()}px)` }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
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
              y: 20,
              transition: { duration: 0.2 },
            }}
            className="w-full max-w-6xl h-[85vh] bg-gradient-to-b from-slate-900/95 to-slate-800/95 rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col touch-manipulation"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-5 relative flex-shrink-0 border-b border-white/10">
              <div className="absolute top-0 left-0 w-full h-1">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl"></div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-indigo-500/20 rounded-md flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-base sm:text-xl font-semibold text-white mb-0.5 sm:mb-1 line-clamp-1">
                      {video.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs">
                      <p className="text-indigo-300 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1"
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
                      </p>
                      <span className="text-white/50 hidden sm:inline">•</span>
                      <p className="text-white/60 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-indigo-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {formatDuration(video.duration)}
                      </p>
                      <span className="text-white/50 hidden sm:inline">•</span>
                      <p className="text-white/60 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-indigo-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        {(video.llm_answer?.developers || []).length} devs
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mt-2 sm:mt-0">
                  <a
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] sm:text-xs font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    Open in Loom
                  </a>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 sm:w-8 sm:h-8 ml-2  items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors hidden sm:flex"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
              {/* Video Embed Section - Make collapsible on mobile */}
              <div className="w-full lg:w-[55%] lg:h-full">
                <div className="px-3 sm:px-5 py-2 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border-b lg:border-b-0 lg:border-r border-white/10 flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-medium text-white/80">
                    Video Preview
                  </h4>
                  <button
                    onClick={() => setVideoHidden(!videoHidden)}
                    className="lg:hidden flex items-center gap-1 text-white/60 hover:text-white/90 text-xs sm:text-sm bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                  >
                    {videoHidden ? (
                      <>
                        Show Video
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        Hide Video
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 p-2 sm:p-4 pl-3 sm:pl-5 ${
                    videoHidden ? "h-0 p-0" : "h-[220px] sm:h-[300px]"
                  }`}
                >
                  {!videoHidden && (
                    <div className="rounded-lg overflow-hidden bg-black h-full w-full shadow-lg">
                      <iframe
                        src={embedUrl}
                        frameBorder="0"
                        allowFullScreen
                        className="w-full h-full"
                        loading="lazy"
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>

              {/* Task Management Section */}
              <div className="w-full lg:w-[45%] px-3 sm:px-4 pr-3 sm:pr-5 flex flex-col pb-4 overflow-hidden flex-grow">
                {/* Task Progress Stats */}
                <div className="py-3 sm:py-4 border-b border-white/10 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                    <div className="text-white/80 font-medium">
                      Task Progress
                    </div>
                    <div className="text-indigo-300 font-medium">
                      {percentage}% Complete
                    </div>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs text-white/50 mt-1.5 sm:mt-2">
                    <div>{completedTasks} completed</div>
                    <div>{totalTasks} total</div>
                  </div>
                </div>

                {/* Developer Tabs */}
                <div
                  className="flex space-x-1 mb-3 sm:mb-4 overflow-x-auto custom-scrollbar pb-2 scrollbar-thin"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {(video.llm_answer?.developers || []).map((dev) => (
                    <motion.button
                      key={dev.Dev}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap flex items-center ${
                        activeDevTab === dev.Dev
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                      onClick={() => setActiveDevTab(dev.Dev)}
                    >
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[8px] sm:text-xs font-medium mr-1.5 sm:mr-2 shadow-md">
                        {dev.Dev.substring(0, 2).toUpperCase()}
                      </div>
                      {dev.Dev}
                      <span className="ml-1 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 bg-white/10 rounded-full text-[8px] sm:text-xs">
                        {dev.Tasks.length}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Task List - Filtered by Developer */}
                <div
                  className="flex-grow overflow-y-auto pr-2 custom-scrollbar scrollbar-thin"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <div className="space-y-3 sm:space-y-4 p-1 pb-2">
                    {(video.llm_answer?.developers || [])
                      .filter((dev) => activeDevTab === dev.Dev)
                      .flatMap((dev) =>
                        (dev.Tasks || []).map((task, index) => {
                          const taskId = `${dev.Dev}-${index}`;
                          const isCompleted = taskCompletionStates[taskId];
                          const isSelected = selectedTask === task;

                          return (
                            <motion.div
                              key={taskId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                boxShadow: isSelected
                                  ? "0 0 0 2px rgb(129, 140, 248), 0 4px 12px rgba(79, 70, 229, 0.3)"
                                  : "none",
                              }}
                              transition={{
                                delay: index * 0.03,
                                boxShadow: { duration: 0.2 },
                              }}
                              className={`bg-white/5 hover:bg-white/10 rounded-lg p-2.5 sm:p-4 border border-white/5 transition-all m-1 ${
                                isSelected ? "task-item-selected" : ""
                              }`}
                            >
                              <div className="flex">
                                <div
                                  className="w-5 h-5 mt-0.5 mr-3 rounded-md border border-white/20 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                                  onClick={() =>
                                    toggleTaskCompletion(dev.Dev, index)
                                  }
                                >
                                  {isCompleted && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5 text-green-400"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>

                                <div className="flex-1">
                                  {selectedTask &&
                                  selectedTask.Dev === dev.Dev &&
                                  selectedTask.index === index ? (
                                    <div className="flex flex-col space-y-2">
                                      <input
                                        type="text"
                                        value={selectedTask.Task}
                                        onChange={(e) =>
                                          setTaskTextStates((prev) => ({
                                            ...prev,
                                            [taskId]: e.target.value,
                                          }))
                                        }
                                        className="w-full bg-white/10 text-white/90 px-3 py-1.5 rounded border border-white/20 focus:border-indigo-500 focus:outline-none text-sm"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            saveTaskTextEdit();
                                          if (e.key === "Escape")
                                            cancelTaskTextEdit();
                                        }}
                                      />
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={saveTaskTextEdit}
                                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3 mr-1"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          Save
                                        </button>
                                        <button
                                          onClick={cancelTaskTextEdit}
                                          className="px-2 py-1 text-xs bg-white/10 text-white/80 rounded hover:bg-white/20 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() =>
                                        setSelectedTask(
                                          task === selectedTask
                                            ? null
                                            : {
                                                ...task,
                                                Dev: dev.Dev,
                                                index,
                                              }
                                        )
                                      }
                                    >
                                      <div className="flex justify-between items-start">
                                        <h4
                                          className={`text-sm font-medium transition-all ${
                                            isCompleted
                                              ? "text-white/50 line-through"
                                              : "text-white/90"
                                          }`}
                                        >
                                          {taskTextStates[taskId]}
                                        </h4>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            startEditingTask(
                                              dev.Dev,
                                              index,
                                              taskTextStates[taskId]
                                            );
                                          }}
                                          className="text-white/40 hover:text-white/90 p-1 rounded-full hover:bg-white/10 transition-colors"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                          </svg>
                                        </button>
                                      </div>

                                      <div className="flex items-center mt-2 justify-between">
                                        <p className="text-xs text-white/50 flex items-center">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5 mr-1 text-indigo-400/60"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          {task.Timestamp}
                                        </p>

                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${
                                            isCompleted
                                              ? "bg-green-500/10 text-green-400"
                                              : "bg-blue-500/10 text-blue-400"
                                          }`}
                                        >
                                          {isCompleted
                                            ? "Completed"
                                            : "In Progress"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-5 border-t border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-white/60 hidden sm:block">
                {hasUnsavedChanges ? (
                  <span className="text-indigo-300">
                    You have unsaved changes
                  </span>
                ) : (
                  "Task changes will be saved automatically"
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-1.5 sm:hidden"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Close
                </button>
                <button
                  onClick={saveChanges}
                  disabled={!hasUnsavedChanges || taskIsSaving}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 ${
                    hasUnsavedChanges && !taskIsSaving
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-indigo-600/50 cursor-not-allowed"
                  } text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center`}
                >
                  {taskIsSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
