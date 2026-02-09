
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { User as UserIcon, Camera, ChevronRight, Check, Phone, Info } from 'lucide-react';

const COUNTRY_DATA = [
  { name: "Angola", code: "+244" }, { name: "Portugal", code: "+351" }, { name: "Brazil", code: "+55" }, 
  { name: "Mozambique", code: "+258" }, { name: "Cape Verde", code: "+238" }, { name: "Guinea-Bissau", code: "+245" },
  { name: "São Tomé and Príncipe", code: "+239" }, { name: "South Africa", code: "+27" }, { name: "United Kingdom", code: "+44" },
  { name: "United States", code: "+1" }
];

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '+244 ',
    country: 'Angola',
    address: '',
    gender: 'Male' as 'Male' | 'Female'
  });
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const selectedCountry = COUNTRY_DATA.find(c => c.name === formData.country);
    if (selectedCountry) {
      const currentPrefix = selectedCountry.code + ' ';
      setFormData(prev => ({ ...prev, phone: currentPrefix }));
    }
  }, [formData.country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    await register({ ...formData, profilePicture: profilePic });
    navigate('/live-tv'); // Redirecionar diretamente para a live após identificação
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-ministry-blue p-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Identificação Comunitária</h1>
              <p className="text-blue-100/60 text-sm mt-1">Diga-nos quem você é para interagir no chat</p>
            </div>
            <div className="flex space-x-2">
              <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-ministry-gold' : 'bg-white/20'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-ministry-gold' : 'bg-white/20'}`}></div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 px-10 flex items-center space-x-4 border-b border-blue-100">
            <Info className="text-blue-600 flex-shrink-0" size={20} />
            <p className="text-[10px] text-blue-800 font-bold uppercase tracking-tight">
              Aviso: Este formulário não exige senha. Serve apenas para estabelecer a sua identidade no chat público.
            </p>
          </div>

          <div className="p-10">
            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Nome que aparecerá no Chat</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-ministry-gold shadow-inner" 
                      placeholder="Ex: Irmão João Silva" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Email (Opcional)</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-ministry-gold shadow-inner" 
                      placeholder="email@exemplo.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">País</label>
                    <select 
                      name="country" 
                      value={formData.country} 
                      onChange={handleInputChange} 
                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-ministry-gold shadow-inner"
                    >
                      {COUNTRY_DATA.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Telemóvel</label>
                    <div className="relative">
                       <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 pl-12 focus:ring-2 focus:ring-ministry-gold shadow-inner" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Género</label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleInputChange} 
                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-ministry-gold shadow-inner"
                    >
                      <option value="Male">Masculino</option>
                      <option value="Female">Feminino</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    className="w-full py-5 bg-ministry-blue text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-opacity-90 transition shadow-xl"
                  >
                    <span>Continuar para Foto de Perfil</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-8 py-4">
                <div className="relative inline-block">
                  <div className="w-48 h-48 bg-gray-100 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner flex items-center justify-center">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={64} className="text-gray-300" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-ministry-gold text-white p-3 rounded-xl shadow-2xl cursor-pointer hover:scale-105 transition active:scale-95">
                    <Camera size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                <div className="max-w-md mx-auto">
                  <h3 className="text-2xl font-display font-bold text-ministry-blue">Defina a sua imagem</h3>
                  <p className="text-gray-500 mt-2 text-sm">Adicionar uma foto permite que a comunidade o reconheça durante as transmissões.</p>
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={() => setStep(1)} 
                    className="flex-1 py-5 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={handleComplete} 
                    className="flex-[2] py-5 bg-ministry-blue text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-opacity-90 transition shadow-xl"
                  >
                    <Check size={20} />
                    <span>Concluir e Ir para Live</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">Recebeu credenciais exclusivas do Administrador? <Link to="/login" className="text-ministry-gold font-bold hover:underline">Entre Aqui</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
