
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHODS } from '../constants';
import { Heart, Coins, Gift, Sparkles, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../services/api';

const Donations: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('offering');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const donationTypes = [
    { id: 'offering', name: t('donations.type_offering'), icon: <Coins size={20} /> },
    { id: 'tithe', name: t('donations.type_tithe'), icon: <Gift size={20} /> },
    { id: 'seeds', name: t('donations.type_seeds'), icon: <Sparkles size={20} /> },
    { id: 'project', name: t('donations.type_project'), icon: <Heart size={20} /> },
  ];

  const handleGive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !method) {
      alert(t('donations.error_fill_form'));
      return;
    }

    setIsProcessing(true);

    try {
      await api.payments.process({
        userId: user?.id || 'public-user',
        userName: user?.fullName || t('common.anonymous_visitor'),
        amount: parseFloat(amount),
        method: method,
        type: 'donation',
        description: t('common.donation_desc', { type: selectedType })
      });

      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message || t('common.error_connection'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center border-t-8 border-ministry-gold animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Check size={48} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-display font-bold text-ministry-blue mb-4 uppercase">{t('donations.success_title')}</h1>
          <p className="text-gray-600 mb-10 leading-relaxed font-medium">
            {t('donations.success_desc')}
            <br /><strong className="text-ministry-blue block mt-4">— {t('donations.verse')}</strong>
          </p>
          <button
            onClick={() => { setIsSuccess(false); setAmount(''); setMethod(''); }}
            className="w-full py-5 bg-ministry-blue text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-ministry-gold transition shadow-xl"
          >
            {t('donations.btn_another')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          {/* Painel Esquerdo: Info */}
          <div className="md:w-1/3 bg-ministry-blue p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-1 bg-ministry-gold mb-8"></div>
              <h1 className="text-4xl font-display font-bold mb-6 leading-tight">{t('donations.panel_title')}</h1>
              <p className="text-blue-100/70 font-light leading-relaxed mb-10 text-sm">
                {t('donations.panel_desc')}
              </p>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/5">1</div>
                <span>{t('donations.step_purpose')}</span>
              </div>
              <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/5">2</div>
                <span>{t('donations.step_payment')}</span>
              </div>
            </div>

            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-ministry-gold/10 rounded-full blur-3xl"></div>
          </div>

          {/* Painel Direito: Formulário */}
          <div className="flex-grow p-12">
            <form onSubmit={handleGive} className="space-y-8">
              {/* Seleção do Tipo */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">{t('donations.select_destination')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {donationTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center space-x-3 p-5 rounded-2xl border-2 transition-all duration-300 ${selectedType === type.id
                        ? 'border-ministry-gold bg-ministry-gold/5 text-ministry-blue shadow-inner'
                        : 'border-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                        }`}
                    >
                      <span className={selectedType === type.id ? 'text-ministry-gold' : ''}>{type.icon}</span>
                      <span className="font-black text-[11px] uppercase tracking-tight">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor */}
              <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">{t('donations.seed_value')}</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-ministry-gold font-black text-xl">Kz</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border-0 rounded-2xl py-6 pl-16 pr-8 text-3xl font-black text-ministry-blue focus:ring-4 focus:ring-ministry-gold/10 transition shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Métodos de Pagamento */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">{t('donations.step_payment')}</label>
                <div className="space-y-6">
                  <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">{t('donations.national_payment')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.angolan.map(pm => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setMethod(pm.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${method === pm.id ? 'border-ministry-blue bg-white shadow-lg scale-105' : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
                            }`}
                        >
                          <span className="text-2xl mb-2">{pm.icon}</span>
                          <span className="text-[9px] font-black text-center leading-none uppercase tracking-tighter text-gray-600">{pm.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !amount || !method}
                className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 active:scale-[0.98] ${isProcessing || !amount || !method
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-ministry-gold text-white hover:bg-ministry-blue shadow-ministry-gold/20'
                  }`}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <span>{t('donations.btn_give_now')}</span>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
