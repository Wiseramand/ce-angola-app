
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Shield, Check, X, Trash2, Database, RefreshCw, AlertTriangle, Lock, Globe, Save, Power
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
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  
  // Stream State
  const [streamForm, setStreamForm] = useState({
    publicUrl: system.publicUrl || '',
    publicTitle: system.publicTitle || '',
    publicDescription: system.publicDescription || '',
    privateUrl: system.privateUrl || '',
    privateTitle: system.privateTitle || '',
    privateDescription: system.privateDescription || '',
    isPrivateMode: system.isPrivateMode
  });

  useEffect(() => {
    setStreamForm({
      publicUrl: system.publicUrl,
      publicTitle: system.publicTitle,
      publicDescription: system.publicDescription,
      privateUrl: system.privateUrl,
      privateTitle: system.privateTitle,
      privateDescription: system.privateDescription,
      isPrivateMode: system.isPrivateMode
    });
  }, [system]);

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
    } catch {
      setDbStatus('offline');
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleUserStatus = async (user: ManagedUser) => {
    if (!confirm(`Deseja ${user.status === 'active' ? 'Bloquear' : 'Desbloquear'} este membro?`)) return;
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: user.status })
      });
      if (res.ok) fetchUsers();
    } catch (e) { alert("Erro ao atualizar status."); }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("⚠️ ATENÇÃO: Esta ação é permanente. Eliminar membro?")) return;
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchUsers();
    } catch (e) { alert("Erro ao eliminar."); }
  };

  const handleSaveConfig = async () => {
    setIsRefreshing(true);
    try {
      await updateStreamConfig(streamForm);
      alert("✅ Configurações de Transmissão Atualizadas!");
    } catch (e) {
      alert("❌ Erro ao salvar configuração.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="bg-[#f1f5f9] min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-80 bg-ministry-blue text-white hidden xl:flex flex-col sticky top-0 h-screen">
        <div className="p-10 border-b border-white/5">
          <Logo className="h-14 w-auto mb-6" />
          <h2 className="text-xl font-display font-bold">Painel Master</h2>
          <p className={`text-[10px] font-black uppercase mt-2 tracking-widest ${dbStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>
            {dbStatus === 'online' ? '● Base de Dados Ativa' : '○ Erro de Conexão'}
          </p>
        </div>
        <nav className="flex-grow p-6 space-y-2">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition ${activeTab === 'users' ? 'bg-ministry-gold text-white font-black' : 'text-slate-400 hover:text-white'}`}>
            <Users size={18} /> <span>Membros</span>
          </button>
          <button onClick={() => setActiveTab('stream')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition ${activeTab === 'stream' ? 'bg-ministry-gold text-white font-black' : 'text-slate-400 hover:text-white'}`}>
            <Video size={18} /> <span>Live Streaming</span>
          </button>
        </nav>
      </aside>

      <main className="flex-grow p-10 lg:p-16">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-display font-black text-ministry-blue uppercase tracking-tight">Consola Administrativa</h1>
            <p className="text-slate-400 text-sm mt-1">Gestão de acessos e canais de transmissão.</p>
          </div>
          <div className="flex space-x-3">
             <button onClick={fetchUsers} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-ministry-blue transition">
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
             </button>
             <div className="bg-ministry-blue text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-ministry-blue/20">Modo: Super Admin</div>
          </div>
        </header>

        {activeTab === 'users' ? (
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200 animate-in fade-in duration-500">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest flex items-center">
                  <Users size={18} className="mr-3 text-ministry-gold" /> Comunitários Registados
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase">{users.length} Total</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <tr>
                     <th className="px-8 py-5">Nome / Email</th>
                     <th className="px-8 py-5">Username</th>
                     <th className="px-8 py-5">Estado</th>
                     <th className="px-8 py-5 text-right">Ações de Gestão</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {users.map(u => (
                     <tr key={u.id} className="hover:bg-slate-50/80 transition">
                       <td className="px-8 py-6">
                          <div className="font-bold text-ministry-blue">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium uppercase mt-1">{u.email}</div>
                       </td>
                       <td className="px-8 py-6 text-sm font-mono text-slate-500">{u.username}</td>
                       <td className="px-8 py-6">
                          <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {u.status === 'active' ? 'ATIVO' : 'BLOQUEADO'}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                             <button 
                               onClick={() => toggleUserStatus(u)}
                               className={`p-2 rounded-xl transition ${u.status === 'active' ? 'bg-orange-50 text-orange-500 hover:bg-orange-100' : 'bg-green-50 text-green-500 hover:bg-green-100'}`}
                               title={u.status === 'active' ? 'Bloquear Acesso' : 'Desbloquear'}
                             >
                               <Power size={18} />
                             </button>
                             <button 
                               onClick={() => deleteUser(u.id)}
                               className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                               title="Eliminar Membro"
                             >
                               <Trash2 size={18} />
                             </button>
                          </div>
                       </td>
                     </tr>
                   ))}
                   {users.length === 0 && (
                     <tr>
                       <td colSpan={4} className="py-20 text-center">
                          <Database size={48} className="mx-auto mb-4 text-slate-200" />
                          <p className="text-xs font-black uppercase text-slate-300 tracking-[0.2em]">Sem registos na base de dados</p>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-5 duration-500">
            {/* Canal Público */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
               <div className="flex items-center space-x-4 mb-10 border-b border-slate-50 pb-6">
                 <div className="p-4 bg-blue-50 text-ministry-blue rounded-2xl"><Globe size={24}/></div>
                 <div>
                   <h3 className="text-lg font-black text-ministry-blue uppercase">Live TV (Público)</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Canal Aberto para todos</p>
                 </div>
               </div>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Link da Transmissão (YT ou .m3u8)</label>
                    <input 
                      type="text" 
                      value={streamForm.publicUrl} 
                      onChange={(e) => setStreamForm({...streamForm, publicUrl: e.target.value})}
                      placeholder="Ex: https://youtube.com/live/..." 
                      className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-ministry-gold outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Título do Programa</label>
                    <input 
                      type="text" 
                      value={streamForm.publicTitle} 
                      onChange={(e) => setStreamForm({...streamForm, publicTitle: e.target.value})}
                      className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-ministry-gold outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Descrição Curta</label>
                    <textarea 
                      value={streamForm.publicDescription} 
                      onChange={(e) => setStreamForm({...streamForm, publicDescription: e.target.value})}
                      className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-ministry-gold outline-none transition" 
                      rows={2}
                    />
                  </div>
               </div>
            </div>

            {/* Canal Privado */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-[12px] border-ministry-gold">
               <div className="flex items-center space-x-4 mb-10 border-b border-slate-50 pb-6">
                 <div className="p-4 bg-orange-50 text-ministry-gold rounded-2xl"><Lock size={24}/></div>
                 <div>
                   <h3 className="text-lg font-black text-ministry-blue uppercase">Acesso Exclusivo (Privado)</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Restrito a utilizadores autorizados</p>
                 </div>
               </div>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Link Restrito (.m3u8 / Private YT)</label>
                    <input 
                      type="text" 
                      value={streamForm.privateUrl} 
                      onChange={(e) => setStreamForm({...streamForm, privateUrl: e.target.value})}
                      className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-ministry-gold outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Título da Conferência</label>
                    <input 
                      type="text" 
                      value={streamForm.privateTitle} 
                      onChange={(e) => setStreamForm({...streamForm, privateTitle: e.target.value})}
                      className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-ministry-gold outline-none transition" 
                    />
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl mt-8">
                     <span className="text-xs font-black text-ministry-blue uppercase tracking-widest">Ativar Bloqueio Automático</span>
                     <button 
                        onClick={() => setStreamForm({...streamForm, isPrivateMode: !streamForm.isPrivateMode})}
                        className={`w-14 h-8 rounded-full relative transition duration-300 ${streamForm.isPrivateMode ? 'bg-ministry-gold' : 'bg-slate-300'}`}
                     >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${streamForm.isPrivateMode ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-2">
               <button 
                 onClick={handleSaveConfig}
                 disabled={isRefreshing}
                 className="w-full py-6 bg-ministry-blue text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.01] active:scale-95 transition flex items-center justify-center space-x-3"
               >
                 <Save size={20} />
                 <span>Publicar Configurações no Servidor Master</span>
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
