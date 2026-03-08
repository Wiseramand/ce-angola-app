import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, Heart, Shield, MessageSquare } from 'lucide-react';
import { useAuth } from '../App';
import { ChatMessage } from '../types';
import UniversalPlayer from '../components/UniversalPlayer';
import { api } from '../services/api';

const LivePrograms: React.FC = () => {
  const { user, system } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activePlayer, setActivePlayer] = useState<'p1' | 'p2' | 'audio'>('p1');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  const fetchMessages = async () => {
    try {
      const data = await api.chat.getMessages('private');
      if (isMounted.current) {
        setMessages(data);
      }
    } catch (e) {
      console.error("Erro ao sincronizar chat privado", e);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const textToSend = newMessage;
    setNewMessage('');

    try {
      await api.chat.sendMessage({
        userId: user.id,
        username: user.fullName,
        text: textToSend,
        channel: 'private'
      });

      await fetchMessages();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen pt-4 pb-20">
      <div className="max-w-[1800px] mx-auto px-4 h-full flex flex-col lg:flex-row gap-6">
        <div className="flex-grow lg:w-[75%] flex flex-col">
          <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10">
            <UniversalPlayer
              url={activePlayer === 'p2' ? (system.privateUrl2 || system.privateUrl) : system.privateUrl}
              title={system.privateTitle}
              isAudioOnly={activePlayer === 'audio'}
            />
          </div>

          <div className="mt-8 bg-gray-900 p-12 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl">
            <div className="flex items-center bg-black/40 p-2 rounded-2xl border border-white/5">
              <button
                onClick={() => setActivePlayer('p1')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePlayer === 'p1' ? 'bg-ministry-gold text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Player 1
              </button>
              <button
                onClick={() => setActivePlayer('p2')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePlayer === 'p2' ? 'bg-ministry-gold text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Player 2
              </button>
              <button
                onClick={() => setActivePlayer('audio')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePlayer === 'audio' ? 'bg-ministry-gold text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Audio Only
              </button>
            </div>
            <Link to="/donations" className="flex items-center space-x-4 px-12 py-7 bg-ministry-gold text-white font-black text-2xl rounded-[2rem] shadow-2xl hover:bg-white hover:text-ministry-blue transition-all">
              <Heart size={28} fill="currentColor" />
              <span>SOU PARCEIRO</span>
            </Link>
          </div>
        </div>

        <div className="lg:w-[25%] flex flex-col bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl h-[calc(100vh-140px)] sticky top-24">
          <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <MessageSquare size={20} className="text-ministry-gold" />
              <h2 className="font-black font-display uppercase tracking-widest text-[11px]">Chat de Comunhão</h2>
            </div>
            <div className="flex items-center space-x-3 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_green]"></span>
              <span className="text-[9px] text-green-400 font-black uppercase tracking-widest">{system.viewerCount} Online</span>
            </div>
          </div>
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-black/30 scrollbar-hide">
            {messages.map((msg) => {
              const isAdmin = msg.user_id === 'admin-1' || msg.user_id?.startsWith('admin');
              return (
                <div key={msg.id} className="animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-lg ${isAdmin ? 'bg-ministry-gold' : 'bg-ministry-blue'}`}>
                      {msg.username ? msg.username.charAt(0) : '?'}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`text-[10px] font-black uppercase tracking-wider ${isAdmin ? 'text-ministry-gold' : 'text-slate-300'}`}>{msg.username}</p>
                        {isAdmin && (
                          <span className="bg-ministry-gold/20 text-ministry-gold text-[8px] px-2 py-0.5 rounded-full font-black border border-ministry-gold/30">ADMIN</span>
                        )}
                      </div>
                      <div className={`text-sm p-4 rounded-2xl rounded-tl-none border shadow-md ${isAdmin ? 'bg-ministry-gold/10 border-ministry-gold/20 text-white' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-8 bg-black/70 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                placeholder="Declare sua vitória..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full bg-slate-800 text-white text-sm rounded-2xl pl-6 pr-16 py-5 border-0 outline-none focus:ring-2 focus:ring-ministry-gold shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 bottom-3 px-5 bg-ministry-gold text-white rounded-xl hover:scale-105 transition-all shadow-lg active:scale-90"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePrograms;
