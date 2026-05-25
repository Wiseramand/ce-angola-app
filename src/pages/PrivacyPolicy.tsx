
import React from 'react';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-gray-50 min-h-screen py-20">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[3rem] shadow-2xl p-12 md:p-20 overflow-hidden relative border border-gray-100">
                    <div className="absolute top-0 left-0 w-full h-2 bg-ministry-gold"></div>

                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-14 h-14 bg-blue-50 text-ministry-blue rounded-2xl flex items-center justify-center">
                            <Lock size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-display font-black text-ministry-blue uppercase tracking-tighter">{t('legal.privacy_title')}</h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{t('legal.privacy_update')}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-8 text-gray-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.1_collect_title')}</h2>
                            <p>{t('legal.1_collect_desc')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.2_usage_title')}</h2>
                            <p>{t('legal.2_usage_desc')}</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>{t('legal.2_usage_1')}</li>
                                <li>{t('legal.2_usage_2')}</li>
                                <li>{t('legal.2_usage_3')}</li>
                                <li>{t('legal.2_usage_4')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.3_security_title')}</h2>
                            <p>{t('legal.3_security_desc')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.4_sharing_title')}</h2>
                            <p>{t('legal.4_sharing_desc')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">{t('legal.5_rights_title')}</h2>
                            <p>{t('legal.5_rights_desc')}</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
