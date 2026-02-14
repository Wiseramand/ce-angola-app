
import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Trash2, RefreshCw, Globe, Save, Power, Server, Key, Lock, Shield, Plus, X, UserPlus, Fingerprint, Eye, AlertCircle, MapPin, FileDown, Printer
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
  city: string;
  neighborhood: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { system, updateStreamConfig, refreshSystem } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'visitors' | 'streams'>('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState({
    fullname: '',
    username: '',
    password: '',
    email: '',
    phone: ''
  });

  const [streamForm, setStreamForm] = useState({
    public_url: '',
    public_server: '',
    public_key: '',
    public_title: '',
    public_description: '',
    private_url: '',
    private_server: '',
    private_key: '',
    private_title: '',
    private_description: '',
    is_private_mode: false
  });

  const loadFullSystem = async () => {
    setIsRefreshing(true);
    setServerError(null);
    try {
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
    } catch (e) {} finally { setIsRefreshing(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {}
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

  // Fix: Added handleSaveStreams function to fix "Cannot find name 'handleSaveStreams'" error.
  const handleSaveStreams = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(streamForm)
      });
      if (res.ok) {
        await updateStreamConfig(streamForm);
        alert('Configurações de transmissão guardadas com sucesso!');
      } else {
        alert('Erro ao guardar as configurações de transmissão.');
      }
    } catch (e) {
      console.error(e);
      alert('Falha na comunicação com o servidor ao guardar configurações.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  useEffect(() => { 
    loadFullSystem();
    fetchUsers(); 
    fetchVisitors();
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex relative">
      {/* Sidebar Admin */}
      <aside className="w-80 bg-ministry-blue text-white flex flex-col h-screen sticky top-0 shadow-2xl z-20 print:hidden">
        <div className="p-10 border-b border-white/10">
          <Logo className="h-12 w-auto mb-6" />
          <h2 className="text-xl font-display font-black uppercase tracking-tight">Consola Master</h2>
          <div className="flex items-center mt-3 space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Servidor Online</span>
          </div>
        </div>
        <nav className="flex-grow p-6 space-y-3">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'users' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}><Shield size={20} /><span>Membros</span></button>
          <button onClick={() => setActiveTab('visitors')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'visitors' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}><Eye size={20} /><span>Visitantes</span></button>
          <button onClick={() => setActiveTab('streams')} className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] transition-all font-bold ${activeTab === 'streams' ? 'bg-ministry-gold text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}><Video size={20} /><span>Streams</span></button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12 print:p-0">
        <header className="flex justify-between items-center mb-12 print:hidden">
          <div>
            <h1 className="text-4xl font-display font-black text-ministry-blue uppercase tracking-tighter">Painel Administrativo</h1>
            <p className="text-slate-500 font-medium mt-1">Gestão central de dados e acessos.</p>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => { fetchUsers(); fetchVisitors(); loadFullSystem(); }} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-ministry-blue transition">
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {activeTab === 'users' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden print:hidden">
            {/* Lista de utilizadores aqui */}
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">Utilizadores do Sistema</h3>
              <button onClick={() => setShowCreateModal(true)} className="bg-ministry-blue text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Novo Acesso</button>
            </div>
            <div className="p-8">
               {users.map(u => (
                 <div key={u.id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="font-bold text-ministry-blue">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ID: {u.username}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{u.status.toUpperCase()}</span>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="space-y-6">
            <div className="flex justify-end print:hidden">
               <button 
                onClick={handleExportPDF}
                className="flex items-center space-x-3 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition shadow-sm"
               >
                 <Printer size={18} />
                 <span>Exportar Relatório PDF</span>
               </button>
            </div>

            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-0">
               {/* Cabeçalho do Relatório para Impressão */}
               <div className="hidden print:block p-10 border-b-4 border-ministry-gold mb-10">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-black text-ministry-blue uppercase tracking-tighter">Relatório de Visitantes</h1>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Christ Embassy Angola • Extraído em {new Date().toLocaleDateString()}</p>
                    </div>
                    <Logo className="h-16 w-auto" />
                  </div>
               </div>

               <div className="p-8 border-b border-slate-50 bg-slate-50/50 print:hidden">
                 <h3 className="font-black text-ministry-blue uppercase text-sm tracking-widest">Registos de Entrada no Portal</h3>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead>
                     <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest print:bg-slate-100 print:text-ministry-blue">
                       <th className="px-8 py-5 text-left">Nome Completo</th>
                       <th className="px-8 py-5 text-left">WhatsApp/Telefone</th>
                       <th className="px-8 py-5 text-left">Localização</th>
                       <th className="px-8 py-5 text-right">Data</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {visitors.map(v => (
                       <tr key={v.id} className="hover:bg-slate-50/50 transition">
                         <td className="px-8 py-6 font-bold text-ministry-blue">{v.fullname}</td>
                         <td className="px-8 py-6 text-slate-500 text-xs font-semibold">{v.phone}</td>
                         <td className="px-8 py-6">
                           <div className="text-xs font-bold text-slate-600">{v.country}</div>
                           <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{v.city} - {v.neighborhood}</div>
                         </td>
                         <td className="px-8 py-6 text-right text-[10px] text-slate-400 font-bold uppercase">
                           {new Date(v.created_at).toLocaleDateString()}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {visitors.length === 0 && (
                   <div className="p-20 text-center text-slate-300">
                      <Users size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-black uppercase text-xs tracking-widest">Sem dados disponíveis</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="space-y-8 print:hidden">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-8">Canal Público</h3>
                <div className="space-y-5">
                  <InputField label="URL / Embed" value={streamForm.public_url} onChange={v => setStreamForm({...streamForm, public_url: v})} />
                  <InputField label="Título" value={streamForm.public_title} onChange={v => setStreamForm({...streamForm, public_title: v})} />
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border-t-[12px] border-ministry-gold">
                <h3 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-8">Canal Exclusivo</h3>
                <div className="space-y-5">
                  <InputField label="URL Privada" value={streamForm.private_url} onChange={v => setStreamForm({...streamForm, private_url: v})} />
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl mt-4">
                    <span className="text-[11px] font-black text-ministry-blue uppercase tracking-widest">Restringir Acesso</span>
                    <button 
                      onClick={() => setStreamForm({...streamForm, is_private_mode: !streamForm.is_private_mode})}
                      className={`w-14 h-8 rounded-full relative transition ${streamForm.is_private_mode ? 'bg-ministry-gold' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${streamForm.is_private_mode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveStreams} className="w-full py-7 bg-ministry-blue text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center space-x-3">
              <Save size={20} />
              <span>GUARDAR CONFIGURAÇÕES</span>
            </button>
          </div>
        )}
      </main>

      {/* Modal Criar Utilizador */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm print:hidden">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="bg-ministry-blue p-10 text-white flex justify-between items-center">
              <h3 className="text-2xl font-display font-black uppercase tracking-tight">Gerar Nova Credencial</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition"><X size={24}/></button>
            </div>
            {/* Form de criação simplificado */}
            <div className="p-10">
              <button onClick={() => setShowCreateModal(false)} className="w-full py-6 bg-ministry-blue text-white rounded-2xl font-black uppercase tracking-widest">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Estilo Global de Impressão */}
      <style>{`
        @media print {
          body { background: white !important; }
          main { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #e2e8f0 !important; padding: 12px !important; text-align: left !important; font-size: 10px !important; }
          th { background-color: #f1f5f9 !important; color: #002B5B !important; font-weight: 900 !important; text-transform: uppercase !important; }
        }
      `}</style>
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
