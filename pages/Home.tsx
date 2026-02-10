
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Heart, ShieldCheck } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-ministry-blue">
        {/* Background Layer - Imagem por trás do azul */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/hero-pastor.jpg" 
            alt="Pastor Chris" 
            className="w-full h-full object-cover object-top opacity-15 mix-blend-luminosity scale-105"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = "https://assets/hero-pastor.jpg";
              img.className = "w-full h-full object-cover opacity-10 mix-blend-overlay";
            }}
          />
          {/* Camadas de cor para garantir o azul predominante */}
          <div className="absolute inset-0 bg-gradient-to-r from-ministry-blue via-ministry-blue/80 to-ministry-blue/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-ministry-blue via-transparent to-transparent opacity-90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-3xl animate-in fade-in slide-in-from-left duration-1000">
            <span className="inline-block px-4 py-1.5 bg-ministry-gold text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-8 shadow-lg border border-white/10">
              Portal Oficial • Christ Embassy Angola
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-black mb-8 leading-[0.9] tracking-tighter">
              A Palavra que <br/>
              <span className="text-ministry-gold">Transforma</span> Vidas
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/60 font-light mb-12 leading-relaxed max-w-2xl">
              Experimente a atmosfera de milagres e o poder da palavra de Deus. Junte-se à nossa comunidade global a partir de Luanda para o mundo.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                to="/live-tv" 
                className="flex items-center justify-center space-x-3 px-10 py-5 bg-ministry-gold hover:bg-white hover:text-ministry-blue text-white font-black text-lg rounded-2xl transition-all duration-500 shadow-2xl shadow-ministry-gold/20 active:scale-95"
              >
                <Play fill="currentColor" size={20} />
                <span>ASSISTIR LIVE TV</span>
              </Link>
              <Link 
                to="/register" 
                className="flex items-center justify-center space-x-3 px-10 py-5 bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white font-black text-lg rounded-2xl border border-white/10 transition-all duration-500 active:scale-95"
              >
                <span>CRIAR CONTA GRÁTIS</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-black text-ministry-blue mb-6 uppercase tracking-tighter">Nosso Mandato Principal</h2>
            <div className="w-24 h-2 bg-ministry-gold mx-auto rounded-full shadow-[0_0_15px_rgba(197,160,89,0.5)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-12 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 text-ministry-blue rounded-3xl flex items-center justify-center mb-8 group-hover:bg-ministry-blue group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner">
                <Play size={40} />
              </div>
              <h3 className="text-2xl font-display font-black mb-4 text-ministry-blue uppercase tracking-tight">Alcance Global</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                Alcançando cada alma com o Evangelho através de todas as plataformas tecnológicas disponíveis na era digital.
              </p>
            </div>

            <div className="bg-white p-12 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 text-ministry-blue rounded-3xl flex items-center justify-center mb-8 group-hover:bg-ministry-blue group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner">
                <Calendar size={40} />
              </div>
              <h3 className="text-2xl font-display font-black mb-4 text-ministry-blue uppercase tracking-tight">Sessões de Vida</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                Junte-se aos nossos programas especiais e conferências projetadas para elevar o seu espírito e mudar sua realidade.
              </p>
            </div>

            <div className="bg-white p-12 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 group border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 text-ministry-blue rounded-3xl flex items-center justify-center mb-8 group-hover:bg-ministry-blue group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner">
                <Heart size={40} />
              </div>
              <h3 className="text-2xl font-display font-black mb-4 text-ministry-blue uppercase tracking-tight">Parcerias</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                Torne-se um parceiro no Reino através de vários braços do ministério que impactam bilhões globalmente todos os dias.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
