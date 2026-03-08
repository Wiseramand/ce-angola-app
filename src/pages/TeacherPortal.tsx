
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Video, Calendar, BookOpen, Settings,
    LogOut, ChevronRight, Plus, Clock, Search,
    UserCheck, AlertCircle, Save, X, Calendar as CalendarIcon, Play, Menu
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [teacher, setTeacher] = useState({
        id: null,
        fullName: 'Professor',
        email: '',
        phone: '',
        username: '',
        profilePicture: ''
    });
    const [settingsData, setSettingsData] = useState({
        fullname: '',
        email: '',
        phone: '',
        password: ''
    });

    const [students, setStudents] = useState<Student[]>([]);
    const [isLive, setIsLive] = useState(false);
    const [devices, setDevices] = useState<{ video: MediaDeviceInfo[], audio: MediaDeviceInfo[] }>({ video: [], audio: [] });
    const [selectedVideo, setSelectedVideo] = useState('');
    const [selectedAudio, setSelectedAudio] = useState('');
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const loadDevices = async () => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            setDevices({
                video: allDevices.filter(d => d.kind === 'videoinput'),
                audio: allDevices.filter(d => d.kind === 'audioinput')
            });
        } catch (e) { console.error(e); }
    };

    const startPreview = async () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: selectedVideo ? { deviceId: { exact: selectedVideo } } : true,
                audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true
            });
            setStream(newStream);
            if (videoRef.current) videoRef.current.srcObject = newStream;
        } catch (e) { alert("Erro ao acessar câmera/microfone"); }
    };

    const handleGoLive = async () => {
        try {
            await api.system.updateConfig({
                is_teacher_live: true,
                live_teacher_name: teacher.fullName
            });
            setIsLive(true);
            alert("VOCÊ ESTÁ AO VIVO! Os alunos foram notificados.");
        } catch (e) { alert("Erro ao iniciar transmissão"); }
    };

    const handleEndLive = async () => {
        try {
            await api.system.updateConfig({ is_teacher_live: false, live_teacher_name: '' });
            setIsLive(false);
            if (stream) stream.getTracks().forEach(t => t.stop());
            setStream(null);
            alert("Transmissão encerrada.");
        } catch (e) { }
    };

    useEffect(() => {
        loadDevices();
    }, []);
    const [myStudents, setMyStudents] = useState<any[]>([]);

    useEffect(() => {
        const loadPortalData = async () => {
            setIsLoading(true);
            try {
                const savedUser = localStorage.getItem('school_teacher');
                if (!savedUser) {
                    navigate('/school/teacher/login');
                    return;
                }
                if (savedUser) {
                    const parsed = JSON.parse(savedUser);
                    const teacherData = {
                        id: parsed.id || null,
                        fullName: parsed.fullname || parsed.fullName || 'Professor',
                        email: parsed.email || '',
                        phone: parsed.phone || '',
                        username: parsed.username || '',
                        profilePicture: ''
                    };
                    setTeacher(teacherData);
                    setSettingsData({
                        fullname: teacherData.fullName,
                        email: teacherData.email,
                        phone: teacherData.phone,
                        password: ''
                    });

                    // Load assigned students
                    if (parsed.id) {
                        const assignedStudents = await api.school.getTeacherStudents(parsed.id);
                        setMyStudents(assignedStudents || []);
                    }
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
        localStorage.removeItem('school_teacher');
        navigate('/school/teacher/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
            {/* Mobile Header */}
            <header className="md:hidden bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-30 shadow-lg">
                <Logo className="h-8 w-auto brightness-0 invert" />
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Backdrop for Mobile Menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-80 bg-slate-900 text-white flex flex-col z-50 shadow-2xl transition-transform duration-300
                ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8 border-b border-white/10">
                    <Logo className="h-12 w-auto mb-6 brightness-0 invert hidden md:block" />
                    <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                            {teacher.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Professor</p>
                            <h3 className="font-bold text-sm truncate">{teacher.fullName}</h3>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
                    <SidebarLink
                        icon={UserCheck}
                        label="Meus Alunos"
                        active={activeTab === 'students'}
                        onClick={() => { setActiveTab('students'); setIsMenuOpen(false); }}
                    />
                    <SidebarLink
                        icon={Video}
                        label="Aulas ao Vivo"
                        active={activeTab === 'classes'}
                        onClick={() => { setActiveTab('classes'); setIsMenuOpen(false); }}
                    />
                    <SidebarLink
                        icon={Settings}
                        label="Configurações"
                        active={activeTab === 'settings'}
                        onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }}
                    />
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
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Meus Alunos</h1>
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Alunos atribuídos a si pelo administrador.</p>
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
                                        <th className="px-8 py-6">Nome Completo</th>
                                        <th className="px-8 py-6">Turma / Classe</th>
                                        <th className="px-8 py-6">Contato</th>
                                        <th className="px-8 py-6">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {myStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center">
                                                <UserCheck className="text-slate-200 mx-auto mb-3" size={40} />
                                                <p className="text-slate-400 font-bold text-sm uppercase">Nenhum aluno atribuído ainda.</p>
                                                <p className="text-slate-300 font-bold text-xs mt-1">O administrador pode atribuir alunos ao criar ou aprovar uma inscrição.</p>
                                            </td>
                                        </tr>
                                    ) : myStudents.filter(s =>
                                        (s.fullname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (s.class_title || '').toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-sm">
                                                        {(s.fullname || 'A').charAt(0)}
                                                    </div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{s.fullname}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${s.class_title ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    {s.class_title || 'Sem turma'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-xs text-slate-500 font-bold">{s.email || s.phone || '—'}</td>
                                            <td className="px-8 py-5">
                                                {s.access_expiry && new Date(s.access_expiry) < new Date() ? (
                                                    <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[9px] font-black uppercase">Expirado</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase">Ativo</span>
                                                )}
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
                            {!isLive ? (
                                <button onClick={() => { setActiveTab('classes'); startPreview(); }} className="flex items-center space-x-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all">
                                    <Video size={18} />
                                    <span>Iniciar Transmissão</span>
                                </button>
                            ) : (
                                <button onClick={handleEndLive} className="flex items-center space-x-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">
                                    <X size={18} />
                                    <span>Encerrar Aula</span>
                                </button>
                            )}
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Área da Câmera / Transmissão */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 group">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    {isLive && (
                                        <div className="absolute top-8 left-8 flex items-center space-x-3">
                                            <div className="flex items-center space-x-2 bg-red-600 px-4 py-2 rounded-full shadow-lg animate-pulse">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Ao Vivo</span>
                                            </div>
                                            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                                                {new Date().toLocaleTimeString()}
                                            </div>
                                        </div>
                                    )}
                                    {!stream && !isLive && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                                            <button onClick={startPreview} className="p-8 bg-white/10 hover:bg-white/20 rounded-full transition-all group-hover:scale-110">
                                                <Play className="text-white fill-white" size={48} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex flex-col md:flex-row gap-6 flex-grow w-full">
                                        <div className="flex-grow space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Câmera / Fonte</label>
                                            <select
                                                value={selectedVideo}
                                                onChange={e => { setSelectedVideo(e.target.value); setTimeout(startPreview, 100); }}
                                                className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                            >
                                                {devices.video.map(d => (
                                                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Câmera ${d.deviceId.slice(0, 5)}`}</option>
                                                ))}
                                                <option value="">OBS Virtual Camera / Default</option>
                                            </select>
                                        </div>
                                        <div className="flex-grow space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Microfone</label>
                                            <select
                                                value={selectedAudio}
                                                onChange={e => { setSelectedAudio(e.target.value); setTimeout(startPreview, 100); }}
                                                className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                            >
                                                {devices.audio.map(d => (
                                                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {!isLive ? (
                                        <button
                                            onClick={handleGoLive}
                                            disabled={!stream}
                                            className="w-full md:w-auto px-12 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-red-700 transition-all disabled:opacity-50"
                                        >
                                            Ir ao Vivo Now
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleEndLive}
                                            className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all"
                                        >
                                            Sair do Ar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Chat (Simulado ou Real) */}
                            <div className="h-full min-h-[500px] flex flex-col bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase text-xs tracking-tight">Chat da Aula</h3>
                                        <p className="text-[9px] text-green-500 font-bold uppercase mt-0.5">Sessão Ativa</p>
                                    </div>
                                    <Users size={18} className="text-slate-300" />
                                </div>
                                <div className="flex-grow p-8 space-y-6 overflow-y-auto">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex-shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Wilson Carlos</p>
                                            <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-2xl rounded-tl-none">Professor, tenho uma dúvida sobre o Módulo 2!</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-50 bg-slate-50/50">
                                    <div className="flex gap-3">
                                        <input type="text" placeholder="Responder aos alunos..." className="flex-grow bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                                        <button className="p-3 bg-blue-600 text-white rounded-xl"><Plus size={16} /></button>
                                    </div>
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-1">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center text-center space-y-6">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-300 relative group">
                                        <Users size={48} />
                                        <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                            <Save className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{teacher.fullName}</h3>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">ID: {teacher.username}</p>
                                    </div>
                                    <div className="w-full pt-6 border-t border-gray-50 flex flex-col gap-3">
                                        <div className="flex items-center justify-between text-xs px-2">
                                            <span className="text-gray-400 font-bold uppercase tracking-widest">Alunos</span>
                                            <span className="font-black text-slate-900">{myStudents.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs px-2">
                                            <span className="text-gray-400 font-bold uppercase tracking-widest">Status</span>
                                            <span className="text-green-500 font-black uppercase">Ativo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Informações Pessoais</h3>
                                        {!isEditingSettings && (
                                            <button
                                                onClick={() => setIsEditingSettings(true)}
                                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition"
                                            >
                                                Editar Dados
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                            {isEditingSettings ? (
                                                <input
                                                    type="text"
                                                    value={settingsData.fullname}
                                                    onChange={e => setSettingsData({ ...settingsData, fullname: e.target.value })}
                                                    className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                />
                                            ) : (
                                                <p className="text-sm font-bold text-slate-900 px-6 py-4 bg-slate-50 rounded-2xl border border-transparent">{teacher.fullName}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail de Trabalho</label>
                                            {isEditingSettings ? (
                                                <input
                                                    type="email"
                                                    value={settingsData.email}
                                                    onChange={e => setSettingsData({ ...settingsData, email: e.target.value })}
                                                    className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                />
                                            ) : (
                                                <p className="text-sm font-bold text-slate-900 px-6 py-4 bg-slate-50 rounded-2xl border border-transparent">{teacher.email || 'Não informado'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                                            {isEditingSettings ? (
                                                <input
                                                    type="text"
                                                    value={settingsData.phone}
                                                    onChange={e => setSettingsData({ ...settingsData, phone: e.target.value })}
                                                    className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                />
                                            ) : (
                                                <p className="text-sm font-bold text-slate-900 px-6 py-4 bg-slate-50 rounded-2xl border border-transparent">{teacher.phone || 'Não informado'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Palavra-passe</label>
                                            {isEditingSettings ? (
                                                <input
                                                    type="password"
                                                    placeholder="Deixe em branco para não alterar"
                                                    value={settingsData.password}
                                                    onChange={e => setSettingsData({ ...settingsData, password: e.target.value })}
                                                    className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                />
                                            ) : (
                                                <p className="text-sm font-bold text-slate-900 px-6 py-4 bg-slate-50 rounded-2xl border border-transparent">••••••••••••</p>
                                            )}
                                        </div>
                                    </div>

                                    {isEditingSettings && (
                                        <div className="mt-10 flex gap-4">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const updatePayload = {
                                                            ...teacher,
                                                            fullname: settingsData.fullname,
                                                            email: settingsData.email,
                                                            phone: settingsData.phone,
                                                            password: settingsData.password || null
                                                        };
                                                        await api.school.saveUser(updatePayload);
                                                        setTeacher({
                                                            ...teacher,
                                                            fullName: settingsData.fullname,
                                                            email: settingsData.email,
                                                            phone: settingsData.phone
                                                        });
                                                        localStorage.setItem('school_teacher', JSON.stringify({
                                                            ...JSON.parse(localStorage.getItem('school_teacher') || '{}'),
                                                            fullname: settingsData.fullname,
                                                            email: settingsData.email,
                                                            phone: settingsData.phone
                                                        }));
                                                        setIsEditingSettings(false);
                                                        alert("Definições atualizadas com sucesso!");
                                                    } catch (e) {
                                                        alert("Erro ao salvar alterações.");
                                                    }
                                                }}
                                                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 shadow-lg transition"
                                            >
                                                Salvar Alterações
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingSettings(false);
                                                    setSettingsData({
                                                        fullname: teacher.fullName,
                                                        email: teacher.email,
                                                        phone: teacher.phone,
                                                        password: ''
                                                    });
                                                }}
                                                className="px-8 py-4 bg-slate-100 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-blue-50/50 p-10 rounded-[3rem] border border-blue-100/50">
                                    <div className="flex items-start gap-6">
                                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Dica de Segurança</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                Certifique-se de manter seus dados de contato atualizados. Caso altere sua palavra-passe, use uma combinação forte de letras e números para garantir a segurança da sua sala de aula.
                                            </p>
                                        </div>
                                    </div>
                                </div>
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
