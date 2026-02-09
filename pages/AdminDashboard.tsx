
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Globe, Lock, Check, X, Plus, Trash2, Edit2, Copy, Radio, MessageSquare, Info, Layout
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

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', username: '', password: '' });
  
  // Stream Forms
  const [publicStream, setPublicStream] = useState({
    url: system.publicUrl,
    title: system.publicTitle,
    description: system.publicDescription
  });

  const [privateStream, setPrivateStream] = useState({
    url: system.privateUrl,
    title: system.privateTitle,
    description: system.privateDescription
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

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editMode ? `/api/admin/users/${editMode}` : '/api/admin/users';
    const method = editMode ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });

    setUserForm({ name: '', username: '', password: '' });
    setEditMode(null);
    setIsModalOpen(false);
    fetchUsers();
  };

  const handleEditClick = (user: ManagedUser) => {
    setEditMode(user.id);
    setUserForm({ name: user.name, username: user.username, password: user.password || '' });
    setIsModalOpen(true);
  };

  const handleCopy = (user: ManagedUser) => {
    const text = `Acesso Christ Embassy Angola\nUtilizador: ${user.username}\nSenha: ${user.password}\nLink: ${window.location.origin}/#/login`;
    navigator.clipboard.writeText(text);
    alert(`Credenciais de ${user.name} copiadas!`);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Remover acesso deste membro permanentemente?")) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleStreamSave = async () => {
    await updateStreamConfig({
      publicUrl: publicStream.url,
      publicTitle: publicStream.title,
      publicDescription: publicStream.description,
      privateUrl: privateStream.url,
      privateTitle: privateStream.title,
      privateDescription: privateStream.description
    });
    alert("Configurações de Satélite atualizadas com sucesso!");
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex">
      <aside className="w-80 bg-ministry-blue text-white hidden xl:flex flex-col sticky top-0 h-screen">
        <div className="p-10 border-b border-white/5">
          <Logo className="h-16 w-auto mb-4" />
          <h2 className="text-xl font-display font-bold">Consola Master</h2>
          <p className="text-xs text-ministry-gold font-bold uppercase tracking-widest mt-1">Executivo Angola</p>
        </div>
        <nav className="flex-grow p-6 space-y-2">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition ${activeTab === 'users' ? 'bg-ministry-gold text-white font-black shadow-lg shadow-ministry-gold/20' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
            <Users size={18} /> <span>Membros e Acessos</span>
          </button>
          <button onClick={() => setActiveTab('stream')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition ${activeTab === 'stream' ? 'bg-ministry-gold text-white font-black shadow-lg shadow-ministry-gold/20' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
            <Video size={18} /> <span>Canais de Emissão</span>
          </button>
        </nav>
      </aside>

      <main className="flex-grow p-10 lg:p-16 overflow-y-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-ministry-blue border border-slate-100">
               {activeTab === 'users' ? <Users size={24} /> : <Radio size={24} />}
            </div>
            <h1 className="text-3xl font-display font-black text-ministry-blue">
              {activeTab === 'users' ? 'Gestão de Identidades' : 'Controlo de Satélite'}
            </h1>
          </div>
          <button 
            onClick={() => updateStreamConfig({ isPrivateMode: !system.isPrivateMode })}
            className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 shadow-xl transition active:scale-95 ${system.isPrivateMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          >
            <Lock size={16} />
            <span>{system.isPrivateMode ? 'Modo de Segurança Ativo' : 'Modo Público Ativo'}</span>
          </button>
        </header>

        {activeTab === 'users' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-ministry-blue">Membros Autorizados</h3>
                <p className="text-sm text-gray-500 mt-1">Gerencie quem tem acesso às transmissões exclusivas.</p>
              </div>
              <button 
                onClick={() => { setEditMode(null); setUserForm({ name: '', username: '', password: '' }); setIsModalOpen(true); }} 
                className="bg-ministry-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center space-x-3 hover:bg-opacity-90 shadow-xl shadow-blue-900/10 transition"
              >
                <Plus size={16} /> <span>Nova Credencial</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-10 py-6">Nome do Membro</th>
                    <th className="px-10 py-6">Utilizador</th>
                    <th className="px-10 py-6">Senha Master</th>
                    <th className="px-10 py-6 text-center">Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/30 transition">
                      <td className="px-10 py-6">
                        <div className="font-bold text-ministry-blue">{u.name}</div>
                        <div className="text-[10px] text-green-500 font-bold uppercase mt-0.5 flex items-center">
                          <Check size={10} className="mr-1" /> Acesso Ativo
                        </div>
                      </td>
                      <td className="px-10 py-6 text-sm font-medium text-slate-600 font-mono bg-slate-50/20">{u.username}</td>
                      <td className="px-10 py-6 text-sm text-slate-400 font-mono tracking-tighter">{u.password}</td>
                      <td className="px-10 py-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleCopy(u)} className="p-3 text-slate-400 hover:text-ministry-gold bg-slate-50 rounded-xl transition" title="Copiar Dados"><Copy size={16} /></button>
                          <button onClick={() => handleEditClick(u)} className="p-3 text-slate-400 hover:text-blue-500 bg-slate-50 rounded-xl transition" title="Editar"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition" title="Remover"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-400 italic">Nenhum membro autorizado no sistema.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stream' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Canal Público */}
            <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100">
              <div className="flex items-center space-x-3 mb-8">
                 <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><Globe size={20} /></div>
                 <h3 className="text-xl font-black text-ministry-blue">Canal Público (Aberto)</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Link da Transmissão (YouTube / OBS)</label>
                  <input type="text" value={publicStream.url} onChange={e => setPublicStream({...publicStream, url: e.target.value})} placeholder="Ex: https://youtube.com/live/..." className="w-full bg-slate-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-ministry-gold text-sm font-medium" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Título da Transmissão</label>
                  <input type="text" value={publicStream.title} onChange={e => setPublicStream({...publicStream, title: e.target.value})} placeholder="Ex: Culto de Domingo Online" className="w-full bg-slate-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-ministry-gold text-sm font-medium" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Descrição</label>
                  <textarea rows={3} value={publicStream.description} onChange={e => setPublicStream({...publicStream, description: e.target.value})} placeholder="Mensagem para os visitantes..." className="w-full bg-slate-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-ministry-gold text-sm font-medium" />
                </div>
              </div>
            </div>

            {/* Canal Exclusivo */}
            <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100">
              <div className="flex items-center space-x-3 mb-8">
                 <div className="w-10 h-10 bg-ministry-gold/10 text-ministry-gold rounded-xl flex items-center justify-center"><Lock size={20} /></div>
                 <h3 className="text-xl font-black text-ministry-blue">Canal Exclusivo (Obreiros)</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Link Restrito (OBS / m3u8)</label>
                  <input type="text" value={privateStream.url} onChange={e => setPrivateStream({...privateStream, url: e.target.value})} placeholder="Ex: https://meu-servidor.com/stream.m3u8" className="w-full bg-slate-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-ministry-gold text-sm font-medium" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Título Privado</label>
                  <input type="text" value={privateStream.title} onChange={e => setPrivateStream({...privateStream, title: e.target.value})} placeholder="Ex: Conferência de Pastores" className="w-full bg-slate-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-ministry-gold text-sm font-medium" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Descrição Restrita</label>
                  <textarea rows={3} value={privateStream.description} onChange={e => setPrivateStream({...privateStream, description: e.target.value})} placeholder="Informações exclusivas..." className="w-full bg-slate-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-ministry-gold text-sm font-medium" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <button 
                onClick={handleStreamSave}
                className="w-full py-6 bg-ministry-blue text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-opacity-95 transition active:scale-[0.98]"
              >
                PUBLICAR ALTERAÇÕES NOS CANAIS
              </button>
            </div>
          </div>
        )}

        {/* Modal Utilizador */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/20">
              <div className="bg-ministry-blue p-10 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold uppercase text-xs tracking-[0.3em] opacity-60 mb-1">{editMode ? 'Atualizar Membro' : 'Novo Membro'}</h3>
                  <p className="text-xl font-display font-bold">{editMode ? 'Editar Identidade' : 'Criar Credencial'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"><X /></button>
              </div>
              <form onSubmit={handleUserSubmit} className="p-10 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Nome Completo</label>
                  <input type="text" placeholder="Irmão / Pastor..." required value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold transition" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Nome de Utilizador</label>
                  <input type="text" placeholder="username_identidade" required value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold transition font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Senha de Acesso</label>
                  <input type="text" placeholder="Crie uma senha forte" required value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold transition font-mono" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-5 bg-ministry-gold text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:opacity-95 transition">
                    {editMode ? 'SALVAR ALTERAÇÕES' : 'GERAR ACESSO IMEDIATO'}
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

export default AdminDashboard;
