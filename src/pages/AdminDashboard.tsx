import React, { useState } from 'react';
import { User, ProgramCredential, StreamEvent } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Users, Video, Plus, Lock, X, Globe, ShieldCheck, Mail, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface AdminDashboardProps {
  user: User;
  credentials: ProgramCredential[];
  setCredentials: React.Dispatch<React.SetStateAction<ProgramCredential[]>>;
  streams: StreamEvent[];
  setStreams: React.Dispatch<React.SetStateAction<StreamEvent[]>>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, credentials, setCredentials, streams, setStreams }) => {
  const [accessForm, setAccessForm] = useState({ firstName: '', lastName: '', email: '', expirationDate: '' });
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'credentials'>('public');
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [streamFormData, setStreamFormData] = useState({
    id: '', title: '', description: '', date: '', thumbnailUrl: '', isLive: false,
    type: 'public' as 'public' | 'private', streamSource: 'youtube' as 'youtube' | 'custom', streamUrl: ''
  });

  const refreshData = async () => {
      setIsRefreshing(true);
      try {
          const s = await api.streams.getAll();
          setStreams(s);
          const c = await api.credentials.getAll();
          setCredentials(c);
      } catch (e) { console.error("Refresh failed", e); } 
      finally { setIsRefreshing(false); }
  };

  const handleGenerateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionStatus('loading');
    try {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const generatedUser = `${accessForm.firstName.toLowerCase()}.${accessForm.lastName.toLowerCase().charAt(0)}${randomNum}`;
        const generatedPass = Math.random().toString(36).slice(-8);

        const newCredPayload = {
            firstName: accessForm.firstName,
            lastName: accessForm.lastName,
            email: accessForm.email,
            username: generatedUser,
            password: generatedPass,
            expiresAt: accessForm.expirationDate || new Date(Date.now() + 86400000).toISOString(),
        };

        const created = await api.credentials.create(newCredPayload);
        setCredentials(prev => [created, ...prev]);
        setActionStatus('success');
    } catch (e) { alert("Failed to save credential"); setActionStatus('idle'); }
  };

  const handleDeleteCredential = async (id: string) => {
    if (window.confirm('Delete this credential?')) {
        await api.credentials.delete(id);
        setCredentials(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSaveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionStatus('loading');
    try {
        const created = await api.streams.create(streamFormData);
        setStreams(prev => [created, ...prev]);
        setShowStreamModal(false);
    } catch (e: any) { alert("Error saving stream: " + e.message); } 
    finally { setActionStatus('idle'); }
  };

  const handleDeleteStream = async (id: string) => {
       if (confirm("Delete this broadcast?")) {
           await api.streams.delete(id);
           setStreams(prev => prev.filter(s => s.id !== id));
       }
  }

  const filteredStreams = streams.filter(s => s.type === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-3">
            <button onClick={refreshData} className={`p-2 rounded-lg bg-gray-100 ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={20} /></button>
            <Button className="flex items-center gap-2" onClick={() => setShowStreamModal(true)}><Plus size={18} /> New Broadcast</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                <div className="flex border-b border-gray-200">
                    {['public', 'private', 'credentials'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 text-sm font-bold uppercase ${activeTab === tab ? 'text-blue-900 bg-blue-50' : 'text-gray-500'}`}>{tab}</button>
                    ))}
                </div>

                {activeTab === 'credentials' ? (
                     <div className="p-4">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50"><tr><th className="px-6 py-3">Owner</th><th className="px-6 py-3">Login</th><th className="px-6 py-3">Action</th></tr></thead>
                            <tbody>
                                {credentials.map(cred => (
                                    <tr key={cred.id} className="border-b">
                                        <td className="px-6 py-3">{cred.firstName} {cred.lastName}</td>
                                        <td className="px-6 py-3 font-mono text-xs">U: {cred.username}<br/>P: {cred.password}</td>
                                        <td className="px-6 py-3"><button onClick={() => handleDeleteCredential(cred.id)} className="text-red-600"><Trash2 size={16}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredStreams.map(stream => (
                        <div key={stream.id} className="p-6 flex items-center gap-4">
                            <img src={stream.thumbnailUrl} alt="" className="w-24 h-16 object-cover rounded-md" />
                            <div className="flex-grow"><h4 className="font-bold">{stream.title}</h4><span className={`text-xs px-2 py-1 rounded ${stream.isLive ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}>{stream.isLive ? 'LIVE' : 'OFFLINE'}</span></div>
                            <Button variant="danger" className="px-2 py-1" onClick={() => handleDeleteStream(stream.id)}><Trash2 size={14} /></Button>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-8">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold mb-4 flex gap-2"><ShieldCheck/> New Access</h3>
                {actionStatus === 'success' ? (
                    <div className="bg-green-50 text-green-800 p-4 rounded text-center"><CheckCircle className="mx-auto mb-2"/> Generated! <br/> <button onClick={() => setActionStatus('idle')} className="underline">Create Another</button></div>
                ) : (
                    <form onSubmit={handleGenerateCredential} className="space-y-4">
                        <Input label="First Name" value={accessForm.firstName} onChange={(e) => setAccessForm({...accessForm, firstName: e.target.value})} />
                        <Input label="Last Name" value={accessForm.lastName} onChange={(e) => setAccessForm({...accessForm, lastName: e.target.value})} />
                        <Input label="Email" value={accessForm.email} onChange={(e) => setAccessForm({...accessForm, email: e.target.value})} />
                        <Input label="Valid Until" type="date" value={accessForm.expirationDate} onChange={(e) => setAccessForm({...accessForm, expirationDate: new Date(e.target.value).toISOString()})} />
                        <Button type="submit" className="w-full" isLoading={actionStatus === 'loading'}>Generate</Button>
                    </form>
                )}
            </div>
        </div>
      </div>

      {showStreamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                <div className="flex justify-between mb-4"><h3 className="font-bold">New Broadcast</h3><button onClick={() => setShowStreamModal(false)}><X/></button></div>
                <form onSubmit={handleSaveStream} className="space-y-4">
                    <Input label="Title" value={streamFormData.title} onChange={(e) => setStreamFormData({...streamFormData, title: e.target.value})} />
                    <Input label="Stream URL (YouTube/HLS)" value={streamFormData.streamUrl} onChange={(e) => setStreamFormData({...streamFormData, streamUrl: e.target.value})} />
                    <Input label="Thumbnail URL" value={streamFormData.thumbnailUrl} onChange={(e) => setStreamFormData({...streamFormData, thumbnailUrl: e.target.value})} />
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2"><input type="checkbox" checked={streamFormData.isLive} onChange={(e) => setStreamFormData({...streamFormData, isLive: e.target.checked})} /> Live Now</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={streamFormData.type === 'private'} onChange={(e) => setStreamFormData({...streamFormData, type: e.target.checked ? 'private' : 'public'})} /> Private Event</label>
                    </div>
                    <Button type="submit" className="w-full">Create</Button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};