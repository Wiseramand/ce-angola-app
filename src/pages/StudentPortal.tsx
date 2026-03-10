
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap, BookOpen, Video, Calendar, Users, Settings, LogOut, Search,
    UserCheck, AlertCircle, Save, X, Menu, MessageSquare, Send, Play, Plus, Clock,
    ChevronRight, CheckCircle, Lock, PlayCircle, Volume2, VolumeX, Trash2,
    LayoutDashboard, User, Trophy, Camera, ArrowLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import { api } from '../services/api';

interface Module {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    isUnlocked: boolean;
    score: number | null;
}

const StudentPortal: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'modules' | 'live' | 'profile'>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [student, setStudent] = useState({
        id: null,
        fullName: 'Estudante',
        email: '',
        phone: '',
        neighborhood: '',
        city: '',
        state: '',
        country: '',
        churchName: '',
        churchAddress: '',
        churchPhone: '',
        isMember: false,
        profilePicture: ''
    });

    const [modules, setModules] = useState<Module[]>([]);
    const [isTeacherLive, setIsTeacherLive] = useState(false);
    const [liveTeacherName, setLiveTeacherName] = useState('');
    const [liveUrl, setLiveUrl] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<{ title: string, url: string } | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const isLiveRef = useRef(false);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const signalingInterval = useRef<any>(null);
    const studentSignalingId = useRef(`student-${Math.random().toString(36).substr(2, 9)}`);


    const handleSignaling = async (teacherSignalingId: string) => {
        if (!isLiveRef.current) return;

        const signals = await api.school.live.getSignals(studentSignalingId.current);

        // If we haven't received an offer yet, aggressively resend JOIN heartbeat
        if (!peerConnection.current || peerConnection.current.signalingState === "closed") {
            api.school.live.sendSignal({
                sender_id: studentSignalingId.current,
                receiver_id: teacherSignalingId,
                type: 'join',
                data: {}
            });
        }

        for (const signal of signals) {
            if (signal.type === 'offer') {
                if (peerConnection.current) peerConnection.current.close();

                const pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                        { urls: 'stun:stun2.l.google.com:19302' },
                        // Free public TURN servers for NAT traversal
                        {
                            urls: [
                                'turn:openrelay.metered.ca:80',
                                'turn:openrelay.metered.ca:443',
                                'turns:openrelay.metered.ca:443'
                            ],
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        }
                    ],
                    iceCandidatePoolSize: 10
                });

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log("Student ICE candidate:", event.candidate.type);
                        api.school.live.sendSignal({
                            sender_id: studentSignalingId.current,
                            receiver_id: teacherSignalingId,
                            type: 'candidate',
                            data: event.candidate
                        });
                    } else {
                        console.log("Student: ICE gathering complete.");
                    }
                };

                pc.oniceconnectionstatechange = () => {
                    console.log("Student ICE state:", pc.iceConnectionState);
                };

                pc.ontrack = (event) => {
                    console.log("Student received track:", event.track.kind);
                    if (event.streams && event.streams[0]) {
                        setRemoteStream(event.streams[0]);
                    } else {
                        const inboundStream = new MediaStream();
                        inboundStream.addTrack(event.track);
                        setRemoteStream(inboundStream);
                    }
                };

                peerConnection.current = pc;
                console.log("Student: Setting remote description...");
                await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
                console.log("Student: Remote description set. Creating answer...");
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                await api.school.live.sendSignal({
                    sender_id: studentSignalingId.current,
                    receiver_id: teacherSignalingId,
                    type: 'answer',
                    data: answer
                });
            } else if (signal.type === 'candidate') {
                const pc = peerConnection.current;
                if (pc && pc.remoteDescription) {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.data)).catch(e => console.error("Error adding candidate", e));
                } else {
                    console.warn("Student: PC not ready for candidate or remoteDescription missing.");
                }
            }
        }
    };

    const joinLiveSession = async (teacherSignalingId: string) => {
        // The first JOIN is sent here, subsequent JOINs acts as heartbeats inside handleSignaling
        await api.school.live.sendSignal({
            sender_id: studentSignalingId.current,
            receiver_id: teacherSignalingId,
            type: 'join',
            data: {}
        });
        if (signalingInterval.current) clearInterval(signalingInterval.current);
        signalingInterval.current = setInterval(() => handleSignaling(teacherSignalingId), 3000);
    };

    const checkLiveStatus = async () => {
        try {
            const config = await api.system.getConfig();
            console.log("Student: Checking live status...", config?.is_teacher_live);
            if (config) {
                const live = config.is_teacher_live === true ||
                    config.is_teacher_live === 'true' ||
                    config.is_teacher_live === 't' ||
                    config.is_teacher_live === 1 ||
                    config.is_teacher_live === '1';

                const wasLive = isLiveRef.current;

                if (live !== wasLive) {
                    setIsTeacherLive(live);
                    isLiveRef.current = live;

                    if (live && config.live_teacher_id) {
                        joinLiveSession(config.live_teacher_id);
                    } else if (!live) {
                        if (signalingInterval.current) clearInterval(signalingInterval.current);
                        if (peerConnection.current) peerConnection.current.close();
                        peerConnection.current = null;
                        setRemoteStream(null);
                    }
                }

                if (live) {
                    setLiveTeacherName(config.live_teacher_name || 'Professor');
                    setLiveUrl(config.school_live_url || '');
                }
            } else {
                if (isLiveRef.current) {
                    setIsTeacherLive(false);
                    isLiveRef.current = false;
                    if (signalingInterval.current) clearInterval(signalingInterval.current);
                    if (peerConnection.current) peerConnection.current.close();
                    peerConnection.current = null;
                    setRemoteStream(null);
                }
            }
        } catch (e) { }
    };

    useEffect(() => {
        checkLiveStatus();
        const interval = setInterval(checkLiveStatus, 3000); // 3s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadPortalData = async () => {
            setIsLoading(true);
            try {
                const savedUser = localStorage.getItem('school_student');
                if (!savedUser) {
                    navigate('/school/login');
                    return;
                }
                if (savedUser) {
                    const parsed = JSON.parse(savedUser);
                    setStudent({
                        id: parsed.id || null,
                        fullName: parsed.fullname || parsed.fullName || 'Estudante',
                        email: parsed.email || '',
                        phone: parsed.phone || '',
                        neighborhood: parsed.neighborhood || '',
                        city: parsed.city || '',
                        state: parsed.state || '',
                        country: parsed.country || '',
                        churchName: parsed.church_name || parsed.churchName || '',
                        churchAddress: parsed.church_address || parsed.churchAddress || '',
                        churchPhone: parsed.church_phone || parsed.churchPhone || '',
                        isMember: !!parsed.is_member,
                        profilePicture: ''
                    });
                }

                const mods = await api.school.getModules();
                if (mods) {
                    setModules(mods.map((m: any) => ({
                        ...m,
                        isCompleted: false, // Mocked for now, backend could track this
                        isUnlocked: true    // All unlocked for now
                    })));
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
        localStorage.removeItem('school_student');
        navigate('/school/login');
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col md:flex-row relative overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden bg-ministry-blue text-white p-6 flex justify-between items-center sticky top-0 z-[60] shadow-lg">
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
                    className="fixed inset-0 bg-ministry-blue/60 backdrop-blur-sm z-[70] md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-80 bg-ministry-blue text-white flex flex-col z-[80] shadow-2xl transition-transform duration-300
                ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8 border-b border-white/10">
                    <Logo className="h-12 w-auto mb-6 brightness-0 invert hidden md:block" />
                    <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-ministry-gold flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                            {student.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ministry-gold">Aluno</p>
                            <h3 className="font-bold text-sm truncate">{student.fullName}</h3>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
                    <SidebarLink
                        icon={LayoutDashboardIcon}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}
                    />
                    <SidebarLink
                        icon={BookOpen}
                        label="Meus Classes"
                        active={activeTab === 'modules'}
                        onClick={() => { setActiveTab('modules'); setIsMenuOpen(false); }}
                    />
                    <SidebarLink
                        icon={Video}
                        label="Aulas ao Vivo"
                        active={activeTab === 'live'}
                        isLive={isTeacherLive}
                        onClick={() => { setActiveTab('live'); setIsMenuOpen(false); }}
                    />
                    <SidebarLink
                        icon={User}
                        label="Meu Perfil"
                        active={activeTab === 'profile'}
                        onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                    />
                </nav>

                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-6 py-4 text-blue-200/50 hover:text-white hover:bg-white/5 rounded-xl transition font-bold text-xs uppercase tracking-widest"
                    >
                        <LogOut size={18} />
                        <span>Sair do Portal</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-6 md:p-12 overflow-y-auto">
                {isTeacherLive && (
                    <div className="mb-10 bg-red-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-red-500/20 animate-bounce-subtle">
                        <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                                <Video size={32} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">O {liveTeacherName} está AO VIVO!</h3>
                                <p className="text-[10px] font-bold uppercase text-white/60 tracking-widest mt-1">Sessão Interativa em Tempo Real</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('live')}
                            className="px-10 py-4 bg-white text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg"
                        >
                            Assistir Agora
                        </button>
                    </div>
                )}
                {activeTab === 'dashboard' && <DashboardView student={student} modules={modules} onStartCourse={() => setActiveTab('modules')} onCompleteProfile={() => setActiveTab('profile')} />}
                {activeTab === 'modules' && <ModulesView modules={modules} onSelectVideo={setSelectedVideo} />}
                {activeTab === 'live' && <LiveClassesView isLive={isTeacherLive} teacherName={liveTeacherName} liveUrl={liveUrl} studentName={student.fullName} studentId={student.id || 'anonymous'} remoteStream={remoteStream} />}
                {activeTab === 'profile' && (
                    <ProfileView
                        student={student}
                        isEditing={isEditingProfile}
                        onEdit={() => setIsEditingProfile(true)}
                        onCancel={() => setIsEditingProfile(false)}
                        onSave={async (data: any) => {
                            try {
                                await api.school.saveUser({
                                    ...data,
                                    fullname: data.fullName,
                                    church_name: data.churchName,
                                    church_address: data.churchAddress,
                                    church_phone: data.churchPhone,
                                    is_member: data.isMember
                                });
                                setStudent(data);
                                localStorage.setItem('school_user', JSON.stringify({
                                    ...data,
                                    fullname: data.fullName,
                                    church_name: data.churchName,
                                    church_address: data.churchAddress,
                                    church_phone: data.churchPhone,
                                    is_member: data.isMember
                                }));
                                setIsEditingProfile(false);
                                alert("Perfil atualizado!");
                            } catch (e) {
                                alert("Erro ao salvar perfil.");
                            }
                        }}
                    />
                )}
                {selectedVideo && (
                    <VideoPlayerModal
                        title={selectedVideo.title}
                        url={selectedVideo.url}
                        onClose={() => setSelectedVideo(null)}
                    />
                )}

            </main>
        </div>
    );
};

// --- SUB-VIEWS ---

const DashboardView = ({ student, modules, onStartCourse, onCompleteProfile }: any) => {
    const completedCount = modules.filter((m: any) => m.isCompleted).length;
    const progress = (completedCount / modules.length) * 100;

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header>
                <h1 className="text-4xl font-black text-ministry-blue uppercase tracking-tighter mb-2">Paz do Senhor, {student.fullName.split(' ')[0]}!</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Bem-vindo de volta à sua jornada de crescimento.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard icon={Trophy} label="Classes Concluídos" value={`${completedCount}/8`} color="text-ministry-gold" bg="bg-ministry-gold/10" />
                <StatCard icon={Clock} label="Status do Curso" value={progress === 100 ? "Concluído" : "Em Progresso"} color="text-blue-600" bg="bg-blue-50" />
                <StatCard icon={CheckCircle} label="Próxima Classe" value="Classe 2" color="text-green-600" bg="bg-green-50" />
            </div>

            {(!student.neighborhood || !student.churchName) && (
                <div className="bg-ministry-gold/10 border-2 border-dashed border-ministry-gold rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-ministry-gold text-white rounded-2xl flex items-center justify-center">
                            <Settings size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase text-ministry-blue tracking-tight">Complete o seu Perfil</h3>
                            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mt-1">Faltam dados importantes como a sua Igreja e Bairro.</p>
                        </div>
                    </div>
                    <button
                        onClick={onCompleteProfile}
                        className="px-8 py-4 bg-ministry-blue text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-ministry-gold transition-all shadow-lg"
                    >
                        Preencher Agora
                    </button>
                </div>
            )}

            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-10">
                <div className="w-48 h-48 relative flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#C5A059" strokeWidth="4"
                            strokeDasharray={`${progress}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-ministry-blue">{Math.round(progress)}%</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Progresso</span>
                    </div>
                </div>
                <div className="flex-grow space-y-6">
                    <h2 className="text-2xl font-black text-ministry-blue uppercase tracking-tight">Escola de Fundação Christ Embassy</h2>
                    <p className="text-gray-500 leading-relaxed font-medium">Continue onde parou! O Classe 2 está aguardando você para aprofundar seu conhecimento sobre a Natureza de Deus.</p>
                    <button
                        onClick={onStartCourse}
                        className="px-10 py-5 bg-ministry-blue text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:scale-105 transition-all"
                    >
                        Continuar Curso
                    </button>
                </div>
            </div>
        </div>
    );
};

const ModulesView = ({ modules, onSelectVideo }: { modules: Module[], onSelectVideo: (v: any) => void }) => {
    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-ministry-blue uppercase tracking-tighter mb-2">Conteúdo do Curso</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">8 Classes de Preparação para a Vida em Cristo.</p>
                </div>
                <div className="bg-ministry-gold/10 px-4 py-2 rounded-full border border-ministry-gold/20 flex items-center space-x-2">
                    <Trophy size={14} className="text-ministry-gold" />
                    <span className="text-[10px] font-black text-ministry-gold uppercase tracking-widest">Graduação 100%</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modules.map((m, idx) => (
                    <div
                        key={m.id}
                        onClick={() => m.isUnlocked && onSelectVideo({ title: m.title, url: (m as any).video_url })}
                        className={`group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${m.isUnlocked
                            ? 'bg-white border-gray-100 hover:border-ministry-gold hover:shadow-2xl cursor-pointer'
                            : 'bg-gray-50 border-transparent opacity-60 grayscale'
                            }`}
                    >

                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.isCompleted ? 'bg-green-100 text-green-600' : 'bg-ministry-blue text-white'}`}>
                                {m.isCompleted ? <CheckCircle size={24} /> : <span className="text-xl font-black">{m.id}</span>}
                            </div>
                            {!m.isUnlocked ? <Lock size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-300 group-hover:text-ministry-gold transition-colors" />}
                        </div>

                        <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-3">{m.title}</h3>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">{m.description}</p>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                            {m.isUnlocked ? (
                                <div className="flex items-center space-x-2 text-ministry-gold font-black text-[10px] uppercase tracking-widest">
                                    <PlayCircle size={16} />
                                    <span>{m.isCompleted ? "Rever Aula" : "Começar Agora"}</span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trancado</span>
                            )}
                            {m.score !== null && (
                                <div className="bg-green-50 px-3 py-1 rounded-full text-green-600 font-black text-[9px] uppercase tracking-widest border border-green-100">
                                    Score: {m.score}%
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LiveClassesView = ({ isLive, teacherName, liveUrl, studentName, studentId, remoteStream }: { isLive: boolean, teacherName: string, liveUrl: string, studentName: string, studentId: string, remoteStream: MediaStream | null }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(true); // Default to muted for autoplay


    useEffect(() => {
        if (videoRef.current && remoteStream) {
            videoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    }, [volume]);

    const fetchMessages = async () => {
        try {
            const data = await api.chat.getMessages('school-live');
            setMessages(data);
        } catch (e) { }
    };

    useEffect(() => {
        if (isLive) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [isLive]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            await api.chat.sendMessage({
                userId: studentId,
                username: studentName,
                text: newMessage,
                channel: 'school-live'
            });
            setNewMessage('');
            fetchMessages();
        } catch (e) { }
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
        if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
        if (url.includes('drive.google.com')) {
            const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (idMatch && idMatch[1]) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
        }
        if (url.startsWith('/uploads')) return `${window.location.origin}/api/school${url}`;
        return url;
    };

    const embedUrl = getEmbedUrl(liveUrl);

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <header>
                <h1 className="text-4xl font-black text-ministry-blue uppercase tracking-tighter mb-2">Aula Interativa</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Aprenda e interaja em tempo real.</p>
            </header>

            <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[800px] max-h-[80vh]">
                <div className="p-8 border-b border-gray-50 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${isLive ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-400'} rounded-2xl flex items-center justify-center`}>
                            <Video size={24} />
                        </div>
                        <div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${isLive ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'} rounded-full mb-1 inline-block`}>
                                {isLive ? 'Aula On-line' : 'Sem Transmissão'}
                            </span>
                            <h3 className="text-lg font-black text-ministry-blue uppercase tracking-tight">
                                {isLive ? `Sessão com ${teacherName}` : 'Aguardando Professor'}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    {/* Video Area */}
                    <div className="flex-grow bg-black flex items-center justify-center relative overflow-hidden group">
                        {isLive ? (
                            liveUrl === 'WEBRTC_DIRECT' ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="flex items-center space-x-6 bg-slate-900/80 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
                                            <button
                                                onClick={() => setIsMuted(!isMuted)}
                                                className={`p-3 rounded-xl transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white text-slate-800'}`}
                                            >
                                                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={volume}
                                                onChange={(e) => {
                                                    const v = parseFloat(e.target.value);
                                                    setVolume(v);
                                                    if (videoRef.current) videoRef.current.volume = v;
                                                    if (v > 0) setIsMuted(false);
                                                }}
                                                className="w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-ministry-gold"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <iframe
                                    src={embedUrl}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                                    <Calendar size={32} />
                                </div>
                                <h4 className="text-xl font-black text-white/40 uppercase tracking-tight">Nenhuma aula agendada agora</h4>
                            </div>
                        )}
                    </div>

                    {/* Chat Area */}
                    {isLive && (
                        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col bg-slate-50">
                            <div className="p-4 border-b border-gray-100 bg-white">
                                <h4 className="text-[10px] font-black text-ministry-blue uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={14} className="text-ministry-gold" />
                                    Voz dos Estudantes
                                </h4>
                            </div>
                            <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-hide">
                                {messages.length === 0 && (
                                    <p className="text-center py-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Seja o primeiro a perguntar...</p>
                                )}
                                {messages.map((msg, i) => (
                                    <div key={i} className="flex flex-col animate-in fade-in slide-in-from-bottom-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black text-ministry-blue uppercase">{msg.username}</span>
                                            {msg.user_id === 'admin-1' && <span className="bg-ministry-gold/10 text-ministry-gold text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">Prof</span>}
                                        </div>
                                        <div className={`p-3 rounded-2xl rounded-tl-none text-xs ${msg.user_id === studentId ? 'bg-ministry-blue text-white' : 'bg-white border border-gray-100 text-gray-600'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tire aqui a sua dúvida..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 pl-4 pr-12 text-xs font-bold outline-none focus:ring-2 focus:ring-ministry-blue transition"
                                    />
                                    <button type="submit" className="absolute right-2 top-2 bottom-2 px-3 bg-ministry-gold text-white rounded-lg hover:bg-ministry-blue transition flex items-center justify-center">
                                        <Send size={14} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProfileView = ({ student, isEditing, onEdit, onCancel, onSave }: any) => {
    const [editData, setEditData] = useState(student);

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-ministry-blue uppercase tracking-tighter mb-2">Meu Perfil</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Gerencie suas informações de estudante.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={onEdit}
                        className="flex items-center space-x-2 px-6 py-3 border-2 border-ministry-blue text-ministry-blue rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-ministry-blue hover:text-white transition-all"
                    >
                        <Settings size={16} />
                        <span>Editar Perfil</span>
                    </button>
                )}
            </header>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
                <div className="h-40 bg-ministry-blue relative">
                    <div className="absolute -bottom-16 left-12 p-2 bg-white rounded-[2rem] shadow-xl">
                        <div className="w-32 h-32 rounded-[1.5rem] bg-gray-100 overflow-hidden relative group">
                            <div className="w-full h-full flex items-center justify-center text-ministry-blue text-4xl font-black">
                                {student.fullName.charAt(0)}
                            </div>
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="text-white" size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-24 pb-12 px-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <ProfileField label="Nome Completo" value={editData.fullName} isEditing={isEditing} onChange={(v: string) => setEditData({ ...editData, fullName: v })} />
                    <ProfileField label="E-mail" value={editData.email} isEditing={isEditing} onChange={(v: string) => setEditData({ ...editData, email: v })} />
                    <ProfileField label="Telefone" value={editData.phone} isEditing={isEditing} onChange={(v: string) => setEditData({ ...editData, phone: v })} />
                    <ProfileField label="País" value={editData.country} isEditing={isEditing} onChange={(v: string) => setEditData({ ...editData, country: v })} />
                    <ProfileField label="Cidade" value={editData.city} isEditing={isEditing} onChange={(v: string) => setEditData({ ...editData, city: v })} />
                    <ProfileField label="Bairro" value={editData.neighborhood} isEditing={isEditing} onChange={(v: string) => setEditData({ ...editData, neighborhood: v })} />

                    <div className="md:col-span-2 pt-6 border-t border-slate-50">
                        <h4 className="text-[10px] font-black text-ministry-gold uppercase tracking-[0.3em] mb-6 underline decoration-2 underline-offset-8">Dados da Igreja Local</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <ProfileField label="Nome da Igreja" value={editData.churchName} isEditing={isEditing} onChange={(v: string) => setEditData({ ...editData, churchName: v })} />
                            <ProfileField label="Telefone da Igreja" value={editData.churchPhone} isEditing={isEditing} onChange={(v: string) => setEditData({ ...editData, churchPhone: v })} />
                            <div className="md:col-span-2">
                                <ProfileField label="Endereço Completo da Igreja" value={editData.churchAddress} isEditing={isEditing} onChange={(v: string) => setEditData({ ...editData, churchAddress: v })} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status da Conta</label>
                        <div className="flex items-center space-x-2 text-green-600 font-black text-xs uppercase tracking-widest bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                            <ShieldCheck size={16} />
                            <span>Ativo • Aluno Verificado</span>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="md:col-span-2 flex space-x-4 pt-8">
                            <button
                                onClick={() => onSave(editData)}
                                className="flex-grow py-5 bg-ministry-blue text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-ministry-gold transition-all flex items-center justify-center space-x-3"
                            >
                                <Save size={18} />
                                <span>Salvar Alterações</span>
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-10 py-5 border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center space-x-3"
                            >
                                <X size={18} />
                                <span>Cancelar</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const VideoPlayerModal = ({ title, url, onClose }: { title: string, url: string, onClose: () => void }) => {
    const getEmbedUrl = (rawUrl: string) => {
        if (!rawUrl) return '';
        if (rawUrl.includes('youtube.com/watch?v=')) return rawUrl.replace('watch?v=', 'embed/');
        if (rawUrl.includes('youtu.be/')) return rawUrl.replace('youtu.be/', 'youtube.com/embed/');
        if (rawUrl.includes('drive.google.com')) {
            const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;
            return rawUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview');
        }
        if (rawUrl.startsWith('/uploads')) return `${window.location.origin}/api/school${rawUrl}`;
        return rawUrl;
    };

    const isDirectVideo = url && (url.startsWith('/uploads') || url.endsWith('.mp4') || url.endsWith('.webm'));
    const embedUrl = getEmbedUrl(url);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-ministry-blue/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-ministry-gold uppercase tracking-[0.3em] mb-1">Assistindo agora</p>
                        <h3 className="text-2xl font-black text-ministry-blue uppercase tracking-tight">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="aspect-video bg-black">
                    {isDirectVideo ? (
                        <video src={url} controls className="w-full h-full" autoPlay />
                    ) : embedUrl ? (
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="autoplay; fullscreen"
                            title={title}
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                            <Video size={64} />
                            <p className="font-black uppercase tracking-widest text-xs">Vídeo não disponível</p>
                        </div>
                    )}
                </div>
                <div className="p-8 bg-slate-50 flex justify-between items-center">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Escola de Fundação Christ Embassy Angola</p>
                    <button onClick={onClose} className="px-8 py-4 bg-ministry-blue text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-ministry-gold transition-all shadow-lg">
                        Concluído
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- HELPERS ---

const SidebarLink = ({ icon: Icon, label, active, onClick, isLive }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${active ? 'bg-ministry-gold text-white shadow-xl translate-x-2' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
        <div className="flex items-center space-x-4">
            <Icon size={20} />
            <span>{label}</span>
        </div>
        {isLive && (
            <span className="flex items-center space-x-1 bg-red-500 text-[8px] px-2 py-0.5 rounded-full animate-pulse shadow-lg text-white font-black">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span>AO VIVO</span>
            </span>
        )}
    </button>
);

const StatCard = ({ icon: Icon, label, value, color, bg }: any) => (
    <div className={`p-8 rounded-[2rem] border border-gray-100 bg-white shadow-sm flex items-center space-x-6`}>
        <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black text-ministry-blue uppercase`}>{value}</p>
        </div>
    </div>
);

const ProfileField = ({ label, value, isEditing, onChange }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        {isEditing ? (
            <input
                type="text"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-ministry-gold rounded-xl px-6 py-4 text-sm font-bold outline-none transition"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        ) : (
            <p className="text-sm font-black text-ministry-blue border-b border-gray-100 pb-2">{value}</p>
        )}
    </div>
);

const LayoutDashboardIcon = ({ size }: { size?: number }) => (
    <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9"></rect>
        <rect x="14" y="3" width="7" height="5"></rect>
        <rect x="14" y="11" width="7" height="10"></rect>
        <rect x="3" y="15" width="7" height="6"></rect>
    </svg>
);

const ShieldCheck = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
    </svg>
);

// Custom Animations
const globalStyles = `
  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  .animate-bounce-subtle {
    animation: bounce-subtle 2s infinite ease-in-out;
  }
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(globalStyles));
    document.head.appendChild(style);
}

export default StudentPortal;
