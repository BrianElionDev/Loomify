"use client";

import { createContext, useContext, useState } from "react";
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

// Fetch a single Loom video by ID
const fetchLoomVideo = async (id: string): Promise<LoomAnalysis> => {
  const { data, error } = await supabase
    .from("loom_analysis")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch video: ${error.message}`);
  }

  return data;
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
  // First get the current video data
  const videoData = await fetchLoomVideo(videoId);

  // Make a deep copy of the video data to modify
  const updatedVideo = JSON.parse(JSON.stringify(videoData));

  // Apply all completion status updates
  taskCompletionUpdates.forEach(({ devName, taskIndex, completed }) => {
    const devIndex = updatedVideo.llm_answer.developers.findIndex(
      (dev: Developer) => dev.Dev === devName
    );

    if (
      devIndex !== -1 &&
      updatedVideo.llm_answer.developers[devIndex].Tasks &&
      updatedVideo.llm_answer.developers[devIndex].Tasks[taskIndex]
    ) {
      updatedVideo.llm_answer.developers[devIndex].Tasks[taskIndex].completed =
        completed;
    }
  });

  // Apply all task text updates
  taskTextUpdates.forEach(({ devName, taskIndex, text }) => {
    const devIndex = updatedVideo.llm_answer.developers.findIndex(
      (dev: Developer) => dev.Dev === devName
    );

    if (
      devIndex !== -1 &&
      updatedVideo.llm_answer.developers[devIndex].Tasks &&
      updatedVideo.llm_answer.developers[devIndex].Tasks[taskIndex]
    ) {
      updatedVideo.llm_answer.developers[devIndex].Tasks[taskIndex].Task = text;
    }
  });

  // Update in Supabase
  const { data, error: updateError } = await supabase
    .from("loom_analysis")
    .update({ llm_answer: updatedVideo.llm_answer })
    .eq("id", videoId)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating tasks:", updateError);
    throw new Error(`Failed to update video: ${updateError.message}`);
  }

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
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.loomData],
    queryFn: fetchLoomData,
  });

  // Extract error message
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "An error occurred"
    : null;

  // Mutation for updating task completion status
  const { mutateAsync: updateTask } = useMutation({
    mutationFn: updateLoomVideo,
    onSuccess: (updatedVideo) => {
      // Optimistically update the video in the cached data
      queryClient.setQueryData(
        [QUERY_KEYS.loomData],
        (oldData: LoomAnalysis[] | undefined) => {
          if (!oldData) return [updatedVideo];
          return oldData.map((video) =>
            video.id === updatedVideo.id ? updatedVideo : video
          );
        }
      );

      // Also update the individual video query if it exists
      queryClient.setQueryData(
        QUERY_KEYS.loomVideo(updatedVideo.id),
        updatedVideo
      );
    },
  });

  // Function to manually refresh data
  const refreshData = async () => {
    try {
      setTaskIsSaving(true);
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
      setTaskIsSaving(false);
    }
  };

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

      return true;
    } catch (err) {
      console.error("Error updating tasks:", err);
      return false;
    } finally {
      setTaskIsSaving(false);
    }
  };

  return (
    <LoomContext.Provider
      value={{
        loomData,
        loading,
        error,
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
