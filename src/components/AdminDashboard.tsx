import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Trophy, Clock, TrendingUp, Calendar, Settings, Plus, Edit, Trash2, Save, X, AlertTriangle, ArrowUpDown, Eye, CheckCircle, XCircle } from 'lucide-react';
import { calculateQuizStats, getQuizConfig, saveQuizConfig, addQuestion, updateQuestion, deleteQuestion, generateDeletionCode, deleteQuizResult, deleteAllQuizResults, getQuizResults } from '../utils/quiz';
import { getUsers } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import { QuizQuestion } from '../types';

interface QuestionFormData {
  question: string;
  options: string[];
  correctAnswers: number[];
  category: string;
}

type SortField = 'name' | 'score' | 'percentage' | 'time';
type SortOrder = 'asc' | 'desc';

export const AdminDashboard: React.FC = () => {
  const { state } = useAuth();
  const [stats, setStats] = useState(calculateQuizStats());
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'questions' | 'settings' | 'manage-questions' | 'manage-results'>('overview');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [quizConfig, setQuizConfig] = useState(getQuizConfig());
  
  // Question management state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormData>({
    question: '',
    options: ['', '', '', ''],
    correctAnswers: [],
    category: 'Personal'
  });
  
  // Deletion confirmation state
  const [deletionCode, setDeletionCode] = useState('');
  const [expectedDeletionCode, setExpectedDeletionCode] = useState('');
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);
  const [showDeletionCode, setShowDeletionCode] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'question' | 'result' | 'all-results', id?: string} | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(calculateQuizStats());
      setQuizConfig(getQuizConfig());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedResults = () => {
    return [...stats.userStats].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.userName.toLowerCase();
          bValue = b.userName.toLowerCase();
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'percentage':
          aValue = a.percentage;
          bValue = b.percentage;
          break;
        case 'time':
          aValue = a.timeSpent;
          bValue = b.timeSpent;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleConfigUpdate = () => {
    saveQuizConfig(quizConfig);
    alert('Configuración actualizada correctamente');
  };

  // Question management functions
  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswers: [],
      category: 'Personal'
    });
    setEditingQuestion(null);
  };

  const handleAddQuestion = () => {
    setShowQuestionForm(true);
    resetQuestionForm();
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      options: [...question.options],
      correctAnswers: Array.isArray(question.correctAnswers) ? [...question.correctAnswers] : [],
      category: question.category || 'Personal'
    });
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = () => {
    // Validation
    if (!questionForm.question.trim()) {
      alert('La pregunta es requerida');
      return;
    }
    
    const validOptions = questionForm.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('Se requieren al menos 2 opciones');
      return;
    }
    
    if (questionForm.correctAnswers.length === 0) {
      alert('Debe seleccionar al menos una respuesta correcta');
      return;
    }

    // Check if correct answers are valid
    const invalidCorrectAnswers = questionForm.correctAnswers.filter(
      index => index >= validOptions.length
    );
    if (invalidCorrectAnswers.length > 0) {
      alert('Las respuestas correctas seleccionadas no son válidas');
      return;
    }

    const questionData = {
      question: questionForm.question.trim(),
      options: validOptions,
      correctAnswers: questionForm.correctAnswers,
      category: questionForm.category
    };

    if (editingQuestion) {
      updateQuestion(editingQuestion.id, questionData);
    } else {
      addQuestion(questionData);
    }

    setShowQuestionForm(false);
    resetQuestionForm();
    
    // Update stats
    setStats(calculateQuizStats());
    setQuizConfig(getQuizConfig());
  };

  const handleDeleteItem = (type: 'question' | 'result' | 'all-results', id?: string) => {
    const code = generateDeletionCode();
    setExpectedDeletionCode(code);
    setDeletionCode('');
    setItemToDelete({ type, id });
    setShowDeletionCode(true);
  };

  const confirmDeletion = () => {
    if (deletionCode !== expectedDeletionCode) {
      return;
    }

    if (!itemToDelete) return;

    switch (itemToDelete.type) {
      case 'question':
        if (itemToDelete.id) {
          deleteQuestion(itemToDelete.id);
        }
        break;
      case 'result':
        if (itemToDelete.id) {
          deleteQuizResult(itemToDelete.id);
        }
        break;
      case 'all-results':
        deleteAllQuizResults();
        break;
    }

    // Reset state
    setShowDeletionCode(false);
    setShowDeletionConfirm(false);
    setItemToDelete(null);
    setDeletionCode('');
    setExpectedDeletionCode('');
    
    // Update stats
    setStats(calculateQuizStats());
    setQuizConfig(getQuizConfig());
  };

  const proceedToConfirmation = () => {
    setShowDeletionCode(false);
    setShowDeletionConfirm(true);
  };

  const cancelDeletion = () => {
    setShowDeletionCode(false);
    setShowDeletionConfirm(false);
    setItemToDelete(null);
    setDeletionCode('');
    setExpectedDeletionCode('');
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, '']
    });
  };

  const removeOption = (index: number) => {
    if (questionForm.options.length <= 2) {
      alert('Se requieren al menos 2 opciones');
      return;
    }
    
    const newOptions = questionForm.options.filter((_, i) => i !== index);
    const newCorrectAnswers = questionForm.correctAnswers
      .filter(ansIndex => ansIndex !== index)
      .map(ansIndex => ansIndex > index ? ansIndex - 1 : ansIndex);
    
    setQuestionForm({
      ...questionForm,
      options: newOptions,
      correctAnswers: newCorrectAnswers
    });
  };

  const toggleCorrectAnswer = (index: number) => {
    const newCorrectAnswers = questionForm.correctAnswers.includes(index)
      ? questionForm.correctAnswers.filter(i => i !== index)
      : [...questionForm.correctAnswers, index];
    
    setQuestionForm({
      ...questionForm,
      correctAnswers: newCorrectAnswers
    });
  };

  const handleViewUserDetails = (result: any) => {
    const userDetails = {
      ...result,
      answers: result.answers.map((answer: any) => {
        const question = quizConfig.questions.find(q => q.id === answer.questionId);
        return {
          ...answer,
          question: question?.question || 'Pregunta no encontrada',
          options: question?.options || [],
          correctAnswers: question?.correctAnswers || []
        };
      })
    };
    setSelectedUser(userDetails);
    setShowUserDetails(true);
  };

  return (
    <div className={`min-h-screen py-8 transition-colors duration-200 ${
      state.isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold transition-colors duration-200 ${
            state.isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>Panel de Administración</h1>
          <p className={`mt-2 transition-colors duration-200 ${
            state.isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>Dashboard de estadísticas y configuración del cuestionario</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className={`flex space-x-8 border-b overflow-x-auto transition-colors duration-200 ${
            state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
          }`}>
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'users', label: 'Usuarios', icon: Users },
              { id: 'questions', label: 'Estadísticas', icon: Trophy },
              { id: 'manage-questions', label: 'Gestionar Preguntas', icon: Edit },
              { id: 'manage-results', label: 'Gestionar Resultados', icon: Trash2 },
              { id: 'settings', label: 'Configuración', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent transition-colors duration-200 ${
                        state.isDarkMode 
                          ? 'text-slate-400 hover:text-slate-200 hover:border-slate-600' 
                          : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`rounded-lg shadow p-6 transition-colors duration-200 ${
                state.isDarkMode ? 'bg-slate-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>Total Envíos</p>
                    <p className={`text-2xl font-bold transition-colors duration-200 ${
                      state.isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>{stats.totalSubmissions}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg shadow p-6 transition-colors duration-200 ${
                state.isDarkMode ? 'bg-slate-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>Promedio General</p>
                    <p className={`text-2xl font-bold transition-colors duration-200 ${
                      state.isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {stats.averageScore.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg shadow p-6 transition-colors duration-200 ${
                state.isDarkMode ? 'bg-slate-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>Total Preguntas</p>
                    <p className={`text-2xl font-bold transition-colors duration-200 ${
                      state.isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {quizConfig.questions.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg shadow p-6 transition-colors duration-200 ${
                state.isDarkMode ? 'bg-slate-800' : 'bg-white'
              }`}>
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>Estado</p>
                    <p className="text-sm font-bold text-green-600">
                      {quizConfig.isActive ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Results */}
              <div className={`rounded-lg shadow transition-colors duration-200 ${
                state.isDarkMode ? 'bg-slate-800' : 'bg-white'
              }`}>
                <div className={`px-6 py-4 border-b transition-colors duration-200 ${
                  state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <h3 className={`text-lg font-medium transition-colors duration-200 ${
                    state.isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>Resultados Recientes</h3>
                </div>
                {stats.userStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y transition-colors duration-200 ${
                      state.isDarkMode ? 'divide-slate-700' : 'divide-slate-200'
                    }`}>
                      <thead className={`transition-colors duration-200 ${
                        state.isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                      }`}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors duration-200 ${
                            state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                          }`} onClick={() => handleSort('name')}>
                            <div className="flex items-center space-x-1">
                              <span>Usuario</span>
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors duration-200 ${
                            state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                          }`} onClick={() => handleSort('score')}>
                            <div className="flex items-center space-x-1">
                              <span>Puntuación</span>
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </th>
                          <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                            state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y transition-colors duration-200 ${
                        state.isDarkMode ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-slate-200'
                      }`}>
                        {getSortedResults()
                          .slice(0, 10)
                          .map((user, index) => {
                            const fullResult = getQuizResults().find(r => r.userEmail === user.userEmail);
                            return (
                              <tr key={index} className={`transition-colors duration-200 ${
                                state.isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                              }`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className={`text-sm font-medium transition-colors duration-200 ${
                                      state.isDarkMode ? 'text-white' : 'text-slate-900'
                                    }`}>{user.userName}</div>
                                    <div className={`text-sm transition-colors duration-200 ${
                                      state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                    }`}>{user.userEmail}</div>
                                  </div>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200 ${
                                  state.isDarkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                  {user.score}/10 ({Math.round(user.percentage)}%)
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <button
                                    onClick={() => handleViewUserDetails(fullResult)}
                                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                      state.isDarkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                    }`}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver respuestas
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`text-center py-8 ${state.isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No hay resultados disponibles
                  </p>
                )}
              </div>

              {/* Active Users */}
              <div className={`rounded-lg shadow transition-colors duration-200 ${
                state.isDarkMode ? 'bg-slate-800' : 'bg-white'
              }`}>
                <div className={`px-6 py-4 border-b transition-colors duration-200 ${
                  state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <h3 className={`text-lg font-medium transition-colors duration-200 ${
                    state.isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>Usuarios Registrados</h3>
                </div>
                {getUsers().length > 0 ? (
                  <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                    {getUsers().map((user, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border transition-colors ${
                          state.isDarkMode 
                            ? 'border-slate-700 bg-slate-700/50' 
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              user.hasCompletedQuiz 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              {user.hasCompletedQuiz ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <div className={`font-medium ${state.isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {user.name}
                                {user.isAdmin && (
                                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className={`text-sm ${state.isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            user.hasCompletedQuiz 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {user.hasCompletedQuiz ? 'Completado' : 'En progreso'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-center py-8 ${state.isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No hay usuarios registrados
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={`rounded-lg shadow transition-colors duration-200 ${
            state.isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className={`px-6 py-4 border-b transition-colors duration-200 ${
              state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className={`text-lg font-medium transition-colors duration-200 ${
                state.isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Estadísticas por Usuario</h3>
            </div>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y transition-colors duration-200 ${
                state.isDarkMode ? 'divide-slate-700' : 'divide-slate-200'
              }`}>
                <thead className={`transition-colors duration-200 ${
                  state.isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                }`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      Usuario
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      Estado
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      Puntuación
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      % Aciertos
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      Completado
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-200 ${
                  state.isDarkMode ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-slate-200'
                }`}>
                  {stats.userStats.map((user, index) => (
                    <tr key={index} className={`transition-colors duration-200 ${
                      state.isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium transition-colors duration-200 ${
                            state.isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>{user.userName}</div>
                          <div className={`text-sm transition-colors duration-200 ${
                            state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>{user.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Completado
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200 ${
                        state.isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {user.score}/10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-16 rounded-full h-2 mr-2 transition-colors duration-200 ${
                            state.isDarkMode ? 'bg-slate-600' : 'bg-slate-200'
                          }`}>
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${user.percentage}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm transition-colors duration-200 ${
                            state.isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>{user.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200 ${
                        state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {formatDate(user.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className={`rounded-lg shadow transition-colors duration-200 ${
            state.isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className={`px-6 py-4 border-b transition-colors duration-200 ${
              state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className={`text-lg font-medium transition-colors duration-200 ${
                state.isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Estadísticas por Pregunta</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {stats.questionStats.map((question, index) => (
                  <div key={question.questionId} className={`border rounded-lg p-4 transition-colors duration-200 ${
                    state.isDarkMode ? 'border-slate-600' : 'border-slate-200'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className={`text-sm font-medium flex-1 transition-colors duration-200 ${
                        state.isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {index + 1}. {question.question}
                      </h4>
                      <span className={`ml-4 px-2 py-1 text-xs font-semibold rounded-full ${
                        question.correctPercentage >= 80
                          ? 'bg-green-100 text-green-800'
                          : question.correctPercentage >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {question.correctPercentage.toFixed(1)}% correcto
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-full rounded-full h-2 mr-3 transition-colors duration-200 ${
                        state.isDarkMode ? 'bg-slate-600' : 'bg-slate-200'
                      }`}>
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${question.correctPercentage}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm whitespace-nowrap transition-colors duration-200 ${
                        state.isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {question.totalAnswers} respuestas
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manage Questions Tab */}
        {activeTab === 'manage-questions' && (
          <div className="space-y-6">
            <div className={`rounded-lg shadow transition-colors duration-200 ${
              state.isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b flex justify-between items-center transition-colors duration-200 ${
                state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <h3 className={`text-lg font-medium transition-colors duration-200 ${
                  state.isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>Gestionar Preguntas</h3>
                <button
                  onClick={handleAddQuestion}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Pregunta
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {quizConfig.questions.map((question, index) => (
                    <div key={question.id} className={`border rounded-lg p-4 transition-colors duration-200 ${
                      state.isDarkMode ? 'border-slate-600' : 'border-slate-200'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium mb-2 transition-colors duration-200 ${
                            state.isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {index + 1}. {question.question}
                          </h4>
                          <div className={`text-xs mb-2 transition-colors duration-200 ${
                            state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Categoría: {question.category || 'Sin categoría'}
                          </div>
                          <div className="space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className={`text-sm p-2 rounded ${
                                question.correctAnswers.includes(optIndex)
                                  ? 'bg-green-100 text-green-800 font-medium' 
                                  : state.isDarkMode 
                                    ? 'bg-slate-700 text-slate-300' 
                                    : 'bg-slate-50 text-slate-700'
                              }`}>
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {question.correctAnswers.includes(optIndex) && ' ✓'}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className={`p-2 text-blue-600 rounded transition-colors duration-200 ${
                              state.isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'
                            }`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('question', question.id)}
                            className={`p-2 text-red-600 rounded transition-colors duration-200 ${
                              state.isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manage Results Tab */}
        {activeTab === 'manage-results' && (
          <div className={`rounded-lg shadow transition-colors duration-200 ${
            state.isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className={`px-6 py-4 border-b flex justify-between items-center transition-colors duration-200 ${
              state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className={`text-lg font-medium transition-colors duration-200 ${
                state.isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Gestionar Resultados</h3>
              {stats.userStats.length > 0 && (
                <button
                  onClick={() => handleDeleteItem('all-results')}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Todos los Resultados
                </button>
              )}
            </div>
            
            {stats.userStats.length === 0 ? (
              <div className={`p-8 text-center transition-colors duration-200 ${
                state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                No hay resultados para mostrar
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y transition-colors duration-200 ${
                  state.isDarkMode ? 'divide-slate-700' : 'divide-slate-200'
                }`}>
                  <thead className={`transition-colors duration-200 ${
                    state.isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                  }`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                        state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        Usuario
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                        state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        Puntuación
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                        state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        Fecha
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                        state.isDarkMode ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-200 ${
                    state.isDarkMode ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-slate-200'
                  }`}>
                    {stats.userStats.map((user, index) => {
                      return (
                        <tr key={index} className={`transition-colors duration-200 ${
                          state.isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                        }`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className={`text-sm font-medium transition-colors duration-200 ${
                                state.isDarkMode ? 'text-white' : 'text-slate-900'
                              }`}>{user.userName}</div>
                              <div className={`text-sm transition-colors duration-200 ${
                                state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>{user.userEmail}</div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200 ${
                            state.isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {user.score}/10 ({user.percentage.toFixed(1)}%)
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200 ${
                            state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {formatDate(user.completedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteItem('result', `${user.userEmail}-${user.completedAt.getTime()}`)}
                              className={`text-red-600 text-sm font-medium transition-colors duration-200 ${
                                state.isDarkMode ? 'hover:text-red-400' : 'hover:text-red-900'
                              }`}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={`rounded-lg shadow transition-colors duration-200 ${
            state.isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className={`px-6 py-4 border-b transition-colors duration-200 ${
              state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className={`text-lg font-medium transition-colors duration-200 ${
                state.isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Configuración del Cuestionario</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                    state.isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Título del Cuestionario
                  </label>
                  <input
                    type="text"
                    value={quizConfig.title}
                    onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                      state.isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-white' 
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={quizConfig.isActive}
                    onChange={(e) => setQuizConfig({ ...quizConfig, isActive: e.target.checked })}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded transition-colors duration-200 ${
                      state.isDarkMode ? 'border-slate-600' : 'border-slate-300'
                    }`}
                  />
                  <label htmlFor="isActive" className={`text-sm font-medium transition-colors duration-200 ${
                    state.isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Cuestionario activo
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Fecha de inicio
                    </label>
                    <input
                      type="datetime-local"
                      value={quizConfig.startDate.toISOString().slice(0, 16)}
                      onChange={(e) => setQuizConfig({ 
                        ...quizConfig, 
                        startDate: (() => {
                          const newDate = new Date(e.target.value);
                          return !isNaN(newDate.getTime()) ? newDate : quizConfig.startDate;
                        })()
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                        state.isDarkMode 
                          ? 'border-slate-600 bg-slate-700 text-white' 
                          : 'border-slate-300 bg-white text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Fecha de finalización
                    </label>
                    <input
                      type="datetime-local"
                      value={quizConfig.endDate.toISOString().slice(0, 16)}
                      onChange={(e) => setQuizConfig({ 
                        ...quizConfig, 
                        endDate: (() => {
                          const newDate = new Date(e.target.value);
                          return !isNaN(newDate.getTime()) ? newDate : quizConfig.endDate;
                        })()
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                        state.isDarkMode 
                          ? 'border-slate-600 bg-slate-700 text-white' 
                          : 'border-slate-300 bg-white text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleConfigUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Form Modal */}
        {showQuestionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-200 ${
              state.isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b flex justify-between items-center transition-colors duration-200 ${
                state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <h3 className={`text-lg font-medium transition-colors duration-200 ${
                  state.isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {editingQuestion ? 'Editar Pregunta' : 'Agregar Nueva Pregunta'}
                </h3>
                <button
                  onClick={() => setShowQuestionForm(false)}
                  className={`transition-colors duration-200 ${
                    state.isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                    state.isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Pregunta *
                  </label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                      state.isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-white' 
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                    rows={3}
                    placeholder="Escribe tu pregunta aquí..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                    state.isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                      state.isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-white' 
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                    placeholder="Personal, Académico, etc."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`block text-sm font-medium transition-colors duration-200 ${
                      state.isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Opciones de Respuesta *
                    </label>
                    <button
                      onClick={addOption}
                      className={`text-sm text-blue-600 transition-colors duration-200 ${
                        state.isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-800'
                      }`}
                    >
                      + Agregar opción
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={questionForm.correctAnswers.includes(index)}
                          onChange={() => toggleCorrectAnswer(index)}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 rounded transition-colors duration-200 ${
                            state.isDarkMode ? 'border-slate-600' : 'border-slate-300'
                          }`}
                          title="Marcar como respuesta correcta"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                            state.isDarkMode 
                              ? 'border-slate-600 bg-slate-700 text-white' 
                              : 'border-slate-300 bg-white text-slate-900'
                          }`}
                          placeholder={`Opción ${index + 1}`}
                        />
                        {questionForm.options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className={`text-red-600 transition-colors duration-200 ${
                              state.isDarkMode ? 'hover:text-red-400' : 'hover:text-red-800'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <p className={`text-xs mt-2 transition-colors duration-200 ${
                    state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    ✓ Marcá las casillas para indicar las respuestas correctas. Debe haber al menos una respuesta correcta.
                  </p>
                </div>

                <div className={`flex justify-end space-x-3 pt-4 border-t transition-colors duration-200 ${
                  state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <button
                    onClick={() => setShowQuestionForm(false)}
                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                      state.isDarkMode 
                        ? 'text-slate-300 bg-slate-700 hover:bg-slate-600' 
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingQuestion ? 'Actualizar' : 'Guardar'} Pregunta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deletion Code Display Modal */}
        {showDeletionCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg shadow-xl max-w-md w-full transition-colors duration-200 ${
              state.isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b transition-colors duration-200 ${
                state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  <h3 className={`text-lg font-medium transition-colors duration-200 ${
                    state.isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>Código de Confirmación</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className={`mb-4 transition-colors duration-200 ${
                  state.isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Para confirmar la eliminación, usa este código de confirmación:
                </p>
                
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center mb-4">
                  <span className="text-2xl font-bold text-yellow-800 tracking-wider font-mono">
                    {expectedDeletionCode}
                  </span>
                </div>
                
                <p className={`text-sm mb-6 transition-colors duration-200 ${
                  state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Copia este código y úsalo en la siguiente pantalla para confirmar la eliminación.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDeletion}
                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                      state.isDarkMode 
                        ? 'text-slate-300 bg-slate-700 hover:bg-slate-600' 
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={proceedToConfirmation}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deletion Confirmation Modal */}
        {showDeletionConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg shadow-xl max-w-md w-full transition-colors duration-200 ${
              state.isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b transition-colors duration-200 ${
                state.isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <h3 className={`text-lg font-medium transition-colors duration-200 ${
                    state.isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>Confirmar Eliminación</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className={`mb-4 transition-colors duration-200 ${
                  state.isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Para confirmar esta acción, ingresa el código de confirmación que se mostró anteriormente:
                </p>
                
                <input
                  type="text"
                  value={deletionCode}
                  onChange={(e) => setDeletionCode(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 text-center font-mono text-lg transition-colors duration-200 ${
                    state.isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-white' 
                      : 'border-slate-300 bg-white text-slate-900'
                  }`}
                  placeholder="Código de 6 dígitos"
                  maxLength={6}
                />
                
                {deletionCode && deletionCode !== expectedDeletionCode && (
                  <p className="text-red-600 text-sm mt-2">
                    Código incorrecto. Inténtalo de nuevo.
                  </p>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={cancelDeletion}
                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                      state.isDarkMode 
                        ? 'text-slate-300 bg-slate-700 hover:bg-slate-600' 
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeletion}
                    disabled={!deletionCode || deletionCode !== expectedDeletionCode}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    Confirmar Eliminación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
              state.isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className={`sticky top-0 p-6 border-b ${
                state.isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`text-xl font-bold ${state.isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Respuestas de {selectedUser.userName}
                    </h3>
                    <p className={`text-sm ${state.isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {selectedUser.userEmail} • Puntuación: {selectedUser.score}/{selectedUser.totalQuestions} • 
                      Tiempo: {Math.floor(selectedUser.timeSpent / 60)}m {selectedUser.timeSpent % 60}s
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      state.isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {selectedUser.answers.map((answer: any, index: number) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      state.isDarkMode ? 'border-slate-700 bg-slate-700/50' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className={`font-medium ${state.isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Pregunta {index + 1}: {answer.question}
                      </h4>
                      <div className={`flex items-center space-x-2 ${
                        answer.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {answer.isCorrect ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                        <span className="text-sm font-medium">
                          {answer.isCorrect ? 'Correcta' : 'Incorrecta'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {answer.options.map((option: string, optionIndex: number) => {
                        const isSelected = answer.selectedAnswers.includes(optionIndex);
                        const isCorrect = answer.correctAnswers.includes(optionIndex);
                        
                        return (
                          <div 
                            key={optionIndex}
                            className={`p-3 rounded-lg border-2 ${
                              isSelected && isCorrect
                                ? 'border-green-500 bg-green-50 text-green-900'
                                : isSelected && !isCorrect
                                ? 'border-red-500 bg-red-50 text-red-900'
                                : !isSelected && isCorrect
                                ? 'border-green-300 bg-green-50 text-green-700'
                                : state.isDarkMode
                                ? 'border-slate-600 bg-slate-600/50 text-slate-300'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? isCorrect
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-red-500 bg-red-500'
                                  : isCorrect
                                  ? 'border-green-300 bg-green-100'
                                  : 'border-slate-300'
                              }`}>
                                {(isSelected || isCorrect) && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span className="flex-1">{option}</span>
                              {isSelected && (
                                <span className="text-xs font-medium">
                                  {isCorrect ? '✓ Seleccionada' : '✗ Seleccionada'}
                                </span>
                              )}
                              {!isSelected && isCorrect && (
                                <span className="text-xs font-medium text-green-600">
                                  ✓ Respuesta correcta
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {answer.partialCredit && answer.partialCredit < 1 && (
                      <div className={`mt-3 p-2 rounded-lg ${
                        state.isDarkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        <span className="text-sm">
                          Crédito parcial: {Math.round(answer.partialCredit * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};