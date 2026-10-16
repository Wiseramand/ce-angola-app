import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHODS } from '../constants';
import { Heart, Coins, Gift, Sparkles, Check, Loader2, X } from 'lucide-react';
import { useAuth } from '../App';
import { api } from '../services/api';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: string;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, defaultType = 'offering' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const donationTypes = [
    { id: 'offering', name: t('donations.type_offering'), icon: <Coins size={18} /> },
    { id: 'tithe', name: t('donations.type_tithe'), icon: <Gift size={18} /> },
    { id: 'seeds', name: t('donations.type_seeds'), icon: <Sparkles size={18} /> },
    { id: 'project', name: t('donations.type_project'), icon: <Heart size={18} /> },
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

  const handleClose = () => {
    onClose();
    // Reset form after a short delay so the closing animation isn't interrupted
    setTimeout(() => {
      setIsSuccess(false);
      setAmount('');
      setMethod('');
      setSelectedType(defaultType);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-[360px] max-w-[calc(100vw-2rem)] max-h-[80vh] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div className="bg-ministry-blue p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-display font-black uppercase tracking-tight text-sm">{t('donations.panel_title')}</h3>
            <p className="text-[9px] text-blue-100/70 font-medium mt-0.5">{t('donations.step_payment')}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label={t('common.cancel')}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-6 animate-in zoom-in duration-300">
              <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Check size={28} strokeWidth={3} />
              </div>
              <h4 className="text-lg font-display font-black text-ministry-blue mb-2 uppercase">{t('donations.success_title')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {t('donations.success_desc')}
                <br /><strong className="text-ministry-blue block mt-2">— {t('donations.verse')}</strong>
              </p>
              <button
                onClick={() => { setIsSuccess(false); setAmount(''); setMethod(''); }}
                className="w-full py-3 bg-ministry-blue text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-ministry-gold transition shadow-lg"
              >
                {t('donations.btn_another')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleGive} className="space-y-5">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">{t('donations.select_destination')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {donationTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center space-x-2 p-3 rounded-xl border-2 transition-all duration-300 ${selectedType === type.id
                        ? 'border-ministry-gold bg-ministry-gold/5 text-ministry-blue shadow-inner'
                        : 'border-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                        }`}
                    >
                      <span className={selectedType === type.id ? 'text-ministry-gold' : ''}>{type.icon}</span>
                      <span className="font-black text-[10px] uppercase tracking-tight leading-none">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">{t('donations.seed_value')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ministry-gold font-black text-lg">Kz</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border-0 rounded-2xl py-4 pl-12 pr-6 text-2xl font-black text-ministry-blue focus:ring-4 focus:ring-ministry-gold/10 transition shadow-inner"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">{t('donations.step_payment')}</label>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">{t('donations.national_payment')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.angolan.map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setMethod(pm.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 ${method === pm.id ? 'border-ministry-blue bg-white shadow-lg scale-105' : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                        }`}
                    >
                      <span className="text-xl mb-1">{pm.icon}</span>
                      <span className="text-[8px] font-black text-center leading-none uppercase tracking-tighter text-gray-600">{pm.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !amount || !method}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-[0.98] ${isProcessing || !amount || !method
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-ministry-gold text-white hover:bg-ministry-blue shadow-ministry-gold/20'
                  }`}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <span>{t('donations.btn_give_now')}</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
