
import React, { useState } from 'react';
import { useAuth } from '../App';
import Logo from '../components/Logo';
import { User as UserIcon, Mail, Phone, Globe, ChevronRight, Loader2, Heart, MapPin, Building2 } from 'lucide-react';

const COUNTRIES = [
  "Angola", "Portugal", "Brasil", "Moçambique", "Cabo Verde", "Guiné-Bissau", "São Tomé e Príncipe",
  "África do Sul", "Alemanha", "Argentina", "Austrália", "Bélgica", "Canadá", "Chile", "China", 
  "Colômbia", "Coreia do Sul", "Egito", "Espanha", "Estados Unidos", "França", "Gana", "Índia", 
  "Irlanda", "Itália", "Japão", "Luxemburgo", "México", "Namíbia", "Nigéria", "Noruega", "Países Baixos", 
  "Polónia", "Reino Unido", "Rússia", "Suíça", "Suécia", "Turquia", "Ucrânia", "Venezuela"
].sort();

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
      const userPayload = { ...formData, gender: 'Male' };
      // O register agora é uma promessa que inclui o fetch para o servidor
      await register(userPayload);
      // Se chegou aqui, o servidor gravou com sucesso e o App.tsx vai redirecionar sozinho
    } catch (err) {
      console.error("Erro no registo:", err);
      alert("Houve um problema ao conectar com o servidor. Por favor, tente novamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ministry-blue relative flex items-center justify-center overflow-hidden p-6 py-12">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1510519133417-c057b49ef29d?q=80&w=2070" 
          className="w-full h-full object-cover opacity-20 scale-110 blur-sm"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ministry-blue/95 via-ministry-blue/80 to-ministry-blue"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <Logo className="h-28 w-auto mx-auto mb-6 brightness-125 drop-shadow-[0_0_15px_rgba(197,160,89,0.3)]" />
          <h1 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
            Bem-vindo ao Portal <br/>
            <span className="text-ministry-gold">CE Angola</span>
          </h1>
          <p className="text-blue-100/70 mt-4 font-light text-lg uppercase tracking-widest italic">Ajuda-nos a te contactar outra vez</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <Heart size={100} className="text-ministry-gold" />
          </div>

          <form onSubmit={handleIdentify} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[9px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none placeholder:text-white/10 font-bold"
                  placeholder="Nome e Sobrenome"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[9px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">WhatsApp / Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none placeholder:text-white/10 font-bold"
                    placeholder="+244..."
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">País de Residência</label>
                <div className="relative">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none appearance-none font-bold"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c} className="bg-ministry-blue text-white">{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[9px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">Cidade</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none placeholder:text-white/10 font-bold"
                    placeholder="Ex: Luanda"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">Bairro</label>
                <div className="relative">
                  <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none placeholder:text-white/10 font-bold"
                    placeholder="Ex: Talatona"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-ministry-gold uppercase mb-2 ml-2 tracking-widest">Email (Opcional)</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-white focus:ring-2 focus:ring-ministry-gold transition outline-none placeholder:text-white/10 font-bold"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 mt-4 bg-ministry-gold text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center space-x-3 hover:bg-white hover:text-ministry-blue transition-all duration-300 shadow-2xl active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span>Prosseguir para o Portal</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">
          Plataforma Segura • Christ Embassy Angola © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Welcome;
