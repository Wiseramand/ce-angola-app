
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Lock, User as UserIcon, Loader2, ShieldCheck } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { adminLogin, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await adminLogin({ username, pass: password });
      navigate('/admin');
    } catch (err) {
      setError('Acesso negado. Credenciais de mestre inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050a15] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-ministry-blue mb-6 border border-white/10 shadow-2xl">
            <ShieldCheck size={40} className="text-ministry-gold" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Painel de Controlo Master</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Autenticação Restrita • Christ Embassy Angola</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-[0.2em] ml-2">Master ID</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none"
                placeholder="Introduzir ID"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-[0.2em] ml-2">Chave de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-ministry-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-opacity-90 transition disabled:opacity-50 shadow-xl"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Desbloquear Consola"}
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] text-gray-700 font-bold uppercase tracking-widest">
          Sistema de Segurança Integrado • v4.0.1
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
