
import React, { useState } from 'react';
import { PARTNERSHIP_BRANCHES, PAYMENT_METHODS } from '../constants';
import { ShieldCheck, Info, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../App';

const Partnerships: React.FC = () => {
  const { user } = useAuth();
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleBranch = (id: string) => {
    setSelectedBranches(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleSponsorClick = () => {
    if (selectedBranches.length === 0) {
      alert("Por favor, selecione pelo menos um braço de parceria.");
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'anon',
          userName: user?.fullName || 'Anônimo',
          amount: parseFloat(amount),
          method: method,
          type: 'partnership',
          description: `Semente para: ${selectedBranches.join(', ')}`
        })
      });

      if (res.ok) {
        setStep(3);
      } else {
        alert("Erro ao processar pagamento no servidor.");
      }
    } catch (e) {
      alert("Falha na conexão de pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <div className="bg-ministry-blue py-32 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 animate-in fade-in zoom-in duration-700">
          <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-8 tracking-tight uppercase">Parceria & Impacto</h1>
          <p className="text-2xl text-blue-100/70 font-light max-w-3xl mx-auto leading-relaxed">
            O Evangelismo Global é impulsionado por parcerias. Junte-se a nós hoje para causar um impacto eterno na vida de bilhões.
          </p>
        </div>
        <div className="absolute inset-0 opacity-20 grayscale">
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-4xl font-display font-black text-ministry-blue mb-12 uppercase tracking-tighter">Nossos Braços de Parceria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {PARTNERSHIP_BRANCHES.map(branch => (
                  <div 
                    key={branch.id} 
                    className={`group bg-white border-2 rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl ${
                      selectedBranches.includes(branch.id) 
                        ? 'border-ministry-gold ring-[12px] ring-ministry-gold/5 scale-[1.02]' 
                        : 'border-gray-100 hover:border-ministry-gold/30'
                    }`}
                    onClick={() => toggleBranch(branch.id)}
                  >
                    <div className="h-56 overflow-hidden bg-gray-100 relative">
                      <img 
                        src={branch.imageUrl} 
                        alt={branch.name} 
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = "https://images.unsplash.com/photo-1459183885447-59f9b0ed85a0?q=80&w=2070";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-black text-ministry-blue uppercase tracking-tight">{branch.name}</h3>
                        {selectedBranches.includes(branch.id) && (
                          <div className="bg-ministry-gold text-white rounded-full p-1.5 shadow-lg">
                            <Check size={20} />
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-3 font-medium">{branch.description}</p>
                      <div className="flex items-center text-[10px] text-ministry-gold font-black uppercase tracking-widest bg-ministry-gold/5 p-3 rounded-xl border border-ministry-gold/10">
                        <Info size={14} className="mr-2" />
                        Impacto: {branch.impact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-8">
              {!showForm ? (
                <div className="bg-gray-50 border border-gray-100 p-10 rounded-[3rem] shadow-xl">
                  <h3 className="text-3xl font-display font-black text-ministry-blue mb-8 uppercase tracking-tighter">Torne-se Parceiro</h3>
                  <div className="space-y-6 mb-10">
                    <p className="text-gray-500 font-medium leading-relaxed">Selecione um ou mais braços para patrocinar. Sua semente é um milagre na vida de alguém.</p>
                    {selectedBranches.length > 0 ? (
                      <div className="space-y-3">
                        {selectedBranches.map(id => {
                          const branch = PARTNERSHIP_BRANCHES.find(b => b.id === id);
                          return (
                            <div key={id} className="flex items-center space-x-3 text-sm font-black text-ministry-blue bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-right duration-300">
                              <div className="w-2.5 h-2.5 bg-ministry-gold rounded-full shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
                              <span>{branch?.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 italic font-medium">
                        Nenhum braço selecionado
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleSponsorClick}
                    disabled={selectedBranches.length === 0}
                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 transition-all duration-300 shadow-2xl active:scale-95 ${
                      selectedBranches.length > 0 
                        ? 'bg-ministry-blue text-white hover:bg-ministry-gold' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>PROSSEGUIR PARA PATROCÍNIO</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              ) : (
                <div className="bg-white border-[6px] border-ministry-gold p-10 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(197,160,89,0.2)] animate-in zoom-in duration-500">
                  {step === 1 && (
                    <div>
                      <h3 className="text-3xl font-display font-black text-ministry-blue mb-8 uppercase tracking-tighter">Detalhes da Semente</h3>
                      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Nome Completo</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-ministry-gold/20 font-bold" 
                            defaultValue={user?.fullName} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Valor da Semente (AOA/USD)</label>
                          <input 
                            type="number" 
                            className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-ministry-gold/20 font-black text-xl text-ministry-blue" 
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Pedido de Oração / Nota</label>
                          <textarea 
                            className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-ministry-gold/20 font-medium" 
                            rows={3} 
                            placeholder="Sua mensagem para o pastor..."
                          ></textarea>
                        </div>
                        <button type="submit" className="w-full py-6 bg-ministry-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-ministry-gold transition-all duration-300">
                          CONTINUAR PARA PAGAMENTO
                        </button>
                      </form>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="animate-in slide-in-from-right duration-500">
                      <h3 className="text-3xl font-display font-black text-ministry-blue mb-8 uppercase tracking-tighter">Forma de Envio</h3>
                      <div className="space-y-8">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Métodos Locais (Angola)</p>
                          <div className="grid grid-cols-1 gap-3">
                            {PAYMENT_METHODS.angolan.map(pm => (
                              <button 
                                key={pm.id}
                                onClick={() => setMethod(pm.id)}
                                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${method === pm.id ? 'border-ministry-gold bg-ministry-gold/5 shadow-inner' : 'border-gray-50 hover:border-gray-200'}`}
                              >
                                <span className="flex items-center space-x-3">
                                  <span className="text-2xl">{pm.icon}</span>
                                  <span className="text-sm font-black text-ministry-blue">{pm.name}</span>
                                </span>
                                {method === pm.id && <Check size={20} className="text-ministry-gold" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Métodos Internacionais</p>
                          <div className="grid grid-cols-1 gap-3">
                            {PAYMENT_METHODS.international.map(pm => (
                              <button 
                                key={pm.id}
                                onClick={() => setMethod(pm.id)}
                                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${method === pm.id ? 'border-ministry-gold bg-ministry-gold/5 shadow-inner' : 'border-gray-50 hover:border-gray-200'}`}
                              >
                                <span className="flex items-center space-x-3">
                                  <span className="text-2xl">{pm.icon}</span>
                                  <span className="text-sm font-black text-ministry-blue">{pm.name}</span>
                                </span>
                                {method === pm.id && <Check size={20} className="text-ministry-gold" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-4 pt-4">
                          <button onClick={() => setStep(1)} disabled={isProcessing} className="flex-1 py-6 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-600 transition">VOLTAR</button>
                          <button 
                            onClick={handleSubmit} 
                            disabled={!method || isProcessing}
                            className={`flex-[2] py-6 rounded-2xl font-black uppercase tracking-widest text-xs text-white transition-all duration-300 shadow-2xl ${method && !isProcessing ? 'bg-ministry-gold hover:opacity-90' : 'bg-gray-200 cursor-not-allowed'}`}
                          >
                            {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'CONCLUIR OFERTA'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="text-center py-10 animate-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Check size={48} strokeWidth={3} />
                      </div>
                      <h3 className="text-3xl font-display font-black text-ministry-blue mb-4 uppercase tracking-tighter">Semente Recebida!</h3>
                      <p className="text-gray-500 mb-10 font-medium leading-relaxed">Deus abençoe sua parceria no Evangelho. Registramos sua transação no sistema master.</p>
                      <button 
                        onClick={() => { setStep(1); setShowForm(false); setSelectedBranches([]); }}
                        className="px-12 py-5 bg-ministry-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-ministry-gold transition-all duration-300 shadow-xl"
                      >
                        VOLTAR PARA PARCERIAS
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50/50 p-8 rounded-[2rem] flex items-start space-x-4 border border-blue-100 shadow-sm">
                <ShieldCheck className="text-blue-600 flex-shrink-0" size={24} />
                <p className="text-[11px] text-blue-800/60 font-bold uppercase tracking-tight leading-relaxed">
                  Suas transações são protegidas com criptografia SSL de padrão bancário. A Christ Embassy Angola não armazena dados financeiros sensíveis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partnerships;
