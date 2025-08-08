import { QuizQuestion, QuizResult, QuizConfig } from '../types';

export const sampleQuestions: QuizQuestion[] = [
  
];

export const getQuizConfig = (): QuizConfig => {
  const stored = localStorage.getItem('quizConfig');
  if (stored) {
    const config = JSON.parse(stored);
    return {
      ...config,
      startDate: new Date(config.startDate),
      endDate: new Date(config.endDate),
    };
  }
  
  // Default configuration
  const defaultConfig: QuizConfig = {
    isActive: true,
    startDate: new Date('2025-01-01T09:00:00'),
    endDate: new Date('2025-12-31T23:59:59'),
    questions: sampleQuestions,
    title: 'CRUFTYs Games'
  };
  
  localStorage.setItem('quizConfig', JSON.stringify(defaultConfig));
  return defaultConfig;
};

export const saveQuizConfig = (config: QuizConfig): void => {
  localStorage.setItem('quizConfig', JSON.stringify(config));
};

export const isQuizAvailable = (): boolean => {
  const config = getQuizConfig();
  const now = new Date();
  return config.isActive && now >= config.startDate && now <= config.endDate;
};

export const saveQuizResult = (result: QuizResult): void => {
  const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
  results.push(result);
  localStorage.setItem('quizResults', JSON.stringify(results));
};

export const getQuizResults = (): QuizResult[] => {
  return JSON.parse(localStorage.getItem('quizResults') || '[]')
    .map((result: any) => ({
      ...result,
      completedAt: new Date(result.completedAt)
    }));
};

export const calculateQuizStats = () => {
  const results = getQuizResults();
  
  if (results.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      completionRate: 0,
      questionStats: [],
      userStats: []
    };
  }

  const totalSubmissions = results.length;
  const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalSubmissions;
  
  // Question statistics
  const questionStats = sampleQuestions.map(question => {
    const questionResults = results.map(result => 
      result.answers.find(answer => answer.questionId === question.id)
    ).filter(Boolean);
    
    const correctAnswers = questionResults.filter(answer => answer?.isCorrect).length;
    const totalAnswers = questionResults.length;
    
    return {
      questionId: question.id,
      question: question.question,
      correctPercentage: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
      totalAnswers
    };
  });

  // User statistics
  const userStats = results.map(result => ({
    userEmail: result.userEmail,
    userName: result.userName,
    score: result.score,
    percentage: (result.score / result.totalQuestions) * 100,
    timeSpent: result.timeSpent,
    completedAt: result.completedAt
  }));

  return {
    totalSubmissions,
    averageScore,
    completionRate: (averageScore / sampleQuestions.length) * 100,
    questionStats,
    userStats
  };
};