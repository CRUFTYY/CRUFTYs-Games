import React, { useState } from 'react';
import { Mail, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isEmailAuthorized, sendVerificationCode } from '../utils/auth';

export const EmailVerification: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const { dispatch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@gmail.com')) {
      setError('Solo se permiten direcciones de Gmail');
      return;
    }

    if (!isEmailAuthorized(email)) {
      setError('Tu dirección de correo no está autorizada para acceder a este cuestionario');
      return;
    }

    setIsLoading(true);

    try {
      const code = await sendVerificationCode(email);
      setVerificationCode(code);
      setShowCode(true);
      dispatch({ type: 'SET_PENDING_EMAIL', payload: email });
      dispatch({ type: 'SET_VERIFICATION_STEP', payload: 'code' });
    } catch (err) {
      setError('Error al enviar el código de verificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_VERIFICATION_STEP', payload: 'code' });
  };

  if (showCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Código de Verificación</h1>
              <p className="text-slate-600 mb-4">
                Tu código de verificación es:
              </p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <div className="text-3xl font-bold text-blue-600 tracking-wider">
                  {verificationCode}
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Usa este código en la siguiente pantalla para continuar
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Continuar con la verificación
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verificación de Acceso</h1>
            <p className="text-slate-600">
              Ingresa tu dirección de Gmail autorizada para obtener tu código de verificación
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Dirección de Gmail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.email@gmail.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
                disabled={isLoading}
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
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generando código...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Obtener código de verificación</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              El código se mostrará directamente en pantalla
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};