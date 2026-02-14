import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { LiveStream } from './pages/LiveStream';
import { UserAuth } from './pages/UserAuth';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserProfile } from './pages/UserProfile';
import { Partnership } from './pages/Partnership';
import { PrivateLiveProgram } from './pages/PrivateLiveProgram';
import { User, UserRole, ProgramCredential, StreamEvent } from './types';
import { api } from './services/api';

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for Global Data
  const [streams, setStreams] = useState<StreamEvent[]>([]);
  const [programCredentials, setProgramCredentials] = useState<ProgramCredential[]>([]);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedStreams = await api.streams.getAll();
        const loadedCreds = await api.credentials.getAll();
        setStreams(loadedStreams);
        setProgramCredentials(loadedCreds);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Simple hash router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      setPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Init

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    if (newUser.role === UserRole.ADMIN) {
      navigate('admin-dashboard');
    } else {
      navigate('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('home');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Render Route
  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      );
    }

    switch (page) {
      case 'home':
        return <Home onNavigate={navigate} streams={streams} />;
      case 'live':
        return <LiveStream user={user} onNavigate={navigate} streams={streams} />;
      case 'private-live':
        return <PrivateLiveProgram onNavigate={navigate} credentials={programCredentials} streams={streams} />;
      case 'partnership':
        return <Partnership user={user} onNavigate={navigate} />;
      case 'profile':
        if (!user) {
            navigate('login');
            return <UserAuth type="login" onLogin={handleLogin} onNavigate={navigate} />;
        }
        return <UserProfile user={user} onUpdateUser={handleUpdateUser} />;
      case 'login':
        return <UserAuth type="login" onLogin={handleLogin} onNavigate={navigate} />;
      case 'register':
        return <UserAuth type="register" onLogin={handleLogin} onNavigate={navigate} />;
      case 'admin-login':
        return <AdminLogin onLogin={handleLogin} />;
      case 'admin-dashboard':
        if (user?.role === UserRole.ADMIN) {
          return (
            <AdminDashboard 
              user={user} 
              credentials={programCredentials}
              setCredentials={setProgramCredentials}
              streams={streams}
              setStreams={setStreams}
            />
          );
        }
        return <AdminLogin onLogin={handleLogin} />;
      default:
        return <Home onNavigate={navigate} streams={streams} />;
    }
  };

  // Admin Login Standalone Page (Full Screen)
  if (page === 'admin-login') {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout} onNavigate={navigate} currentPage={page}>
      {renderPage()}
    </Layout>
  );
}

export default App;