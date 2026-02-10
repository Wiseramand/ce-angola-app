
import React, { useState } from 'react';
import { PAYMENT_METHODS } from '../constants';
import { Heart, Coins, Gift, Sparkles, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../App';

const Donations: React.FC = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('offering');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const donationTypes = [
    { id: 'offering', name: 'Oferta Geral', icon: <Coins size={20} /> },
    { id: 'tithe', name: 'Dízimo', icon: <Gift size={20} /> },
    { id: 'seeds', name: 'Semente Especial', icon: <Sparkles size={20} /> },
    { id: 'project', name: 'Projeto de Igreja', icon: <Heart size={20} /> },
  ];

  const handleGive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !method) {
      alert("Selecione o valor e o método de pagamento.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // CHAMADA PARA O BACKEND (Onde as APIs reais estão configuradas)
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'anon',
          userName: user?.fullName || 'Anônimo',
          amount: parseFloat(amount),
          method: method,
          type: 'donation',
          description: `Doação: ${selectedType}`
        })
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert("Erro ao processar doação. Tente novamente ou contacte o suporte.");
      }
    } catch (err) {
      alert("Erro de conexão com o sistema de pagamentos.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-12 rounded-3xl shadow-2xl text-center border-t-8 border-ministry-gold animate-in zoom-in duration-500">
           <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
             <Check size={48} strokeWidth={3} />
           </div>
           <h1 className="text-3xl font-display font-bold text-ministry-blue mb-4 uppercase">Oferta Concluída!</h1>
           <p className="text-gray-600 mb-10 leading-relaxed font-medium">
             "Dai, e ser-vos-á dado; boa medida, recalcada, sacudida e transbordando, vos deitarão no vosso seio."
             <br/><strong className="text-ministry-blue block mt-4">— Lucas 6:38</strong>
           </p>
           <button 
             onClick={() => { setIsSuccess(false); setAmount(''); setMethod(''); }}
             className="w-full py-5 bg-ministry-blue text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-ministry-gold transition shadow-xl"
           >
             REALIZAR OUTRA OFERTA
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          {/* Left Panel */}
          <div className="md:w-1/3 bg-ministry-blue p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-1 bg-ministry-gold mb-8"></div>
              <h1 className="text-4xl font-display font-bold mb-6 leading-tight">Ofertas Online</h1>
              <p className="text-blue-100/70 font-light leading-relaxed mb-10">
                As suas contribuições financeiras apoiam a propagação do Evangelho em toda a Angola e no mundo.
              </p>
            </div>
            
            <div className="space-y-6 relative z-10">
               <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-widest">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">1</div>
                 <span>Tipo & Valor</span>
               </div>
               <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-widest">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">2</div>
                 <span>Pagamento</span>
               </div>
               <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-widest opacity-30">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">3</div>
                 <span>Confirmação</span>
               </div>
            </div>

            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-ministry-gold/10 rounded-full blur-3xl"></div>
          </div>

          {/* Right Panel */}
          <div className="flex-grow p-12">
            <form onSubmit={handleGive} className="space-y-8">
              {/* Type Selection */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Selecione o Propósito</label>
                <div className="grid grid-cols-2 gap-3">
                  {donationTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center space-x-3 p-5 rounded-2xl border-2 transition-all duration-300 ${
                        selectedType === type.id 
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

              {/* Amount */}
              <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Valor da Oferta</label>
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

              {/* Payment Methods */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Método de Envio</label>
                <div className="space-y-6">
                  <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Operadoras em Angola</p>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.angolan.map(pm => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setMethod(pm.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                            method === pm.id ? 'border-ministry-blue bg-white shadow-lg scale-105' : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
                          }`}
                        >
                          <span className="text-2xl mb-2">{pm.icon}</span>
                          <span className="text-[9px] font-black text-center leading-none uppercase tracking-tighter text-gray-600">{pm.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Cartões & Internacional</p>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.international.map(pm => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setMethod(pm.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                            method === pm.id ? 'border-ministry-blue bg-white shadow-lg scale-105' : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
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
                className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 active:scale-[0.98] ${
                  isProcessing || !amount || !method 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-ministry-gold text-white hover:bg-ministry-blue shadow-ministry-gold/20'
                }`}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <span>CONFIRMAR OFERTA AGORA</span>}
              </button>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-center space-x-8 opacity-40 grayscale hover:grayscale-0 transition duration-500">
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
