import React, { useState } from 'react';
import { Button } from '../components/Button';
import { User, UserRole } from '../types';
import { ShieldAlert, Lock, ServerCog, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';
import { Logo } from '../components/Logo';
import { api } from '../services/api';

interface AdminLoginProps {
  onLogin: (user: User) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [setupMessage, setSetupMessage] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowHelp(false);

    try {
      const user = await api.auth.login(email, password);
      if (user.role === UserRole.ADMIN) {
        onLogin(user);
      } else {
        setError('Access denied. Administrator privileges required.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
      if (err.message && (err.message.includes('404') || err.message.includes('Server Error'))) {
          setShowHelp(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFirstTimeSetup = async () => {
      setIsSettingUp(true);
      setSetupMessage('');
      setError('');
      try {
          const msg = await api.system.setupAdmin();
          setSetupMessage(msg);
          setEmail('admin@christembassy.org');
          setPassword('admin123');
      } catch (e: any) {
          setError(e.message);
          setShowHelp(true);
      } finally {
          setIsSettingUp(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <div className="max-w-md w-full space-y-6 bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/20 relative z-10">
        <div className="text-center">
          <Logo className="h-20 w-20 drop-shadow-2xl mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
            <AlertTriangle size={16} className="inline mr-2" /> {error}
          </div>
        )}

        {showHelp && (
            <div className="bg-black/40 border border-yellow-500/30 text-gray-200 p-4 rounded-lg text-xs">
                <h4 className="text-yellow-400 font-bold flex items-center gap-2 mb-2">
                    <Terminal size={14} /> Backend Setup Guide
                </h4>
                <p>Ensure `php artisan serve` is running in `cea-backend`.</p>
            </div>
        )}

        {setupMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle size={16} /> {setupMessage}
          </div>
        )}

        <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input 
                type="email" 
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="admin@christembassy.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                type="password" 
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="danger" className="w-full py-4 text-lg" isLoading={loading}>
            Authenticate
          </Button>

          <div className="text-center pt-4 border-t border-white/5">
             <button 
                type="button"
                onClick={handleFirstTimeSetup}
                disabled={isSettingUp}
                className="text-xs text-blue-300 hover:text-white flex items-center justify-center gap-1 mx-auto"
             >
                <ServerCog size={12} />
                {isSettingUp ? 'Connecting...' : 'Run Auto-Setup (First Time)'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};