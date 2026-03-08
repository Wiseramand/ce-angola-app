
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Video, Calendar, BookOpen, Settings,
    LogOut, ChevronRight, Plus, Clock, Search,
    UserCheck, AlertCircle, Save, X, Calendar as CalendarIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import { api } from '../services/api';

interface Student {
    id: number;
    name: string;
    progress: number;
    lastActive: string;
    status: 'active' | 'inactive';
}

const TeacherPortal: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'students' | 'classes' | 'settings'>('students');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [teacher, setTeacher] = useState({ fullName: 'Professor', profilePicture: '' });

    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        const loadPortalData = async () => {
            setIsLoading(true);
            try {
                const savedUser = localStorage.getItem('school_user');
                if (savedUser) {
                    const parsed = JSON.parse(savedUser);
                    setTeacher({
                        fullName: parsed.fullname || parsed.fullName || 'Professor',
                        profilePicture: ''
                    });
                }

                const allUsers = await api.school.getUsers();
                if (allUsers) {
                    // Filter for students and map to required format
                    const studentList = allUsers
                        .filter((u: any) => u.role === 'student')
                        .map((s: any) => ({
                            id: s.id,
                            name: s.fullname,
                            progress: Math.floor(Math.random() * 100), // Mocked progress
                            lastActive: 'Ativo agora',
                            status: 'active' as 'active' | 'inactive'
                        }));
                    setStudents(studentList);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadPortalData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('school_user');
        navigate('/school/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <aside className="w-full md:w-80 bg-slate-900 text-white flex flex-col h-screen sticky top-0 z-20 shadow-2xl">
                <div className="p-8 border-b border-white/10">
                    <Logo className="h-12 w-auto mb-6 brightness-0 invert" />
                    <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-lg">
                            {teacher.fullName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Professor</p>
                            <h3 className="font-bold text-sm">{teacher.fullName}</h3>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow p-6 space-y-2">
                    <SidebarLink icon={Users} label="Meus Alunos" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    <SidebarLink icon={Video} label="Aulas ao Vivo" active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} />
                    <SidebarLink icon={Settings} label="Configurações" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-6 py-4 text-slate-400 hover:text-white transition font-bold text-xs uppercase tracking-widest"
                    >
                        <LogOut size={18} />
                        <span>Sair do Portal</span>
                    </button>
                </div>
            </aside>

            <main className="flex-grow p-6 md:p-12 overflow-y-auto">
                {activeTab === 'students' && (
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Gestão de Alunos</h1>
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Acompanhe o crescimento espiritual da sua turma.</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Procurar aluno..."
                                    className="bg-white border border-gray-100 rounded-xl pl-12 pr-6 py-4 text-sm font-bold w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </header>

                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-b">
                                        <th className="px-8 py-6">Aluno</th>
                                        <th className="px-8 py-6">Progresso</th>
                                        <th className="px-8 py-6">Última Atividade</th>
                                        <th className="px-8 py-6 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {students.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{s.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Foundation Student</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.progress}%` }} />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-600">{s.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold text-gray-400">{s.lastActive}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <header className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Aulas ao Vivo</h1>
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Agende sessões interativas com seus alunos.</p>
                            </div>
                            <button className="flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all">
                                <Plus size={18} />
                                <span>Agendar Aula</span>
                            </button>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <CalendarIcon size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nova Aula</h3>
                                </div>
                                <div className="space-y-6">
                                    <InputField label="Título da Sessão" placeholder="Ex: Revisão Módulo 1" />
                                    <InputField label="Data e Hora" type="datetime-local" />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descrição / Notas</label>
                                        <textarea className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[120px]" placeholder="Instruções para os alunos..."></textarea>
                                    </div>
                                    <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-slate-900 transition-all">
                                        Confirmar Agendamento
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Aulas Agendadas</h4>
                                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col justify-between h-full space-y-12">
                                        <div className="flex justify-between items-start">
                                            <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-400/20">Hoje</div>
                                            <button className="text-white/40 hover:text-white transition"><X size={20} /></button>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Q&A: Dúvidas Módulos 1 a 4</h3>
                                            <div className="flex items-center space-x-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                <Clock size={14} />
                                                <span>19:30 BRT</span>
                                            </div>
                                        </div>
                                        <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                                            Iniciar Aula Agora
                                        </button>
                                    </div>
                                    {/* Decorative */}
                                    <Video className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-500">
                        <header>
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Configurações</h1>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Gerencie sua conta de professor.</p>
                        </header>
                        <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-100 flex flex-col items-center text-center space-y-8">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-300">
                                <Users size={48} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Painel em Construção</h3>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto mt-4">Estamos aprimorando as ferramentas de professor para que você tenha a melhor experiência de ensino.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const SidebarLink = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${active ? 'bg-blue-600 text-white shadow-xl translate-x-2' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </button>
);

const InputField = ({ label, type = "text", placeholder }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 h-[58px] text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
        />
    </div>
);

export default TeacherPortal;
