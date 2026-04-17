import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '../App';
import { ChatMessage } from '../types';
import UniversalPlayer from '../components/UniversalPlayer';
import { api } from '../services/api';

const LiveTV: React.FC = () => {
  const { user, system } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activePlayer, setActivePlayer] = useState<'p1' | 'p2' | 'audio'>('p1');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  const fetchMessages = async () => {
    try {
      const data = await api.chat.getMessages('public');
      if (isMounted.current) {
        setMessages(data);
      }
    } catch (e) {
      console.error("Erro ao sincronizar chat", e);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchMessages();

    // Polling agressivo de 2 segundos para interatividade máxima
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
        channel: 'public'
      });

      // Busca imediata após enviar para garantir que apareça na lista global
      await fetchMessages();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen pt-4 pb-20">
      <div className="max-w-[1800px] mx-auto px-4 h-full flex flex-col lg:flex-row gap-6">
        <div className="flex-grow lg:w-[75%] flex flex-col">
          <div className="relative aspect-video bg-black overflow-hidden shadow-2xl border border-white/5">
            <UniversalPlayer
              url={activePlayer === 'p2' ? (system.publicUrl2 || system.publicUrl) : system.publicUrl}
              title={system.publicTitle}
              isAudioOnly={activePlayer === 'audio'}
              quality={quality}
            />
          </div>

          <div className="mt-8 bg-gray-900 p-10 rounded-none border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center bg-black/40 p-1.5 border border-white/5">
                <button
                  onClick={() => setActivePlayer('p1')}
                  className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activePlayer === 'p1' ? 'bg-ministry-gold text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  Player 1
                </button>
                <button
                  onClick={() => setActivePlayer('p2')}
                  className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activePlayer === 'p2' ? 'bg-ministry-gold text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  Player 2
                </button>
                <button
                  onClick={() => setActivePlayer('audio')}
                  className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activePlayer === 'audio' ? 'bg-ministry-gold text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  Áudio
                </button>
              </div>

              <div className="flex items-center bg-black/40 p-1.5 border border-white/5">
                <button
                  onClick={() => setQuality('fhd')}
                  className={`px-4 py-3 text-[9px] font-black uppercase tracking-tighter transition-all ${quality === 'fhd' ? 'text-ministry-gold underline' : 'text-gray-500 hover:text-white'}`}
                >
                  FHD
                </button>
                <button
                  onClick={() => setQuality('hd')}
                  className={`px-4 py-3 text-[9px] font-black uppercase tracking-tighter transition-all ${quality === 'hd' ? 'text-ministry-gold underline' : 'text-gray-500 hover:text-white'}`}
                >
                  HD
                </button>
                <button
                  onClick={() => setQuality('sd')}
                  className={`px-4 py-3 text-[9px] font-black uppercase tracking-tighter transition-all ${quality === 'sd' ? 'text-ministry-gold underline' : 'text-gray-500 hover:text-white'}`}
                >
                  SD
                </button>
                <button
                  onClick={() => setQuality('auto')}
                  className={`px-4 py-3 text-[9px] font-black uppercase tracking-tighter transition-all ${quality === 'auto' ? 'text-ministry-gold underline' : 'text-gray-500 hover:text-white'}`}
                >
                  Auto
                </button>
              </div>
            </div>
            <Link to="/donations" className="flex items-center space-x-4 px-12 py-6 bg-ministry-gold text-white font-black text-xl hover:scale-105 transition-all shadow-2xl">
              <Heart size={24} fill="white" />
              <span>SEMENTE DE FÉ</span>
            </Link>
          </div>
        </div>

        <div className="lg:w-[25%] flex flex-col bg-gray-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl h-[calc(100vh-140px)] sticky top-24">
          <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <MessageSquare size={20} className="text-ministry-gold" />
              <h2 className="font-black font-display uppercase tracking-[0.2em] text-xs">Comunidade</h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-green-400 font-black">{system.viewerCount} Online</span>
              </div>
            </div>
          </div>
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-black/20 scrollbar-hide">
            {messages.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest">Inicie a conversa...</div>
            )}
            {messages.map((msg) => {
              const isAdmin = msg.user_id === 'admin-1' || msg.user_id?.startsWith('admin');
              return (
                <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 uppercase shadow-lg ${isAdmin ? 'bg-ministry-gold' : 'bg-slate-700'}`}>
                      {msg.username ? msg.username.charAt(0) : '?'}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`text-[10px] font-black uppercase tracking-wider ${isAdmin ? 'text-ministry-gold' : 'text-slate-400'}`}>
                          {msg.username}
                        </p>
                        {isAdmin && (
                          <span className="bg-ministry-gold/20 text-ministry-gold text-[8px] px-2 py-0.5 rounded-full font-black border border-ministry-gold/30">ADMIN</span>
                        )}
                      </div>
                      <div className={`text-sm p-4 rounded-2xl rounded-tl-none border shadow-sm ${isAdmin ? 'bg-ministry-gold/10 border-ministry-gold/20 text-white' : 'bg-white/5 border-white/5 text-slate-300'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-8 bg-black/60 border-t border-white/5">
            {user ? (
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  placeholder="Escreva sua mensagem aqui..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-slate-800/50 text-white text-sm rounded-2xl pl-6 pr-16 py-5 focus:ring-2 focus:ring-ministry-gold border-0 outline-none transition shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 bottom-3 px-5 bg-ministry-gold text-white rounded-xl hover:bg-ministry-blue transition-all active:scale-90"
                >
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest py-2">Identifique-se para falar</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTV;
