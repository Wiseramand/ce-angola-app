import React, { useState } from 'react';
import { Button } from '../components/Button';
import { PARTNERSHIP_ARMS } from '../constants';
import { User } from '../types';
import { Heart, CheckCircle, Globe, Wallet } from 'lucide-react';

interface PartnershipProps {
  user: User | null;
  onNavigate: (page: string) => void;
}

export const Partnership: React.FC<PartnershipProps> = ({ user, onNavigate }) => {
  const [selectedArms, setSelectedArms] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const toggleArm = (id: string) => {
    if (selectedArms.includes(id)) setSelectedArms(selectedArms.filter(armId => armId !== id));
    else setSelectedArms([...selectedArms, id]);
  };

  if (step === 2) {
    return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <CheckCircle size={60} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-8">Your partnership seed request has been initiated.</p>
            <Button onClick={() => setStep(1)} variant="outline">Back</Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="bg-blue-900 text-white py-20 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Connect with Divinity</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">Join forces with Christ Embassy Angola to change lives globally.</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {PARTNERSHIP_ARMS.map(arm => (
                <div key={arm.id} className={`border-2 rounded-xl p-4 cursor-pointer ${selectedArms.includes(arm.id) ? 'border-blue-600' : 'border-gray-100'}`} onClick={() => toggleArm(arm.id)}>
                    <img src={arm.imageUrl} className="w-full h-32 object-cover rounded mb-4"/>
                    <h3 className="font-bold">{arm.name}</h3>
                </div>
            ))}
        </div>
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 sticky top-24">
                <h3 className="font-bold mb-6 flex gap-2"><Wallet/> Your Seed</h3>
                <p className="mb-4 text-sm text-gray-500">Selected: {selectedArms.length} Arms</p>
                <Button onClick={() => setStep(2)} className="w-full">Partner Now</Button>
            </div>
        </div>
      </div>
    </div>
  );
};