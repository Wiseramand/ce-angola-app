
import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

  const logout = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    setUser(null);
    localStorage.removeItem('ce_session_user');
  };

  const sendHeartbeat = async (userId: string, sessionId: string) => {
    try {
      const res = await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId })
      });
      if (res.status === 401) {
        alert("Sessão Terminada: Foi detetado um novo acesso com esta conta noutro dispositivo.");
        logout();
      }
    } catch (e) {}
  };

  const refreshSystem = async () => {
    try {
      const res = await fetch('/api/system');
      if (res.ok) {
        const data = await res.json();
        setSystem(prev => ({
          ...prev,
          publicUrl: data.public_url,
          publicTitle: data.public_title,
          publicDescription: data.public_description,
          privateUrl: data.private_url,
          privateTitle: data.private_title,
          privateDescription: data.private_description,
          isPrivateMode: !!data.is_private_mode
        }));
      }
    } catch (e) {}
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
            heartbeatRef.current = window.setInterval(() => sendHeartbeat(parsedUser.id, parsedUser.sessionId), 10000);
          }
        } catch (e) { localStorage.removeItem('ce_session_user'); }
      }
      setIsLoading(false);
    };
    init();
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
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
        if (data.sessionId && data.role !== 'admin') {
          if (heartbeatRef.current) clearInterval(heartbeatRef.current);
          heartbeatRef.current = window.setInterval(() => sendHeartbeat(data.id, data.sessionId), 10000);
        }
      } else { throw new Error(data.error || 'INVALID'); }
    } finally { setIsLoading(false); }
  };

  const adminLogin = async (creds: { username: string; pass: string }) => {
    setIsLoading(true);
    if (creds.username === 'master_admin' && creds.pass === 'angola_faith_2025') {
      const admin: UserExtended = { id: 'admin-1', fullName: 'Super Administrador', email: 'admin@ceangola.org', phone: '900', country: 'Angola', address: 'Luanda', gender: 'Male', hasLiveAccess: true, role: 'admin' };
      setUser(admin);
      localStorage.setItem('ce_session_user', JSON.stringify(admin));
    } else { throw new Error('UNAUTHORIZED'); }
    setIsLoading(false);
  };

  const register = async (data: any) => {
    setUser({ ...data, id: 'pub-' + Date.now(), role: 'user', hasLiveAccess: false });
  };

  const updateStreamConfig = async (config: Partial<StreamConfig>) => {
    const res = await fetch('/api/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...system, ...config })
    });
    if (res.ok) await refreshSystem();
  };

  return (
    <AuthContext.Provider value={{ user, system, login, adminLogin, register, logout, isLoading, updateStreamConfig, refreshSystem }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; liveOnly?: boolean }> = ({ children, adminOnly, liveOnly }) => {
  const { user, system, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center animate-pulse"><Loader2 className="text-ministry-gold animate-spin" size={48} /></div>;
  if (!user && (adminOnly || liveOnly)) return <Navigate to={adminOnly ? "/central-admin" : "/login"} replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  
  if (liveOnly && system.isPrivateMode && !user?.hasLiveAccess && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
        <div className="max-w-md w-full bg-gray-900 p-12 rounded-[4rem] border border-white/5 text-center shadow-2xl">
          <ShieldAlert size={64} className="text-ministry-gold mx-auto mb-8 animate-bounce" />
          <h2 className="text-3xl font-display font-black text-white mb-6 uppercase tracking-tight">Zona Privada</h2>
          <p className="text-gray-400 mb-10 text-lg font-light leading-relaxed">Este conteúdo é reservado a parceiros com credenciais ativas do sistema master.</p>
          <button onClick={() => window.location.hash = '#/login'} className="w-full py-6 bg-ministry-gold text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Introduzir Chave de Acesso</button>
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
const Loader2 = ({ className, size }: any) => <div className={`w-${size || 10} h-${size || 10} border-4 border-ministry-gold border-t-transparent rounded-full animate-spin ${className}`}></div>;
