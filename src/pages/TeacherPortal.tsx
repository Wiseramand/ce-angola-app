import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Video, Settings, LogOut, Search,
    UserCheck, AlertCircle, Save, X, Menu,
    MessageSquare, Send, Play, Plus, Clock, ChevronRight, BookOpen, Calendar,
    Mic, MicOff
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import { api } from '../services/api';

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

    const [myStudents, setMyStudents] = useState<any[]>([]);
    const [isLive, setIsLive] = useState(false);
    const [liveUrl, setLiveUrl] = useState('');
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [newChatMessage, setNewChatMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [devices, setDevices] = useState<{ video: MediaDeviceInfo[], audio: MediaDeviceInfo[] }>({ video: [], audio: [] });
    const [selectedVideo, setSelectedVideo] = useState('');
    const [selectedAudio, setSelectedAudio] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const signalingInterval = useRef<any>(null);

    const loadDevices = async () => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const v = allDevices.filter(d => d.kind === 'videoinput');
            const a = allDevices.filter(d => d.kind === 'audioinput');
            setDevices({ video: v, audio: a });
            if (v.length > 0 && !selectedVideo) setSelectedVideo(v[0].deviceId);
            if (a.length > 0 && !selectedAudio) setSelectedAudio(a[0].deviceId);
        } catch (e) { console.error(e); }
    };

    const startPreview = async () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }
        try {
            const constraints = {
                video: selectedVideo ? { deviceId: { exact: selectedVideo } } : true,
                audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current) videoRef.current.srcObject = newStream;

            // If already live, update tracks for all peers
            if (isLive) {
                peerConnections.current.forEach(pc => {
                    const senders = pc.getSenders();
                    newStream.getTracks().forEach(track => {
                        const sender = senders.find(s => s.track?.kind === track.kind);
                        if (sender) sender.replaceTrack(track);
                        else pc.addTrack(track, newStream);
                    });
                });
            }
        } catch (e) { alert("Erro ao acessar câmera/microfone"); }
    };

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicMuted(!audioTrack.enabled);
            }
        }
    };

    const createPeerConnection = (studentId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                api.school.live.sendSignal({
                    sender_id: `teacher-${teacher.id}`,
                    receiver_id: studentId,
                    type: 'candidate',
                    data: event.candidate
                });
            }
        };

        if (stream) {
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }

        return pc;
    };

    const handleSignaling = async () => {
        if (!teacher.id) return;
        const signals = await api.school.live.getSignals(`teacher-${teacher.id}`);
        for (const signal of signals) {
            let pc = peerConnections.current.get(signal.sender_id);

            if (signal.type === 'join') {
                console.log("Teacher: Received JOIN from", signal.sender_id);
                // Only create a new connection if we don't already have an active one
                if (pc && pc.signalingState !== "closed" && pc.connectionState !== "closed" && pc.connectionState !== "failed") {
                    console.log("Teacher: Ignoring JOIN because connection is already active.");
                    continue;
                }

                if (pc) pc.close();
                pc = createPeerConnection(signal.sender_id);
                peerConnections.current.set(signal.sender_id, pc);

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                console.log("Teacher: Sending OFFER to", signal.sender_id);
                await api.school.live.sendSignal({
                    sender_id: `teacher-${teacher.id}`,
                    receiver_id: signal.sender_id,
                    type: 'offer',
                    data: offer
                });
            } else if (signal.type === 'answer' && pc) {
                console.log("Teacher: Received ANSWER from", signal.sender_id);
                await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            } else if (signal.type === 'candidate' && pc) {
                console.log("Teacher: Received CANDIDATE from", signal.sender_id);
                await pc.addIceCandidate(new RTCIceCandidate(signal.data));
            }
        }
    };

    const handleGoLive = async () => {
        if (!teacher.id) {
            alert("Erro: ID do professor não encontrado. Tente sair e entrar novamente.");
            return;
        }
        if (!stream) {
            await startPreview();
        }
        if (!stream) {
            alert("Erro: Por favor, verifique se a sua câmera está ativa antes de iniciar.");
            return;
        }
        try {
            await api.system.updateConfig({
                is_teacher_live: true,
                live_teacher_name: teacher.fullName,
                live_teacher_id: `teacher-${teacher.id}`,
                school_live_url: 'WEBRTC_DIRECT'
            });
            setIsLive(true);
            if (signalingInterval.current) clearInterval(signalingInterval.current);
            signalingInterval.current = setInterval(handleSignaling, 2000);
            alert("VOCÊ ESTÁ AO VIVO! Os alunos podem entrar agora.");
        } catch (e: any) { alert("Erro ao iniciar transmissão: " + e.message); }
    };

    const handleEndLive = async () => {
        try {
            await api.system.updateConfig({
                is_teacher_live: false,
                live_teacher_name: '',
                live_teacher_id: '',
                school_live_url: ''
            });
            setIsLive(false);
            if (signalingInterval.current) clearInterval(signalingInterval.current);
            peerConnections.current.forEach(pc => pc.close());
            peerConnections.current.clear();
            await api.school.live.clearSignals(`teacher-${teacher.id}`);
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                setStream(null);
            }
            alert("Transmissão encerrada com sucesso.");
        } catch (e: any) {
            console.error("Teacher: End live error", e);
            alert("AVISO: Erro ao sincronizar com o servidor, mas a aula foi fechada localmente. Erro: " + e.message);
            setIsLive(false);
            if (signalingInterval.current) clearInterval(signalingInterval.current);
            peerConnections.current.forEach(pc => pc.close());
            peerConnections.current.clear();
        }
    };

    const handleForceStop = () => {
        setIsLive(false);
        if (signalingInterval.current) clearInterval(signalingInterval.current);
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
        alert("Encerrado localmente à força.");
    };

    const fetchChatMessages = async () => {
        try {
            const msgs = await api.chat.getMessages('school-live');
            setChatMessages(msgs);
        } catch (e) { }
    };

    useEffect(() => {
        let interval: any;
        if (isLive) {
            fetchChatMessages();
            interval = setInterval(fetchChatMessages, 3000);
        }
        return () => clearInterval(interval);
    }, [isLive]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChatMessage.trim()) return;
        try {
            await api.chat.sendMessage({
                userId: 'admin-1',
                username: teacher.fullName,
                text: newChatMessage,
                channel: 'school-live'
            });
            setNewChatMessage('');
            fetchChatMessages();
        } catch (e) { }
    };

    useEffect(() => {
        const loadPortalData = async () => {
            setIsLoading(true);
            try {
                const savedUser = localStorage.getItem('school_teacher');
                if (!savedUser) {
                    navigate('/school/teacher/login');
                    return;
                }
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

                if (parsed.id) {
                    const assignedStudents = await api.school.getTeacherStudents(parsed.id);
                    setMyStudents(assignedStudents || []);
                }

                await loadDevices();
                setTimeout(startPreview, 1000); // Auto-start preview after loading devices
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadPortalData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('school_teacher');
        navigate('/school/teacher/login');
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col md:flex-row relative overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-[60] shadow-lg">
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
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-80 bg-slate-900 text-white flex flex-col z-[80] shadow-2xl transition-transform duration-300
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
                    <div className="space-y-12 animate-in fade-in duration-500 overflow-visible">
                        <header className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Aulas ao Vivo</h1>
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Agende sessões interativas com seus alunos.</p>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Controls */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Status da Transmissão</h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                                <Video size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Sinal de Vídeo</p>
                                                <h4 className="text-sm font-black text-slate-900 uppercase">WebRTC Direct Stream</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={toggleMic}
                                                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${isMicMuted ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-slate-600 hover:text-blue-600 shadow-sm border border-gray-100'}`}
                                                title={isMicMuted ? "Ativar Microfone" : "Silenciar Microfone"}
                                            >
                                                {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {isMicMuted ? "MUDO" : "MIC ATIVO"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-grow space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Câmera</label>
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
                                                <option value="">OBS Audio / Padrão do Sistema</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {!isLive ? (
                                    <button
                                        onClick={handleGoLive}
                                        className="w-full px-12 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-red-700 transition-all"
                                    >
                                        Iniciar Transmissão
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={handleEndLive}
                                            className="w-full px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all"
                                        >
                                            Encerrar Aula
                                        </button>
                                        <button
                                            onClick={handleForceStop}
                                            className="w-full py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition"
                                        >
                                            Forçar Fechamento (Se travar)
                                        </button>
                                    </div>
                                )}

                                {/* Preview Screen */}
                                <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative group">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    <div className="absolute top-6 left-6 flex items-center space-x-2">
                                        <div className={`w-3 h-3 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'} rounded-full shadow-lg`}></div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">
                                            {isLive ? 'Live Preview' : 'Camera Preview'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Chat */}
                            <div className="h-full min-h-[600px] flex flex-col bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase text-xs tracking-tight">Chat em Tempo Real</h3>
                                        <p className={`text-[9px] font-bold uppercase mt-0.5 ${isLive ? 'text-green-500' : 'text-slate-400'}`}>
                                            {isLive ? 'Aula On-line' : 'Chat em Espera'}
                                        </p>
                                    </div>
                                    <MessageSquare size={18} className="text-slate-300" />
                                </div>
                                <div ref={chatContainerRef} className="flex-grow p-8 space-y-6 overflow-y-auto bg-slate-50/30 scrollbar-hide">
                                    {chatMessages.length === 0 && (
                                        <div className="text-center py-20">
                                            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Aguardando interações...</p>
                                        </div>
                                    )}
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.user_id === 'admin-1' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{msg.username}</span>
                                                {msg.user_id === 'admin-1' && <span className="bg-blue-600 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase">Professor</span>}
                                            </div>
                                            <div className={`p-4 rounded-2xl text-xs max-w-[85%] shadow-sm ${msg.user_id === 'admin-1' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-slate-700 rounded-tl-none'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-50 bg-white">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Escrever para a turma..."
                                            value={newChatMessage}
                                            onChange={e => setNewChatMessage(e.target.value)}
                                            className="w-full bg-slate-50 border border-gray-100 rounded-2xl py-4 pl-6 pr-14 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600 transition"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-3 top-3 bottom-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center active:scale-90 shadow-lg"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </form>
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
                                                        } as any;
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

export default TeacherPortal;
