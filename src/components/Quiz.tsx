import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getQuizConfig, isQuizAvailable, saveQuizResult } from '../utils/quiz';
import { markUserAsCompleted } from '../utils/auth';
import { QuizAnswer, QuizResult } from '../types';

export const Quiz: React.FC = () => {
  const { state } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const quizConfig = getQuizConfig();
  const questions = quizConfig.questions;
  const isAvailable = isQuizAvailable();

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  if (!isAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-yellow-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Cuestionario no disponible</h1>
            <p className="text-slate-600">
              El cuestionario no está disponible en este momento. Por favor intenta más tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const score = answers.filter(answer => answer.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Cuestionario completado!</h1>
            <p className="text-slate-600 mb-6">
              Has terminado el cuestionario exitosamente
            </p>
            
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <div className="text-3xl font-bold text-slate-900 mb-2">{score}/{questions.length}</div>
              <div className="text-lg text-slate-600 mb-2">{percentage}% correcto</div>
              <div className="text-sm text-slate-500">
                Tiempo: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Tus respuestas han sido guardadas. Gracias por participar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctAnswer;

    const newAnswer: QuizAnswer = {
      questionId: question.id,
      selectedAnswer,
      isCorrect,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      const finalResult: QuizResult = {
        id: Date.now().toString(),
        userEmail: state.user!.email,
        userName: state.user!.name,
        answers: updatedAnswers,
        score: updatedAnswers.filter(answer => answer.isCorrect).length,
        totalQuestions: questions.length,
        completedAt: new Date(),
        timeSpent,
      };

      saveQuizResult(finalResult);
      markUserAsCompleted(state.user!.email);
      setQuizCompleted(true);
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-slate-900">{quizConfig.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}</span>
              </div>
              <span>{currentQuestion + 1} de {questions.length}</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedAnswer === index && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-slate-700">{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion < questions.length - 1 ? 'Siguiente pregunta' : 'Finalizar cuestionario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};