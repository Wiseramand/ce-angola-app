
import React, { useState } from 'react';
import { PAYMENT_METHODS } from '../constants';
import { Heart, Coins, Gift, Sparkles, Check } from 'lucide-react';

const Donations: React.FC = () => {
  const [selectedType, setSelectedType] = useState('offering');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const donationTypes = [
    { id: 'offering', name: 'General Offering', icon: <Coins size={20} /> },
    { id: 'tithe', name: 'Tithe', icon: <Gift size={20} /> },
    { id: 'seeds', name: 'Special Seed', icon: <Sparkles size={20} /> },
    { id: 'project', name: 'Church Project', icon: <Heart size={20} /> },
  ];

  const handleGive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !method) return;
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-12 rounded-3xl shadow-2xl text-center border-t-8 border-ministry-gold">
           <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
             <Check size={48} />
           </div>
           <h1 className="text-3xl font-display font-bold text-ministry-blue mb-4">Giving Complete!</h1>
           <p className="text-gray-600 mb-10 leading-relaxed">
             "Give, and it will be given to you: good measure, pressed down, shaken together, and running over will be put into your bosom."
             <br/><strong className="text-ministry-blue block mt-2">— Luke 6:38</strong>
           </p>
           <button 
             onClick={() => setIsSuccess(false)}
             className="w-full py-4 bg-ministry-blue text-white font-bold rounded-2xl hover:bg-opacity-90 transition"
           >
             Give Again
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel */}
          <div className="md:w-1/3 bg-ministry-blue p-10 text-white flex flex-col justify-between">
            <div>
              <div className="w-16 h-1 bg-ministry-gold mb-8"></div>
              <h1 className="text-4xl font-display font-bold mb-6">Online Giving</h1>
              <p className="text-blue-100/70 font-light leading-relaxed mb-10">
                Your financial contributions support the spread of the Gospel across Angola and the world.
              </p>
            </div>
            <div className="space-y-6">
               <div className="flex items-center space-x-3 text-sm">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">1</div>
                 <span>Select Type & Amount</span>
               </div>
               <div className="flex items-center space-x-3 text-sm">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">2</div>
                 <span>Payment Method</span>
               </div>
               <div className="flex items-center space-x-3 text-sm">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">3</div>
                 <span>Confirmation</span>
               </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-grow p-10">
            <form onSubmit={handleGive} className="space-y-8">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Giving Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {donationTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition ${
                        selectedType === type.id 
                        ? 'border-ministry-gold bg-ministry-gold/5 text-ministry-blue' 
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      <span className={selectedType === type.id ? 'text-ministry-gold' : ''}>{type.icon}</span>
                      <span className="font-bold text-sm">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Kz</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border-0 rounded-2xl py-4 pl-12 pr-6 text-2xl font-bold text-ministry-blue focus:ring-4 focus:ring-ministry-gold/10 transition"
                    required
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Method</label>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Angola Local</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PAYMENT_METHODS.angolan.map(pm => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setMethod(pm.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${
                            method === pm.id ? 'border-ministry-blue bg-blue-50' : 'border-gray-50 hover:border-gray-100'
                          }`}
                        >
                          <span className="text-xl mb-1">{pm.icon}</span>
                          <span className="text-[10px] font-bold text-center leading-none">{pm.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">International</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PAYMENT_METHODS.international.map(pm => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setMethod(pm.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${
                            method === pm.id ? 'border-ministry-blue bg-blue-50' : 'border-gray-50 hover:border-gray-100'
                          }`}
                        >
                          <span className="text-xl mb-1">{pm.icon}</span>
                          <span className="text-[10px] font-bold text-center leading-none">{pm.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-ministry-gold text-white text-xl font-bold rounded-2xl shadow-xl shadow-ministry-gold/30 hover:bg-opacity-90 active:scale-[0.98] transition"
              >
                GIVE NOW
              </button>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-center space-x-6 opacity-50 grayscale hover:grayscale-0 transition">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
