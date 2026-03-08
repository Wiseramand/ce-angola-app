
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { User as UserIcon, Lock, Loader2, ShieldAlert } from 'lucide-react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/live';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const normalizedUsername = username.toLowerCase().trim();

    try {
      await login({ username: normalizedUsername, pass: password });
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.message === 'BLOCKED') {
        setError('A sua conta está temporariamente bloqueada pela administração.');
      } else if (err.message === 'INVALID_CREDENTIALS' || err.message === 'INVALID') {
        setError('Credenciais inválidas. Verifique o seu ID e Senha exclusivos.');
      } else {
        setError('Falha de conexão com o sistema central. Tente novamente mais tarde.');
        console.error("Login Error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 relative">
          <div className="bg-ministry-blue p-12 text-center text-white relative">
            <div className="absolute inset-0 opacity-10">
               <img src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2134&auto=format&fit=crop" className="w-full h-full object-cover" alt="" />
            </div>
            <div className="relative z-10">
              <Logo className="h-20 w-auto mx-auto mb-6 brightness-125" />
              <h1 className="text-2xl font-display font-bold">Acesso Exclusivo</h1>
              <p className="text-blue-100/50 mt-2 text-xs font-bold uppercase tracking-widest">Introduza as suas Credenciais</p>
            </div>
          </div>

          <div className="p-12">
            {error ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-center space-x-3 text-xs font-bold uppercase tracking-widest">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 ml-2 tracking-widest">ID de Utilizador</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none"
                    placeholder="ex: membro_luanda"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-3 ml-2 tracking-widest">Chave Secreta</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-ministry-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-opacity-90 transition disabled:opacity-50 shadow-xl shadow-blue-900/20 active:scale-95"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>ENTRAR NO PROGRAMA</span>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
