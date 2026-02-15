
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Shield, Eye, Save, RefreshCw, ArrowLeft, Download, User, Lock, Globe, MapPin
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
    } catch (e) {
      console.error("Erro no Dashboard:", e);
    } finally { setIsRefreshing(false); }
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
        alert('Configurações atualizadas!');
        updateStreamConfig(streamForm);
      }
    } finally { setIsRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex relative">
      {/* Sidebar Menu - RESTAURADO */}
      <aside className="w-80 bg-ministry-blue text-white flex flex-col h-screen sticky top-0 shadow-2xl z-20 print:hidden">
        <div className="p-10 border-b border-white/10">
          <Logo className="h-12 w-auto mb-6 brightness-110" />
          <h2 className="text-xl font-display font-black uppercase tracking-tight text-ministry-gold">Consola Master</h2>
        </div>
        
        <nav className="flex-grow p-6 space-y-3">
          <button 
            onClick={() => setActiveTab('users')} 
            className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'users' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
          >
            <Shield size={20} />
            <span>Membros</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('visitors')} 
            className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'visitors' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
          >
            <Users size={20} />
            <span>Visitantes</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('streams')} 
            className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'streams' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
          >
            <Video size={20} />
            <span>Streams</span>
          </button>

          <div className="pt-10 border-t border-white/5 mt-10">
            <button onClick={() => navigate('/')} className="w-full flex items-center space-x-4 px-6 py-4 text-slate-400 hover:text-white transition font-bold text-xs uppercase">
              <ArrowLeft size={18} />
              <span>Voltar ao Portal</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12">
        <header className="flex justify-between items-center mb-12 print:hidden">
          <div>
            <h1 className="text-4xl font-display font-black text-ministry-blue uppercase tracking-tighter">Administração</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Christ Embassy Angola • Painel de Controlo</p>
          </div>
          <button onClick={loadData} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-ministry-blue transition border border-slate-100">
            <RefreshCw size={22} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </header>

        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">Utilizadores Autorizados (Membros)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    <th className="px-8 py-5">Nome do Membro</th>
                    <th className="px-8 py-5">Usuário (ID)</th>
                    <th className="px-8 py-5">Senha (Chave)</th>
                    <th className="px-8 py-5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-ministry-blue/10 rounded-xl flex items-center justify-center text-ministry-blue font-black text-xs">{u.name.charAt(0)}</div>
                          <span className="font-bold text-ministry-blue">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-sm text-slate-500">{u.username}</td>
                      <td className="px-8 py-6 font-mono text-sm text-slate-500">{u.password}</td>
                      <td className="px-8 py-6 text-right">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {u.status}
                        </span>
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
             <div className="p-8 border-b border-slate-50 bg-slate-50/50">
               <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">Visitantes Registados no Portal</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase text-left">
                     <th className="px-8 py-5">Nome Completo</th>
                     <th className="px-8 py-5">Contacto</th>
                     <th className="px-8 py-5">Localização (Cidade/Bairro)</th>
                     <th className="px-8 py-5 text-right">Data</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {visitors.map(v => (
                     <tr key={v.id} className="hover:bg-slate-50/50 transition">
                       <td className="px-8 py-6">
                          <div className="font-bold text-ministry-blue uppercase tracking-tight">{v.fullname}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{v.email || 'N/A'}</div>
                       </td>
                       <td className="px-8 py-6 text-slate-500 text-xs font-bold">{v.phone}</td>
                       <td className="px-8 py-6">
                          <div className="text-xs font-black text-slate-600 uppercase tracking-tighter">{v.city || 'Desconhecida'}</div>
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
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-8">Canal Público</h3>
                <div className="space-y-6">
                  <InputField label="URL Transmissão" value={streamForm.public_url} onChange={v => setStreamForm({...streamForm, public_url: v})} />
                  <InputField label="Título" value={streamForm.public_title} onChange={v => setStreamForm({...streamForm, public_title: v})} />
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-[12px] border-ministry-gold">
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-8">Canal Privado</h3>
                <div className="space-y-6">
                  <InputField label="URL Privada" value={streamForm.private_url} onChange={v => setStreamForm({...streamForm, private_url: v})} />
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-black text-ministry-blue uppercase tracking-widest">Restringir Acesso</span>
                    <button onClick={() => setStreamForm({...streamForm, is_private_mode: !streamForm.is_private_mode})} className={`w-14 h-8 rounded-full relative transition duration-300 ${streamForm.is_private_mode ? 'bg-ministry-gold' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${streamForm.is_private_mode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveStreams} className="w-full py-7 bg-ministry-blue text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center space-x-3 hover:bg-ministry-gold transition-all">
              <Save size={20} />
              <span>Guardar Configurações</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const InputField = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 ml-2 tracking-widest">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold" />
  </div>
);

export default AdminDashboard;
