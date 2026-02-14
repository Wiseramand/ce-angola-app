import React, { useState } from 'react';
import { Button } from '../components/Button';
import { User, StreamEvent } from '../types';
import { MessageCircle, Heart, Share2, Users, Send } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';

interface LiveStreamProps {
  user: User | null;
  onNavigate: (page: string) => void;
  streams: StreamEvent[];
}

export const LiveStream: React.FC<LiveStreamProps> = ({ user, onNavigate, streams }) => {
  const activeStream = streams.find(s => s.type === 'public' && s.isLive) || streams.find(s => s.type === 'public');
  
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{user: string, text: string}[]>([
    { user: 'Sarah J.', text: 'Hallelujah! Glory to God!' },
    { user: 'John Doe', text: 'Watching from Huambo. God bless you Pastor.' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    if (!user) {
      onNavigate('login');
      return;
    }
    setMessages([...messages, { user: user.name, text: chatMessage }]);
    setChatMessage('');
  };

  if (!activeStream) {
      return (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
              <h2 className="text-2xl font-bold text-gray-700">No Public Broadcasts Available</h2>
              <Button onClick={() => onNavigate('home')} className="mt-6">Return Home</Button>
          </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group border border-gray-800">
             <VideoPlayer 
                streamSource={activeStream.streamSource}
                streamUrl={activeStream.streamUrl}
                thumbnailUrl={activeStream.thumbnailUrl}
                title={activeStream.title}
             />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{activeStream.title}</h1>
            <p className="text-gray-600 leading-relaxed">{activeStream.description}</p>
          </div>
        </div>

        <div className="lg:col-span-1 h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <MessageCircle size={18} /> Live Chat
            </h3>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-bold flex-shrink-0">
                  {msg.user.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 mr-2">{msg.user}</span>
                  <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded-lg rounded-tl-none inline-block">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {user ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Say something..."
                  className="flex-grow px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                />
                <button type="submit" className="p-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <Button variant="outline" className="w-full text-sm" onClick={() => onNavigate('login')}>
                Sign in to chat
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};