
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Globe, Lock, Key, Check, X, RefreshCw, Power, Plus, Trash2, Shield, Settings, Link as LinkIcon, Radio
} from 'lucide-react';
import { useAuth } from '../App';
import Logo from '../components/Logo';

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  status: 'active' | 'blocked';
}

const AdminDashboard: React.FC = () => {
  const { system, updateStreamConfig } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });
  
  const [streamForm, setStreamForm] = useState({
    publicUrl: system.publicUrl,
    privateUrl: system.privateUrl,
    isPrivateMode: system.isPrivateMode
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    setNewUser({ name: '', username: '', password: '' });
    setIsModalOpen(false);
    fetchUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Remover acesso deste membro?")) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleStreamUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStreamConfig(streamForm);
    alert("Canais atualizados no satélite!");
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex">
      <aside className="w-80 bg-ministry-blue text-white hidden xl:flex flex-col">
        <div className="p-10 border-b border-white/5">
          <Logo className="h-20 w-auto mb-6" />
          <h2 className="text-xl font-display font-bold">Consola Master</h2>
        </div>
        <nav className="flex-grow p-6 space-y-3">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl ${activeTab === 'users' ? 'bg-ministry-gold text-white font-black' : 'hover:bg-white/5'}`}>
            <Lock size={18} /> <span>Gestão de Acessos</span>
          </button>
          <button onClick={() => setActiveTab('stream')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl ${activeTab === 'stream' ? 'bg-ministry-gold text-white font-black' : 'hover:bg-white/5'}`}>
            <Video size={18} /> <span>Controlo de Emissão</span>
          </button>
        </nav>
      </aside>

      <main className="flex-grow p-10 lg:p-16 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-4xl font-display font-black text-ministry-blue">Executivo Angola</h1>
          <button 
            onClick={() => {
              const newMode = !system.isPrivateMode;
              updateStreamConfig({ isPrivateMode: newMode });
              setStreamForm(s => ({ ...s, isPrivateMode: newMode }));
            }}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase ${system.isPrivateMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          >
            {system.isPrivateMode ? 'Modo Restrito' : 'Modo Público'}
          </button>
        </header>

        {activeTab === 'users' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-10 flex justify-between items-center">
              <h3 className="text-2xl font-black text-ministry-blue">Identidades Autorizadas</h3>
              <button onClick={() => setIsModalOpen(true)} className="bg-ministry-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center space-x-2">
                <Plus size={16} /> <span>Gerar Credencial</span>
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                  <th className="px-10 py-6">Membro</th>
                  <th className="px-10 py-6">Credenciais</th>
                  <th className="px-10 py-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-50">
                    <td className="px-10 py-6 font-bold">{u.name}</td>
                    <td className="px-10 py-6 text-xs text-slate-500">U: {u.username} | P: {u.password}</td>
                    <td className="px-10 py-6 text-center">
                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stream' && (
          <div className="bg-white rounded-[3rem] shadow-xl p-12">
            <h3 className="text-2xl font-black text-ministry-blue mb-8">Controlo de Sinais de Vídeo</h3>
            <form onSubmit={handleStreamUpdate} className="space-y-8 max-w-2xl">
              <input 
                type="text" 
                value={streamForm.publicUrl}
                onChange={(e) => setStreamForm({...streamForm, publicUrl: e.target.value})}
                placeholder="Link YouTube ou .m3u8 (Público)"
                className="w-full bg-slate-50 rounded-2xl py-5 px-6 border-0 focus:ring-2 focus:ring-ministry-gold"
              />
              <input 
                type="text" 
                value={streamForm.privateUrl}
                onChange={(e) => setStreamForm({...streamForm, privateUrl: e.target.value})}
                placeholder="Link da Transmissão Privada"
                className="w-full bg-slate-50 rounded-2xl py-5 px-6 border-0 focus:ring-2 focus:ring-ministry-gold"
              />
              <button type="submit" className="w-full py-5 bg-ministry-gold text-white rounded-2xl font-black shadow-xl">
                ATUALIZAR SATÉLITE
              </button>
            </form>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden">
              <div className="bg-ministry-blue p-8 text-white flex justify-between">
                <h3 className="font-bold uppercase text-xs tracking-widest">Nova Identidade</h3>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              <form onSubmit={handleAddUser} className="p-10 space-y-6">
                <input type="text" placeholder="Nome Completo" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none" />
                <input type="text" placeholder="Username" required value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none" />
                <input type="text" placeholder="Senha" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 outline-none" />
                <button type="submit" className="w-full py-4 bg-ministry-gold text-white rounded-2xl font-bold">GERAR ACESSO</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
