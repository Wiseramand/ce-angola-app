
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Globe, Lock, Check, X, Plus, Trash2, Edit2, Database, Link2, RefreshCw
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
  const { system, updateStreamConfig, refreshSystem } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', username: '', password: '' });
  
  const [publicStream, setPublicStream] = useState({ url: '', title: '', description: '' });

  const checkConnection = async () => {
    setDbStatus('checking');
    try {
      const res = await fetch('/api/system');
      if (res.ok) setDbStatus('online');
      else setDbStatus('offline');
    } catch {
      setDbStatus('offline');
    }
  };

  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setDbStatus('online');
      } else {
        setDbStatus('offline');
      }
    } catch (e) {
      setDbStatus('offline');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkConnection();
    fetchUsers();
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica simplificada para exemplo
    alert("A enviar dados para a base de dados...");
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-80 bg-ministry-blue text-white hidden xl:flex flex-col sticky top-0 h-screen">
        <div className="p-10 border-b border-white/5">
          <Logo className="h-16 w-auto mb-4" />
          <h2 className="text-xl font-display font-bold">Consola Master</h2>
          <p className="text-xs text-ministry-gold font-bold uppercase tracking-widest mt-1">Status: {dbStatus === 'online' ? '✅ LIGADO' : '❌ DESLIGADO'}</p>
        </div>
        <nav className="flex-grow p-6 space-y-2">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition ${activeTab === 'users' ? 'bg-ministry-gold text-white font-black' : 'text-gray-400 hover:text-white'}`}>
            <Users size={18} /> <span>Membros</span>
          </button>
          <button onClick={() => setActiveTab('stream')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition ${activeTab === 'stream' ? 'bg-ministry-gold text-white font-black' : 'text-gray-400 hover:text-white'}`}>
            <Video size={18} /> <span>Canais</span>
          </button>
        </nav>
      </aside>

      <main className="flex-grow p-10 lg:p-16">
        {dbStatus === 'offline' && (
          <div className="mb-12 p-8 bg-red-50 border-2 border-red-100 rounded-[2.5rem] flex items-center space-x-6 animate-pulse">
            <Database className="text-red-500" size={40} />
            <div>
              <h3 className="text-lg font-black text-red-600 uppercase">Erro de Conexão com a Base de Dados</h3>
              <p className="text-red-500/80 text-sm font-medium">Siga os passos: Vercel -> Storage -> Connect Neon -> Redeploy.</p>
            </div>
            <button onClick={checkConnection} className="ml-auto p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition">
              <RefreshCw size={20} />
            </button>
          </div>
        )}

        <header className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-display font-black text-ministry-blue uppercase">Painel de Gestão</h1>
          <div className="flex space-x-4">
            <button onClick={fetchUsers} className="p-4 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-ministry-blue transition">
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button className="bg-ministry-gold text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-ministry-gold/20">
              MODO ADMINISTRADOR
            </button>
          </div>
        </header>

        {activeTab === 'users' ? (
          <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-black text-ministry-blue uppercase tracking-tight">Utilizadores Ativos</h3>
                <button onClick={() => setIsModalOpen(true)} className="bg-ministry-blue text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase">Novo Acesso</button>
             </div>
             <div className="p-0">
               {users.length > 0 ? (
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <tr>
                       <th className="px-8 py-4">Nome</th>
                       <th className="px-8 py-4">Username</th>
                       <th className="px-8 py-4">Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     {users.map(u => (
                       <tr key={u.id} className="border-b border-slate-50 last:border-0">
                         <td className="px-8 py-5 font-bold text-ministry-blue">{u.name}</td>
                         <td className="px-8 py-5 text-sm text-slate-500">{u.username}</td>
                         <td className="px-8 py-5">
                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full uppercase">Ativo</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                 <div className="py-20 text-center text-slate-300">
                    <Database size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">Sem dados para mostrar</p>
                 </div>
               )}
             </div>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <h3 className="text-xl font-black text-ministry-blue mb-8 uppercase">Configuração de Satélite</h3>
            <p className="text-slate-400 text-sm mb-10">Aqui poderá definir os links do YouTube para a transmissão em direto.</p>
            <div className="space-y-6">
               <input type="text" placeholder="URL do Stream" className="w-full bg-slate-50 p-5 rounded-2xl border-0 focus:ring-2 focus:ring-ministry-gold" />
               <button className="w-full py-5 bg-ministry-blue text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Guardar Alterações</button>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-xl">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
              <h2 className="text-2xl font-display font-bold text-ministry-blue mb-6">Criar Identidade</h2>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                 <input type="text" placeholder="Nome do Membro" className="w-full bg-slate-50 p-4 rounded-xl border-0" required />
                 <input type="text" placeholder="ID de Acesso" className="w-full bg-slate-50 p-4 rounded-xl border-0" required />
                 <input type="password" placeholder="Senha" className="w-full bg-slate-50 p-4 rounded-xl border-0" required />
                 <button className="w-full py-4 bg-ministry-gold text-white rounded-xl font-black uppercase">Desbloquear</button>
                 <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-2 text-slate-400 font-bold">Cancelar</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
