
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Trash2, RefreshCw, Globe, Save, Shield, Eye, Printer, Lock, Key, User
} from 'lucide-react';
import { useAuth } from '../App';
import Logo from '../components/Logo';

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  email: string;
  phone: string;
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
  const [activeTab, setActiveTab] = useState<'users' | 'visitors' | 'streams'>('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [streamForm, setStreamForm] = useState({
    public_url: '',
    public_title: '',
    public_description: '',
    private_url: '',
    private_title: '',
    private_description: '',
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
          public_description: sData.public_description || '',
          private_url: sData.private_url || '',
          private_title: sData.private_title || '',
          private_description: sData.private_description || '',
          is_private_mode: !!sData.is_private_mode
        });
      }
    } catch (e) {} finally { setIsRefreshing(false); }
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
        alert('Configurações guardadas!');
        updateStreamConfig(streamForm);
      }
    } finally { setIsRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex relative">
      <aside className="w-80 bg-ministry-blue text-white flex flex-col h-screen sticky top-0 shadow-2xl z-20 print:hidden">
        <div className="p-10 border-b border-white/10">
          <Logo className="h-12 w-auto mb-6" />
          <h2 className="text-xl font-display font-black uppercase tracking-tight">Consola Master</h2>
        </div>
        <nav className="flex-grow p-6 space-y-3">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'users' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}><Shield size={20} /><span>Membros</span></button>
          <button onClick={() => setActiveTab('visitors')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'visitors' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}><Eye size={20} /><span>Visitantes</span></button>
          <button onClick={() => setActiveTab('streams')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'streams' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}><Video size={20} /><span>Streams</span></button>
        </nav>
      </aside>

      <main className="flex-grow p-12 print:p-0">
        <header className="flex justify-between items-center mb-12 print:hidden">
          <h1 className="text-4xl font-display font-black text-ministry-blue uppercase">Painel de Controlo</h1>
          <button onClick={loadData} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-ministry-blue transition">
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </header>

        {activeTab === 'users' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">Utilizadores do Sistema (Membros)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    <th className="px-8 py-5">Nome do Membro</th>
                    <th className="px-8 py-5">Usuário (ID)</th>
                    <th className="px-8 py-5">Senha (Chave)</th>
                    <th className="px-8 py-5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-ministry-blue/10 rounded-lg flex items-center justify-center text-ministry-blue"><User size={16}/></div>
                          <span className="font-bold text-ministry-blue">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-slate-600 font-mono text-sm">{u.username}</td>
                      <td className="px-8 py-6 text-slate-600 font-mono text-sm">{u.password}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1 rounded-full text-[9px] font-black ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{u.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="space-y-6">
            <div className="flex justify-end print:hidden">
               <button onClick={() => window.print()} className="flex items-center space-x-3 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 transition shadow-sm">
                 <Printer size={18} /><span>Exportar Relatório PDF</span>
               </button>
            </div>
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-0">
               <div className="hidden print:block p-10 border-b-4 border-ministry-gold mb-10 text-center">
                  <h1 className="text-3xl font-black text-ministry-blue uppercase">Lista de Visitantes Registrados</h1>
                  <p className="text-slate-500 font-bold uppercase text-[10px] mt-2">Relatório Oficial • Extraído em {new Date().toLocaleDateString()}</p>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead>
                     <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase text-left">
                       <th className="px-8 py-5">Visitante</th>
                       <th className="px-8 py-5">Email</th>
                       <th className="px-8 py-5">WhatsApp</th>
                       <th className="px-8 py-5">Localização</th>
                       <th className="px-8 py-5 text-right">Data</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {visitors.map(v => (
                       <tr key={v.id}>
                         <td className="px-8 py-6 font-bold text-ministry-blue">{v.fullname}</td>
                         <td className="px-8 py-6 text-slate-500 text-xs">{v.email || '—'}</td>
                         <td className="px-8 py-6 text-slate-500 text-xs font-semibold">{v.phone}</td>
                         <td className="px-8 py-6 text-[10px] text-slate-400 uppercase font-black">{v.city} / {v.neighborhood}</td>
                         <td className="px-8 py-6 text-right text-[10px] text-slate-400 font-bold">{new Date(v.created_at).toLocaleDateString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-ministry-blue uppercase mb-8">Canal Público</h3>
                <div className="space-y-5">
                  <InputField label="URL YouTube / HLS" value={streamForm.public_url} onChange={v => setStreamForm({...streamForm, public_url: v})} />
                  <InputField label="Título" value={streamForm.public_title} onChange={v => setStreamForm({...streamForm, public_title: v})} />
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border-t-[12px] border-ministry-gold">
                <h3 className="text-xl font-black text-ministry-blue uppercase mb-8">Canal Privado</h3>
                <div className="space-y-5">
                  <InputField label="URL Privada" value={streamForm.private_url} onChange={v => setStreamForm({...streamForm, private_url: v})} />
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                    <span className="text-[11px] font-black text-ministry-blue uppercase">Restringir Acesso</span>
                    <button onClick={() => setStreamForm({...streamForm, is_private_mode: !streamForm.is_private_mode})} className={`w-14 h-8 rounded-full relative transition ${streamForm.is_private_mode ? 'bg-ministry-gold' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${streamForm.is_private_mode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveStreams} className="w-full py-7 bg-ministry-blue text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center space-x-3">
              <Save size={20} /><span>GUARDAR CONFIGURAÇÕES</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const InputField = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-2">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold" />
  </div>
);

export default AdminDashboard;
