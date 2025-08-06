import React, { useState, useRef, useEffect } from 'react';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { verifyCode } from '../utils/auth';

export const CodeVerification: React.FC = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { state, dispatch } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerification(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerification = async (verificationCode: string) => {
    setIsLoading(true);
    setError('');

    try {
      const isValid = verifyCode(state.pendingEmail, verificationCode);
      
      if (isValid) {
        dispatch({ type: 'SET_VERIFICATION_STEP', payload: 'name' });
        // Clear the verification code from session
        sessionStorage.removeItem(`verification_${state.pendingEmail}`);
      } else {
        setError('Código de verificación incorrecto');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Error al verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    dispatch({ type: 'SET_VERIFICATION_STEP', payload: 'email' });
    dispatch({ type: 'SET_PENDING_EMAIL', payload: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verificar Código</h1>
            <p className="text-slate-600 mb-2">
              Hemos enviado un código de 6 dígitos a:
            </p>
            <p className="text-blue-600 font-medium">{state.pendingEmail}</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center space-x-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  disabled={isLoading}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {isLoading && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-slate-600">Verificando código...</span>
                </div>
              </div>
            )}

            <button
              onClick={handleBackToEmail}
              className="w-full flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-800 py-2 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Cambiar dirección de correo</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Revisa tu bandeja de entrada y carpeta de spam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};