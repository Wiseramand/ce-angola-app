import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Church, MapPin, Phone } from 'lucide-react';
import { churches, Church as ChurchType } from '../data/churches';
import ChurchModal from '../components/ChurchModal';

const Churches: React.FC = () => {
  const { t } = useTranslation();
  const [selectedChurch, setSelectedChurch] = useState<ChurchType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (church: ChurchType) => {
    setSelectedChurch(church);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedChurch(null), 200);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-ministry-gold font-black uppercase tracking-[0.3em] text-xs mb-4 block">{t('churches.subtitle')}</span>
          <h1 className="text-4xl md:text-6xl font-display font-black text-ministry-blue leading-tight tracking-tighter mb-6">
            {t('churches.title')}
          </h1>
          <p className="text-gray-600 text-lg font-light leading-relaxed">
            {t('churches.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {churches.map((church, index) => (
            <button
              key={church.id}
              onClick={() => openModal(church)}
              className="group relative bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-ministry-gold/30 focus:outline-none focus:ring-4 focus:ring-ministry-gold/20"
            >
              {church.isCentral && (
                <span className="absolute top-6 right-6 px-3 py-1 bg-ministry-gold text-ministry-blue text-[9px] font-black uppercase tracking-widest rounded-full">
                  Igreja Central
                </span>
              )}
              <div className="w-16 h-16 bg-ministry-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-ministry-gold/10 transition">
                <Church size={32} className="text-ministry-blue group-hover:text-ministry-gold transition" />
              </div>
              <h3 className="text-xl font-display font-black text-ministry-blue mb-2 leading-tight">
                {church.name}
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-6">
                {church.pastorTitle} {church.pastor}
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <MapPin size={16} className="text-ministry-gold shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{church.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-ministry-gold shrink-0" />
                  <span>
                    {church.contacts.length > 0
                      ? church.contacts.map(c => c.phone).join(' / ')
                      : 'Em breve'}
                  </span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <span className="text-ministry-blue font-black text-[10px] uppercase tracking-widest group-hover:text-ministry-gold transition">
                  Ver informações
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ChurchModal
        church={selectedChurch}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Churches;
