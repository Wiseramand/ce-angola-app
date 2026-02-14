import React, { useState } from 'react';
import { User } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User as UserIcon, Save } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    city: user.city || '',
    country: user.country || 'Angola',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onUpdateUser({ ...user, ...formData });
      setLoading(false);
      alert('Profile updated!');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon size={40} className="text-gray-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
            </div>
         </div>
         <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <Input label="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            <Input label="Country" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
            <Button type="submit" isLoading={loading} className="w-full md:w-auto"><Save size={18} className="mr-2" /> Save Changes</Button>
         </form>
      </div>
    </div>
  );
};