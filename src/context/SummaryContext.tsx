"use client";

import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MeetingSummary } from "@/types/summary";

// Query keys for React Query
const QUERY_KEYS = {
  summaryData: "meeting-summaries",
  summary: (id: string) => ["meeting-summary", id],
};

interface SummaryContextType {
  summaries: MeetingSummary[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getSummaryById: (id: string) => MeetingSummary | undefined;
}

const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

// Fetch all meeting summaries using the API route
const fetchSummaries = async (): Promise<MeetingSummary[]> => {
  console.log("Fetching meeting summaries from API...");
  try {
    const response = await fetch("/api/summaries");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log(`Retrieved ${data?.length || 0} summaries from API`);
    return data || [];
  } catch (error) {
    console.error("Exception when fetching summaries:", error);
    throw error;
  }
};

export function SummaryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Use React Query to fetch and cache the meeting summaries
  const {
    data: summaries = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: [QUERY_KEYS.summaryData],
    queryFn: fetchSummaries,
  });

  // Extract error message
  const errorMsg = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "An error occurred"
    : null;

  // Function to manually refresh data
  const refreshData = async () => {
    try {
      console.log("Manually refreshing summary data...");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.summaryData],
      });
    } catch (error) {
      console.error("Error refreshing summary data:", error);
    }
  };

  // Function to get a summary by UUID
  const getSummaryById = (id: string) => {
    return summaries.find((summary) => summary.id === id);
  };

  return (
    <SummaryContext.Provider
      value={{
        summaries,
        loading,
        error: errorMsg,
        refreshData,
        getSummaryById,
      }}
    >
      {children}
    </SummaryContext.Provider>
  );
}

export function useSummaries() {
  const context = useContext(SummaryContext);
  if (context === undefined) {
    throw new Error("useSummaries must be used within a SummaryProvider");
  }
  return context;
}
