import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  const { state, dispatch } = useAuth();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    sessionStorage.clear();
  };

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      state.isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {showHeader && state.isAuthenticated && (
        <header className={`shadow-sm border-b transition-colors duration-200 ${
          state.isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-semibold transition-colors duration-200 ${
                    state.isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>CRUFTYs Games</h1>
                  {state.user?.isAdmin && (
                    <span className="text-xs text-blue-600 font-medium">Administrador</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`text-sm font-medium transition-colors duration-200 ${
                    state.isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>{state.user?.name}</p>
                  <p className={`text-xs transition-colors duration-200 ${
                    state.isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>{state.user?.email}</p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    state.isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {state.isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleLogout}
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                    state.isDarkMode 
                      ? 'border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700' 
                      : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};