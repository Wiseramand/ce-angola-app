
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, Users, MessageSquare, Maximize2, Volume2, Shield, Heart, Radio } from 'lucide-react';
import { useAuth } from '../App';
import { ChatMessage } from '../types';
import UniversalPlayer from '../components/UniversalPlayer';

const LivePrograms: React.FC = () => {
  const { user, system } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      { id: '1', userId: 'bot', userName: 'System', text: 'Sessão Exclusiva Iniciada. A glória de Deus está aqui.', timestamp: new Date() },
    ];
    setMessages(initialMessages);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const msg: ChatMessage = { id: Date.now().toString(), userId: user.id, userName: user.fullName, userImage: user.profilePicture, text: newMessage, timestamp: new Date() };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="bg-gray-950 min-h-screen pt-4 pb-20">
      <div className="max-w-[1800px] mx-auto px-4 h-full flex flex-col lg:flex-row gap-6">
        <div className="flex-grow lg:w-[75%] flex flex-col">
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10">
            <UniversalPlayer url={system.privateUrl} title="Acesso Exclusivo CE Angola" />
            
            <div className="absolute top-6 left-6 flex items-center space-x-3">
              <div className="bg-ministry-gold px-4 py-1.5 rounded-lg text-white text-[10px] font-black uppercase flex items-center shadow-lg">
                 <Shield size={12} className="mr-2" />
                 Emissão Restrita
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-900 p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl">
            <div className="flex-grow">
              <div className="flex items-center space-x-3 mb-3">
                 <span className="px-3 py-1 bg-ministry-gold/20 text-ministry-gold text-[10px] font-extrabold rounded-full uppercase tracking-widest">Canal Consagrado</span>
              </div>
              <h1 className="text-3xl font-bold text-white font-display mb-3">Conferência Ministerial de Angola</h1>
              <p className="text-gray-400 text-lg font-light leading-relaxed max-w-3xl">Programação de acesso restrito para parceiros e obreiros.</p>
            </div>
            <Link to="/donations" className="flex items-center space-x-3 px-10 py-5 bg-ministry-gold text-white font-black text-xl rounded-2xl shadow-2xl">
              <Heart size={24} fill="white" />
              <span>DOAÇÃO ESPECIAL</span>
            </Link>
          </div>
        </div>

        <div className="lg:w-[25%] flex flex-col bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl h-[calc(100vh-140px)] sticky top-24">
          <div className="p-6 border-b border-white/5 bg-black/30 flex items-center justify-between text-white">
            <h2 className="font-bold font-display uppercase tracking-widest text-xs">Chat Exclusivo</h2>
            <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
              Seguro
            </span>
          </div>
          <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-black/10">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-in slide-in-from-bottom-2">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-ministry-blue flex items-center justify-center text-sm font-black text-white border border-white/10 overflow-hidden">
                    {msg.userImage ? <img src={msg.userImage} className="w-full h-full object-cover" /> : msg.userName.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] font-black text-ministry-gold uppercase mb-1">{msg.userName}</p>
                    <div className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">{msg.text}</div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-6 bg-black/50 border-t border-white/5">
            <form onSubmit={handleSendMessage} className="relative">
              <input type="text" placeholder="Envie uma bênção..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="w-full bg-gray-800 text-white text-sm rounded-2xl pl-5 pr-14 py-4 border-0 outline-none" />
              <button type="submit" className="absolute right-2 top-2 bottom-2 px-3 bg-ministry-gold text-white rounded-xl"><Send size={18} /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePrograms;
