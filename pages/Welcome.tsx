
import React, { useState } from 'react';
import { useAuth } from '../App';
import Logo from '../components/Logo';
import { User as UserIcon, Phone, Globe, ChevronRight, Loader2, MapPin, Building2 } from 'lucide-react';

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
    const userPayload = { ...formData, gender: 'Male', address: `${formData.city}, ${formData.neighborhood}` };

    // TÉCNICA SÉNIOR: Tentamos salvar, mas não deixamos o utilizador esperar mais de 1.5s
    // Se o servidor falhar, ele entra no portal do mesmo jeito (Prioridade: Experiência do Utilizador)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
        signal: controller.signal
      }).catch(err => console.warn("Registo em background falhou, mas utilizador prossegue."));

      // Aguardamos apenas um momento curto para dar sensação de processamento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      clearTimeout(timeoutId);
      await register(userPayload);
    } catch (err) {
      // Em caso de erro crítico, ainda assim deixamos entrar
      await register(userPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ministry-blue relative flex items-center justify-center overflow-hidden p-6 py-12">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1510519133417-c057b49ef29d?q=80&w=2070" className="w-full h-full object-cover opacity-20 scale-110 blur-sm" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-ministry-blue/95 via-ministry-blue/80 to-ministry-blue"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <Logo className="h-28 w-auto mx-auto mb-8 brightness-125" />
          <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter leading-none">Portal Oficial</h1>
          <p className="text-blue-100/60 mt-4 text-sm font-bold uppercase tracking-[0.4em] italic">Bem-vindo à Christ Embassy Angola</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl p-8 md:p-14 rounded-[4rem] border border-white/10 shadow-2xl">
          <form onSubmit={handleIdentify} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-ministry-gold uppercase ml-3 tracking-widest">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-ministry-gold/20 font-bold text-lg" placeholder="Seu nome" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-ministry-gold uppercase ml-3 tracking-widest">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-ministry-gold/20 font-bold" placeholder="+244..." required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-ministry-gold uppercase ml-3 tracking-widest">País</label>
                <div className="relative">
                  <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                  <select name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-ministry-gold/20 font-bold appearance-none">
                    <option value="Angola">Angola</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Moçambique">Moçambique</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-ministry-gold uppercase ml-3 tracking-widest">Cidade</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-ministry-gold/20 font-bold" placeholder="Luanda" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-ministry-gold uppercase ml-3 tracking-widest">Bairro</label>
                <div className="relative">
                  <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                  <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-ministry-gold/20 font-bold" placeholder="Talatona" required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-6 mt-6 bg-ministry-gold text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4 transition-all hover:bg-white hover:text-ministry-blue">
              {isSubmitting ? <Loader2 className="animate-spin" size={28} /> : <><span>ENTRAR NA TRANSMISSÃO</span><ChevronRight size={24} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
