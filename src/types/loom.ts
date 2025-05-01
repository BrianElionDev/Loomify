export interface Task {
  Task: string;
  Timestamp: string;
  Completed: boolean;
  Dev?: string;
  index?: number;
}

export interface Developer {
  Dev: string;
  Tasks: Task[];
}

export interface LoomAnalysis {
  date: string;
  transcript: string;
  title: string;
  llm_answer: {
    project: string;
    developers: Developer[];
  };
  created_at: string;
  updated_at: string;
  id: string;
  model: string;
  link: string;
  usage: number;
  recording_type: string;
  project: string;
  description: string;
  duration: string;
  thumbnail: string;
}
