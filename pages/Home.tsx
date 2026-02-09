
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Heart, ShieldCheck } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Altere o src para o caminho da sua imagem local, ex: "assets/hero.jpg" ou apenas "hero.jpg" */}
          <img 
            src="assets/hero-pastor.jpg" 
            alt="Pastor Chris Oyakhilome" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback caso a imagem local ainda não exista
              (e.target as HTMLImageElement).src = "assets/hero-pastor.jpg";
            }}
          />
          <div className="absolute inset-0 bg-ministry-blue/60 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-ministry-blue via-ministry-blue/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1 bg-ministry-gold text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              Portal Oficial - Angola
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 leading-tight">
              Bem-vindo à <br/>
              <span className="text-ministry-gold">Christ Embassy</span> Angola
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-light mb-10 leading-relaxed">
              Dando um sentido à sua vida. Experimente a atmosfera de milagres, 
              presença divina e a palavra de Deus.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                to="/live-tv" 
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-ministry-gold hover:bg-opacity-90 text-white font-bold text-lg rounded-xl transition shadow-lg shadow-ministry-gold/20"
              >
                <Play fill="currentColor" size={20} />
                <span>Watch Live TV</span>
              </Link>
              <Link 
                to="/register" 
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-lg rounded-xl border border-white/30 transition"
              >
                <span>Join Our Family</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-ministry-blue mb-4">Nosso Mandato Principal</h2>
            <div className="w-24 h-1 bg-ministry-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition group">
              <div className="w-16 h-16 bg-blue-50 text-ministry-blue rounded-2xl flex items-center justify-center mb-6 group-hover:bg-ministry-blue group-hover:text-white transition">
                <Play size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Alcance Global</h3>
              <p className="text-gray-600 leading-relaxed">
                Alcançando cada alma com o Evangelho de nosso Senhor Jesus Cristo através de todas as plataformas disponíveis.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition group">
              <div className="w-16 h-16 bg-blue-50 text-ministry-blue rounded-2xl flex items-center justify-center mb-6 group-hover:bg-ministry-blue group-hover:text-white transition">
                <Calendar size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Sessões de Vida</h3>
              <p className="text-gray-600 leading-relaxed">
                Junte-se aos nossos programas especiais, conferências e sessões de oração projetadas para elevar o seu espírito.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition group">
              <div className="w-16 h-16 bg-blue-50 text-ministry-blue rounded-2xl flex items-center justify-center mb-6 group-hover:bg-ministry-blue group-hover:text-white transition">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Parcerias</h3>
              <p className="text-gray-600 leading-relaxed">
                Torne-se um stakeholder no Reino através de vários braços do ministério que impactam bilhões globalmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ministry-blue relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-ministry-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">Junte-se ao nosso Culto de Domingo</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Experimente a glória e a palavra de Deus. Estamos esperando por você neste domingo!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-white text-ministry-blue font-bold rounded-xl hover:bg-gray-100 transition">
              Criar Conta Grátis
            </Link>
            <div className="flex items-center space-x-2 text-white/80">
              <ShieldCheck size={20} className="text-ministry-gold" />
              <span>Acesso Seguro e Encriptado</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
