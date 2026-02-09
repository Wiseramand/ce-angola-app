
import React, { useState } from 'react';
import { PARTNERSHIP_BRANCHES, PAYMENT_METHODS } from '../constants';
import { ShieldCheck, Info, Gift, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../App';

const Partnerships: React.FC = () => {
  const { user } = useAuth();
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');

  const toggleBranch = (id: string) => {
    setSelectedBranches(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleSponsorClick = () => {
    if (selectedBranches.length === 0) {
      alert("Please select at least one partnership arm to sponsor.");
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
    // In real app, process payment here
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <div className="bg-ministry-blue py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Partnership & Impact</h1>
          <p className="text-xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed">
            Global Evangelism is powered by partnerships. Join us today to make an eternal impact in the lives of billions.
          </p>
        </div>
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-ministry-blue mb-8">Our Partnership Arms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {PARTNERSHIP_BRANCHES.map(branch => (
                  <div 
                    key={branch.id} 
                    className={`relative group bg-white border-2 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 transform ${
                      selectedBranches.includes(branch.id) 
                        ? 'border-ministry-gold ring-4 ring-ministry-gold/10' 
                        : 'border-gray-100 hover:border-ministry-gold/50'
                    }`}
                    onClick={() => toggleBranch(branch.id)}
                  >
                    <div className="h-48 overflow-hidden">
                      <img src={branch.imageUrl} alt={branch.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-ministry-blue">{branch.name}</h3>
                        {selectedBranches.includes(branch.id) && (
                          <div className="bg-ministry-gold text-white rounded-full p-1">
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{branch.description}</p>
                      <div className="flex items-center text-xs text-ministry-gold font-bold uppercase tracking-wider">
                        <Info size={14} className="mr-1" />
                        Impact: {branch.impact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {!showForm ? (
                <div className="bg-gray-50 border border-gray-100 p-8 rounded-3xl shadow-sm">
                  <h3 className="text-2xl font-display font-bold text-ministry-blue mb-6">Become a Partner</h3>
                  <div className="space-y-4 mb-8">
                    <p className="text-gray-600 text-sm">Select one or more arms to sponsor. Your seed is a miracle in someone's life.</p>
                    {selectedBranches.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedBranches.map(id => {
                          const branch = PARTNERSHIP_BRANCHES.find(b => b.id === id);
                          return (
                            <li key={id} className="flex items-center space-x-2 text-sm font-medium text-ministry-blue bg-white p-2 rounded-lg border border-gray-100">
                              <span className="w-2 h-2 bg-ministry-gold rounded-full"></span>
                              <span>{branch?.name}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-center py-4 text-gray-400 italic text-sm">No arms selected</p>
                    )}
                  </div>
                  <button 
                    onClick={handleSponsorClick}
                    disabled={selectedBranches.length === 0}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition ${
                      selectedBranches.length > 0 
                        ? 'bg-ministry-blue text-white hover:bg-opacity-90 shadow-lg' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Proceed to Sponsorship</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              ) : (
                <div className="bg-white border-2 border-ministry-gold p-8 rounded-3xl shadow-xl">
                  {step === 1 && (
                    <div>
                      <h3 className="text-2xl font-display font-bold text-ministry-blue mb-6">Sponsorship Details</h3>
                      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-ministry-gold" 
                            defaultValue={user?.fullName} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Seed Amount (AOA/USD)</label>
                          <input 
                            type="number" 
                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-ministry-gold" 
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prayer Request / Note</label>
                          <textarea 
                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-ministry-gold" 
                            rows={3} 
                            placeholder="Optional message..."
                          ></textarea>
                        </div>
                        <button type="submit" className="w-full py-4 bg-ministry-blue text-white rounded-xl font-bold hover:bg-opacity-90">
                          Next: Payment Method
                        </button>
                      </form>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h3 className="text-2xl font-display font-bold text-ministry-blue mb-6">Select Payment</h3>
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Angolan Local Methods</p>
                          <div className="grid grid-cols-1 gap-2">
                            {PAYMENT_METHODS.angolan.map(pm => (
                              <button 
                                key={pm.id}
                                onClick={() => setMethod(pm.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition ${method === pm.id ? 'border-ministry-gold bg-ministry-gold/5' : 'border-gray-50 hover:border-gray-200'}`}
                              >
                                <span className="flex items-center space-x-2">
                                  <span>{pm.icon}</span>
                                  <span className="text-sm font-semibold">{pm.name}</span>
                                </span>
                                {method === pm.id && <Check size={16} className="text-ministry-gold" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-3">International Methods</p>
                          <div className="grid grid-cols-1 gap-2">
                            {PAYMENT_METHODS.international.map(pm => (
                              <button 
                                key={pm.id}
                                onClick={() => setMethod(pm.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition ${method === pm.id ? 'border-ministry-gold bg-ministry-gold/5' : 'border-gray-50 hover:border-gray-200'}`}
                              >
                                <span className="flex items-center space-x-2">
                                  <span>{pm.icon}</span>
                                  <span className="text-sm font-semibold">{pm.name}</span>
                                </span>
                                {method === pm.id && <Check size={16} className="text-ministry-gold" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-500 font-bold">Back</button>
                          <button 
                            onClick={handleSubmit} 
                            disabled={!method}
                            className={`flex-[2] py-4 rounded-xl font-bold text-white transition ${method ? 'bg-ministry-gold hover:opacity-90' : 'bg-gray-200 cursor-not-allowed'}`}
                          >
                            Complete Giving
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="text-center py-10">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-ministry-blue mb-2">Seed Received!</h3>
                      <p className="text-gray-600 mb-8">God bless you for your partnership in the Gospel. A receipt has been sent to your email.</p>
                      <button 
                        onClick={() => { setStep(1); setShowForm(false); setSelectedBranches([]); }}
                        className="px-8 py-3 bg-ministry-blue text-white rounded-xl font-bold hover:bg-opacity-90"
                      >
                        Back to Partnerships
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 p-6 rounded-2xl flex items-start space-x-4 border border-blue-100">
                <ShieldCheck className="text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Your transactions are secured with industry-standard SSL encryption. Christ Embassy Angola does not store your sensitive financial information.
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
