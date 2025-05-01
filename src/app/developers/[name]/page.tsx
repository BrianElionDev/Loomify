"use client";

import { useState, useMemo, useEffect } from "react";
import { useLoom } from "@/context/LoomContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Filter,
  Search,
  VideoIcon,
  Calendar,
  FolderKanban,
} from "lucide-react";
import { Task } from "@/types/loom";
import { useNotification } from "@/hooks/useNotification";
import VideoModal from "@/components/VideoModal";

// Define an interface for the extended task
interface ExtendedTask extends Task {
  videoId: string;
  videoTitle?: string;
  project?: string;
  thumbnail?: string;
  taskIndex: number;
  date?: string; // For sorting/grouping
}

// Helper function to format dates
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Check if a date is today
const isToday = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  return today.toDateString() === date.toDateString();
};

// Check if a date is yesterday
const isYesterday = (dateString: string) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(dateString);
  return yesterday.toDateString() === date.toDateString();
};

export default function DeveloperPage() {
  const { name } = useParams<{ name: string }>();
  const { loomData, loading, error, updateTaskCompletionStatus, refreshData } =
    useLoom();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [recordingTypeFilter, setRecordingTypeFilter] = useState<string | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [groupBy, setGroupBy] = useState<"date" | "project" | "recording_type">(
    "date"
  );
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);
  const [taskTextStates, setTaskTextStates] = useState<Record<string, string>>(
    {}
  );
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const notification = useNotification();

  // Decode the URL-encoded name
  const developerName = useMemo(
    () => decodeURIComponent(name as string),
    [name]
  );

  // Collect all tasks for this developer from all videos
  const developerTasks = useMemo(() => {
    if (!loomData || loading) return [];

    const tasks: ExtendedTask[] = [];

    for (const video of loomData) {
      if (!video.llm_answer?.developers) continue;

      const developer = video.llm_answer.developers.find(
        (dev) => dev.Dev.toLowerCase() === developerName.toLowerCase()
      );

      if (developer && developer.Tasks) {
        developer.Tasks.forEach((task, index) => {
          // Use video date or created_at or current date as fallback
          const date =
            video.date || video.created_at || new Date().toISOString();

          tasks.push({
            ...task,
            videoId: video.id,
            videoTitle: video.title,
            project: video.project,
            thumbnail: video.thumbnail,
            taskIndex: index,
            date: date,
          });
        });
      }
    }

    // Sort tasks by date (newest first)
    return tasks.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [loomData, developerName, loading]);

  // Initialize task text states
  useEffect(() => {
    if (developerTasks.length) {
      const initialTextStates: Record<string, string> = {};
      developerTasks.forEach((task) => {
        const taskKey = `${task.videoId}-${task.taskIndex}`;
        initialTextStates[taskKey] = task.Task;
      });
      setTaskTextStates(initialTextStates);
    }
  }, [developerTasks]);

  // Get unique projects, dates, and recording types
  const { projects, dates, recordingTypes } = useMemo(() => {
    const projectSet = new Set<string>();
    const dateSet = new Set<string>();
    const recordingTypeSet = new Set<string>();

    developerTasks.forEach((task) => {
      if (task.project) projectSet.add(task.project);
      if (task.date) {
        const date = new Date(task.date);
        dateSet.add(date.toISOString().split("T")[0]); // YYYY-MM-DD format
      }

      // Get the video from loomData to access recording_type
      const video = loomData?.find((video) => video.id === task.videoId);
      if (video?.recording_type) {
        recordingTypeSet.add(video.recording_type);
      }
    });

    return {
      projects: Array.from(projectSet).sort(),
      dates: Array.from(dateSet).sort().reverse(), // Newest first
      recordingTypes: Array.from(recordingTypeSet).sort(),
    };
  }, [developerTasks, loomData]);

  // Filter tasks based on search, status, date, project, and recording_type
  const filteredTasks = useMemo(() => {
    if (!developerTasks.length) return [];

    return developerTasks.filter((task) => {
      // Apply status filter
      if (statusFilter === "completed" && !task.Completed) return false;
      if (statusFilter === "pending" && task.Completed) return false;

      // Apply date filter
      if (dateFilter && task.date) {
        const taskDate = new Date(task.date).toISOString().split("T")[0];
        if (taskDate !== dateFilter) return false;
      }

      // Apply project filter
      if (projectFilter && task.project !== projectFilter) return false;

      // Apply recording_type filter
      if (recordingTypeFilter) {
        const video = loomData?.find((video) => video.id === task.videoId);
        if (!video || video.recording_type !== recordingTypeFilter)
          return false;
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.Task.toLowerCase().includes(query) ||
          task.videoTitle?.toLowerCase().includes(query) ||
          task.project?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [
    developerTasks,
    searchQuery,
    statusFilter,
    dateFilter,
    projectFilter,
    recordingTypeFilter,
    loomData,
  ]);

  // Group tasks by date, project or recording_type
  const groupedTasks = useMemo(() => {
    if (groupBy === "date") {
      const groups = new Map<string, ExtendedTask[]>();

      // Initialize with empty arrays for today and yesterday for better UX
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];
      groups.set(today, []);
      groups.set(yesterday, []);

      filteredTasks.forEach((task) => {
        if (!task.date) return;

        const dateKey = new Date(task.date).toISOString().split("T")[0];
        if (!groups.has(dateKey)) {
          groups.set(dateKey, []);
        }
        groups.get(dateKey)?.push(task);
      });

      // Convert to array and sort by date (newest first)
      return Array.from(groups.entries())
        .filter(([, tasks]) => tasks.length > 0) // Remove empty dates
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
    } else if (groupBy === "project") {
      const groups = new Map<string, ExtendedTask[]>();

      // Add "No Project" group
      groups.set("No Project", []);

      filteredTasks.forEach((task) => {
        const projectKey = task.project || "No Project";
        if (!groups.has(projectKey)) {
          groups.set(projectKey, []);
        }
        groups.get(projectKey)?.push(task);
      });

      // Convert to array and sort alphabetically
      return Array.from(groups.entries())
        .filter(([, tasks]) => tasks.length > 0) // Remove empty projects
        .sort(([projectA], [projectB]) => {
          // Keep "No Project" at the end
          if (projectA === "No Project") return 1;
          if (projectB === "No Project") return -1;
          return projectA.localeCompare(projectB);
        });
    } else {
      // Group by recording_type
      const groups = new Map<string, ExtendedTask[]>();

      // Add "Unspecified" group
      groups.set("Unspecified", []);

      filteredTasks.forEach((task) => {
        const video = loomData?.find((video) => video.id === task.videoId);
        const recordingTypeKey = video?.recording_type || "Unspecified";

        if (!groups.has(recordingTypeKey)) {
          groups.set(recordingTypeKey, []);
        }
        groups.get(recordingTypeKey)?.push(task);
      });

      // Convert to array and sort alphabetically
      return Array.from(groups.entries())
        .filter(([, tasks]) => tasks.length > 0) // Remove empty recording types
        .sort(([typeA], [typeB]) => {
          // Keep "Unspecified" at the end
          if (typeA === "Unspecified") return 1;
          if (typeB === "Unspecified") return -1;
          return typeA.localeCompare(typeB);
        });
    }
  }, [filteredTasks, groupBy, loomData]);

  // Stats
  const stats = useMemo(() => {
    const total = developerTasks.length;
    const completed = developerTasks.filter((task) => task.Completed).length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }, [developerTasks]);

  // Handle task status toggle
  const toggleTaskStatus = async (task: ExtendedTask) => {
    if (saving) return;

    const taskKey = `${task.videoId}-${task.taskIndex}`;
    setLoadingTasks((prev) => ({ ...prev, [taskKey]: true }));

    try {
      const result = await updateTaskCompletionStatus(task.videoId, [
        {
          devName: developerName,
          taskIndex: task.taskIndex,
          completed: !task.Completed,
        },
      ]);

      console.log("Task status updated:", result);

      // Add success notification with longer duration
      notification.success(
        task.Completed
          ? "Task marked as incomplete"
          : "Task marked as complete",
        { duration: 5000 }
      );

      // Refresh data to update UI
      refreshData();
    } catch (err) {
      console.error("Failed to update task status:", err);
      notification.error("Failed to update task status");
    } finally {
      setLoadingTasks((prev) => ({ ...prev, [taskKey]: false }));
    }
  };

  // Start editing a task
  const startEditingTask = (task: ExtendedTask) => {
    setSelectedTask(task);
  };

  // Save task text edit
  const saveTaskTextEdit = async () => {
    if (!selectedTask) return;

    const taskKey = `${selectedTask.videoId}-${selectedTask.taskIndex}`;
    const updatedText = taskTextStates[taskKey];

    if (updatedText === selectedTask.Task) {
      setSelectedTask(null);
      return;
    }

    setSaving(true);
    try {
      const result = await updateTaskCompletionStatus(
        selectedTask.videoId,
        [],
        [
          {
            devName: developerName,
            taskIndex: selectedTask.taskIndex,
            text: updatedText,
          },
        ]
      );

      console.log("Task text updated:", result);

      notification.success("Task text updated successfully", {
        duration: 5000,
      });

      // Refresh data to update UI
      refreshData();
    } catch (err) {
      console.error("Failed to update task text:", err);
      notification.error("Failed to update task text");
    } finally {
      setSaving(false);
      setSelectedTask(null);
    }
  };

  // Cancel task text edit
  const cancelTaskTextEdit = () => {
    if (selectedTask) {
      const taskKey = `${selectedTask.videoId}-${selectedTask.taskIndex}`;
      setTaskTextStates((prev) => ({
        ...prev,
        [taskKey]: selectedTask.Task,
      }));
      setSelectedTask(null);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (isToday(dateString)) return "Today";
    if (isYesterday(dateString)) return "Yesterday";
    return formatDate(dateString);
  };

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
              {developerName}
            </h1>
            <p className="text-sm sm:text-base text-white/60">
              Task management and progress tracking
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-500/10 text-indigo-300 text-xs sm:text-sm font-medium rounded-lg flex items-center">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {loading ? (
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-indigo-500/20 rounded animate-pulse" />
              ) : (
                `${stats.total} Tasks`
              )}
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500/10 text-emerald-300 text-xs sm:text-sm font-medium rounded-lg flex items-center">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {loading ? (
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-emerald-500/20 rounded animate-pulse" />
              ) : (
                `${stats.completed} Completed`
              )}
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/10 text-amber-300 text-xs sm:text-sm font-medium rounded-lg flex items-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {loading ? (
                <div className="h-3 sm:h-4 w-12 sm:w-16 bg-amber-500/20 rounded animate-pulse" />
              ) : (
                `${stats.pending} Pending`
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white/80 font-medium">Progress</h2>
          <span className="text-white/70 text-sm">{stats.completionRate}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </motion.div>

      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 mb-4 bg-white/5 rounded-lg p-1 w-fit"
      >
        <button
          onClick={() => setGroupBy("date")}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
            groupBy === "date"
              ? "bg-indigo-500/20 text-indigo-300"
              : "text-white/60 hover:text-white/80"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          By Date
        </button>
        <button
          onClick={() => setGroupBy("project")}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
            groupBy === "project"
              ? "bg-indigo-500/20 text-indigo-300"
              : "text-white/60 hover:text-white/80"
          }`}
        >
          <FolderKanban className="h-3.5 w-3.5" />
          By Project
        </button>
        <button
          onClick={() => setGroupBy("recording_type")}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
            groupBy === "recording_type"
              ? "bg-indigo-500/20 text-indigo-300"
              : "text-white/60 hover:text-white/80"
          }`}
        >
          <VideoIcon className="h-3.5 w-3.5" />
          By Recording Type
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1 sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Search className="h-4 w-4 text-indigo-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2 pl-9 pr-4 bg-indigo-900/40 border-2 border-indigo-500/40 hover:border-indigo-500/60 rounded-lg text-indigo-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 w-full backdrop-blur-sm shadow-lg"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Filter className="h-4 w-4 text-purple-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "completed" | "pending")
            }
            className="py-2 pl-9 pr-8 bg-purple-900/40 border-2 border-purple-500/40 hover:border-purple-500/60 rounded-lg text-purple-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 appearance-none backdrop-blur-sm shadow-lg w-full sm:w-auto"
            style={{ WebkitAppearance: "none" }}
          >
            <option
              value="all"
              className="bg-slate-800 text-purple-300 font-medium"
            >
              All Tasks
            </option>
            <option
              value="completed"
              className="bg-slate-800 text-purple-300 font-medium"
            >
              Completed
            </option>
            <option
              value="pending"
              className="bg-slate-800 text-purple-300 font-medium"
            >
              Pending
            </option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400"
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
          </div>
        </div>

        {groupBy === "date" && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Calendar className="h-4 w-4 text-indigo-400" />
            </div>
            <select
              value={dateFilter || ""}
              onChange={(e) => setDateFilter(e.target.value || null)}
              className="py-2 pl-9 pr-8 bg-indigo-900/40 border-2 border-indigo-500/40 hover:border-indigo-500/60 rounded-lg text-indigo-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 appearance-none backdrop-blur-sm shadow-lg w-full sm:w-auto"
              style={{ WebkitAppearance: "none" }}
            >
              <option
                value=""
                className="bg-slate-800 text-indigo-300 font-medium"
              >
                All Dates
              </option>
              {dates.map((date) => (
                <option
                  key={date}
                  value={date}
                  className="bg-slate-800 text-indigo-300 font-medium"
                >
                  {formatDateForDisplay(date)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-indigo-400"
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
            </div>
          </div>
        )}

        {groupBy === "project" && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <FolderKanban className="h-4 w-4 text-indigo-400" />
            </div>
            <select
              value={projectFilter || ""}
              onChange={(e) => setProjectFilter(e.target.value || null)}
              className="py-2 pl-9 pr-8 bg-indigo-900/40 border-2 border-indigo-500/40 hover:border-indigo-500/60 rounded-lg text-indigo-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 appearance-none backdrop-blur-sm shadow-lg w-full sm:w-auto"
              style={{ WebkitAppearance: "none" }}
            >
              <option
                value=""
                className="bg-slate-800 text-indigo-300 font-medium"
              >
                All Projects
              </option>
              {projects.map((project) => (
                <option
                  key={project}
                  value={project}
                  className="bg-slate-800 text-indigo-300 font-medium"
                >
                  {project}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-indigo-400"
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
            </div>
          </div>
        )}

        {groupBy === "recording_type" && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <VideoIcon className="h-4 w-4 text-indigo-400" />
            </div>
            <select
              value={recordingTypeFilter || ""}
              onChange={(e) => setRecordingTypeFilter(e.target.value || null)}
              className="py-2 pl-9 pr-8 bg-indigo-900/40 border-2 border-indigo-500/40 hover:border-indigo-500/60 rounded-lg text-indigo-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 appearance-none backdrop-blur-sm shadow-lg w-full sm:w-auto"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-indigo-400"
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
            </div>
          </div>
        )}
      </motion.div>

      {/* Tasks list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-xl border border-slate-700/40 p-4 animate-pulse"
            >
              <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-700/30 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-700/30 rounded w-5/6"></div>
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
      ) : filteredTasks.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/40 rounded-xl text-center">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-slate-700/30 rounded-full mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white/80 mb-2">
            No Tasks Found
          </h3>
          <p className="text-white/60 text-sm">
            {developerTasks.length === 0
              ? `No tasks have been assigned to ${developerName} yet.`
              : `No tasks match your current filters. Try adjusting your search criteria.`}
          </p>
        </div>
      ) : (
        <motion.div
          className="space-y-6"
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
          {groupedTasks.map(([groupName, tasks]) => (
            <div key={groupName}>
              {/* Group header */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                className="mb-3"
              >
                <h3 className="text-base sm:text-lg font-medium text-white/80 flex items-center">
                  {groupBy === "date" ? (
                    <>
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-400" />
                      {formatDateForDisplay(groupName)}
                    </>
                  ) : groupBy === "project" ? (
                    <>
                      <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-400" />
                      {groupName}
                    </>
                  ) : (
                    <>
                      <VideoIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-indigo-400" />
                      {groupName}
                    </>
                  )}
                  <span className="ml-2 text-xs sm:text-sm text-white/50">
                    ({tasks.length} task{tasks.length !== 1 ? "s" : ""})
                  </span>
                </h3>
              </motion.div>

              {/* Tasks in this group */}
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div
                    key={`${task.videoId}-${task.taskIndex}`}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className={`bg-gradient-to-r ${
                      task.Completed
                        ? "from-emerald-900/10 to-emerald-800/5 border-emerald-500/10"
                        : "from-slate-900 to-slate-800/80 border-slate-700/40"
                    } rounded-xl border p-4 sm:p-5 hover:border-indigo-500/30 transition-colors shadow-md`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div
                        onClick={() => toggleTaskStatus(task)}
                        className={`flex-shrink-0 cursor-pointer ${
                          loadingTasks[`${task.videoId}-${task.taskIndex}`]
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        {loadingTasks[`${task.videoId}-${task.taskIndex}`] ? (
                          <div className="h-6 w-6 flex items-center justify-center">
                            <svg
                              className="animate-spin h-4 w-4 text-indigo-400"
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
                          </div>
                        ) : task.Completed ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <Circle className="h-6 w-6 text-white/30 hover:text-white/60" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        {selectedTask &&
                        selectedTask.videoId === task.videoId &&
                        selectedTask.taskIndex === task.taskIndex ? (
                          <div className="flex flex-col space-y-2">
                            <textarea
                              value={
                                taskTextStates[
                                  `${task.videoId}-${task.taskIndex}`
                                ] || ""
                              }
                              onChange={(e) => {
                                const taskKey = `${task.videoId}-${task.taskIndex}`;
                                setTaskTextStates((prev) => ({
                                  ...prev,
                                  [taskKey]: e.target.value,
                                }));
                              }}
                              className="w-full bg-white/10 text-white/90 px-3 py-2 rounded border border-white/20 focus:border-indigo-500 focus:outline-none text-sm min-h-[80px] resize-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && e.ctrlKey)
                                  saveTaskTextEdit();
                                if (e.key === "Escape") cancelTaskTextEdit();
                              }}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={saveTaskTextEdit}
                                disabled={saving}
                                className={`px-2 py-1 text-xs ${
                                  saving
                                    ? "bg-indigo-600/50"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                } text-white rounded transition-colors flex items-center`}
                              >
                                {saving ? (
                                  <>
                                    <svg
                                      className="animate-spin h-3 w-3 mr-1.5"
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
                                    Saving...
                                  </>
                                ) : (
                                  <>
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
                                  </>
                                )}
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
                          <>
                            <div className="flex justify-between items-start">
                              <p
                                className={`text-sm sm:text-base ${
                                  task.Completed
                                    ? "text-white/60 line-through"
                                    : "text-white/90"
                                }`}
                              >
                                {taskTextStates[
                                  `${task.videoId}-${task.taskIndex}`
                                ] || task.Task}
                              </p>
                              <button
                                onClick={() => startEditingTask(task)}
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

                            <div className="flex flex-wrap gap-2 items-center text-xs text-white/60">
                              {task.Timestamp && (
                                <span className="inline-flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.Timestamp}
                                </span>
                              )}

                              {/* Only show project badge when grouping by date */}
                              {groupBy === "date" && task.project && (
                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded">
                                  {task.project}
                                </span>
                              )}

                              {/* Only show date badge when grouping by project */}
                              {groupBy === "project" && task.date && (
                                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded">
                                  {formatDate(task.date)}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedVideoId(task.videoId)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white/70 text-xs rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        title="View source video"
                      >
                        <VideoIcon className="h-3 w-3" />
                        <span className="sm:inline hidden">View Video</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {selectedVideoId && (
        <VideoModal
          videoId={selectedVideoId}
          isOpen={!!selectedVideoId}
          onClose={() => setSelectedVideoId(null)}
        />
      )}
    </div>
  );
}
