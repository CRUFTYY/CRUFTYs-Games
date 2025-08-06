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
  correctAnswer: number;
  category?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
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