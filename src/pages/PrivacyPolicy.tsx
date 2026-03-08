
import React from 'react';
import { Lock } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
                            <h1 className="text-4xl font-display font-black text-ministry-blue uppercase tracking-tighter">Política de Privacidade</h1>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Christ Embassy Angola • Última atualização: Março 2025</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-8 text-gray-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">1. Informações que Recolhemos</h2>
                            <p>Recolhemos informações que nos fornece diretamente, como o seu nome, endereço de e-mail, número de telefone e outros detalhes de contacto quando se regista na nossa plataforma ou faz uma doação.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">2. Como Utilizamos os seus Dados</h2>
                            <p>As informações recolhidas são utilizadas para:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Fornecer e gerir o seu acesso a conteúdos exclusivos.</li>
                                <li>Processar as suas doações e emitir confirmações.</li>
                                <li>Enviar comunicações relacionadas com o ministério e eventos.</li>
                                <li>Melhorar a experiência do utilizador na nossa plataforma.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">3. Segurança da Informação</h2>
                            <p>Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger os seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">4. Partilha com Terceiros</h2>
                            <p>Não vendemos, trocamos ou alugamos as suas informações de identificação pessoal a terceiros. Podemos partilhar dados com parceiros de serviço confiáveis (como processadores de pagamento) apenas na medida necessária para realizar as operações solicitadas.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-ministry-blue uppercase tracking-tight mb-4 border-l-4 border-ministry-gold pl-4">5. Seus Direitos</h2>
                            <p>Tem o direito de aceder, corrigir ou solicitar a eliminação dos seus dados pessoais armazenados nos nossos sistemas a qualquer momento, contactando o nosso suporte administrativo.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
