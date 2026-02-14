import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User } from '../types';
import { Logo } from '../components/Logo';
import { api } from '../services/api';

interface AuthProps {
  type: 'login' | 'register';
  onLogin: (user: User) => void;
  onNavigate: (page: string) => void;
}

export const UserAuth: React.FC<AuthProps> = ({ type, onLogin, onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user: User;
      if (type === 'login') {
        user = await api.auth.login(formData.email, formData.password);
      } else {
        user = await api.auth.register(formData.name, formData.email, formData.password);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <Logo className="h-20 w-20 drop-shadow-md mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
             <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {error}
             </div>
          )}
          
          <div className="space-y-4">
            {type === 'register' && (
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full py-3" isLoading={loading}>
            {type === 'login' ? 'Sign In' : 'Register'}
          </Button>

          <div className="text-center text-sm">
            <button 
              type="button"
              onClick={() => onNavigate(type === 'login' ? 'register' : 'login')}
              className="font-medium text-blue-900 hover:text-blue-800"
            >
              {type === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};