import { QuizQuestion, QuizResult, QuizConfig } from '../types';

export const sampleQuestions: QuizQuestion[] = [
    {
    id: '1',
    question: '¿Cuál es mi filósofo existencialista favorito?',
    options: ['Friedrich Nietzsche', 'Albert Camus', 'Jean-Paul Sartre', 'Franz Kafka'],
    correctAnswers: [1],
    category: 'Personal'
  },
  {
    id: '2',
    question: '¿Cuál es mi libro favorito?',
    options: ['La Náusea', 'El Extranjero', 'Crimen y Castigo', 'El Retrato de Dorian Gray'],
    correctAnswers: [1],
    category: 'Personal'
  },
  {
    id: '3',
    question: '¿Cuál es el libro que más veces leí?',
    options: ['La Peste', 'El Extranjero (3 veces)', 'El Proceso', 'El Principito'],
    correctAnswers: [1],
    category: 'Personal'
  },
  {
    id: '4',
    question: '¿Cuáles son mis colores favoritos?',
    options: ['Verde', 'Naranja', 'Rosa y Azul', 'Amarillo'],
    correctAnswers: [2],
    category: 'Personal'
  },
  {
    id: '5',
    question: '¿Cuál es mi canción favorita?',
    options: ['Lover', 'Shake It Off', 'Con La Misma Moneda', 'My Tears Ricochet', 'Fake Tales Of San Francisco'],
    correctAnswers: [3],
    category: 'Personal'
  },
  {
    id: '6',
    question: '¿Cuál es mi álbum favorito?',
    options: ['DOGVIOLET - LAUREL', 'Folklore - Taylor Swift', 'eternal sunshine - Ariana Grande', 'Trench - twenty one pilots'],
    correctAnswers: [1],
    category: 'Personal'
  },
  {
    id: '7',
    question: '¿Cuál es mi álbum favorito de Fito Páez?',
    options: ['Ciudad de pobres corazones', 'Del 63', 'La La La', 'Giros'],
    correctAnswers: [1],
    category: 'Personal'
  },
  {
    id: '8',
    question: '¿Cuántas veces vi The Flash hasta hoy?',
    options: ['5 veces', '2 veces', '6 veces', 'Una vez', 'No la terminé nunca'],
    correctAnswers: [2],
    category: 'Personal'
  },
  {
    id: '9',
    question: '¿Cuál es mi película favorita?',
    options: ['Eternal Sunshine of the Spotless Mind', 'The Matrix (1999)', 'Black Swan', 'The Truman Show', 'Edward Scissorhands'],
    correctAnswers: [2],
    category: 'Personal'
  },
  {
    id: '10',
    question: '¿Cuál es mi juego favorito?',
    options: ['Balatro', 'Detroit Become Human', 'GTA', 'Counter-Strike 2', 'F1 2020', 'Red Dead Redemption 2'],
    correctAnswers: [1],
    category: 'Personal'
  },
  {
    id: '11',
    question: '¿Cuál es mi corriente filosófica favorita?',
    options: ['Existencialismo', 'Nihilismo', 'Utilitarismo', 'Positivismo', 'Escepticismo'],
    correctAnswers: [0],
    category: 'Personal'
  },
  {
    id: '12',
    question: '¿Quién es mi artista de reggae favorito?',
    options: ['Bob Marley', 'Los Cafres', 'Gondwana', 'Los Pericos', 'Dread Mar I'],
    correctAnswers: [4],
    category: 'Personal'
  },
  {
    id: '13',
    question: '¿Sería capaz de asesinar a alguien a sangre fría?',
    options: ['Sí', 'No'],
    correctAnswers: [1],
    category: 'Personal'
  },
  {
    id: '14',
    question: '¿De cuál de los siguientes artistas no tengo vinilo?',
    options: ['The Smiths', 'Michael Jackson', 'Electric Light Orchestra', 'Osvaldo Pugliese', 'The Doors', 'Bob Dylan'],
    correctAnswers: [5],
    category: 'Personal'
  },
  {
    id: '15',
    question: '¿Cuál es mi serie favorita?',
    options: ['Dexter', 'Suits', 'The Flash', 'Arcane', 'You', 'Casados con hijos'],
    correctAnswers: [2],
    category: 'Personal'
  },
  {
    id: '16',
    question: '¿En qué día cumplo años?',
    options: ['3 - marzo', '15 - marzo', '21 - marzo', '22 - marzo', '9 - marzo', '28 - marzo'],
    correctAnswers: [3],
    category: 'Personal'
  },
  {
    id: '17',
    question: '¿Qué prefiero, frío o calor?',
    options: ['Frío', 'Calor'],
    correctAnswers: [0],
    category: 'Personal'
  },
  {
    id: '18',
    question: '¿Cuál es mi comida favorita?',
    options: ['Pizza de Jamón y Morrón a la piedra', 'Pizza de Jamón y Morrón', 'Canelones', 'Ñoquis', 'Agnolotis', 'Milanesa con puré', '23g de clonazepam'],
    correctAnswers: [2],
    category: 'Personal'
  },
  {
    id: '19',
    question: '¿Cuál es mi alfajor favorito?',
    options: ['Jorgelin blanco', 'Rasta', '70% cacao - Havanna', 'Gula', 'Mini torta clásica - Aguila', 'Mini torta blanco - Aguila', 'Capitán del Espacio'],
    correctAnswers: [2],
    category: 'Personal'
  },
  {
    id: '20',
    question: '¿Cuál es mi película argentina favorita?',
    options: ['El Secreto de Sus Ojos', 'Nueve Reinas', 'El Hombre Mirando al Sudeste', 'El Robo del Siglo', 'La Historia Oficial', 'El Clan', 'Relatos Salvajes'],
    correctAnswers: [2],
    category: 'Personal'
  },
  {
    id: '21',
    question: '¿Cuál es mi película animada favorita?',
    options: ['Soul', 'Megamente', 'El Secreto de la Vida', 'Frozen', 'Emoji Movie'],
    correctAnswers: [2],
    category: 'Personal'
  },
  {
    id: '22',
    question: '¿Cuál de estas películas está en mi top 10 personal?',
    options: ['Zoolander', 'Before Sunrise', 'Dune', 'The Shining', 'Dead Poets Society'],
    correctAnswers: [4],
    category: 'Personal'
  }
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

export const addQuestion = (question: Omit<QuizQuestion, 'id'>): void => {
  const config = getQuizConfig();
  const newQuestion: QuizQuestion = {
    ...question,
    id: Date.now().toString()
  };
  config.questions.push(newQuestion);
  saveQuizConfig(config);
};

export const updateQuestion = (questionId: string, updatedQuestion: Omit<QuizQuestion, 'id'>): void => {
  const config = getQuizConfig();
  const index = config.questions.findIndex(q => q.id === questionId);
  if (index !== -1) {
    config.questions[index] = { ...updatedQuestion, id: questionId };
    saveQuizConfig(config);
  }
};

export const deleteQuestion = (questionId: string): void => {
  const config = getQuizConfig();
  config.questions = config.questions.filter(q => q.id !== questionId);
  saveQuizConfig(config);
};

export const generateDeletionCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const deleteQuizResult = (resultId: string): void => {
  const results = getQuizResults();
  const filteredResults = results.filter(result => result.id !== resultId);
  localStorage.setItem('quizResults', JSON.stringify(filteredResults));
};

export const deleteAllQuizResults = (): void => {
  localStorage.setItem('quizResults', JSON.stringify([]));
  localStorage.setItem('completedUsers', JSON.stringify([]));
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

  const config = getQuizConfig();
  const totalQuestions = config.questions.length;

  const totalSubmissions = results.length;
  const averageScore = results.reduce((sum, result) => sum + (result.score / totalQuestions * 10), 0) / totalSubmissions;
  
  // Question statistics
  const questionStats = config.questions.map(question => {
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
    score: Math.round((result.score / totalQuestions) * 10 * 10) / 10, // Score out of 10 with 1 decimal
    percentage: (result.score / totalQuestions) * 100,
    timeSpent: result.timeSpent,
    completedAt: result.completedAt
  }));

  return {
    totalSubmissions,
    averageScore,
    completionRate: (averageScore / 10) * 100,
    questionStats,
    userStats
  };
};