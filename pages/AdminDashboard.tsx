
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Trash2, RefreshCw, Globe, Save, Power, Server, Key, Lock, Shield, Plus, X, UserPlus, Fingerprint, Eye
} from 'lucide-react';
import { useAuth } from '../App';
import Logo from '../components/Logo';

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: 'active' | 'blocked';
  password?: string;
}

interface Visitor {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  country: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { system, updateStreamConfig } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'visitors' | 'streams'>('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form de Novo Membro Exclusivo
  const [newUser, setNewUser] = useState({
    fullname: '',
    username: '',
    password: '',
    email: '',
    phone: ''
  });

  // Form de Streams (Campos devem bater com o Backend em snake_case)
  const [streamForm, setStreamForm] = useState({
    public_url: system.publicUrl || '',
    public_server: '',
    public_key: '',
    public_title: system.publicTitle || '',
    public_description: system.publicDescription || '',
    private_url: system.privateUrl || '',
    private_server: '',
    private_key: '',
    private_title: system.privateTitle || '',
    private_description: system.privateDescription || '',
    is_private_mode: system.isPrivateMode
  });

  const loadFullSystem = async () => {
    const res = await fetch('/api/system');
    if (res.ok) {
      const data = await res.json();
      setStreamForm({
        public_url: data.public_url || '',
        public_server: data.public_server || '',
        public_key: data.public_key || '',
        public_title: data.public_title || '',
        public_description: data.public_description || '',
        private_url: data.private_url || '',
        private_server: data.private_server || '',
        private_key: data.private_key || '',
        private_title: data.private_title || '',
        private_description: data.private_description || '',
        is_private_mode: !!data.is_private_mode
      });
    }
  };

  useEffect(() => { loadFullSystem(); }, []);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      const res = await fetch('/api/admin/visitors');
      if (res.ok) {
        const data = await res.json();
        setVisitors(data);
      }
    } catch (e) {}
  };

  const handleToggleUser = async (user: ManagedUser) => {
    if (!confirm(`Deseja ${user.status === 'active' ? 'BLOQUEAR' : 'ATIVAR'} o acesso de ${user.name}?`)) return;
    const res = await fetch('/api/admin/users/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, status: user.status })
    });
    if (res.ok) fetchUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("⚠️ ATENÇÃO: Eliminar este utilizador permanentemente?")) return;
    const res = await fetch('/api/admin/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        alert("✅ Credenciais geradas com sucesso!");
        setShowCreateModal(false);
        setNewUser({ fullname: '', username: '', password: '', email: '', phone: '' });
        fetchUsers();
      } else {
        alert("Erro: Este ID já existe ou os dados são inválidos.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const generatePass = () => {
    const pass = Math.random().toString(36).substring(2, 10).toUpperCase();
    setNewUser({ ...newUser, password: pass });
  };

  const handleSaveStreams = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(streamForm)
      });
      if (res.ok) {
        alert("✅ Configurações de Transmissão Atualizadas com Sucesso!");
        await updateStreamConfig(streamForm);
      } else {
        alert("Falha ao salvar no servidor.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
    fetchVisitors();
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex">
      {/* Sidebar Admin */}
      <aside className="w-80 bg-ministry-blue text-white flex flex-col h-screen sticky top-0 shadow-2xl z-20">
        <div className="p-10 border-b border-white/10">
          <Logo className="h-12 w-auto mb-6" />
          <h2 className="text-xl font-display font-black uppercase tracking-tight">Consola Master</h2>
          <div className="flex items-center mt-3 space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Servidor Online</span>
          </div>
        </div>
        <nav className="flex-grow p-6 space-y-3">
          <button 
            onClick={() => setActiveTab('users')} 
            className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'users' ? 'bg-ministry-gold text-white shadow-xl shadow-ministry-gold/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Shield size={20} />
            <span>Membros Exclusivos</span>
          </button>
          <button 
            onClick={() => setActiveTab('visitors')} 
            className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'visitors' ? 'bg-ministry-gold text-white shadow-xl shadow-ministry-gold/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Eye size={20} />
            <span>Visitantes Online</span>
          </button>
          <button 
            onClick={() => setActiveTab('streams')} 
            className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'streams' ? 'bg-ministry-gold text-white shadow-xl shadow-ministry-gold/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Video size={20} />
            <span>Canais de Live</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-display font-black text-ministry-blue uppercase tracking-tighter">Administração Central</h1>
            <p className="text-slate-500 font-medium mt-1">
              {activeTab === 'users' ? 'Gestão de Credenciais e Acessos Restritos.' : activeTab === 'visitors' ? 'Pessoas registadas via formulário público.' : 'Configurações de Transmissão.'}
            </p>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => { fetchUsers(); fetchVisitors(); loadFullSystem(); }} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-ministry-blue transition">
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {activeTab === 'users' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest flex items-center">
                <Lock size={18} className="mr-3 text-ministry-gold" /> Acessos Gerados
              </h3>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-ministry-blue text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 hover:bg-ministry-gold transition-all shadow-lg"
              >
                <Plus size={16} />
                <span>Gerar Nova Credencial</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5 text-left">Membro</th>
                    <th className="px-8 py-5 text-left">ID / Password</th>
                    <th className="px-8 py-5 text-left">Estado</th>
                    <th className="px-8 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-6">
                        <div className="font-bold text-ministry-blue">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{u.email || 'S/ Email'}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="font-mono text-xs font-black text-ministry-gold uppercase tracking-tighter">ID: {u.username}</span>
                           <span className="font-mono text-[10px] text-slate-400">PW: {u.password}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {u.status === 'active' ? 'ATIVO' : 'BLOQUEADO'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleToggleUser(u)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-ministry-gold hover:text-white transition">
                            <Power size={18} />
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition">
                            <Trash2 size={18} />
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
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
             <div className="p-8 border-b border-slate-50 bg-slate-50/50">
               <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">Base de Dados de Registo Público</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="px-8 py-5 text-left">Visitante</th>
                     <th className="px-8 py-5 text-left">Contacto</th>
                     <th className="px-8 py-5 text-left">País</th>
                     <th className="px-8 py-5 text-right">Data Registo</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {visitors.map(v => (
                     <tr key={v.id} className="hover:bg-slate-50/50 transition">
                       <td className="px-8 py-6 font-bold text-ministry-blue">{v.fullname}</td>
                       <td className="px-8 py-6 text-slate-500 text-xs">{v.email}<br/>{v.phone}</td>
                       <td className="px-8 py-6 text-slate-500 text-xs font-bold uppercase">{v.country}</td>
                       <td className="px-8 py-6 text-right text-[10px] text-slate-400">{new Date(v.created_at).toLocaleDateString()}</td>
                     </tr>
                   ))}
                   {visitors.length === 0 && <tr><td colSpan={4} className="p-20 text-center text-slate-400 italic">Nenhum registo público encontrado.</td></tr>}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-8">Canal Público (Livre)</h3>
                <div className="space-y-5">
                  <InputField label="Título" value={streamForm.public_title} onChange={v => setStreamForm({...streamForm, public_title: v})} />
                  <InputField label="URL / Embed" value={streamForm.public_url} onChange={v => setStreamForm({...streamForm, public_url: v})} />
                  <InputField label="Descrição" value={streamForm.public_description} onChange={v => setStreamForm({...streamForm, public_description: v})} />
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border-t-[12px] border-ministry-gold">
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-8">Canal Exclusivo (Protegido)</h3>
                <div className="space-y-5">
                  <InputField label="Título da Conferência" value={streamForm.private_title} onChange={v => setStreamForm({...streamForm, private_title: v})} />
                  <InputField label="URL Privada" value={streamForm.private_url} onChange={v => setStreamForm({...streamForm, private_url: v})} />
                  <InputField label="Descrição Exclusiva" value={streamForm.private_description} onChange={v => setStreamForm({...streamForm, private_description: v})} />
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl mt-4">
                    <span className="text-[11px] font-black text-ministry-blue uppercase tracking-widest">Ativar Bloqueio Automático</span>
                    <button 
                      onClick={() => setStreamForm({...streamForm, is_private_mode: !streamForm.is_private_mode})}
                      className={`w-14 h-8 rounded-full relative transition duration-300 ${streamForm.is_private_mode ? 'bg-ministry-gold' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${streamForm.is_private_mode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSaveStreams} 
              disabled={isRefreshing}
              className="w-full py-7 bg-ministry-blue text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-ministry-gold transition-all flex items-center justify-center space-x-3"
            >
              {isRefreshing ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
              <span>PUBLICAR CONFIGURAÇÕES</span>
            </button>
          </div>
        )}
      </main>

      {/* Modal Criar Utilizador */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_35px_100px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="bg-ministry-blue p-10 text-white flex justify-between items-center">
              <h3 className="text-2xl font-display font-black uppercase tracking-tight">Novo Membro Exclusivo</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-10 space-y-6">
              <InputField label="Nome Completo" value={newUser.fullname} onChange={v => setNewUser({...newUser, fullname: v})} placeholder="Ex: Irmão Pedro" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">ID de Acesso</label>
                  <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value.toLowerCase().replace(/\s/g, '')})} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-black" placeholder="membro_01" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">Password</label>
                  <div className="flex space-x-2">
                    <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="flex-grow bg-slate-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-mono font-black text-ministry-gold" required />
                    <button type="button" onClick={generatePass} className="p-4 bg-slate-100 rounded-2xl hover:bg-ministry-gold hover:text-white transition"><RefreshCw size={20}/></button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <InputField label="Email (Opcional)" value={newUser.email} onChange={v => setNewUser({...newUser, email: v})} />
                <InputField label="Telefone (Opcional)" value={newUser.phone} onChange={v => setNewUser({...newUser, phone: v})} />
              </div>
              <button type="submit" disabled={isRefreshing} className="w-full py-6 bg-ministry-blue text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-ministry-gold transition-all">
                {isRefreshing ? 'GERANDO...' : 'ATIVAR ACESSO AGORA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold text-ministry-blue" 
    />
  </div>
);

export default AdminDashboard;
