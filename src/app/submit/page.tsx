"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLoom } from "@/context/LoomContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@/hooks/useNotification";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";

// Submit Loom URL to microservice API
const submitLoomUrl = async ({
  loomUrl,
  project,
}: {
  loomUrl: string;
  project: string;
}) => {
  try {
    console.log("Submitting URL:", loomUrl, "Project:", project);

    // Use our proxy API route to avoid CORS issues
    const response = await axios.post(
      "/api/loom-proxy",
      {
        loom_url: loomUrl,
        project: project,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Increase timeout for potentially slow operations
        timeout: 60000, // 60 seconds
      }
    );

    console.log("API Response:", response.data);

    // Check if the response is actually an error (API might return 200 but with error inside)
    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error("API call failed:", error);

    // Get the most specific error message we can
    let errorMessage = "Unknown error occurred";

    if (axios.isAxiosError(error)) {
      // Handle Axios specific errors
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Log additional details for debugging
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(`API Error: ${errorMessage}`);
  }
};

export default function SubmitPage() {
  const router = useRouter();
  const { refreshData } = useLoom();
  const [loomUrl, setLoomUrl] = useState("");
  const [project, setProject] = useState("CryptoLens");
  const [redirecting, setRedirecting] = useState(false);
  const queryClient = useQueryClient();
  const notification = useNotification();

  // Projects available for selection as JSON
  const projects = [
    { id: 1, name: "CryptoLens", color: "indigo" },
    { id: 2, name: "Agent Based Market Analysis", color: "purple" },
    { id: 3, name: "Internal Tools", color: "blue" },
  ];

  // Get color class for project
  const getProjectColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      indigo: "text-indigo-300",
      purple: "text-purple-300",
      blue: "text-blue-300",
    };
    return colorMap[colorName] || "text-white/80";
  };

  // Get background color class for project
  const getProjectBgClass = (colorName: string) => {
    const bgMap: Record<string, string> = {
      indigo:
        "bg-indigo-900/40 border-indigo-500/40 hover:border-indigo-500/60 focus:ring-indigo-500",
      purple:
        "bg-purple-900/40 border-purple-500/40 hover:border-purple-500/60 focus:ring-purple-500",
      blue: "bg-blue-900/40 border-blue-500/40 hover:border-blue-500/60 focus:ring-blue-500",
    };
    return (
      bgMap[colorName] ||
      "bg-white/5 border-white/10 hover:border-white/20 focus:ring-white/30"
    );
  };

  // Get the selected project object
  const selectedProject =
    projects.find((p) => p.id.toString() === project.toString()) || projects[0];

  // Handle redirect after success
  useEffect(() => {
    if (redirecting) {
      // Wait 2.5 seconds before redirecting to allow the success notification to be visible
      const timer = setTimeout(() => {
        router.push("/");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [redirecting, router]);

  // Use React Query mutation
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: submitLoomUrl,
    onSuccess: (data) => {
      console.log("Submission successful:", data);

      notification.success(
        "Loom video has been successfully submitted for analysis!"
      );
      setLoomUrl("");

      // Refresh the data
      refreshData();
      queryClient.invalidateQueries({ queryKey: ["loom-data"] });

      // Set redirecting state without showing additional notification
      setRedirecting(true);
    },
    onError: (err) => {
      console.error("Submission error details:", err);
      notification.error(
        err instanceof Error
          ? err.message
          : "Failed to submit Loom URL. Please check your connection and try again."
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!loomUrl.trim()) {
      notification.error("Please enter a Loom URL");
      return;
    }

    if (!loomUrl.includes("loom.com/share/")) {
      notification.error("Please enter a valid Loom share URL");
      return;
    }

    // Submit with React Query
    mutate({ loomUrl, project });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 py-4 sm:py-6">
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
        className="bg-gradient-to-r from-slate-900 to-slate-800/80 p-4 sm:p-6 rounded-xl border border-slate-700/40 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
          <div className="h-10 w-10 bg-indigo-500/20 rounded-md flex items-center justify-center mb-2 sm:mb-0 sm:mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-indigo-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white/90">
              Submit Loom Video
            </h2>
            <p className="text-white/60 text-sm sm:text-base">
              Submit your Loom video URL for AI analysis and task generation
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="loomUrl"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Loom Share URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
              </div>
              <input
                id="loomUrl"
                name="loomUrl"
                type="url"
                value={loomUrl}
                onChange={(e) => setLoomUrl(e.target.value)}
                placeholder="https://www.loom.com/share/your-video-id"
                className="py-3 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-white/80 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            <p className="mt-2 text-sm text-white/50">
              Paste the full Loom share URL
              <span className="block sm:inline">
                (e.g.,{" "}
                <span className="break-all">
                  https://www.loom.com/share/0ab8c7b6e55b4d9daa8a8b48dee80378
                </span>
                )
              </span>
            </p>
          </div>

          <div>
            <label
              htmlFor="project"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Project
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FolderKanban
                  className={`h-5 w-5 ${getProjectColorClass(
                    selectedProject.color
                  )}`}
                />
              </div>
              <select
                id="project"
                name="project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className={`py-3 pl-10 pr-4 ${getProjectBgClass(
                  selectedProject.color
                )} border-2 rounded-lg ${getProjectColorClass(
                  selectedProject.color
                )} text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:border-transparent w-full appearance-none backdrop-blur-sm shadow-lg`}
              >
                {projects.map((proj) => (
                  <option
                    key={proj.id}
                    value={proj.id}
                    className="bg-slate-800 font-medium"
                  >
                    {proj.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${getProjectColorClass(
                    selectedProject.color
                  )}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <p
              className={`mt-2 text-sm ${getProjectColorClass(
                selectedProject.color
              ).replace("300", "400/70")}`}
            >
              Select the project this Loom video is associated with
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-white font-medium ${
                isSubmitting
                  ? "bg-indigo-600/50 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } transition-colors flex items-center justify-center sm:justify-start`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white"
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
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 sm:h-5 w-4 sm:w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Submit for Analysis
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800/80 p-4 sm:p-6 rounded-xl border border-slate-700/40 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          How it Works
        </h3>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold mr-3 flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="text-white/90 font-medium">Paste your Loom URL</h4>
              <p className="text-white/60 text-sm">
                Paste the share URL of your Loom video above and select the
                project this Loom video is associated with.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold mr-3 flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="text-white/90 font-medium">AI Analysis</h4>
              <p className="text-white/60 text-sm">
                Our system uses AI to analyze the video content, transcript, and
                context.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold mr-3 flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="text-white/90 font-medium">Task Generation</h4>
              <p className="text-white/60 text-sm">
                The system extracts tasks, assigns developers, and creates a
                structured task list.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold mr-3 flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="text-white/90 font-medium">Track Progress</h4>
              <p className="text-white/60 text-sm">
                Return to the dashboard to view, manage, and track the progress
                of your tasks.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
