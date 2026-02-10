
import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import LivePrograms from './pages/LivePrograms';
import LiveTV from './pages/LiveTV';
import Partnerships from './pages/Partnerships';
import Donations from './pages/Donations';
import Founder from './pages/Founder';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { User, StreamConfig } from './types';
import { ShieldAlert } from 'lucide-react';

interface UserExtended extends User {
  sessionId?: string;
}

interface SystemState extends StreamConfig {
  activeSessions: string[];
}

interface AuthContextType {
  user: UserExtended | null;
  system: SystemState;
  login: (credentials: { username: string; pass: string }) => Promise<void>;
  adminLogin: (credentials: { username: string; pass: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateStreamConfig: (config: Partial<StreamConfig>) => Promise<void>;
  terminateSession: (userId: string) => void;
  isLoading: boolean;
  refreshSystem: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserExtended | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const heartbeatRef = useRef<number | null>(null);
  const [system, setSystem] = useState<SystemState>({
    publicUrl: '',
    publicTitle: 'LoveWorld TV Angola',
    publicDescription: 'Transmissão pública e gratuita.',
    privateUrl: '',
    privateTitle: 'Conferência Ministerial',
    privateDescription: 'Acesso restrito para parceiros.',
    isPrivateMode: false,
    activeSessions: []
  });

  const sendHeartbeat = async (userId: string, sessionId: string) => {
    try {
      const res = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId })
      });
      if (!res.ok) {
        logout(); // Sessão expirou ou foi invalidada
      }
    } catch (e) { /* Falha silenciosa de rede */ }
  };

  const refreshSystem = async () => {
    try {
      const res = await fetch('/api/system');
      if (!res.ok) return;
      const data = await res.json();
      if (data && !data.error) {
        setSystem(prev => ({
          ...prev,
          publicUrl: data.public_url || '',
          publicTitle: data.public_title || 'LoveWorld TV Angola',
          publicDescription: data.public_description || 'Transmissão pública e gratuita.',
          privateUrl: data.private_url || '',
          privateTitle: data.private_title || 'Conferência Ministerial',
          privateDescription: data.private_description || 'Acesso restrito para parceiros.',
          isPrivateMode: !!data.is_private_mode
        }));
      }
    } catch (e) { }
  };

  useEffect(() => {
    const init = async () => {
      await refreshSystem();
      const saved = localStorage.getItem('ce_session_user');
      if (saved) {
        try {
          const parsedUser = JSON.parse(saved);
          setUser(parsedUser);
          if (parsedUser.sessionId && parsedUser.role !== 'admin') {
            heartbeatRef.current = window.setInterval(() => sendHeartbeat(parsedUser.id, parsedUser.sessionId), 45000);
          }
        } catch (e) {
          localStorage.removeItem('ce_session_user');
        }
      }
      setIsLoading(false);
    };
    init();
    const interval = setInterval(refreshSystem, 15000); 
    return () => {
      clearInterval(interval);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  const login = async (creds: { username: string; pass: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });
      
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('ce_session_user', JSON.stringify(data));
        if (data.sessionId) {
          if (heartbeatRef.current) clearInterval(heartbeatRef.current);
          heartbeatRef.current = window.setInterval(() => sendHeartbeat(data.id, data.sessionId), 45000);
        }
      } else {
        if (res.status === 409) throw new Error('SESSION_ACTIVE');
        throw new Error('INVALID');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (creds: { username: string; pass: string }) => {
    setIsLoading(true);
    if (creds.username === 'master_admin' && creds.pass === 'angola_faith_2025') {
      const admin: UserExtended = { id: 'admin-1', fullName: 'Super Administrador', email: 'admin@ceangola.org', phone: '900', country: 'Angola', address: 'Luanda', gender: 'Male', hasLiveAccess: true, role: 'admin' };
      setUser(admin);
      localStorage.setItem('ce_session_user', JSON.stringify(admin));
    } else {
      setIsLoading(false);
      throw new Error('UNAUTHORIZED');
    }
    setIsLoading(false);
  };

  const register = async (data: any) => {
    const newUser = { ...data, id: 'pub-' + Date.now(), role: 'user', hasLiveAccess: false };
    setUser(newUser);
    localStorage.setItem('ce_session_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    if (user?.id && user?.role !== 'admin') {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
      } catch (e) {}
    }
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    setUser(null);
    localStorage.removeItem('ce_session_user');
  };

  const updateStreamConfig = async (config: Partial<StreamConfig>) => {
    try {
      const res = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...system, ...config })
      });
      if (res.ok) {
        await refreshSystem();
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (e) {
      alert("Erro ao comunicar com o servidor. O banco de dados pode estar mal configurado.");
      throw e;
    }
  };

  const terminateSession = (userId: string) => { console.log(userId); };

  return (
    <AuthContext.Provider value={{ user, system, login, adminLogin, register, logout, isLoading, updateStreamConfig, terminateSession, refreshSystem }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; liveOnly?: boolean }> = ({ children, adminOnly, liveOnly }) => {
  const { user, system, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-ministry-gold border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (!user && (adminOnly || liveOnly)) return <Navigate to={adminOnly ? "/central-admin" : "/login"} replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  
  if (liveOnly && system.isPrivateMode && !user?.hasLiveAccess && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
        <div className="max-w-md w-full bg-gray-900 p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl">
          <ShieldAlert size={60} className="text-ministry-gold mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-white mb-4">Canal Restrito</h2>
          <p className="text-gray-400 mb-8">Esta transmissão requer credenciais administrativas para visualização.</p>
          <button onClick={() => window.location.href = '#/login'} className="w-full py-4 bg-ministry-gold text-white rounded-2xl font-black uppercase tracking-widest">Introduzir Credenciais</button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live-tv" element={<LiveTV />} />
            <Route path="/live" element={<ProtectedRoute liveOnly><LivePrograms /></ProtectedRoute>} />
            <Route path="/partnerships" element={<Partnerships />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/founder" element={<Founder />} />
            <Route path="/central-admin" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
