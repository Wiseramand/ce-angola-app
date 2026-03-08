
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Phone, User, Mail, MapPin, Building, CheckCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import { api } from '../services/api';

const SchoolRegister: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: 'Angola',
        state: '',
        city: '',
        neighborhood: '',
        isMember: false,
        churchName: '',
        churchAddress: '',
        churchPhone: ''
    });

    const lusophoneCountries = [
        { name: 'Angola', code: '+244' },
        { name: 'Brasil', code: '+55' },
        { name: 'Cabo Verde', code: '+238' },
        { name: 'Guiné-Bissau', code: '+245' },
        { name: 'Guiné Equatorial', code: '+240' },
        { name: 'Moçambique', code: '+258' },
        { name: 'Portugal', code: '+351' },
        { name: 'São Tomé e Príncipe', code: '+239' },
        { name: 'Timor-Leste', code: '+670' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.school.register(formData);
            setIsSuccess(true);
        } catch (error) {
            alert("Erro ao enviar inscrição. Tente novamente.");
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle size={48} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black text-ministry-blue uppercase tracking-tight">Conta Criada!</h1>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Depois de confirmada a sua informação o Admin enviará as credenciais de acesso.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center space-x-2 w-full py-4 bg-ministry-blue text-white rounded-xl font-bold hover:bg-ministry-gold transition-all shadow-lg"
                    >
                        <ArrowLeft size={20} />
                        <span>Voltar ao Site</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <div className="hidden md:flex md:w-1/3 bg-ministry-blue p-12 flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <Logo className="h-20 w-auto mb-8 brightness-0 invert" />
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Escola de Fundação</h1>
                    <p className="text-blue-200 text-lg leading-relaxed">Inicie sua jornada de fé com fundamentos sólidos na palavra de Deus.</p>
                </div>
                <div className="relative z-10 mt-auto flex items-center space-x-4 text-blue-200/50">
                    <GraduationCap size={48} />
                    <div className="h-px flex-grow bg-blue-200/20" />
                </div>
                {/* Background Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-ministry-gold opacity-10 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48" />
            </div>

            <div className="flex-grow p-6 md:p-12 lg:p-24 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <Link to="/school/login" className="inline-flex items-center space-x-2 text-ministry-blue hover:text-ministry-gold transition font-bold uppercase text-xs tracking-widest mb-12">
                        <ArrowLeft size={16} />
                        <span>Voltar ao Login</span>
                    </Link>

                    <header className="mb-12">
                        <h2 className="text-3xl font-black text-ministry-blue uppercase tracking-tighter mb-2">Inscrição de Aluno</h2>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Christ Embassy Angola • Foundation School</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <SectionTitle title="Dados Pessoais" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Nome Completo" icon={User} required value={formData.fullName} onChange={v => setFormData({ ...formData, fullName: v })} />
                            <Input label="E-mail (Opcional)" icon={Mail} type="email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefone</label>
                                <div className="flex space-x-2">
                                    <select
                                        className="w-24 bg-white border border-gray-200 rounded-xl px-2 py-4 h-[58px] text-xs font-bold outline-none focus:ring-2 focus:ring-ministry-gold appearance-none cursor-pointer"
                                        onChange={(e) => {
                                            const country = lusophoneCountries.find(c => c.code === e.target.value);
                                            if (country) setFormData({ ...formData, country: country.name });
                                        }}
                                    >
                                        {lusophoneCountries.map(c => (
                                            <option key={c.name} value={c.code}>{c.code} ({c.name})</option>
                                        ))}
                                    </select>
                                    <div className="flex-grow relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Número"
                                            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 h-[58px] text-sm font-bold outline-none focus:ring-2 focus:ring-ministry-gold transition"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Input label="País" icon={Globe} required value={formData.country} readOnly />
                        </div>

                        <SectionTitle title="Localização" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Input label="Província / Estado" icon={MapPin} required value={formData.state} onChange={v => setFormData({ ...formData, state: v })} />
                            <Input label="Cidade" icon={MapPin} required value={formData.city} onChange={v => setFormData({ ...formData, city: v })} />
                            <Input label="Bairro" icon={MapPin} required value={formData.neighborhood} onChange={v => setFormData({ ...formData, neighborhood: v })} />
                        </div>

                        <SectionTitle title="Vínculo Ministerial" />
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-black text-ministry-blue uppercase tracking-widest block">É membro da Igreja?</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Confirme se já frequenta uma das nossas igrejas.</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isMember: !formData.isMember })}
                                    className={`w-14 h-8 rounded-full relative transition duration-300 ${formData.isMember ? 'bg-ministry-gold' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${formData.isMember ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            {formData.isMember && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
                                    <Input label="Nome da Igreja" icon={Building} required={formData.isMember} value={formData.churchName} onChange={v => setFormData({ ...formData, churchName: v })} />
                                    <Input label="Telefone da Igreja" icon={Phone} value={formData.churchPhone} onChange={v => setFormData({ ...formData, churchPhone: v })} />
                                    <div className="md:col-span-2">
                                        <Input label="Endereço da Igreja" icon={MapPin} required={formData.isMember} value={formData.churchAddress} onChange={v => setFormData({ ...formData, churchAddress: v })} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                className="w-full py-6 bg-ministry-blue text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-ministry-gold transition-all"
                            >
                                Criar Conta
                            </button>
                            <p className="text-center mt-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                Já tem conta? <Link to="/school/login" className="text-ministry-gold hover:underline">Entrar</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const SectionTitle = ({ title }: { title: string }) => (
    <div className="flex items-center space-x-4 mb-4">
        <h3 className="text-xs font-black text-ministry-gold uppercase tracking-[0.2em] whitespace-nowrap">{title}</h3>
        <div className="h-px w-full bg-gray-100" />
    </div>
);

const Input = ({ label, icon: Icon, required, type = "text", value, onChange, placeholder, readOnly }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
                type={type}
                required={required}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 h-[58px] text-sm font-bold outline-none focus:ring-2 focus:ring-ministry-gold transition ${readOnly ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    </div>
);

export default SchoolRegister;
