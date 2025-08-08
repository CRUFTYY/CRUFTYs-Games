import React, { useState } from 'react';
import { Mail, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isEmailAuthorized, sendVerificationCode } from '../utils/auth';

export const EmailVerification: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [developmentCode, setDevelopmentCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
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
      // In development mode, show the code directly
      if (result.developmentMode && result.code) {
        setDevelopmentCode(result.code);
      }
      setEmailSent(true);
      dispatch({ type: 'SET_PENDING_EMAIL', payload: email });
      dispatch({ type: 'SET_VERIFICATION_STEP', payload: 'code' });
    } catch (err) {
      setError('Error al enviar el código de verificación. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Código Enviado!</h1>
              <p className="text-slate-600 mb-4">
                Hemos enviado un código de verificación de 6 dígitos a:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium">{email}</p>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Revisa tu bandeja de entrada y carpeta de spam. El código expira en 10 minutos.
              </p>
            </div>

            <button
              onClick={() => dispatch({ type: 'SET_VERIFICATION_STEP', payload: 'code' })}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Ingresar código de verificación
            </button>
            
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setError('');
              }}
              className="w-full mt-3 text-slate-600 hover:text-slate-800 py-2 transition-colors duration-200"
            >
              Cambiar dirección de correo
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
              Ingresa tu dirección de Gmail autorizada para recibir tu código de verificación
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {developmentCode && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-yellow-800">Modo de Desarrollo</span>
              </div>
              <p className="text-sm text-yellow-700 mb-2">
                Tu código de verificación es:
              </p>
              <div className="bg-white border-2 border-yellow-300 rounded-lg p-3 text-center">
                <span className="text-2xl font-bold text-yellow-800 tracking-wider">{developmentCode}</span>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                En producción, este código se enviaría por email.
              </p>
            </div>
          )}

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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando código...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Enviar código de verificación</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Recibirás el código en tu bandeja de entrada de Gmail
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};