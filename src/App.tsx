import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { EmailVerification } from './components/EmailVerification';
import { CodeVerification } from './components/CodeVerification';
import { NameEntry } from './components/NameEntry';
import { Quiz } from './components/Quiz';
import { AdminDashboard } from './components/AdminDashboard';

const AppContent: React.FC = () => {
  const { state } = useAuth();

  // Show appropriate component based on auth state
  if (!state.isAuthenticated) {
    switch (state.verificationStep) {
      case 'email':
        return <EmailVerification />;
      case 'code':
        return <CodeVerification />;
      case 'name':
        return <NameEntry />;
      default:
        return <EmailVerification />;
    }
  }

  // User is authenticated
  if (state.user?.isAdmin) {
    return (
      <Layout>
        <AdminDashboard />
      </Layout>
    );
  }

  return (
    <Layout>
      <Quiz />
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;