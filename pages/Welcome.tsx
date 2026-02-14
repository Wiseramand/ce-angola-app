
import React, { useState } from 'react';
import { useAuth } from '../App';
import Logo from '../components/Logo';
import { User as UserIcon, Mail, Phone, Globe, ChevronRight, Loader2, Heart, MapPin, Building2 } from 'lucide-react';

const COUNTRIES = ["Angola", "Portugal", "Brasil", "Moçambique", "Cabo Verde", "Guiné-Bissau", "São Tomé e Príncipe"].sort();

const Welcome: React.FC = () => {
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'Angola',
    city: '',
    neighborhood: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Objeto de dados limpo para o servidor
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim() || '', // Email opcional
        phone: formData.phone.trim(),
        country: formData.country,
        city: formData.city.trim(),
        neighborhood: formData.neighborhood.trim(),
        address: `${formData.city}, ${formData.neighborhood}`,
        gender: 'Male'
      };

      // Chamamos o register do App.tsx que faz o fetch e aguarda
      await register(payload);
      
      // O App.tsx mudará o estado do 'user' e este componente sairá de cena automaticamente
    } catch (err) {
      console.error("Erro fatal no registo:", err);
      alert("Erro ao conectar com o servidor central. Por favor, tente novamente agora.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ministry-blue relative flex items-center justify-center overflow-hidden p-6 py-12">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1510519133417-c057b49ef29d?q=80&w=2070" className="w-full h-full object-cover opacity-20 blur-sm" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-ministry-blue/95 via-ministry-blue/80 to-ministry-blue"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <Logo className="h-24 w-auto mx-auto mb-6 brightness-110" />
          <h1 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tighter">Portal CE Angola</h1>
          <p className="text-blue-100/60 mt-4 text-sm font-bold uppercase tracking-widest italic">Coleta de Dados para Visitantes</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl">
          <form onSubmit={handleIdentify} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white outline-none focus:ring-2 focus:ring-ministry-gold font-bold" placeholder="Seu Nome" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">WhatsApp / Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white outline-none focus:ring-2 focus:ring-ministry-gold font-bold" placeholder="9xx xxx xxx" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">País</label>
                <select name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-ministry-gold font-bold appearance-none">
                  {COUNTRIES.map(c => <option key={c} value={c} className="bg-ministry-blue text-white">{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">Cidade</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-ministry-gold font-bold" placeholder="Ex: Luanda" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">Bairro</label>
                <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-ministry-gold font-bold" placeholder="Ex: Talatona" required />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">Email (Opcional)</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white outline-none focus:ring-2 focus:ring-ministry-gold font-bold" placeholder="seu@email.com (opcional)" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-ministry-gold text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3">
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <><span>ENTRAR NO PORTAL</span><ChevronRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
