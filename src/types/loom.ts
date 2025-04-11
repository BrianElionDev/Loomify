export interface Task {
  Task: string;
  Timestamp: string;
  completed: boolean;
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
    developers: Developer[];
  };
  created_at: string;
  updated_at: string;
  id: string;
  model: string;
  link: string;
  description: string;
  duration: string;
  thumbnail: string;
}
