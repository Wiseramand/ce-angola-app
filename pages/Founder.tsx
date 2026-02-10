
import React from 'react';

const Founder: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          <div className="lg:w-1/2 lg:sticky lg:top-32">
            <div className="relative group">
              <div className="absolute -inset-4 bg-ministry-gold/20 rounded-[3rem] blur-3xl group-hover:bg-ministry-gold/30 transition duration-700"></div>
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white bg-gray-50">
                <img 
                  src="/assets/pastor-chris.jpg" 
                  alt="Rev. Dr. Chris Oyakhilome" 
                  className="w-full aspect-[4/5] object-cover object-top transition duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2134";
                  }}
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-ministry-blue text-white p-10 rounded-[2.5rem] shadow-2xl border-4 border-ministry-gold max-w-sm hidden xl:block animate-in zoom-in duration-1000">
                 <p className="italic text-xl font-light leading-relaxed">
                   "A sua vida é a expressão da sua mente. Para mudar a sua vida, você deve mudar a sua mente."
                 </p>
                 <p className="mt-6 font-black text-ministry-gold uppercase tracking-[0.2em] text-xs">— Rev. Chris Oyakhilome</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-12">
            <div className="animate-in fade-in slide-in-from-right duration-700">
              <span className="text-ministry-gold font-black uppercase tracking-[0.3em] text-xs mb-4 block">O Homem de Deus</span>
              <h1 className="text-5xl md:text-7xl font-display font-black text-ministry-blue leading-[0.9] tracking-tighter">Rev. (Dr.) Chris <br/>Oyakhilome</h1>
              <div className="w-24 h-2.5 bg-ministry-gold mt-8 rounded-full shadow-[0_0_15px_rgba(197,160,89,0.5)]"></div>
            </div>

            <div className="prose prose-xl text-gray-600 max-w-none space-y-8 font-light leading-relaxed">
              <p className="text-2xl font-bold text-gray-900 leading-snug">
                Presidente da LoveWorld Inc., um ministério global com o mandato de levar a presença divina às nações.
              </p>
              <p>
                Como pastor, mestre, ministro de cura, apresentador de televisão e autor de best-sellers, o Pastor Chris ajudou milhões de pessoas a experimentar uma vida vitoriosa e com propósito através da Palavra de Deus.
              </p>
              
              <div className="bg-gray-50 p-10 rounded-[2rem] border-l-[12px] border-ministry-gold italic text-gray-800 text-xl font-medium shadow-inner">
                "Estamos levando a presença de Deus às nações do mundo e demonstrando o caráter do Espírito."
              </div>
              
              <p className="pb-12 text-lg">
                Hoje, a Christ Embassy Angola permanece como um testemunho vibrante desta visão global, estabelecendo milhares de almas na realidade da sua herança em Cristo Jesus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Founder;
