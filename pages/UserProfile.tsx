import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Camera, MapPin, Save, User as UserIcon } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    country: user.country || 'Angola',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Update local state if user prop changes
  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      country: user.country || 'Angola',
    });
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    // Simulate API Delay
    setTimeout(() => {
      onUpdateUser({
        ...user,
        ...formData
      });
      setLoading(false);
      setSuccessMsg('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  const handlePhotoUpload = () => {
    // In a real app, this would open a file picker
    alert("Photo upload feature would open system dialog here.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Photo Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer" onClick={handlePhotoUpload}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={64} className="text-gray-300" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" />
              </div>
              <div className="absolute bottom-2 right-2 bg-blue-900 p-1.5 rounded-full text-white shadow-md">
                <Camera size={14} />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{user.role}</p>
            
            <div className="w-full pt-4 border-t border-gray-100 mt-2">
              <div className="flex items-center justify-center text-sm text-gray-500 gap-1">
                 <MapPin size={14} />
                 {formData.city ? `${formData.city}, ${formData.country}` : 'Location not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
                {successMsg && <span className="text-green-600 text-sm font-medium animate-pulse">{successMsg}</span>}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your full name"
                />
                <Input
                  label="Email Address"
                  value={formData.email}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+244 9XX XXX XXX"
                />
                <div className="hidden md:block"></div> {/* Spacer */}
                
                <div className="md:col-span-2">
                   <Input
                    label="Street Address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Faith Avenue"
                  />
                </div>
                
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Luanda"
                />
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  placeholder="Angola"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={loading} className="px-8">
                  <Save size={18} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
