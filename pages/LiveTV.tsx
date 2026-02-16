
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquare, Heart, ShieldCheck } from 'lucide-react';
import { useAuth } from '../App';
import { ChatMessage } from '../types';
import UniversalPlayer from '../components/UniversalPlayer';

const LiveTV: React.FC = () => {
  const { user, system } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat?channel=public');
      if (res.ok) {
        const data = await res.json();
        // Atualiza as mensagens se o tamanho for diferente (simplificação)
        setMessages(data);
      }
    } catch (e) {
      console.error("Erro ao carregar chat", e);
    }
  };

  useEffect(() => {
    fetchMessages();
    // INTERVALO DE 1.5 SEGUNDOS PARA MELHOR INTERATIVIDADE
    const interval = setInterval(fetchMessages, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    const textToSend = newMessage;
    setNewMessage(''); 

    // Envio para o servidor
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.fullName,
          text: textToSend,
          channel: 'public'
        })
      });
      if (res.ok) {
        fetchMessages(); // Recarrega imediatamente após enviar
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen pt-4 pb-20">
      <div className="max-w-[1800px] mx-auto px-4 h-full flex flex-col lg:flex-row gap-6">
        <div className="flex-grow lg:w-[75%] flex flex-col">
          <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
            <UniversalPlayer url={system.publicUrl} title={system.publicTitle} />
            <div className="absolute top-8 left-8 flex items-center space-x-3">
              <div className="bg-red-600 px-5 py-2 rounded-xl text-white text-xs font-black uppercase flex items-center shadow-2xl">
                 <span className="w-2.5 h-2.5 bg-white rounded-full mr-3 animate-ping"></span>
                 Direto em Angola
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-900 p-10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="flex-grow">
              <h1 className="text-4xl font-black text-white font-display mb-2 uppercase tracking-tight">{system.publicTitle}</h1>
              <p className="text-gray-400 text-lg font-light leading-relaxed max-w-2xl">{system.publicDescription}</p>
            </div>
            <Link to="/donations" className="flex items-center space-x-4 px-12 py-6 bg-ministry-gold text-white font-black text-xl rounded-2xl hover:scale-105 transition-all shadow-2xl">
              <Heart size={24} fill="white" />
              <span>SEMENTE DE FÉ</span>
            </Link>
          </div>
        </div>

        <div className="lg:w-[25%] flex flex-col bg-gray-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl h-[calc(100vh-140px)] sticky top-24">
          <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <MessageSquare size={20} className="text-ministry-gold" />
              <h2 className="font-black font-display uppercase tracking-[0.2em] text-xs">Comunidade Viva</h2>
            </div>
            <span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-black animate-pulse">EM TEMPO REAL</span>
          </div>
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-black/20 scrollbar-hide scroll-smooth">
            {messages.map((msg) => {
              const isAdmin = msg.user_id === 'admin-1' || msg.user_id.startsWith('admin');
              return (
                <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 uppercase shadow-lg ${isAdmin ? 'bg-ministry-gold' : 'bg-slate-700'}`}>
                      {msg.username.charAt(0)}
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
                      <div className={`text-sm p-4 rounded-2xl rounded-tl-none border ${isAdmin ? 'bg-ministry-gold/10 border-ministry-gold/20 text-white' : 'bg-white/5 border-white/5 text-slate-300'}`}>
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
                  placeholder="Escreva uma mensagem..." 
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
              <Link to="/register" className="w-full py-5 bg-ministry-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 shadow-xl hover:bg-ministry-gold transition-all">
                <span>Identifique-se para interagir</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTV;
