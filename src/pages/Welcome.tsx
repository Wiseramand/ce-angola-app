import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import Logo from '../components/Logo';
import { COUNTRIES } from '../constants';
import { Users, ShieldCheck, Lock, Loader2, AlertCircle, Search, ChevronDown, Check, Phone, ArrowRight } from 'lucide-react';

const Welcome: React.FC = () => {
  const { t } = useTranslation();
  const { register, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'visitor' | 'partner'>('visitor');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: 'Angola',
    countryCode: '+244',
    churchName: ''
  });

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.dialCode.includes(searchQuery)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      await register(formData);
      // Persist visitor data for automatic return
      localStorage.setItem('ce_visitor_data', JSON.stringify(formData));
    } catch (err) {
      console.error("Error during visitor registration:", err);
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
          <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter leading-none">{t('welcome.hero_title')}</h1>
          <p className="text-blue-100/60 mt-4 text-sm font-bold uppercase tracking-[0.4em] italic">{t('welcome.hero_subtitle')}</p>
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
                    placeholder={t('auth.user_id')}
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
                  placeholder={t('welcome.form_name')}
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-gray-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('admin.country')}</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="w-full bg-gray-50 rounded-2xl px-6 py-4 flex items-center justify-between border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{COUNTRIES.find(c => c.name === formData.country)?.flag || '🌍'}</span>
                      <span className="text-gray-700">{formData.country} ({formData.countryCode})</span>
                    </div>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCountryOpen && (
                    <div className="absolute z-[100] mt-2 w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-gray-50 sticky top-0 bg-white">
                        <div className="relative">
                          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder={t('welcome.search_country')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl px-4 py-3 pl-12 border-none focus:ring-2 focus:ring-ministry-gold outline-none font-bold text-sm"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar text-ministry-blue">
                        {filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, country: c.name, countryCode: c.dialCode });
                              setIsCountryOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-ministry-gold/5 transition group border-b border-gray-50 last:border-0"
                          >
                            <div className="flex items-center space-x-3 text-left">
                              <span className="text-2xl">{c.flag}</span>
                              <div>
                                <p className="font-bold text-gray-700 text-sm group-hover:text-ministry-gold">{c.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.dialCode}</p>
                              </div>
                            </div>
                            {formData.country === c.name && <Check size={18} className="text-ministry-gold" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('welcome.form_phone')}</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm border-r border-gray-200 pr-3 h-6 flex items-center">
                    {formData.countryCode}
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="9xx xxx xxx"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold"
                    style={{ paddingLeft: `${(formData.countryCode.length * 9) + 40}px` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('admin.church')}</label>
                <input
                  type="text"
                  required
                  value={formData.churchName}
                  onChange={e => setFormData({ ...formData, churchName: e.target.value })}
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

