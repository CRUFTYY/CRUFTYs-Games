import React, { useState } from 'react';
import { User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdmin, hasUserCompletedQuiz, saveUser } from '../utils/auth';

export const NameEntry: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { state, dispatch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Por favor ingresa tu nombre completo');
      return;
    }

    // Check if user has already completed the quiz (including admin)
    if (hasUserCompletedQuiz(state.pendingEmail)) {
      setError('Ya has completado este cuestionario anteriormente');
      return;
    }

    setIsLoading(true);

    try {
      const user = {
        email: state.pendingEmail,
        name: name.trim(),
        isAdmin: isAdmin(state.pendingEmail),
        hasCompletedQuiz: hasUserCompletedQuiz(state.pendingEmail),
        lastAccess: new Date(),
      };

      saveUser(user);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (err) {
      setError('Error al procesar la información');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Bienvenido!</h1>
            <p className="text-slate-600">
              Para continuar, por favor ingresa tu nombre completo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                required
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                'Continuar al cuestionario'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Tu información se mantendrá segura y confidencial
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};