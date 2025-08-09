export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
  hasCompletedQuiz: boolean;
  lastAccess?: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[]; // Changed to support multiple correct answers
  category?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswers: number[]; // Changed to support multiple selections
  isCorrect: boolean;
  partialCredit?: number; // For partial scoring with multiple correct answers
}

export interface QuizResult {
  id: string;
  userEmail: string;
  userName: string;
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
  timeSpent: number; // in seconds
}

export interface QuizConfig {
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  questions: QuizQuestion[];
  title: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  verificationStep: 'email' | 'code' | 'name' | 'complete';
  pendingEmail: string;
}