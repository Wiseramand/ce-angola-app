import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import Logo from '../components/Logo';
import { api } from '../services/api';
import { User, Users, Globe, ArrowRight, CheckCircle2, ShieldCheck, Heart, Lock, Loader2, AlertCircle } from 'lucide-react';

const Welcome: React.FC = () => {
  const { t } = useTranslation();
  const { register, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'visitor' | 'partner'>('visitor');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    church: ''
  });

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      await register(formData);
      // Persistir dados do visitante para retorno automático
      localStorage.setItem('ce_visitor_data', JSON.stringify(formData));
    } catch (err) {
      console.error("Erro durante o registo de visitante:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      await login({ 
        username: loginData.username.toLowerCase().trim(), 
        pass: loginData.password 
      });
      // Navegação é tratada pelo estado do App
    } catch (err: any) {
      setError(err.message === 'INVALID' ? t('auth.error_invalid_credentials') : t('auth.error_connection_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ministry-blue relative flex items-center justify-center overflow-hidden p-6 py-12">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1510519133417-c057b49ef29d?q=80&w=2070" className="w-full h-full object-cover opacity-20 scale-110 blur-sm" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-ministry-blue/95 via-ministry-blue/80 to-ministry-blue"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <Logo className="h-28 w-auto mx-auto mb-8 brightness-125" />
          <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter leading-none">Portal Oficial</h1>
          <p className="text-blue-100/60 mt-4 text-sm font-bold uppercase tracking-[0.4em] italic">Bem-vindo à Christ Embassy Angola</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl p-8 md:p-14 rounded-[4rem] border border-white/10 shadow-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-black text-ministry-blue mb-4 tracking-tighter uppercase">
              {t('welcome.title')}
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
              {t('welcome.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <button
              type="button"
              onClick={() => { setMode('visitor'); setError(''); }}
              className={`py-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center space-y-3 ${mode === 'visitor' ? 'border-ministry-gold bg-ministry-gold/5 text-ministry-blue ring-4 ring-ministry-gold/10' : 'border-gray-50 text-slate-400 hover:border-gray-100'}`}
            >
              <Users size={24} />
              <span className="font-black text-[10px] uppercase tracking-widest">{t('welcome.visitor')}</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('partner'); setError(''); }}
              className={`py-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center space-y-3 ${mode === 'partner' ? 'border-ministry-blue bg-ministry-blue/5 text-ministry-blue ring-4 ring-ministry-blue/10' : 'border-gray-50 text-slate-400 hover:border-gray-100'}`}
            >
              <ShieldCheck size={24} />
              <span className="font-black text-[10px] uppercase tracking-widest">{t('welcome.partner')}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-100 p-4 rounded-2xl flex items-center space-x-3 mb-6 animate-in slide-in-from-top duration-300">
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-bold text-xs uppercase tracking-wider">{error}</span>
            </div>
          )}

          {mode === 'partner' ? (
            <form onSubmit={handlePartnerLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('auth.user_id')}</label>
                <div className="relative">
                  <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={loginData.username}
                    onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                    className="w-full bg-gray-50 rounded-2xl px-6 py-4 pl-16 border-2 border-transparent focus:border-ministry-blue outline-none transition font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('auth.password')}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full bg-gray-50 rounded-2xl px-6 py-4 pl-16 border-2 border-transparent focus:border-ministry-blue outline-none transition font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-ministry-blue text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-ministry-gold transition-all flex items-center justify-center space-x-3 active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>{t('auth.enter')}</span>
                    <ShieldCheck size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('welcome.form_name')}</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-gray-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('welcome.form_email')}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('welcome.form_church')}</label>
                <input
                  type="text"
                  required
                  value={formData.church}
                  onChange={e => setFormData({ ...formData, church: e.target.value })}
                  className="w-full bg-gray-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-blue outline-none transition font-bold"
                  placeholder="ex: Belas I"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-ministry-gold text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-ministry-blue transition-all flex items-center justify-center space-x-3 active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>{t('welcome.start_exp')}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome;

