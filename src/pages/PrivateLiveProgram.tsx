import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, Play, MessageCircle, Heart, Send, CreditCard, X, Users, Globe, Smartphone, LogOut, UserCheck, CheckCircle, Loader2 } from 'lucide-react';
import { ProgramCredential, StreamEvent } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';

const PaymentMethodBtn = ({ name, color, icon, onClick, disabled }: { name: string; color: string; icon?: React.ReactNode; onClick: () => void; disabled?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`${color} text-white font-bold py-3 px-4 rounded-lg shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {icon}
    {name}
  </button>
);

interface PrivateLiveProgramProps {
  onNavigate: (page: string) => void;
  credentials: ProgramCredential[];
  streams: StreamEvent[];
}

export const PrivateLiveProgram: React.FC<PrivateLiveProgramProps> = ({ onNavigate, credentials, streams }) => {
  const [currentUser, setCurrentUser] = useState<ProgramCredential | null>(null);
  
  // Find the private stream
  const activeStream: StreamEvent = streams.find(s => s.type === 'private') || {
      id: 'default',
      title: 'Private Service',
      description: 'Exclusive access',
      date: '',
      thumbnailUrl: '',
      isLive: true,
      viewers: 0,
      type: 'private',
      streamSource: 'custom',
      streamUrl: ''
  };

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{user: string, text: string}[]>([
    { user: 'Sister Maria', text: 'We are ready to receive!' },
    { user: 'Brother Jose', text: 'Glory to God from Luanda!' }
  ]);

  // Payment Modal State
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'ANGOLA' | 'INTL'>('ANGOLA');
  const [amount, setAmount] = useState('');
  
  // Payment Processing State
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [selectedMethod, setSelectedMethod] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    setTimeout(() => {
      // Find the user with matching credentials
      const foundUser = credentials.find(c => c.username === username && c.password === password);

      if (foundUser) {
        // Check Expiration
        const now = new Date();
        const expirationDate = new Date(foundUser.expiresAt);

        if (now < expirationDate) {
            setCurrentUser(foundUser);
        } else {
            setLoginError('Access credentials have expired. Please contact administration.');
        }
      } else {
        setLoginError('Invalid access credentials. Please try again.');
      }
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages([...messages, { user: currentUser ? currentUser.firstName : 'Me', text: chatMessage }]);
    setChatMessage('');
  };

  const handleProcessPayment = (methodName: string) => {
    if (!amount || Number(amount) <= 0) {
        alert("Please enter a valid amount before selecting a payment method.");
        return;
    }

    setSelectedMethod(methodName);
    setPaymentStatus('processing');

    // Simulate API Transaction
    setTimeout(() => {
        setPaymentStatus('success');
    }, 2000);
  };

  const resetPaymentModal = () => {
    setShowOfferingModal(false);
    setTimeout(() => {
        setPaymentStatus('idle');
        setAmount('');
        setSelectedMethod('');
    }, 300);
  };

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 opacity-20">
            <img src="https://picsum.photos/1920/1080?blur=10" className="w-full h-full object-cover" alt="Background"/>
        </div>

        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl relative z-10">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-900 rounded-full flex items-center justify-center text-white mb-6 shadow-lg border-4 border-blue-50">
              <Lock size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Private Live Program
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This event is restricted. Please enter the access credentials provided by the administrator.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <Input
                label="Access Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
              <Input
                label="Access Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {loginError && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded border border-red-200">
                {loginError}
              </div>
            )}

            <Button type="submit" className="w-full py-3" isLoading={loading}>
              Enter Service
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Logged In Status Header */}
      <div className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                <UserCheck size={16} />
                <span>Welcome, {currentUser.firstName} {currentUser.lastName}</span>
                <span className="bg-green-100 px-2 py-0.5 rounded-full text-xs">Logged In</span>
            </div>
            <button 
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
                <LogOut size={14} /> Exit Session
            </button>
        </div>
      </div>

      {/* Header for Event */}
      <div className="bg-blue-900 text-white py-6 shadow-lg">
         <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    {activeStream.title}
                </h1>
                <p className="text-blue-200 text-sm mt-1">Live from the LoveWorld Crusade Grounds</p>
            </div>
            <Button 
                onClick={() => setShowOfferingModal(true)} 
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-6 shadow-lg shadow-yellow-500/20 animate-bounce"
            >
                <Heart size={18} className="mr-2 fill-blue-900" />
                Give Offering
            </Button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
               <VideoPlayer 
                    streamSource={activeStream.streamSource}
                    streamUrl={activeStream.streamUrl}
                    thumbnailUrl={activeStream.thumbnailUrl}
                    title={activeStream.title}
               />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{activeStream.title}</h2>
                        <p className="text-gray-600 mt-2 leading-relaxed">
                           {activeStream.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                        <Users size={14} /> {activeStream.viewers} Viewing
                    </div>
                </div>
            </div>
          </div>

          {/* Live Chat */}
          <div className="lg:col-span-1 h-[600px] bg-white rounded-xl shadow-sm flex flex-col border border-gray-200">
             <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <MessageCircle size={18} /> Live Interaction
                </h3>
             </div>
             
             <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-white">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.user === 'Me' || msg.user === currentUser.firstName ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-400 mb-1 px-1">{msg.user}</span>
                        <div className={`px-4 py-2 rounded-xl text-sm max-w-[85%] ${
                            msg.user === 'Me' || msg.user === currentUser.firstName
                                ? 'bg-blue-900 text-white rounded-tr-none' 
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
             </div>

             <div className="p-3 border-t border-gray-200 bg-gray-50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                        type="text" 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="flex-grow px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="Share a testimony..."
                    />
                    <button type="submit" className="p-2 bg-blue-900 text-white rounded-full hover:bg-blue-800">
                        <Send size={18} className="ml-0.5" />
                    </button>
                </form>
             </div>
          </div>

        </div>
      </div>

      {/* Offering Modal */}
      {showOfferingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                <div className="bg-blue-900 p-6 flex justify-between items-center text-white">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Heart className="fill-white" /> Give Offering
                        </h3>
                        <p className="text-blue-200 text-sm">Blessed to be a blessing</p>
                    </div>
                    <button onClick={resetPaymentModal} className="text-white/80 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {paymentStatus === 'processing' ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <Loader2 size={48} className="text-blue-900 animate-spin mb-4" />
                            <h4 className="text-xl font-bold text-gray-900">Processing Payment...</h4>
                            <p className="text-gray-500 mt-2">Please check your phone for the {selectedMethod} prompt.</p>
                        </div>
                    ) : paymentStatus === 'success' ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} className="text-green-600" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900">Offering Received!</h4>
                            <p className="text-gray-600 mt-2 max-w-xs">
                                Thank you for your seed of <span className="font-bold">{paymentTab === 'ANGOLA' ? 'Kz' : '$'}{Number(amount).toLocaleString()}</span> via {selectedMethod}.
                            </p>
                            <Button onClick={resetPaymentModal} className="mt-8 bg-green-600 hover:bg-green-700 border-none">
                                Return to Service
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 mb-6">
                                <button 
                                    onClick={() => setPaymentTab('ANGOLA')}
                                    className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
                                        paymentTab === 'ANGOLA' 
                                            ? 'border-blue-900 text-blue-900' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                <span className="flex items-center justify-center gap-2">
                                    <Smartphone size={16} /> Angola Payment Methods
                                </span>
                                </button>
                                <button 
                                    onClick={() => setPaymentTab('INTL')}
                                    className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
                                        paymentTab === 'INTL' 
                                            ? 'border-blue-900 text-blue-900' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                <span className="flex items-center justify-center gap-2">
                                    <Globe size={16} /> International Cards
                                </span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 font-bold">
                                            {paymentTab === 'ANGOLA' ? 'Kz' : '$'}
                                        </span>
                                        <input 
                                            type="number" 
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900/20 outline-none font-bold text-lg"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {paymentTab === 'ANGOLA' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <PaymentMethodBtn onClick={() => handleProcessPayment('Afrimoney')} name="Afrimoney" color="bg-red-600" />
                                        <PaymentMethodBtn onClick={() => handleProcessPayment('Unitel Money')} name="Unitel Money" color="bg-orange-500" />
                                        <PaymentMethodBtn onClick={() => handleProcessPayment('PayPay')} name="PayPay Africa" color="bg-blue-500" />
                                        <PaymentMethodBtn onClick={() => handleProcessPayment('Express')} name="Express" color="bg-green-600" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-4">
                                        <PaymentMethodBtn onClick={() => handleProcessPayment('Visa')} name="Visa" color="bg-blue-800" icon={<CreditCard />} />
                                        <PaymentMethodBtn onClick={() => handleProcessPayment('Mastercard')} name="Mastercard" color="bg-red-800" icon={<CreditCard />} />
                                        <PaymentMethodBtn onClick={() => handleProcessPayment('PayPal')} name="PayPal" color="bg-blue-600" icon={<Globe />} />
                                    </div>
                                )}

                                <p className="text-xs text-center text-gray-500 mt-4">
                                    By giving, you are partnering with us to take the gospel to the ends of the earth.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};