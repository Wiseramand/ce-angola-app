import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users, Video, Shield, RefreshCw, ArrowLeft, UserPlus, FileSpreadsheet, Printer, X, Save, Calendar, Clock, Filter, Edit2, Trash2, Share2, Copy, Mail, MessageCircle, ExternalLink,
  LogOut, Radio, LayoutDashboard, Search, Settings, Check, ShieldAlert, Key, Loader2, Play, GraduationCap
} from 'lucide-react';
import { useAuth } from '../App';
import Logo from '../components/Logo';
import { api } from '../services/api';

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  password?: string;
}

interface Visitor {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  neighborhood: string;
  created_at: string;
}

interface SchoolRequest {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  is_member: boolean;
  church_name: string;
  church_address: string;
  church_phone: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, updateStreamConfig } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'visitors' | 'streams' | 'school'>('members');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [schoolRequests, setSchoolRequests] = useState<SchoolRequest[]>([]);
  const [schoolUsers, setSchoolUsers] = useState<any[]>([]);
  const [schoolModules, setSchoolModules] = useState<any[]>([]);
  const [schoolSubTab, setSchoolSubTab] = useState<'requests' | 'students' | 'teachers' | 'media'>('requests');
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [newTeacher, setNewTeacher] = useState({ fullname: '', username: '', password: '', email: '', phone: '' });
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', video_url: '', module_order: 1 });
  const [selectedRequest, setSelectedRequest] = useState<SchoolRequest | null>(null);
  const [credentials, setCredentials] = useState<{ username: string, password: string, phone: string, email: string } | null>(null);

  // Filtros de Data e Hora
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [newUser, setNewUser] = useState({ fullname: '', username: '', password: '' });
  const [streamForm, setStreamForm] = useState({
    public_url: '',
    public_url2: '',
    public_title: '',
    public_description: '',
    private_url: '',
    private_url2: '',
    private_title: '',
    private_description: '',
    is_private_mode: false
  });

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [usersData, visitorsData, sData] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getVisitors(),
        api.system.getConfig()
      ]);

      if (usersData) setUsers(usersData);
      if (visitorsData) setVisitors(visitorsData);
      if (sData) {
        setStreamForm({
          public_url: sData.public_url || '',
          public_url2: sData.public_url2 || '',
          public_title: sData.public_title || '',
          public_description: sData.public_description || '',
          private_url: sData.private_url || '',
          private_url2: sData.private_url2 || '',
          private_title: sData.private_title || '',
          private_description: sData.private_description || '',
          is_private_mode: !!sData.is_private_mode
        });
      }

      const [sRequests, sUsers, sModules] = await Promise.all([
        api.school.getRequests(),
        api.school.getUsers(),
        api.school.getModules()
      ]);
      if (sRequests) setSchoolRequests(sRequests);
      if (sUsers) setSchoolUsers(sUsers);
      if (sModules) setSchoolModules(sModules);
    } catch (e) { console.error(e); } finally { setIsRefreshing(false); }
  };

  const filteredVisitors = visitors.filter(v => {
    if (!filterStart && !filterEnd) return true;
    const vDate = new Date(v.created_at).getTime();
    const start = filterStart ? new Date(filterStart).getTime() : 0;
    const end = filterEnd ? new Date(filterEnd).getTime() : Infinity;
    return vDate >= start && vDate <= end;
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    try {
      if (editingUser) {
        await api.admin.createUser({ ...newUser, id: editingUser.id });
        alert("Membro atualizado com sucesso!");
      } else {
        await api.admin.createUser(newUser);
        alert("Membro criado com sucesso!");
      }
      setShowUserModal(false);
      setEditingUser(null);
      setNewUser({ fullname: '', username: '', password: '' });
      loadData();
    } catch (e) {
      alert("Erro ao salvar membro.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar este membro?")) return;
    setIsRefreshing(true);
    try {
      await api.admin.deleteUser(id);
      loadData();
    } catch (e) {
      alert("Erro ao eliminar membro.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditUser = (u: ManagedUser) => {
    setEditingUser(u);
    setNewUser({ fullname: u.name, username: u.username, password: u.password || '' });
    setShowUserModal(true);
  };

  const generateCredentials = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const firstName = newUser.fullname.split(' ')[0].toLowerCase() || 'membro';
    const generatedUsername = `${firstName}_${randomNum}`;
    const generatedPassword = Math.random().toString(36).slice(-8);
    setNewUser({ ...newUser, username: generatedUsername, password: generatedPassword });
  };

  const getLoginLink = () => `${window.location.origin}/login`;

  const shareViaWhatsApp = (u: ManagedUser) => {
    const text = `Olá ${u.name}, aqui estão as suas credenciais de acesso exclusivo:\n\nLink: ${getLoginLink()}\nUsuário: ${u.username}\nSenha: ${u.password}\n\nSeja bem-vindo!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = (u: ManagedUser) => {
    const subject = "Suas Credenciais de Acesso - Christ Embassy Angola";
    const body = `Olá ${u.name},\n\nAqui estão as suas credenciais para a área exclusiva da Christ Embassy Angola:\n\nLink de Acesso: ${getLoginLink()}\nUsuário: ${u.username}\nSenha: ${u.password}\n\nDeus o abençoe!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyCredentials = (u: ManagedUser) => {
    const text = `Acesso Exclusivo:\nLink: ${getLoginLink()}\nUsuário: ${u.username}\nSenha: ${u.password}`;
    navigator.clipboard.writeText(text);
    alert("Credenciais copiadas!");
  };

  const exportVisitors = () => {
    if (filteredVisitors.length === 0) return;
    const headers = "Nome,Email,Telefone,Pais,Cidade,Bairro,Data,Hora\n";
    const rows = filteredVisitors.map(v => {
      const d = new Date(v.created_at);
      return `"${v.fullname}","${v.email}","${v.phone}","${v.country}","${v.city}","${v.neighborhood}","${d.toLocaleDateString()}","${d.toLocaleTimeString()}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `export_visitors_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveStreams = async () => {
    setIsRefreshing(true);
    try {
      await api.system.updateConfig(streamForm);
      alert('Canais atualizados!');
      await updateStreamConfig(streamForm);
    } catch (e) {
      alert("Erro ao atualizar canais.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApproveSchool = async (id: number) => {
    setIsRefreshing(true);
    try {
      await api.school.approveRequest(id, 'approve');
      alert("Solicitação aprovada. O aluno agora aparece na lista de Alunos para geração de credenciais.");
      loadData();
    } catch (e) {
      alert("Erro ao aprovar solicitação.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateSchoolCredentials = async (studentId: number) => {
    setIsRefreshing(true);
    try {
      const res = await api.school.generateCredentials(studentId);
      if (res.success) {
        setCredentials(res.credentials);
        setShowSchoolModal(true);
        loadData();
      }
    } catch (e) {
      alert("Erro ao gerar credenciais.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRejectSchool = async (id: number) => {
    if (!confirm("Rejeitar esta solicitação?")) return;
    setIsRefreshing(true);
    try {
      await api.school.approveRequest(id, 'reject');
      loadData();
    } catch (e) {
      alert("Erro ao rejeitar solicitação.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const shareSchoolCredentials = (type: 'wa' | 'email') => {
    if (!credentials) return;
    const loginLink = `${window.location.origin}/school/login`;
    const text = `Parabéns! Sua solicitação para a Escola de Fundação foi aprovada.\n\nLink: ${loginLink}\nUsuário: ${credentials.username}\nSenha: ${credentials.password}\n\nDeus o abençoe!`;

    if (type === 'wa') {
      window.open(`https://wa.me/${credentials.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.location.href = `mailto:${credentials.email}?subject=Credenciais Escola de Fundação&body=${encodeURIComponent(text)}`;
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    try {
      await api.school.saveUser({ ...newTeacher, role: 'teacher' });
      setShowTeacherModal(false);
      setNewTeacher({ fullname: '', username: '', password: '', email: '', phone: '' });
      loadData();
    } catch (e) {
      alert("Erro ao salvar professor.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    try {
      if (editingModule) {
        await api.school.saveModule({ ...moduleForm, id: editingModule.id });
      } else {
        await api.school.saveModule(moduleForm);
      }
      setShowModuleModal(false);
      setEditingModule(null);
      setModuleForm({ title: '', description: '', video_url: '', module_order: schoolModules.length + 1 });
      loadData();
    } catch (e) {
      alert("Erro ao salvar módulo.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteSchoolUser = async (id: number) => {
    if (!confirm("Eliminar este utilizador da escola?")) return;
    setIsRefreshing(true);
    try {
      await api.school.deleteUser(id);
      loadData();
    } catch (e) { console.error(e); } finally { setIsRefreshing(false); }
  };

  const handleDeleteModule = async (id: number) => {
    if (!confirm("Eliminar este módulo?")) return;
    setIsRefreshing(true);
    try {
      await api.school.deleteModule(id);
      loadData();
    } catch (e) { console.error(e); } finally { setIsRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex relative">
      <aside className="w-80 bg-ministry-blue text-white flex flex-col h-screen sticky top-0 shadow-2xl z-20 print:hidden">
        <div className="p-10 border-b border-white/10">
          <Logo className="h-12 w-auto mb-6 brightness-110" />
          <h2 className="text-xl font-display font-black uppercase tracking-tight text-ministry-gold">Master Admin</h2>
        </div>

        <nav className="flex-grow p-6 space-y-3">
          <button onClick={() => setActiveTab('members')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'members' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
            <Shield size={20} />
            <span>Gestão Membros</span>
          </button>
          <button onClick={() => setActiveTab('visitors')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'visitors' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
            <Users size={20} />
            <span>Visitantes</span>
          </button>
          <button onClick={() => setActiveTab('streams')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'streams' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
            <Video size={20} />
            <span>Canais TV</span>
          </button>
          <button onClick={() => setActiveTab('school')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'school' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
            <GraduationCap size={20} />
            <span>Escola de Fundação</span>
          </button>

          <div className="pt-10 border-t border-white/5 mt-10">
            <button onClick={() => navigate('/')} className="w-full flex items-center space-x-4 px-6 py-4 text-slate-400 hover:text-white transition font-bold text-xs uppercase">
              <ArrowLeft size={18} />
              <span>Sair do Painel</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-grow p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12 print:hidden">
          <div>
            <h1 className="text-4xl font-display font-black text-ministry-blue uppercase tracking-tighter">Administração</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Controlo Central Christ Embassy Angola</p>
          </div>
          <div className="flex space-x-4">
            {activeTab === 'visitors' && (
              <>
                <button onClick={exportVisitors} className="flex items-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition shadow-lg">
                  <FileSpreadsheet size={18} />
                  <span>Exportar CSV</span>
                </button>
                <button onClick={() => window.print()} className="flex items-center space-x-2 px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition shadow-lg">
                  <Printer size={18} />
                  <span>PDF / Imprimir</span>
                </button>
              </>
            )}
            <button onClick={loadData} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-ministry-blue transition border border-slate-100">
              <RefreshCw size={22} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {activeTab === 'visitors' && (
          <div className="mb-8 p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 print:hidden">
            <div className="flex items-center space-x-4 mb-6">
              <Filter size={18} className="text-ministry-gold" />
              <h3 className="font-black text-ministry-blue uppercase text-xs tracking-widest">Filtrar por Período (Dia/Mês/Ano e Hora)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Início do Período</label>
                <input
                  type="datetime-local"
                  value={filterStart}
                  onChange={(e) => setFilterStart(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-ministry-gold transition shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Fim do Período</label>
                <input
                  type="datetime-local"
                  value={filterEnd}
                  onChange={(e) => setFilterEnd(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-ministry-gold transition shadow-inner"
                />
              </div>
              <button
                onClick={() => { setFilterStart(''); setFilterEnd(''); }}
                className="px-6 py-3.5 text-[9px] font-black uppercase text-slate-400 hover:text-red-500 transition tracking-widest"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
              <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">{t('admin.members_title')}</h3>
              <button onClick={() => setShowUserModal(true)} className="flex items-center space-x-3 px-8 py-4 bg-ministry-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-ministry-gold transition-all">
                <UserPlus size={18} />
                <span>{t('admin.add_member')}</span>
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-b">
                    <th className="px-8 py-5">{t('admin.full_name')}</th>
                    <th className="px-8 py-5">{t('admin.username')}</th>
                    <th className="px-8 py-5">{t('admin.password')}</th>
                    <th className="px-8 py-5">{t('admin.actions')}</th>
                    <th className="px-8 py-5 text-right">{t('admin.share')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-bold uppercase text-xs">{t('admin.no_members')}</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-8 py-6 font-bold text-ministry-blue uppercase text-xs">{u.name}</td>
                      <td className="px-8 py-6 font-mono text-sm text-slate-500">{u.username}</td>
                      <td className="px-8 py-6 font-mono text-sm text-slate-500">{u.password}</td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditUser(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => shareViaWhatsApp(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="WhatsApp">
                            <MessageCircle size={16} />
                          </button>
                          <button onClick={() => shareViaEmail(u)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition" title="Email">
                            <Mail size={16} />
                          </button>
                          <button onClick={() => copyCredentials(u)} className="p-2 text-ministry-gold hover:bg-gold-50 rounded-lg transition" title="Copiar">
                            <Copy size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 print:hidden">
              <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">
                Visitantes Listados: {filteredVisitors.length}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase text-left border-b">
                    <th className="px-8 py-5">{t('admin.visitor')}</th>
                    <th className="px-8 py-5">{t('admin.contact')}</th>
                    <th className="px-8 py-5">{t('admin.location')}</th>
                    <th className="px-8 py-5 text-right">{t('admin.date_time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisitors.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold uppercase text-xs">{t('admin.no_visitors')}</td></tr>
                  ) : filteredVisitors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/30 transition">
                      <td className="px-8 py-6">
                        <div className="font-bold text-ministry-blue uppercase text-xs">{v.fullname}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{v.email || 'SEM EMAIL'}</div>
                      </td>
                      <td className="px-8 py-6 text-slate-500 text-xs font-bold">{v.phone}</td>
                      <td className="px-8 py-6">
                        <div className="text-xs font-black text-slate-600 uppercase">{v.city || 'Angola'}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{v.neighborhood || v.country}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-[10px] text-slate-600 font-black">{new Date(v.created_at).toLocaleDateString()}</div>
                        <div className="text-[9px] text-slate-400 font-bold">{new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 text-ministry-blue rounded-2xl flex items-center justify-center">
                  <Video size={24} />
                </div>
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight">Canal TV Público</h3>
              </div>
              <InputField label="URL Transmissão (Principal)" value={streamForm.public_url} onChange={v => setStreamForm({ ...streamForm, public_url: v })} />
              <InputField label="URL Transmissão (Suporte/Player 2)" value={streamForm.public_url2} onChange={v => setStreamForm({ ...streamForm, public_url2: v })} />
              <InputField label="Título da Emissão" value={streamForm.public_title} onChange={v => setStreamForm({ ...streamForm, public_title: v })} />
              <InputField label="Descrição" value={streamForm.public_description} onChange={v => setStreamForm({ ...streamForm, public_description: v })} />
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-ministry-gold/10 text-ministry-gold rounded-2xl flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight">Canal de Parceiros</h3>
              </div>
              <InputField label="URL Transmissão (Principal)" value={streamForm.private_url} onChange={v => setStreamForm({ ...streamForm, private_url: v })} />
              <InputField label="URL Transmissão (Suporte/Player 2)" value={streamForm.private_url2} onChange={v => setStreamForm({ ...streamForm, private_url2: v })} />
              <InputField label="Título Privado" value={streamForm.private_title} onChange={v => setStreamForm({ ...streamForm, private_title: v })} />

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-6">
                <div>
                  <span className="text-[11px] font-black text-ministry-blue uppercase tracking-widest block">Restringir Área Exclusiva</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Visitantes normais não poderão ver este sinal.</span>
                </div>
                <button onClick={() => setStreamForm({ ...streamForm, is_private_mode: !streamForm.is_private_mode })} className={`w-14 h-8 rounded-full relative transition duration-300 ${streamForm.is_private_mode ? 'bg-ministry-gold shadow-[0_0_15px_rgba(197,160,89,0.5)]' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${streamForm.is_private_mode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 pt-4">
              <button onClick={handleSaveStreams} className="w-full py-6 bg-ministry-blue text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-ministry-gold transition-all flex items-center justify-center space-x-4">
                <Save size={20} />
                <span>{t('admin.save_changes')}</span>
              </button>
            </div>
          </div>
        )}

        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ministry-blue/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => { setShowUserModal(false); setEditingUser(null); }} className="absolute top-8 right-8 text-slate-400 hover:text-ministry-blue transition">
                <X size={28} />
              </button>
              <h2 className="text-2xl font-black text-ministry-blue uppercase tracking-tighter mb-8">{editingUser ? 'Editar' : 'Criar'} Acesso de Membro</h2>
              <form onSubmit={handleAddUser} className="space-y-6">
                <InputField label="Nome do Membro" value={newUser.fullname} onChange={v => setNewUser({ ...newUser, fullname: v })} placeholder="Ex: Diácono Silva" />

                <div className="relative">
                  <InputField label="ID de Utilizador" value={newUser.username} onChange={v => setNewUser({ ...newUser, username: v })} placeholder="ex: silva_2025" />
                  {!editingUser && (
                    <button type="button" onClick={generateCredentials} className="absolute right-4 top-[38px] text-[9px] font-black uppercase text-ministry-gold hover:text-ministry-blue transition tracking-widest bg-white px-2">
                      Gerar Automático
                    </button>
                  )}
                </div>

                <InputField label="Senha Secreta" value={newUser.password} onChange={v => setNewUser({ ...newUser, password: v })} placeholder="Mínimo 6 caracteres" />

                <div className="pt-6">
                  <button type="submit" className="w-full py-6 bg-ministry-gold text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-ministry-blue transition-all">
                    {editingUser ? 'Guardar Alterações' : 'Ativar Credenciais'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {activeTab === 'school' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div>
                <h3 className="font-black text-ministry-blue uppercase text-lg tracking-tight">Escola de Fundação</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Gestão de Alunos, Professores e Conteúdo</p>
              </div>
              <nav className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button onClick={() => setSchoolSubTab('requests')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${schoolSubTab === 'requests' ? 'bg-white text-ministry-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Solicitações</button>
                <button onClick={() => setSchoolSubTab('students')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${schoolSubTab === 'students' ? 'bg-white text-ministry-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Alunos</button>
                <button onClick={() => setSchoolSubTab('teachers')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${schoolSubTab === 'teachers' ? 'bg-white text-ministry-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Professores</button>
                <button onClick={() => setSchoolSubTab('media')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${schoolSubTab === 'media' ? 'bg-white text-ministry-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Área Média</button>
              </nav>
            </header>

            {schoolSubTab === 'requests' && (
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-b">
                      <th className="px-8 py-5">Aluno</th>
                      <th className="px-8 py-5">Localização</th>
                      <th className="px-8 py-5">Membro?</th>
                      <th className="px-8 py-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schoolRequests.length === 0 ? (
                      <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold uppercase text-xs">Sem solicitações pendentes.</td></tr>
                    ) : schoolRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        <td className="px-8 py-6">
                          <div className="font-bold text-ministry-blue uppercase text-xs">{r.fullname}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{r.email} • {r.phone}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-[10px] font-black text-slate-600 uppercase">{r.city}, {r.state}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{r.neighborhood}, {r.country}</div>
                        </td>
                        <td className="px-8 py-6">
                          {r.is_member ? (
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-green-600 uppercase">Sim</span>
                              <span className="text-[9px] text-slate-400 font-bold truncate max-w-[150px]">{r.church_name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-slate-400 uppercase">Não</span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => setSelectedRequest(r)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition" title="Ver Detalhes">Ver Detalhes</button>
                            <button onClick={() => handleApproveSchool(r.id)} className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition">Aprovar</button>
                            <button onClick={() => handleRejectSchool(r.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition">Rejeitar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {schoolSubTab === 'students' && (
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-b">
                      <th className="px-8 py-5">Aluno</th>
                      <th className="px-8 py-5">Credenciais</th>
                      <th className="px-8 py-5">Data Registo</th>
                      <th className="px-8 py-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schoolUsers.filter(u => u.role === 'student').length === 0 ? (
                      <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold uppercase text-xs">Nenhum aluno registado.</td></tr>
                    ) : schoolUsers.filter(u => u.role === 'student').map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="px-8 py-6">
                          <div className="font-bold text-ministry-blue uppercase text-xs">{u.fullname}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{u.email} • {u.phone}</div>
                        </td>
                        <td className="px-8 py-6 font-mono text-[10px] text-slate-500">
                          {u.is_credentials_generated ? (
                            <span className="text-green-600 font-black">● {u.username}</span>
                          ) : (
                            <span className="text-orange-500 italic">Pendente</span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-[10px] text-slate-400 font-bold">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            {!u.is_credentials_generated && (
                              <button
                                onClick={() => handleGenerateSchoolCredentials(u.id)}
                                className="px-4 py-2 bg-ministry-gold text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:translate-y-[-1px] transition-all"
                              >
                                Gerar Credenciais
                              </button>
                            )}
                            <button onClick={() => handleDeleteSchoolUser(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {schoolSubTab === 'teachers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Docentes Ativos</h4>
                  <button onClick={() => setShowTeacherModal(true)} className="flex items-center space-x-2 px-6 py-3 bg-ministry-blue text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-ministry-gold transition shadow-md">
                    <UserPlus size={14} />
                    <span>Novo Professor</span>
                  </button>
                </div>
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-b">
                        <th className="px-8 py-5">Professor</th>
                        <th className="px-8 py-5">Login</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schoolUsers.filter(u => u.role === 'teacher').length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold uppercase text-xs">Nenhum professor registado.</td></tr>
                      ) : schoolUsers.filter(u => u.role === 'teacher').map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="px-8 py-6">
                            <div className="font-bold text-ministry-blue uppercase text-xs">{u.fullname}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{u.email}</div>
                          </td>
                          <td className="px-8 py-6 font-mono text-xs text-slate-500">{u.username}</td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">Ativo</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button onClick={() => handleDeleteSchoolUser(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {schoolSubTab === 'media' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currículo da Escola</h4>
                  <button onClick={() => {
                    setEditingModule(null);
                    setModuleForm({ title: '', description: '', video_url: '', module_order: schoolModules.length + 1 });
                    setShowModuleModal(true);
                  }}
                    className="flex items-center space-x-2 px-6 py-3 bg-ministry-blue text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-ministry-gold transition shadow-md"
                  >
                    <Video size={14} />
                    <span>Adicionar Módulo</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {schoolModules.map(m => (
                    <div key={m.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-between group hover:border-ministry-gold transition-all">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">{m.module_order}</span>
                          <div className="flex space-x-1">
                            <button onClick={() => {
                              setEditingModule(m);
                              setModuleForm({ title: m.title, description: m.description, video_url: m.video_url || '', module_order: m.module_order });
                              setShowModuleModal(true);
                            }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Editar"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteModule(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-ministry-blue uppercase tracking-tight">{m.title}</h5>
                          <p className="text-[10px] text-gray-500 font-medium line-clamp-2 mt-2">{m.description}</p>
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-50">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                          <div className={`flex items-center space-x-2 ${m.video_url ? 'text-green-500' : 'text-slate-300'}`}>
                            <Play size={14} />
                            <span>{m.video_url ? 'Vídeo OK' : 'Sem Vídeo'}</span>
                          </div>
                          <span className="text-slate-400 font-bold">Módulo {m.module_order}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de Detalhes da Solicitação */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
            <div className="bg-gray-900 border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Detalhes da Inscrição</h3>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">Verificação de Candidato</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                  <X className="text-gray-500" />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Nome Completo</label>
                    <p className="text-white font-bold">{selectedRequest.fullname}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Email</label>
                    <p className="text-white font-bold">{selectedRequest.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Telefone</label>
                    <p className="text-white font-bold">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Localização</label>
                    <p className="text-white font-bold">{selectedRequest.neighborhood}, {selectedRequest.city}</p>
                    <p className="text-xs text-gray-400">{selectedRequest.state}, {selectedRequest.country}</p>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Dados Eclesiásticos</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedRequest.is_member ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {selectedRequest.is_member ? 'Membro' : 'Não Membro'}
                    </span>
                  </div>

                  {selectedRequest.is_member && (
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Igreja</label>
                        <p className="text-white font-bold">{selectedRequest.church_name}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Endereço da Igreja</label>
                        <p className="text-white font-bold">{selectedRequest.church_address}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Telefone da Igreja</label>
                        <p className="text-white font-bold">{selectedRequest.church_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-white/5 flex gap-4">
                <button
                  onClick={() => {
                    handleApproveSchool(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="flex-grow py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                  Aprovar Agora
                </button>
                <button
                  onClick={() => {
                    handleRejectSchool(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="flex-grow py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        )}

        {showSchoolModal && credentials && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ministry-blue/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative animate-in zoom-in duration-300 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} />
              </div>
              <h2 className="text-2xl font-black text-ministry-blue uppercase tracking-tighter mb-2">Acesso Gerado!</h2>
              <p className="text-gray-500 text-sm font-medium mb-8">Envie as credenciais para o aluno iniciar o curso.</p>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-3 cursor-pointer hover:bg-slate-100 transition" onClick={() => {
                navigator.clipboard.writeText(`Usuário: ${credentials.username}\nSenha: ${credentials.password}`);
                alert("Copiado!");
              }}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Usuário</span>
                  <span className="text-sm font-black text-ministry-blue">{credentials.username}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Senha</span>
                  <span className="text-sm font-black text-ministry-blue">{credentials.password}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => shareSchoolCredentials('wa')} className="flex items-center justify-center space-x-2 py-4 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-green-700 transition">
                  <MessageCircle size={18} />
                  <span>WhatsApp</span>
                </button>
                <button onClick={() => shareSchoolCredentials('email')} className="flex items-center justify-center space-x-2 py-4 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition">
                  <Mail size={18} />
                  <span>E-mail</span>
                </button>
              </div>

              <button onClick={() => setShowSchoolModal(false)} className="mt-8 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-ministry-gold transition">Fechar Janela</button>
            </div>
          </div>
        )}

        {showTeacherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ministry-blue/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setShowTeacherModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-ministry-blue transition">
                <X size={28} />
              </button>
              <h2 className="text-2xl font-black text-ministry-blue uppercase tracking-tighter mb-8">Criar Acesso Professor</h2>
              <form onSubmit={handleSaveTeacher} className="space-y-6">
                <InputField label="Nome Completo" value={newTeacher.fullname} onChange={v => setNewTeacher({ ...newTeacher, fullname: v })} placeholder="Ex: Pr. Antunes" />
                <InputField label="Email" value={newTeacher.email} onChange={v => setNewTeacher({ ...newTeacher, email: v })} />
                <InputField label="ID de Utilizador" value={newTeacher.username} onChange={v => setNewTeacher({ ...newTeacher, username: v.toLowerCase() })} placeholder="ex: pr_antunes" />
                <InputField label="Senha Secreta" value={newTeacher.password} onChange={v => setNewTeacher({ ...newTeacher, password: v })} placeholder="Mínimo 6 caracteres" />
                <div className="pt-6">
                  <button type="submit" className="w-full py-6 bg-ministry-gold text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-ministry-blue transition-all">
                    Ativar Conta Professor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showModuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ministry-blue/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => { setShowModuleModal(false); setEditingModule(null); }} className="absolute top-8 right-8 text-slate-400 hover:text-ministry-blue transition">
                <X size={28} />
              </button>
              <h2 className="text-2xl font-black text-ministry-blue uppercase tracking-tighter mb-8">{editingModule ? 'Editar' : 'Novo'} Módulo</h2>
              <form onSubmit={handleSaveModule} className="space-y-6">
                <div className="grid grid-cols-4 gap-4 items-end">
                  <div className="col-span-3">
                    <InputField label="Título do Módulo" value={moduleForm.title} onChange={v => setModuleForm({ ...moduleForm, title: v })} placeholder="Ex: Módulo 1" />
                  </div>
                  <div className="col-span-1">
                    <InputField label="Ordem" value={String(moduleForm.module_order)} onChange={v => setModuleForm({ ...moduleForm, module_order: parseInt(v) || 1 })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase block ml-2 tracking-widest">Descrição do Conteúdo</label>
                  <textarea
                    value={moduleForm.description}
                    onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold text-sm min-h-[100px]"
                    placeholder="O que os alunos vão aprender?"
                  />
                </div>
                <InputField label="ID do Vídeo / URL" value={moduleForm.video_url} onChange={v => setModuleForm({ ...moduleForm, video_url: v })} placeholder="Link Drive ou Embed" />
                <div className="pt-6">
                  <button type="submit" className="w-full py-6 bg-ministry-blue text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-ministry-gold transition-all">
                    {editingModule ? 'Atualizar Módulo' : 'Publicar Módulo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder }: any) => (
  <div className="mb-6">
    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-2 tracking-widest">{label}</label>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold text-sm"
      placeholder={placeholder}
      required
    />
  </div>
);

export default AdminDashboard;
