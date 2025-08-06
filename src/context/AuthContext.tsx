import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AuthState, User } from '../types';

type AuthAction =
  | { type: 'SET_PENDING_EMAIL'; payload: string }
  | { type: 'SET_VERIFICATION_STEP'; payload: 'email' | 'code' | 'name' | 'complete' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  verificationStep: 'email',
  pendingEmail: '',
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_PENDING_EMAIL':
      return { ...state, pendingEmail: action.payload };
    case 'SET_VERIFICATION_STEP':
      return { ...state, verificationStep: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        verificationStep: 'complete',
      };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};