import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Trophy, Clock, TrendingUp, Calendar, Settings, Plus, Edit, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { calculateQuizStats, getQuizConfig, saveQuizConfig, addQuestion, updateQuestion, deleteQuestion, generateDeletionCode, deleteQuizResult, deleteAllQuizResults } from '../utils/quiz';
import { getUsers } from '../utils/auth';
import { QuizQuestion } from '../types';

interface QuestionFormData {
  question: string;
  options: string[];
  correctAnswers: number[];
  category: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState(calculateQuizStats());
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'questions' | 'settings' | 'manage-questions' | 'manage-results'>('overview');
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
  const [itemToDelete, setItemToDelete] = useState<{type: 'question' | 'result' | 'all-results', id?: string} | null>(null);

  useEffect(() => {
    const updateStats = () => {
      setStats(calculateQuizStats());
      setQuizConfig(getQuizConfig());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

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
      correctAnswers: [...question.correctAnswers],
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
    setShowDeletionConfirm(true);
    
    // Show the code to the admin
    alert(`Código de confirmación: ${code}\nIngresa este código para confirmar la eliminación.`);
  };

  const confirmDeletion = () => {
    if (deletionCode !== expectedDeletionCode) {
      alert('Código de confirmación incorrecto');
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
    setShowDeletionConfirm(false);
    setItemToDelete(null);
    setDeletionCode('');
    setExpectedDeletionCode('');
    
    // Update stats
    setStats(calculateQuizStats());
    setQuizConfig(getQuizConfig());
    
    alert('Eliminación completada exitosamente');
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

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="text-slate-600 mt-2">Dashboard de estadísticas y configuración del cuestionario</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-slate-200 overflow-x-auto">
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
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Envíos</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalSubmissions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Promedio General</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stats.averageScore.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Preguntas</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {quizConfig.questions.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Estado</p>
                    <p className="text-sm font-bold text-green-600">
                      {quizConfig.isActive ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Results */}
            {stats.userStats.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-medium text-slate-900">Resultados Recientes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Puntuación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Porcentaje
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Tiempo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {stats.userStats
                        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                        .slice(0, 10)
                        .map((user, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900">{user.userName}</div>
                              <div className="text-sm text-slate-500">{user.userEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {user.score}/10
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.percentage >= 80
                                ? 'bg-green-100 text-green-800'
                                : user.percentage >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatTime(user.timeSpent)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatDate(user.completedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Estadísticas por Usuario</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Puntuación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      % Aciertos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Completado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {stats.userStats.map((user, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{user.userName}</div>
                          <div className="text-sm text-slate-500">{user.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Completado
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {user.score}/10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${user.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600">{user.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Estadísticas por Pregunta</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {stats.questionStats.map((question, index) => (
                  <div key={question.questionId} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-slate-900 flex-1">
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
                      <div className="w-full bg-slate-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${question.correctPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600 whitespace-nowrap">
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
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900">Gestionar Preguntas</h3>
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
                    <div key={question.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-slate-900 mb-2">
                            {index + 1}. {question.question}
                          </h4>
                          <div className="text-xs text-slate-500 mb-2">
                            Categoría: {question.category || 'Sin categoría'}
                          </div>
                          <div className="space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className={`text-sm p-2 rounded ${
                                question.correctAnswers.includes(optIndex)
                                  ? 'bg-green-100 text-green-800 font-medium'
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
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('question', question.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900">Gestionar Resultados</h3>
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
              <div className="p-8 text-center text-slate-500">
                No hay resultados para mostrar
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Puntuación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {stats.userStats.map((user, index) => {
                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900">{user.userName}</div>
                              <div className="text-sm text-slate-500">{user.userEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {user.score}/10 ({user.percentage.toFixed(1)}%)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatDate(user.completedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteItem('result', `${user.userEmail}-${user.completedAt.getTime()}`)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Configuración del Cuestionario</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título del Cuestionario
                  </label>
                  <input
                    type="text"
                    value={quizConfig.title}
                    onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={quizConfig.isActive}
                    onChange={(e) => setQuizConfig({ ...quizConfig, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                    Cuestionario activo
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fecha de inicio
                    </label>
                    <input
                      type="datetime-local"
                      value={quizConfig.startDate.toISOString().slice(0, 16)}
                      onChange={(e) => setQuizConfig({ 
                        ...quizConfig, 
                        startDate: new Date(e.target.value) 
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fecha de finalización
                    </label>
                    <input
                      type="datetime-local"
                      value={quizConfig.endDate.toISOString().slice(0, 16)}
                      onChange={(e) => setQuizConfig({ 
                        ...quizConfig, 
                        endDate: new Date(e.target.value) 
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900">
                  {editingQuestion ? 'Editar Pregunta' : 'Agregar Nueva Pregunta'}
                </h3>
                <button
                  onClick={() => setShowQuestionForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pregunta *
                  </label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Escribe tu pregunta aquí..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Personal, Académico, etc."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Opciones de Respuesta *
                    </label>
                    <button
                      onClick={addOption}
                      className="text-sm text-blue-600 hover:text-blue-800"
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
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded"
                          title="Marcar como respuesta correcta"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Opción ${index + 1}`}
                        />
                        {questionForm.options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-2">
                    ✓ Marca las casillas para indicar las respuestas correctas. Debe haber al menos una respuesta correcta.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowQuestionForm(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors duration-200"
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

        {/* Deletion Confirmation Modal */}
        {showDeletionConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-medium text-slate-900">Confirmar Eliminación</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-slate-600 mb-4">
                  Para confirmar esta acción, ingresa el código de confirmación que se mostró anteriormente:
                </p>
                
                <input
                  type="text"
                  value={deletionCode}
                  onChange={(e) => setDeletionCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-red-500 focus:border-red-500 text-center font-mono text-lg"
                  placeholder="Código de 6 dígitos"
                  maxLength={6}
                />
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDeletionConfirm(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeletion}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    Confirmar Eliminación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};