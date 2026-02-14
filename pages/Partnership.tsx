import React, { useState } from 'react';
import { Button } from '../components/Button';
import { PARTNERSHIP_ARMS } from '../constants';
import { User } from '../types';
import { Heart, CheckCircle, Globe, Wallet, CreditCard } from 'lucide-react';

interface PartnershipProps {
  user: User | null;
  onNavigate: (page: string) => void;
}

export const Partnership: React.FC<PartnershipProps> = ({ user, onNavigate }) => {
  const [selectedArms, setSelectedArms] = useState<string[]>([]);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('Kz');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Selection, 2: Success

  const toggleArm = (id: string) => {
    if (selectedArms.includes(id)) {
      setSelectedArms(selectedArms.filter(armId => armId !== id));
    } else {
      setSelectedArms([...selectedArms, id]);
    }
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedArms.length === 0) {
        alert("Please select at least one partnership arm.");
        return;
    }
    if (!amount) {
        alert("Please enter an amount.");
        return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        setStep(2);
        window.scrollTo(0, 0);
    }, 1500);
  };

  if (step === 2) {
    return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Partnership!</h2>
            <p className="text-lg text-gray-600 mb-8">
                Your seed of <span className="font-bold text-gray-900">{currency} {Number(amount).toLocaleString()}</span> has been received. 
                Together we are taking the gospel to the ends of the earth.
            </p>
            <div className="bg-gray-50 p-6 rounded-xl text-left mb-8 max-w-md mx-auto">
                <h4 className="font-bold text-gray-700 mb-2 border-b border-gray-200 pb-2">Donation Summary</h4>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Arms:</span>
                        <span className="font-medium text-right">
                            {PARTNERSHIP_ARMS.filter(a => selectedArms.includes(a.id)).map(a => a.name).join(', ')}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium text-blue-900">{currency} {Number(amount).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <Button onClick={() => setStep(1)} variant="outline">Make Another Donation</Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-blue-900 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 rounded-full px-4 py-1 mb-6 text-blue-200 text-sm font-semibold">
                <Heart size={16} className="text-pink-500 fill-pink-500" />
                <span>PARTNER WITH US TODAY</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Connect with Divinity</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Partnership is a strategic alliance for the purpose of moving the Gospel forward. 
                Join forces with Christ Embassy Angola to change lives globally.
            </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Partnership Arms List */}
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Globe className="text-blue-900" /> Our Partnership Arms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PARTNERSHIP_ARMS.map(arm => (
                    <div 
                        key={arm.id} 
                        className={`
                            relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer group
                            ${selectedArms.includes(arm.id) ? 'border-blue-600 shadow-lg ring-2 ring-blue-600 ring-offset-2' : 'border-gray-100 hover:border-blue-300'}
                        `}
                        onClick={() => toggleArm(arm.id)}
                    >
                        <div className="h-40 overflow-hidden">
                            <img src={arm.imageUrl} alt={arm.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute top-3 right-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedArms.includes(arm.id) ? 'bg-blue-600 border-blue-600' : 'border-white bg-black/30'}`}>
                                    {selectedArms.includes(arm.id) && <CheckCircle size={16} className="text-white" />}
                                </div>
                            </div>
                        </div>
                        <div className="p-5 bg-white">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{arm.name}</h3>
                            <p className="text-sm text-gray-600">{arm.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Donation Form */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl border border-blue-100 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Wallet className="text-blue-900" /> Your Partnership Seed
                </h3>
                
                <form onSubmit={handleDonate} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Selected Arms ({selectedArms.length})
                        </label>
                        <div className="min-h-[40px] p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
                            {selectedArms.length > 0 ? (
                                <ul className="list-disc list-inside">
                                    {PARTNERSHIP_ARMS.filter(a => selectedArms.includes(a.id)).map(a => (
                                        <li key={a.id}>{a.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-gray-400 italic">Select arms from the left...</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                         <div className="col-span-1">
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Currency</label>
                            <select 
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none"
                            >
                                <option value="Kz">AOA (Kz)</option>
                                <option value="$">USD ($)</option>
                                <option value="€">EUR (€)</option>
                            </select>
                         </div>
                         <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount</label>
                            <input 
                                type="number" 
                                min="1"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none"
                            />
                         </div>
                    </div>

                    {!user && (
                         <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-md border border-yellow-200">
                            Note: Please <button type="button" onClick={() => onNavigate('login')} className="underline font-bold">login</button> to track your partnership records.
                        </div>
                    )}

                    <Button type="submit" className="w-full py-3 text-lg" isLoading={loading}>
                        <CreditCard size={20} className="mr-2" />
                        Partner Now
                    </Button>
                    
                    <p className="text-xs text-center text-gray-400">
                        Secure SSL Encryption. 100% Safe.
                    </p>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
};
