import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, UserCheck, LogOut } from 'lucide-react';
import { ProgramCredential, StreamEvent } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';

interface PrivateLiveProgramProps {
  onNavigate: (page: string) => void;
  credentials: ProgramCredential[];
  streams: StreamEvent[];
}

export const PrivateLiveProgram: React.FC<PrivateLiveProgramProps> = ({ onNavigate, credentials, streams }) => {
  const [currentUser, setCurrentUser] = useState<ProgramCredential | null>(null);
  const activeStream = streams.find(s => s.type === 'private') || streams[0];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = credentials.find(c => c.username === username && c.password === password);
    if (foundUser) setCurrentUser(foundUser);
    else setLoginError('Invalid credentials');
  };

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-6">
            <Lock size={32} className="mx-auto text-blue-900 mb-2" />
            <h2 className="text-2xl font-bold text-gray-900">Private Program</h2>
            <p className="text-sm text-gray-500">Enter access credentials.</p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <Button type="submit" className="w-full">Enter</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white border-b py-2 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-green-700 font-medium"><UserCheck size={16} /> Welcome, {currentUser.firstName}</div>
        <button onClick={() => setCurrentUser(null)} className="text-xs text-red-600 flex items-center gap-1"><LogOut size={14}/> Exit</button>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
             <VideoPlayer streamSource={activeStream.streamSource} streamUrl={activeStream.streamUrl} thumbnailUrl={activeStream.thumbnailUrl} title={activeStream.title} />
        </div>
        <div className="bg-white p-6 mt-6 rounded-xl shadow-sm"><h2 className="text-xl font-bold">{activeStream.title}</h2><p className="text-gray-600">{activeStream.description}</p></div>
      </div>
    </div>
  );
};