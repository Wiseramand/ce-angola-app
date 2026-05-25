
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';

export const COUNTRIES = [
  { name: 'Angola', code: 'AO', dialCode: '+244', flag: '🇦🇴' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Mozambique', code: 'MZ', dialCode: '+258', flag: '🇲🇿' },
];
import { Phone, Loader2, User as UserIcon, Camera, ChevronRight, Check, Info, Search, ChevronDown, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: 'Angola',
    countryCode: '+244',
    churchName: '',
    gender: 'Masculino'
  });
  const [profilePic, setProfilePic] = useState<string | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const countryData = COUNTRIES.find(c => c.name === formData.country);
      const code = countryData?.dialCode || formData.countryCode;
      
      await register({ 
        fullName: formData.fullName, 
        phone: formData.phone, 
        country: formData.country, 
        countryCode: code, 
        churchName: formData.churchName,
        profilePicture: profilePic 
      });
      
      navigate('/live-tv');
    } catch (e) {
      console.error(e);
      alert(t('common.error_connection'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-ministry-blue p-10 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-display font-bold uppercase tracking-tighter">{t('auth.register_title')}</h2>
              <p className="text-blue-100/60 mt-2 text-sm font-bold uppercase tracking-widest">{t('auth.register_subtitle')}</p>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-ministry-gold/20 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-blue-50 p-4 px-10 flex items-center space-x-4 border-b border-blue-100">
            <Info className="text-blue-600 flex-shrink-0" size={20} />
            <p className="text-[10px] text-blue-800 font-bold uppercase tracking-tight">
              {t('auth.register_note')}
            </p>
          </div>

          <div className="p-10">
            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t('auth.full_name')}</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-ministry-gold rounded-2xl px-6 py-4 outline-none transition font-bold"
                      placeholder={t('auth.full_name_placeholder')}
                      required
                    />
                  </div>
                  
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t('admin.country')}</label>
                    <button
                      type="button"
                      onClick={() => setIsCountryOpen(!isCountryOpen)}
                      className="w-full bg-gray-50 rounded-2xl px-6 py-4 flex items-center justify-between border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{COUNTRIES.find(c => c.name === formData.country)?.flag || '🌍'}</span>
                        <span className="text-gray-700">{formData.country} ({formData.countryCode})</span>
                      </div>
                      <ChevronDown size={20} className={`text-slate-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCountryOpen && (
                      <div className="absolute z-50 mt-2 w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, country: c.name, countryCode: c.dialCode });
                                setIsCountryOpen(false);
                                setSearchQuery('');
                              }}
                              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                            >
                              <div className="flex items-center space-x-3 text-left">
                                <span className="text-2xl">{c.flag}</span>
                                <div>
                                  <p className="font-bold text-gray-700 text-sm">{c.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.dialCode}</p>
                                </div>
                              </div>
                              {formData.country === c.name && <Check size={18} className="text-ministry-gold" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t('admin.phone')}</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm border-r border-gray-200 pr-3 h-6 flex items-center">
                        {formData.countryCode}
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-ministry-gold rounded-2xl px-6 py-4 focus:ring-2 outline-none transition font-bold"
                        placeholder="9xx xxx xxx"
                        style={{ paddingLeft: `${(formData.countryCode.length * 9) + 40}px` }}
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t('auth.gender')}</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-ministry-gold rounded-2xl px-6 py-4 outline-none transition font-bold"
                      >
                        <option value="Masculino">{t('common.male')}</option>
                        <option value="Feminino">{t('common.female')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t('auth.church')}</label>
                      <input
                        type="text"
                        name="churchName"
                        value={formData.churchName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-ministry-gold rounded-2xl px-6 py-4 outline-none transition font-bold"
                        placeholder={t('auth.church_placeholder')}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full py-5 bg-ministry-blue text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-ministry-gold transition shadow-xl active:scale-95"
                  >
                    <span>{t('auth.btn_next_photo')}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-8 py-4">
                <div className="relative inline-block">
                  <div className="w-48 h-48 bg-gray-100 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner flex items-center justify-center">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={64} className="text-gray-300" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-ministry-gold text-white p-3 rounded-xl shadow-2xl cursor-pointer hover:scale-105 transition active:scale-95">
                    <Camera size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                <div className="max-w-md mx-auto">
                  <h3 className="text-2xl font-display font-bold text-ministry-blue uppercase tracking-tight">{t('auth.photo_step_title')}</h3>
                  <p className="text-gray-500 mt-2 text-sm font-medium">{t('auth.photo_step_desc')}</p>
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="flex-1 py-5 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition uppercase text-xs tracking-widest"
                  >
                    {t('common.back')}
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="flex-[2] py-5 bg-ministry-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-ministry-gold transition shadow-xl active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    <span>{isSubmitting ? t('common.loading') : t('auth.btn_complete')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
