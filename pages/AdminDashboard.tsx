
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Trash2, RefreshCw, Globe, Save, Power, Server, Key, Lock, Shield
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
}

const AdminDashboard: React.FC = () => {
  const { system, updateStreamConfig } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'streams'>('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Stream Settings Form
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

  // Load initial system data including server/key if they exist in system state
  useEffect(() => {
    // Re-fetch full system data to ensure server/key fields are populated
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
    loadFullSystem();
  }, []);

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

  const handleSaveStreams = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(streamForm)
      });
      if (res.ok) {
        alert("✅ Configurações de Transmissão Atualizadas!");
        await updateStreamConfig({
          publicUrl: streamForm.public_url,
          publicTitle: streamForm.public_title,
          publicDescription: streamForm.public_description,
          privateUrl: streamForm.private_url,
          privateTitle: streamForm.private_title,
          privateDescription: streamForm.private_description,
          isPrivateMode: streamForm.is_private_mode
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex">
      {/* Sidebar Admin */}
      <aside className="w-80 bg-ministry-blue text-white flex flex-col h-screen sticky top-0 shadow-2xl">
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
            <Users size={20} />
            <span>Gestão de Membros</span>
          </button>
          <button 
            onClick={() => setActiveTab('streams')} 
            className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'streams' ? 'bg-ministry-gold text-white shadow-xl shadow-ministry-gold/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Video size={20} />
            <span>Canais de Transmissão</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-display font-black text-ministry-blue uppercase tracking-tighter">Administração Central</h1>
            <p className="text-slate-500 font-medium mt-1">Configurações de rede e acessos comunitários.</p>
          </div>
          <button onClick={fetchUsers} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-ministry-blue transition">
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </header>

        {activeTab === 'users' ? (
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest flex items-center">
                <Shield size={18} className="mr-3 text-ministry-gold" /> Membros na Plataforma
              </h3>
              <span className="bg-ministry-blue text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{users.length} Registados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5 text-left">Nome / Contacto</th>
                    <th className="px-8 py-5 text-left">Username</th>
                    <th className="px-8 py-5 text-left">Acesso</th>
                    <th className="px-8 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-6">
                        <div className="font-bold text-ministry-blue">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{u.email} • {u.phone}</div>
                      </td>
                      <td className="px-8 py-6 font-mono text-sm text-slate-500">{u.username}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {u.status === 'active' ? 'ATIVO' : 'BLOQUEADO'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleToggleUser(u)}
                            className={`p-3 rounded-xl transition ${u.status === 'active' ? 'bg-orange-50 text-orange-500 hover:bg-orange-100' : 'bg-green-50 text-green-500 hover:bg-green-100'}`}
                            title={u.status === 'active' ? 'Bloquear Membro' : 'Ativar Membro'}
                          >
                            <Power size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                            title="Eliminar Permanente"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Nenhum membro encontrado</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cana Grátis */}
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-4 bg-blue-50 text-ministry-blue rounded-2xl"><Globe size={24}/></div>
                  <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight">Emissão Pública (Free)</h3>
                </div>
                <div className="space-y-5">
                  <InputField label="Título da Live" value={streamForm.public_title} onChange={v => setStreamForm({...streamForm, public_title: v})} />
                  <InputField label="Embed URL (YouTube ou .m3u8)" value={streamForm.public_url} onChange={v => setStreamForm({...streamForm, public_url: v})} placeholder="https://..." />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Servidor RTMP" value={streamForm.public_server} onChange={v => setStreamForm({...streamForm, public_server: v})} icon={<Server size={14}/>} />
                    <InputField label="Chave de Stream" value={streamForm.public_key} onChange={v => setStreamForm({...streamForm, public_key: v})} icon={<Key size={14}/>} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Breve Descrição</label>
                    <textarea 
                      value={streamForm.public_description}
                      onChange={e => setStreamForm({...streamForm, public_description: e.target.value})}
                      className="w-full bg-slate-50 rounded-2xl p-5 border-2 border-transparent focus:border-ministry-gold outline-none transition font-medium text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Canal Exclusivo */}
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border-t-[12px] border-ministry-gold">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-4 bg-orange-50 text-ministry-gold rounded-2xl"><Lock size={24}/></div>
                  <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight">Acesso Exclusivo (Private)</h3>
                </div>
                <div className="space-y-5">
                  <InputField label="Título da Conferência" value={streamForm.private_title} onChange={v => setStreamForm({...streamForm, private_title: v})} />
                  <InputField label="Embed URL Privado (.m3u8/YT)" value={streamForm.private_url} onChange={v => setStreamForm({...streamForm, private_url: v})} placeholder="https://..." />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Servidor RTMP" value={streamForm.private_server} onChange={v => setStreamForm({...streamForm, private_server: v})} icon={<Server size={14}/>} />
                    <InputField label="Chave de Stream" value={streamForm.private_key} onChange={v => setStreamForm({...streamForm, private_key: v})} icon={<Key size={14}/>} />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl mt-4">
                    <span className="text-[11px] font-black text-ministry-blue uppercase tracking-widest">Restringir Canal Automaticamente</span>
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
              className="w-full py-7 bg-ministry-blue text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-4"
            >
              <Save size={20} />
              <span>Publicar Configuração Global de Canais</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, icon }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </label>
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
