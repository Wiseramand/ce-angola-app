
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Shield, Eye, Save, RefreshCw, ArrowLeft, Download, UserPlus, Lock, FileSpreadsheet, Printer
} from 'lucide-react';
import { useAuth } from '../App';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  status: 'active' | 'blocked';
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

const AdminDashboard: React.FC = () => {
  const { updateStreamConfig } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'visitors' | 'streams'>('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  
  const [newUser, setNewUser] = useState({ fullname: '', username: '', password: '' });
  const [streamForm, setStreamForm] = useState({
    public_url: '',
    public_title: '',
    private_url: '',
    is_private_mode: false
  });

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [uRes, vRes, sRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/visitors'),
        fetch('/api/system')
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (vRes.ok) setVisitors(await vRes.json());
      if (sRes.ok) {
        const sData = await sRes.json();
        setStreamForm({
          public_url: sData.public_url || '',
          public_title: sData.public_title || '',
          private_url: sData.private_url || '',
          is_private_mode: !!sData.is_private_mode
        });
      }
    } catch (e) { console.error(e); } finally { setIsRefreshing(false); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        alert("Membro criado/atualizado!");
        setShowUserModal(false);
        setNewUser({ fullname: '', username: '', password: '' });
        loadData();
      }
    } finally { setIsRefreshing(false); }
  };

  const exportVisitors = () => {
    if (visitors.length === 0) return;
    const headers = "Nome,Email,Telefone,Pais,Cidade,Bairro,Data\n";
    const rows = visitors.map(v => 
      `"${v.fullname}","${v.email}","${v.phone}","${v.country}","${v.city}","${v.neighborhood}","${new Date(v.created_at).toLocaleDateString()}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `visitantes_ce_angola_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        alert('Canais atualizados!');
        updateStreamConfig(streamForm);
      }
    } finally { setIsRefreshing(false); }
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
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'users' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
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
              <button onClick={exportVisitors} className="flex items-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition shadow-lg">
                <FileSpreadsheet size={18} />
                <span>Exportar Excel</span>
              </button>
            )}
            <button onClick={loadData} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-ministry-blue transition border border-slate-100">
              <RefreshCw size={22} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
               <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">Lista de Membros Ativos</h3>
               <button onClick={() => setShowUserModal(true)} className="flex items-center space-x-3 px-8 py-4 bg-ministry-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-ministry-gold transition-all">
                  <UserPlus size={18} />
                  <span>Novo Membro</span>
               </button>
            </div>
            
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    <th className="px-8 py-5">Nome</th>
                    <th className="px-8 py-5">Usuário (ID)</th>
                    <th className="px-8 py-5">Senha</th>
                    <th className="px-8 py-5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-8 py-6 font-bold text-ministry-blue">{u.name}</td>
                      <td className="px-8 py-6 font-mono text-sm text-slate-500">{u.username}</td>
                      <td className="px-8 py-6 font-mono text-sm text-slate-500">{u.password}</td>
                      <td className="px-8 py-6 text-right">
                        <span className="px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase">Ativo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div id="visitor-list" className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 print:hidden">
               <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">Base de Dados de Visitantes</h3>
               <button onClick={() => window.print()} className="p-2 text-slate-400 hover:text-ministry-blue transition">
                 <Printer size={20} />
               </button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase text-left">
                     <th className="px-8 py-5">Visitante</th>
                     <th className="px-8 py-5">Contacto</th>
                     <th className="px-8 py-5">Localização</th>
                     <th className="px-8 py-5 text-right">Data</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {visitors.map(v => (
                     <tr key={v.id} className="hover:bg-slate-50/30 transition">
                       <td className="px-8 py-6">
                          <div className="font-bold text-ministry-blue uppercase text-xs">{v.fullname}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{v.email || 'SEM EMAIL'}</div>
                       </td>
                       <td className="px-8 py-6 text-slate-500 text-xs font-bold">{v.phone}</td>
                       <td className="px-8 py-6">
                          <div className="text-xs font-black text-slate-600 uppercase">{v.city || 'Desconhecida'}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">{v.neighborhood || '—'}</div>
                       </td>
                       <td className="px-8 py-6 text-right text-[10px] text-slate-400 font-bold">{new Date(v.created_at).toLocaleDateString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-8">Canal Público</h3>
                <InputField label="URL Transmissão" value={streamForm.public_url} onChange={v => setStreamForm({...streamForm, public_url: v})} />
                <InputField label="Título" value={streamForm.public_title} onChange={v => setStreamForm({...streamForm, public_title: v})} />
                <button onClick={handleSaveStreams} className="w-full mt-8 py-5 bg-ministry-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-ministry-gold transition-all">Guardar Alterações</button>
             </div>
             <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-8">Canal Privado (Membros)</h3>
                <InputField label="URL Privada" value={streamForm.private_url} onChange={v => setStreamForm({...streamForm, private_url: v})} />
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-6">
                  <span className="text-[11px] font-black text-ministry-blue uppercase tracking-widest">Ativar Modo Privado</span>
                  <button onClick={() => setStreamForm({...streamForm, is_private_mode: !streamForm.is_private_mode})} className={`w-14 h-8 rounded-full relative transition duration-300 ${streamForm.is_private_mode ? 'bg-ministry-gold' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${streamForm.is_private_mode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* Modal Novo Membro */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ministry-blue/90 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative animate-in zoom-in duration-300">
              <h2 className="text-2xl font-black text-ministry-blue uppercase tracking-tighter mb-8">Adicionar Novo Membro</h2>
              <form onSubmit={handleAddUser} className="space-y-6">
                <InputField label="Nome Completo" value={newUser.fullname} onChange={v => setNewUser({...newUser, fullname: v})} />
                <InputField label="ID de Utilizador" value={newUser.username} onChange={v => setNewUser({...newUser, username: v})} />
                <InputField label="Senha (Chave Secreta)" value={newUser.password} onChange={v => setNewUser({...newUser, password: v})} />
                <div className="flex space-x-4 pt-6">
                   <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-5 font-black uppercase text-[10px] text-slate-400 hover:text-slate-600 tracking-widest">Cancelar</button>
                   <button type="submit" className="flex-[2] py-5 bg-ministry-gold text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Criar Acesso</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const InputField = ({ label, value, onChange }: any) => (
  <div className="mb-6">
    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-2 tracking-widest">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold" required />
  </div>
);

export default AdminDashboard;
