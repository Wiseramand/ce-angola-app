import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import Logo from '../components/Logo';
import { api } from '../services/api';
import { User, Users, Globe, ArrowRight, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

const Welcome: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'visitor' | 'partner'>('visitor');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    church: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const userPayload = { ...formData };

    // TÉCNICA SÉNIOR: Tentamos salvar, mas não deixamos o utilizador esperar mais de 1.5s
    // Se o servidor falhar, ele entra no portal do mesmo jeito (Prioridade: Experiência do Utilizador)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      api.auth.register(userPayload.fullName, userPayload.email, userPayload.church)
        .catch(err => console.warn("Registo em background falhou, mas utilizador prossegue."));

      // Aguardamos apenas um momento curto para dar sensação de processamento
      await new Promise(resolve => setTimeout(resolve, 800));

      clearTimeout(timeoutId);
      await register(userPayload);
    } catch (err) {
      // Em caso de erro crítico, ainda assim deixamos entrar
      await register(userPayload);
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
              onClick={() => setMode('visitor')}
              className={`py-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center space-y-3 ${mode === 'visitor' ? 'border-ministry-gold bg-ministry-gold/5 text-ministry-blue ring-4 ring-ministry-gold/10' : 'border-gray-50 text-slate-400 hover:border-gray-100'}`}
            >
              <Users size={24} />
              <span className="font-black text-[10px] uppercase tracking-widest">{t('welcome.visitor')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('partner')}
              className={`py-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center space-y-3 ${mode === 'partner' ? 'border-ministry-blue bg-ministry-blue/5 text-ministry-blue ring-4 ring-ministry-blue/10' : 'border-gray-50 text-slate-400 hover:border-gray-100'}`}
            >
              <ShieldCheck size={24} />
              <span className="font-black text-[10px] uppercase tracking-widest">{t('welcome.partner')}</span>
            </button>
          </div>

          {mode === 'partner' ? (
            <div className="text-center py-10 animate-in fade-in slide-in-from-bottom duration-500">
              <ShieldCheck size={48} className="mx-auto text-ministry-gold mb-6" />
              <h3 className="text-xl font-black text-ministry-blue uppercase mb-4">{t('auth.login_title')}</h3>
              <p className="text-slate-500 font-bold mb-8 text-sm">{t('auth.login_subtitle')}</p>
              <button
                type="button"
                onClick={() => window.location.hash = '#/login'}
                className="px-10 py-5 bg-ministry-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-ministry-gold transition shadow-xl"
              >
                {t('common.login')}
              </button>
            </div>
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
                <span>{t('welcome.start_exp')}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
