import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Lock, User, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import { api } from '../services/api';

const TeacherLogin: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await api.school.teacherLogin(formData.username, formData.password);
            if (res.success) {
                localStorage.setItem('school_teacher', JSON.stringify(res.user));
                navigate('/school/teacher');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao entrar no portal');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ministry-gold opacity-[0.03] rounded-full -mr-64 -mt-64 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-ministry-blue opacity-[0.05] rounded-full -ml-80 -mb-80 blur-3xl" />

            <div className="max-w-md w-full space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <Logo className="h-20 w-auto brightness-0 invert" />
                    </div>
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-ministry-gold/10 text-ministry-gold rounded-full border border-ministry-gold/20">
                        <GraduationCap size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Escola de Fundação</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Portal do Professor</h1>
                    <p className="text-gray-500 font-medium">Liderar, instruir e acompanhar os alunos na Palavra.</p>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ID de Estudante</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Seu ID de acesso"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-ministry-gold transition"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-ministry-gold transition"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-ministry-gold text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-white hover:text-ministry-blue transition-all flex items-center justify-center space-x-3"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    <span>Entrar no Portal</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <Link to="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-ministry-gold transition font-bold uppercase text-[10px] tracking-widest">
                        <ArrowLeft size={14} />
                        <span>Voltar ao Site Principal</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TeacherLogin;
