import React, { useEffect } from 'react';
import { X, MapPin, Phone, Church, Navigation } from 'lucide-react';
import type { Church as ChurchType } from '../data/churches';
import { getWhatsappLink } from '../data/churches';

interface ChurchModalProps {
  church: ChurchType | null;
  isOpen: boolean;
  onClose: () => void;
}

const ChurchModal: React.FC<ChurchModalProps> = ({ church, isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !church) return null;

  const hasContacts = church.contacts.length > 0;
  const hasMap = !!church.mapLink && !church.mapLink.toLowerCase().includes('em breve');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ministry-blue/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="church-modal-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-6 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-ministry-blue p-8 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-ministry-gold/20 rounded-full blur-3xl"></div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition z-10"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
          <div className="relative z-10 flex items-start space-x-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
              <Church size={28} className="text-ministry-gold" />
            </div>
            <div>
              <h2 id="church-modal-title" className="text-2xl md:text-3xl font-display font-black leading-tight">
                {church.name}
              </h2>
              {church.isCentral && (
                <span className="inline-block mt-2 px-3 py-1 bg-ministry-gold text-ministry-blue text-[10px] font-black uppercase tracking-widest rounded-full">
                  Igreja Central
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-ministry-gold/10 flex items-center justify-center shrink-0">
              <Navigation size={20} className="text-ministry-gold" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Pastor responsável</span>
              <p className="text-gray-900 font-bold text-lg">
                {church.pastorTitle} {church.pastor}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-ministry-blue/10 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-ministry-blue" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Endereço</span>
              <p className="text-gray-700 font-medium leading-relaxed">{church.address}</p>
              {hasMap ? (
                <a
                  href={church.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 mt-3 px-5 py-2.5 bg-ministry-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-ministry-gold transition shadow-lg"
                >
                  <MapPin size={14} />
                  <span>Ver localização no Google Maps</span>
                </a>
              ) : (
                <span className="inline-block mt-3 px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  Localização em breve
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-green-600" />
            </div>
            <div className="flex-grow">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contactos</span>
              {hasContacts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {church.contacts.map((contact, index) => (
                    <div key={index} className="space-y-2">
                      {contact.label && (
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">{contact.label}</span>
                      )}
                      <a
                        href={getWhatsappLink(contact.phone, church.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-green-500/20"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <span>{contact.label ? `WhatsApp — ${contact.label}` : 'Contactar pelo WhatsApp'}</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  Contactos em breve
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchModal;
