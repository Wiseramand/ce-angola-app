
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ContactUs: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simular envio
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSent(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="bg-gray-50 min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-6">
                <header className="text-center mb-20 animate-in fade-in slide-in-from-top duration-700">
                    <h1 className="text-5xl md:text-6xl font-display font-black text-ministry-blue uppercase tracking-tighter mb-4">{t('contact.title')}</h1>
                    <div className="w-24 h-2 bg-ministry-gold mx-auto mb-6"></div>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">{t('contact.subtitle')}</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Info Side */}
                    <div className="space-y-8">
                        <div className="bg-ministry-blue p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black uppercase mb-8 text-ministry-gold">{t('contact.info')}</h3>
                                <div className="space-y-8">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-ministry-gold transition-colors">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[10px] uppercase text-blue-200 tracking-widest mb-1">{t('contact.location')}</p>
                                            <p className="font-bold text-sm">Belas, Luanda, Angola</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-ministry-gold transition-colors">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[10px] uppercase text-blue-200 tracking-widest mb-1">{t('contact.phone')}</p>
                                            <p className="font-bold text-sm">+244 923 000 000</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-ministry-gold transition-colors">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[10px] uppercase text-blue-200 tracking-widest mb-1">{t('contact.email')}</p>
                                            <p className="font-bold text-sm">info@ceangola.org</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-ministry-gold/10 rounded-full blur-3xl"></div>
                        </div>

                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
                            <h3 className="text-xl font-black uppercase mb-6 text-ministry-blue">{t('contact.worship_times')}</h3>
                            <div className="space-y-4 text-sm font-bold text-slate-500">
                                <div className="flex justify-between border-b border-gray-50 pb-2 uppercase text-[10px]">
                                    <span>Domingo</span>
                                    <span className="text-ministry-gold">08:00 & 10:30</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2 uppercase text-[10px]">
                                    <span>Quarta-feira</span>
                                    <span className="text-ministry-gold">18:00</span>
                                </div>
                                <div className="flex justify-between uppercase text-[10px]">
                                    <span>Vigília (6ª)</span>
                                    <span className="text-ministry-gold">22:00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                            {isSent ? (
                                <div className="text-center py-20 animate-in zoom-in duration-500">
                                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <Send size={48} />
                                    </div>
                                    <h2 className="text-3xl font-black text-ministry-blue uppercase mb-4">{t('contact.sent_success')}</h2>
                                    <p className="text-gray-400 font-bold mb-10">{t('contact.sent_desc')}</p>
                                    <button onClick={() => setIsSent(false)} className="px-10 py-5 bg-ministry-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-ministry-gold transition shadow-xl">{t('contact.send_other')}</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('contact.form_name')}</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-gray-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold"
                                                placeholder="Nome Completo"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('contact.form_email')}</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-gray-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold"
                                                placeholder="exemplo@email.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('contact.form_subject')}</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-gray-50 rounded-2xl px-6 py-4 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold"
                                            placeholder="Como podemos ajudar?"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('contact.form_message')}</label>
                                        <textarea
                                            rows={6}
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-gray-50 rounded-2xl px-6 py-6 border-2 border-transparent focus:border-ministry-gold outline-none transition font-bold resize-none"
                                            placeholder="Escreva sua mensagem aqui..."
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-6 bg-ministry-blue text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-ministry-gold transition-all duration-300 flex items-center justify-center space-x-4 active:scale-95"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                                            <>
                                                <Send size={20} />
                                                <span>{t('contact.send')}</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
