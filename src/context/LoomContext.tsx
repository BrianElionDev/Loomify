"use client";

import { createContext, useContext, useState, useEffect } from "react";
import React from "react";
import { LoomAnalysis, Developer } from "@/types/loom";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query keys for React Query
const QUERY_KEYS = {
  loomData: "loom-data",
  loomVideo: (id: string) => ["loom-video", id],
};

interface LoomContextType {
  loomData: LoomAnalysis[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateTaskCompletionStatus: (
    videoId: string,
    taskCompletionUpdates: {
      devName: string;
      taskIndex: number;
      completed: boolean;
    }[],
    taskTextUpdates?: { devName: string; taskIndex: number; text: string }[]
  ) => Promise<boolean>;
  taskIsSaving: boolean;
}

const LoomContext = createContext<LoomContextType | undefined>(undefined);

// Fetch all Loom videos
const fetchLoomData = async (): Promise<LoomAnalysis[]> => {
  console.log("Fetching Loom data from Supabase...");
  const { data, error } = await supabase
    .from("loom_analysis")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }

  return data || [];
};

// Update task completion and text
const updateLoomVideo = async ({
  videoId,
  taskCompletionUpdates,
  taskTextUpdates = [],
}: {
  videoId: string;
  taskCompletionUpdates: {
    devName: string;
    taskIndex: number;
    completed: boolean;
  }[];
  taskTextUpdates: { devName: string; taskIndex: number; text: string }[];
}): Promise<LoomAnalysis> => {
  // Get current video data
  const { data: currentVideo, error: fetchError } = await supabase
    .from("loom_analysis")
    .select("*")
    .eq("id", videoId)
    .single();

  if (fetchError) throw fetchError;

  // Create a deep copy of the developers array
  const updatedDevelopers = JSON.parse(
    JSON.stringify(currentVideo.llm_answer.developers)
  );

  // Update task completion status
  taskCompletionUpdates.forEach(({ devName, taskIndex, completed }) => {
    const dev = updatedDevelopers.find((d: Developer) => d.Dev === devName);
    if (dev && dev.Tasks && dev.Tasks[taskIndex]) {
      dev.Tasks[taskIndex].Completed = completed;
    }
  });

  // Update task text
  taskTextUpdates.forEach(({ devName, taskIndex, text }) => {
    const dev = updatedDevelopers.find((d: Developer) => d.Dev === devName);
    if (dev && dev.Tasks && dev.Tasks[taskIndex]) {
      dev.Tasks[taskIndex].Task = text;
    }
  });

  // Update in Supabase
  const { data, error: updateError } = await supabase
    .from("loom_analysis")
    .update({
      llm_answer: { ...currentVideo.llm_answer, developers: updatedDevelopers },
    })
    .eq("id", videoId)
    .select()
    .single();

  if (updateError) throw updateError;
  return data;
};

export function LoomProvider({ children }: { children: React.ReactNode }) {
  const [taskIsSaving, setTaskIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Use React Query to fetch and cache the Loom data
  const {
    data: loomData = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: [QUERY_KEYS.loomData],
    queryFn: fetchLoomData,
  });

  // Extract error message
  const queryErrorMsg = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "An error occurred"
    : null;

  // Function to manually refresh data
  const refreshData = async () => {
    try {
      const timeoutPromise = new Promise<LoomAnalysis[]>((_, reject) => {
        setTimeout(() => reject(new Error("Refresh timeout")), 5000);
      });

      await Promise.race<LoomAnalysis[]>([fetchLoomData(), timeoutPromise]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Mutation for updating task completion status
  const { mutateAsync: updateTask } = useMutation({
    mutationFn: updateLoomVideo,
    onSuccess: (updatedVideo) => {
      // Update cache
      queryClient.setQueryData(
        [QUERY_KEYS.loomData],
        (oldData: LoomAnalysis[] | undefined) => {
          if (!oldData) return [updatedVideo];
          return oldData.map((video) =>
            video.id === updatedVideo.id ? updatedVideo : video
          );
        }
      );
      // Refetch in background
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.loomData] });
    },
  });

  // Function to update task completion status
  const updateTaskCompletionStatus = async (
    videoId: string,
    taskCompletionUpdates: {
      devName: string;
      taskIndex: number;
      completed: boolean;
    }[],
    taskTextUpdates: { devName: string; taskIndex: number; text: string }[] = []
  ): Promise<boolean> => {
    try {
      setTaskIsSaving(true);
      await updateTask({
        videoId,
        taskCompletionUpdates,
        taskTextUpdates,
      });
      setTaskIsSaving(false);
      return true;
    } catch (error) {
      console.error("Error updating task completion status:", error);
      setTaskIsSaving(false);
      return false;
    }
  };

  // Add a cleanup effect to ensure taskIsSaving is reset
  useEffect(() => {
    return () => {
      setTaskIsSaving(false);
    };
  }, []);

  return (
    <LoomContext.Provider
      value={{
        loomData,
        loading,
        error: queryErrorMsg,
        refreshData,
        updateTaskCompletionStatus,
        taskIsSaving,
      }}
    >
      {children}
    </LoomContext.Provider>
  );
}

export function useLoom() {
  const context = useContext(LoomContext);
  if (context === undefined) {
    throw new Error("useLoom must be used within a LoomProvider");
  }
  return context;
}
