
import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TermsOfService: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-gray-50 min-h-screen py-20">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[3rem] shadow-2xl p-12 md:p-20 overflow-hidden relative border border-gray-100">
                    <div className="absolute top-0 left-0 w-full h-2 bg-ministry-gold"></div>

                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-14 h-14 bg-blue-50 text-ministry-blue rounded-2xl flex items-center justify-center">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-display font-black text-ministry-blue uppercase tracking-tighter">{t('legal.terms_title')}</h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{t('legal.terms_update')}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-8 text-gray-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.t1_accept_title')}</h2>
                            <p>{t('legal.t1_accept_desc')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.t2_content_title')}</h2>
                            <p>{t('legal.t2_content_desc')}</p>
                            <p>{t('legal.t2_content_extra')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.t3_conduct_title')}</h2>
                            <p>{t('legal.t3_conduct_desc')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.t4_donations_title')}</h2>
                            <p>{t('legal.t4_donations_desc')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.t5_modify_title')}</h2>
                            <p>{t('legal.t5_modify_desc')}</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
