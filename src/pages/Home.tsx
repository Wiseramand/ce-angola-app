import React, { useState } from 'react';
import { Button } from '../components/Button';
import { generateDailyDevotional } from '../services/geminiService';
import { Devotional, StreamEvent } from '../types';
import { Play, Calendar, Star, Sparkles, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
  streams: StreamEvent[];
}

export const Home: React.FC<HomeProps> = ({ onNavigate, streams }) => {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loadingDevotional, setLoadingDevotional] = useState(false);

  const handleGetDevotional = async () => {
    setLoadingDevotional(true);
    const data = await generateDailyDevotional();
    setDevotional(data);
    setLoadingDevotional(false);
  };

  const publicStreams = streams.filter(stream => stream.type === 'public');

  return (
    <div className="flex flex-col gap-0">
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-blue-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/90 to-blue-800/80 z-10"></div>
        <img 
          src="https://picsum.photos/1920/1080?blur=4" 
          alt="Worship Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        
        <div className="relative z-20 text-center max-w-4xl px-4 animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-200 text-sm font-semibold tracking-wider mb-6 border border-blue-400/30">
            WELCOME TO GOD'S PRESENCE
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Christ Embassy <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
              Angola
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
            Join a global community of believers. Experience the miraculous, the teaching of the word, and dynamic worship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              onClick={() => onNavigate('live')} 
              className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all"
            >
              <Play fill="currentColor" size={20} className="mr-2" />
              Watch Live Service
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('register')}
              className="text-white border-white hover:bg-white/10 text-lg px-8 py-4"
            >
              Join Our Family
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-semibold mb-4">
                <Sparkles size={20} />
                <span>AI POWERED DEVOTIONAL</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Start Your Day With The Word</h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Get a unique, spirit-inspired devotional message generated just for you. 
              </p>
              <Button onClick={handleGetDevotional} isLoading={loadingDevotional} className="shadow-lg shadow-blue-900/20">
                Receive Today's Word
              </Button>
            </div>
            
            <div className="relative">
              <div className="relative bg-white p-8 rounded-xl shadow-xl border border-gray-100 min-h-[300px] flex flex-col justify-center">
                {devotional ? (
                  <div className="animate-fade-in">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">{devotional.title}</h3>
                    <div className="text-yellow-600 font-serif italic mb-6 border-l-4 border-yellow-400 pl-4 py-1 bg-yellow-50/50">
                      "{devotional.scripture}"
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {devotional.content}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Star className="mx-auto mb-4 text-gray-300" size={48} />
                    <p>Click the button to receive a word of prophecy and encouragement.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Schedule</h2>
            <button onClick={() => onNavigate('live')} className="text-blue-900 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {publicStreams.length > 0 ? publicStreams.map((stream) => (
              <div key={stream.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="relative h-48 overflow-hidden">
                  <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  {stream.isLive && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm z-20 flex items-center gap-1 animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{stream.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{stream.description}</p>
                  <Button variant="outline" className="w-full text-sm py-2" onClick={() => onNavigate('live')}>
                    {stream.isLive ? 'Join Live' : 'Set Reminder'}
                  </Button>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <p>No upcoming services scheduled at this moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};