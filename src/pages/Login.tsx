import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import { ShieldCheck, ArrowLeft, Loader2, User, Lock, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({ username: '', pass: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/live';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUsername = formData.username.toLowerCase().trim();

    try {
      await login({ username: normalizedUsername, pass: formData.pass });
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.message === 'BLOCKED') {
        setError(t('auth.error_blocked'));
      } else if (err.message === 'INVALID_CREDENTIALS' || err.message === 'INVALID') {
        setError(t('auth.error_invalid_credentials'));
      } else {
        setError(t('auth.error_connection_failed'));
        console.error("Login Error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 relative p-12">
          <div className="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2134&auto=format&fit=crop" className="w-full h-full object-cover" alt="" />
          </div>
          <header className="text-center mb-12">
            <Logo className="h-20 w-auto mx-auto mb-6 brightness-125" />
            <h1 className="text-4xl font-display font-black text-ministry-blue mb-4 tracking-tighter uppercase">{t('auth.login_title')}</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">{t('auth.login_subtitle')}</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-3xl flex items-center space-x-4 animate-in slide-in-from-top duration-300">
                <AlertCircle size={24} />
                <span className="font-bold text-sm tracking-tight">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('auth.user_id')}</label>
                <div className="relative">
                  <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-gray-50 border-0 rounded-[2rem] py-6 pl-16 pr-8 text-lg font-bold text-ministry-blue focus:ring-4 focus:ring-ministry-gold/10 transition shadow-inner"
                    placeholder="ex: silva_2024"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('auth.password')}</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="password"
                    required
                    value={formData.pass}
                    onChange={e => setFormData({ ...formData, pass: e.target.value })}
                    className="w-full bg-gray-50 border-0 rounded-[2rem] py-6 pl-16 pr-8 text-lg font-bold text-ministry-blue focus:ring-4 focus:ring-ministry-gold/10 transition shadow-inner"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-ministry-blue text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-ministry-gold transition-all duration-300 flex items-center justify-center space-x-4 active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <ShieldCheck size={20} />
                  <span>{t('auth.enter')}</span>
                </>
              )}
            </button>

            <div className="text-center pt-8 border-t border-gray-50">
              <p className="text-slate-400 font-bold text-sm mb-2">{t('auth.no_account')}</p>
              <p className="text-ministry-blue font-black text-[10px] uppercase tracking-widest">{t('auth.contact_admin')}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
