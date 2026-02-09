
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Globe, Lock, Check, X, Plus, Trash2, Edit2, Copy, Radio, AlertTriangle, Database, Link2
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
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', username: '', password: '' });
  
  const [publicStream, setPublicStream] = useState({ url: '', title: '', description: '' });
  const [privateStream, setPrivateStream] = useState({ url: '', title: '', description: '' });

  useEffect(() => {
    if (system) {
      setPublicStream({
        url: system.publicUrl || '',
        title: system.publicTitle || '',
        description: system.publicDescription || ''
      });
      setPrivateStream({
        url: system.privateUrl || '',
        title: system.privateTitle || '',
        description: system.privateDescription || ''
      });
    }
  }, [system]);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setUsers(data);
        setError(null);
      } else {
        setError(data.message || "Erro ao carregar dados.");
      }
    } catch (e: any) { 
      setError("Conexão falhou. A base de dados Neon precisa de ser ligada ao novo projeto.");
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editMode ? `/api/admin/users/${editMode}` : '/api/admin/users';
    try {
      const res = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        alert("Erro ao salvar. Verifique o Storage da Vercel.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  };

  const handleStreamSave = async () => {
    try {
      await updateStreamConfig({
        publicUrl: publicStream.url,
        publicTitle: publicStream.title,
        publicDescription: publicStream.description,
        privateUrl: privateStream.url,
        privateTitle: privateStream.title,
        privateDescription: privateStream.description
      });
      alert("Canais atualizados!");
    } catch (e) {
      alert("Erro ao salvar canais. Base de dados não responde.");
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex">
      {/* Sidebar */}
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
        {error && (
          <div className="mb-12 p-10 bg-white border-2 border-red-100 rounded-[3rem] shadow-2xl animate-in slide-in-from-top duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center flex-shrink-0 shadow-inner">
                <Database size={40} />
              </div>
              <div className="flex-grow">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-2xl font-black text-red-600">Erro de Configuração Master</h3>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Status 500</span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                  Parece que o projeto foi renomeado. A base de dados precisa de ser conectada novamente ao novo projeto.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="text-ministry-gold mb-3"><Link2 size={24} /></div>
                    <p className="text-xs font-black text-slate-400 uppercase mb-2">Passo 1</p>
                    <p className="text-sm text-slate-700 font-bold">Clica em "Storage" no painel da Vercel.</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="text-ministry-gold mb-3"><Database size={24} /></div>
                    <p className="text-xs font-black text-slate-400 uppercase mb-2">Passo 2</p>
                    <p className="text-sm text-slate-700 font-bold">Escolhe "Neon (Serverless Postgres)".</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="text-ministry-gold mb-3"><Check size={24} /></div>
                    <p className="text-xs font-black text-slate-400 uppercase mb-2">Passo 3</p>
                    <p className="text-sm text-slate-700 font-bold">Clica em "Connect" e faz o "Redeploy".</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-display font-black text-ministry-blue uppercase tracking-tight">
              {activeTab === 'users' ? 'Identidades Master' : 'Satélite Angola'}
            </h1>
          </div>
          <button 
            onClick={() => updateStreamConfig({ isPrivateMode: !system.isPrivateMode })}
            className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 shadow-xl transition active:scale-95 ${system.isPrivateMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          >
            <Lock size={16} />
            <span>{system.isPrivateMode ? 'SEGURANÇA ATIVA' : 'SESSÃO PÚBLICA'}</span>
          </button>
        </header>

        {activeTab === 'users' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-10 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-ministry-blue">Membros com Acesso</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Base de Dados Neon</p>
              </div>
              <button 
                onClick={() => { setEditMode(null); setUserForm({ name: '', username: '', password: '' }); setIsModalOpen(true); }} 
                className="bg-ministry-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center space-x-3 shadow-xl hover:bg-opacity-90 transition"
              >
                <Plus size={16} /> <span>Gerar Novo Acesso</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-10 py-6">Membro</th>
                    <th className="px-10 py-6">ID de Acesso</th>
                    <th className="px-10 py-6">Chave Mestra</th>
                    <th className="px-10 py-6 text-center">Controlo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.length > 0 ? users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/30 transition group">
                      <td className="px-10 py-6">
                        <div className="font-bold text-ministry-blue">{u.name}</div>
                        <div className="text-[10px] text-green-500 font-bold uppercase mt-1">Sinal Ativo</div>
                      </td>
                      <td className="px-10 py-6 text-sm font-mono font-bold text-slate-600">{u.username}</td>
                      <td className="px-10 py-6 text-sm font-mono text-slate-400">{u.password}</td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setEditMode(u.id); setUserForm({ name: u.name, username: u.username, password: u.password || '' }); setIsModalOpen(true); }} className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition"><Edit2 size={16}/></button>
                           <button onClick={async () => { if(confirm("Remover este acesso permanentemente?")) { await fetch(`/api/admin/users/${u.id}`, {method:'DELETE'}); fetchUsers(); } }} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <Database size={48} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">A aguardar ligação com o Neon Postgres...</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stream' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
            <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100 flex flex-col h-full">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 text-ministry-blue rounded-2xl flex items-center justify-center">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-black text-ministry-blue">Transmissão Aberta</h3>
              </div>
              <div className="space-y-6 flex-grow">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-1">Link Global (YouTube / HLS)</label>
                  <input type="text" value={publicStream.url} onChange={e => setPublicStream({...publicStream, url: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold transition" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-1">Título do Evento</label>
                  <input type="text" value={publicStream.title} onChange={e => setPublicStream({...publicStream, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold transition" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-1">Descrição</label>
                  <textarea rows={3} value={publicStream.description} onChange={e => setPublicStream({...publicStream, description: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold transition" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100 flex flex-col h-full">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <h3 className="text-xl font-black text-ministry-blue">Transmissão Restrita</h3>
              </div>
              <div className="space-y-6 flex-grow">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-1">Link Exclusivo (Obreiros)</label>
                  <input type="text" value={privateStream.url} onChange={e => setPrivateStream({...privateStream, url: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold transition" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-1">Título Privado</label>
                  <input type="text" value={privateStream.title} onChange={e => setPrivateStream({...privateStream, title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold transition" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-1">Informação Restrita</label>
                  <textarea rows={3} value={privateStream.description} onChange={e => setPrivateStream({...privateStream, description: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold transition" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <button onClick={handleStreamSave} className="w-full py-8 bg-ministry-blue text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/20 hover:scale-[1.01] active:scale-[0.99] transition">
                PUBLICAR ALTERAÇÕES NOS CANAIS
              </button>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[4rem] overflow-hidden shadow-2xl">
              <div className="bg-ministry-blue p-12 text-white flex justify-between items-center">
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Identificação</h4>
                   <p className="text-2xl font-display font-bold">{editMode ? 'Editar Acesso' : 'Gerar Acesso'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition"><X /></button>
              </div>
              <form onSubmit={handleUserSubmit} className="p-12 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome do Membro</label>
                  <input type="text" placeholder="Ex: Pastor José" required value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ID de Acesso (Username)</label>
                  <input type="text" placeholder="Utilizador" required value={userForm.username} onChange={(e) => setUserForm({...userForm, username: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Chave Mestra (Senha)</label>
                  <input type="text" placeholder="Chave de segurança" required value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-0 focus:ring-2 focus:ring-ministry-gold font-mono" />
                </div>
                <button type="submit" className="w-full py-6 bg-ministry-gold text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:opacity-95 transition">
                  {editMode ? 'ATUALIZAR DADOS' : 'DESBLOQUEAR ACESSO AGORA'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
